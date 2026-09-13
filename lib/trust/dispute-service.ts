import { query, queryOne, execute, runTransaction } from '@/lib/db'
import { logTrustAudit } from './verification-service'
import { calculateTrustScore } from './trust-score-service'

export type DisputeCategory = 
  | 'QUALITY_MISMATCH' 
  | 'QUANTITY_MISMATCH' 
  | 'DAMAGE' 
  | 'DELIVERY_DELAY' 
  | 'PAYMENT' 
  | 'PRODUCT_NOT_RECEIVED' 
  | 'OTHER'

// Backward-compatibility alias
export type DisputeReason = DisputeCategory

export type DisputeStatus = 
  | 'OPEN' 
  | 'UNDER_REVIEW' 
  | 'WAITING_FOR_EVIDENCE' 
  | 'MEDIATION' 
  | 'RESOLVED' 
  | 'REJECTED' 
  | 'ESCALATED'

export type DisputePriority = 'NORMAL' | 'HIGH' | 'CRITICAL'

export type DisputeResolutionDecision = 
  | 'FARMER_PAYOUT' 
  | 'BUYER_REFUND' 
  | 'PARTIAL_REFUND' 
  | 'RE_INSPECTION' 
  | 'MUTUAL_CANCELLATION'

// Backward-compatibility alias
export type DisputeResolution = DisputeResolutionDecision

export interface DisputeEvidenceRecord {
  id: string
  disputeId: string
  uploadedBy: string
  uploaderRole: string
  evidenceType: string
  fileUrl: string
  fileName?: string
  notes?: string
  createdAt: string
}

export interface DisputeRecord {
  id: string
  orderId: string
  raisedBy: string
  raisedByName?: string
  raisedAgainst: string
  raisedAgainstName?: string
  reason: DisputeCategory
  category: DisputeCategory
  description: string
  status: DisputeStatus
  priority: DisputePriority
  disputedAmount: number
  claimedAmount: number
  refundAmount: number
  settlementAmount: number
  claimedWeightLossKg?: number
  qualityGradeClaimed?: string
  assignedAdminId?: string
  resolution?: DisputeResolutionDecision
  resolutionDetails?: Record<string, any>
  resolutionNotes?: string
  settlementAmountFarmer: number
  settlementAmountBuyer: number
  slaDeadline: string
  dueAt: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  evidence?: DisputeEvidenceRecord[]
  orderSummary?: {
    orderNumber: string
    cropName: string
    quantity: number
    totalAmount: number
    paymentStatus: string
    fulfillmentStatus: string
  }
}

/**
 * Calculates deterministic SLA deadline depending on priority.
 * CRITICAL: 12 Hours
 * HIGH: 24 Hours
 * NORMAL: 48 Hours
 */
export function calculateSlaDeadline(priority: DisputePriority): Date {
  const now = new Date()
  let hours = 48
  if (priority === 'CRITICAL') hours = 12
  else if (priority === 'HIGH') hours = 24

  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

/**
 * Automatically calculates priority based on amount and dispute category.
 */
export function determineDisputePriority(category: DisputeCategory, amount: number): DisputePriority {
  if (amount > 100000 || category === 'DAMAGE' || category === 'PRODUCT_NOT_RECEIVED') {
    return 'CRITICAL'
  }
  if (amount > 30000 || category === 'QUALITY_MISMATCH' || category === 'QUANTITY_MISMATCH') {
    return 'HIGH'
  }
  return 'NORMAL'
}

/**
 * Normalizes input category to valid DB enum.
 */
function normalizeCategory(cat: string): DisputeCategory {
  const upper = (cat || 'OTHER').toUpperCase()
  if (upper === 'WEIGHT_SHORTAGE') return 'QUANTITY_MISMATCH'
  if (upper === 'TRANSIT_DAMAGE') return 'DAMAGE'
  if (upper === 'NON_DELIVERY') return 'PRODUCT_NOT_RECEIVED'
  if (upper === 'PAYMENT_ISSUE') return 'PAYMENT'
  if ([
    'QUALITY_MISMATCH', 'QUANTITY_MISMATCH', 'DAMAGE',
    'DELIVERY_DELAY', 'PAYMENT', 'PRODUCT_NOT_RECEIVED', 'OTHER'
  ].includes(upper)) {
    return upper as DisputeCategory
  }
  return 'OTHER'
}

/**
 * Creates a formal trade dispute, automatically freezes escrow payment on the order,
 * and sets SLA timeline.
 */
export async function createDispute(params: {
  orderId: string
  raisedBy: string
  raisedAgainst: string
  reason?: string
  category?: string
  description: string
  disputedAmount?: number
  claimedWeightLossKg?: number
  qualityGradeClaimed?: string
  priorityOverride?: DisputePriority
  initialEvidence?: Array<{
    evidenceType: string
    fileUrl: string
    fileName?: string
    notes?: string
  }>
}): Promise<DisputeRecord> {
  // 1. Verify order exists and retrieve financial state
  const order = await queryOne<any>(`
    SELECT id, farmer_id, buyer_id, crop_name, quantity, total_amount, payment_status, fulfillment_status
    FROM produce_orders
    WHERE id = $1;
  `, [params.orderId])

  if (!order) {
    throw new Error(`Produce order not found: ${params.orderId}`)
  }

  const disputeAmount = params.disputedAmount !== undefined ? params.disputedAmount : Number(order.total_amount || 0)
  const category = normalizeCategory(params.category || params.reason || 'OTHER')
  const priority = params.priorityOverride || determineDisputePriority(category, disputeAmount)
  const slaDeadline = calculateSlaDeadline(priority)
  const disputeId = `DSP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`

  // 2. Insert dispute and update order status within atomic transaction
  await runTransaction(async (client) => {
    // A. Insert dispute
    await client.query(`
      INSERT INTO disputes (
        id, order_id, initiated_by, respondent_id, category, description,
        claimed_amount, refund_amount, settlement_amount, status, priority,
        due_at, resolution, opened_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 0, 0, 'OPEN', $8, $9, '{}'::jsonb, NOW(), NOW(), NOW()
      );
    `, [
      disputeId,
      params.orderId,
      params.raisedBy,
      params.raisedAgainst,
      category,
      params.description,
      disputeAmount,
      priority,
      slaDeadline.toISOString()
    ])

    // B. Freeze escrow by marking order fulfillment_status as 'DISPUTED'
    await client.query(`
      UPDATE produce_orders
      SET fulfillment_status = 'DISPUTED', updated_at = NOW()
      WHERE id = $1;
    `, [params.orderId])

    // C. Insert initial evidence if provided
    if (params.initialEvidence && params.initialEvidence.length > 0) {
      for (const ev of params.initialEvidence) {
        const normEvidenceType = normalizeEvidenceType(ev.evidenceType)
        await client.query(`
          INSERT INTO dispute_evidence (
            dispute_id, uploader_id, uploader_role, evidence_type, reference_url, description, created_at
          ) VALUES (
            $1, $2, 'buyer', $3, $4, $5, NOW()
          );
        `, [
          disputeId,
          params.raisedBy,
          normEvidenceType,
          ev.fileUrl,
          ev.notes || ev.fileName || null
        ])
      }
    }
  })

  // 3. Log audit event
  await logTrustAudit({
    actorId: params.raisedBy,
    actorRole: 'USER',
    action: 'DISPUTE_RAISED',
    entity: 'DISPUTE',
    entityId: disputeId,
    metadata: {
      orderId: params.orderId,
      category,
      priority,
      disputedAmount: disputeAmount
    }
  })

  const fetched = await getDisputeById(disputeId)
  if (!fetched) throw new Error('Dispute created but could not be retrieved')
  return fetched
}

function normalizeEvidenceType(type: string): string {
  const u = (type || 'OTHER').toUpperCase()
  if (u.includes('WEIGHBRIDGE')) return 'WEIGHBRIDGE_RECEIPT'
  if (u.includes('DELIVERY') || u.includes('RECEIPT')) return 'DELIVERY_RECEIPT'
  if (u.includes('QUALITY') || u.includes('REPORT') || u.includes('LAB')) return 'QUALITY_REPORT'
  if (u.includes('IMAGE') || u.includes('PHOTO')) return 'PHOTO'
  if (u.includes('INVOICE')) return 'INVOICE'
  if (['PHOTO', 'DELIVERY_RECEIPT', 'WEIGHBRIDGE_RECEIPT', 'QUALITY_REPORT', 'MESSAGE', 'INVOICE', 'OTHER'].includes(u)) {
    return u
  }
  return 'OTHER'
}

/**
 * Adds supplementary evidence to an open dispute.
 */
export async function addDisputeEvidence(params: {
  disputeId: string
  uploadedBy: string
  uploaderRole?: string
  evidenceType: string
  fileUrl: string
  fileName?: string
  notes?: string
  metadata?: Record<string, any>
}): Promise<DisputeEvidenceRecord> {
  const normType = normalizeEvidenceType(params.evidenceType)
  const role = params.uploaderRole || 'buyer'

  const res = await queryOne<any>(`
    INSERT INTO dispute_evidence (
      dispute_id, uploader_id, uploader_role, evidence_type, reference_url, description, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, NOW()
    ) RETURNING *;
  `, [
    params.disputeId,
    params.uploadedBy,
    role,
    normType,
    params.fileUrl,
    params.notes || params.fileName || null
  ])

  await logTrustAudit({
    actorId: params.uploadedBy,
    actorRole: role,
    action: 'EVIDENCE_SUBMITTED',
    entity: 'DISPUTE_EVIDENCE',
    entityId: String(res.id),
    metadata: {
      disputeId: params.disputeId,
      evidenceType: normType
    }
  })

  return {
    id: String(res.id),
    disputeId: res.dispute_id,
    uploadedBy: res.uploader_id,
    uploaderRole: res.uploader_role,
    evidenceType: res.evidence_type,
    fileUrl: res.reference_url,
    fileName: params.fileName,
    notes: res.notes,
    createdAt: res.created_at
  }
}

/**
 * Resolves dispute with exact decimal financial calculations.
 * Updates dispute with structured resolution JSONB and unfreezes escrow in produce_orders.
 */
export async function resolveDispute(params: {
  disputeId: string
  adminId: string
  resolution: DisputeResolutionDecision
  resolutionNotes: string
  settlementAmountFarmer: number
  settlementAmountBuyer: number
}): Promise<DisputeRecord> {
  const dispute = await queryOne<any>(`
    SELECT * FROM disputes WHERE id = $1;
  `, [params.disputeId])

  if (!dispute) {
    throw new Error(`Dispute not found: ${params.disputeId}`)
  }

  // Exact 2-decimal point precision rounding
  const farmerShare = Math.round(Number(params.settlementAmountFarmer) * 100) / 100
  const buyerShare = Math.round(Number(params.settlementAmountBuyer) * 100) / 100

  const resolutionJson = {
    decision: params.resolution,
    refund_to_buyer: buyerShare,
    release_to_farmer: farmerShare,
    admin_notes: params.resolutionNotes,
    resolved_at: new Date().toISOString()
  }

  // Run resolution transaction
  await runTransaction(async (client) => {
    // 1. Update dispute
    await client.query(`
      UPDATE disputes
      SET 
        status = 'RESOLVED',
        resolution = $1,
        reviewer_id = $2,
        reviewer_notes = $3,
        refund_amount = $4,
        settlement_amount = $5,
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = $6;
    `, [
      JSON.stringify(resolutionJson),
      params.adminId,
      params.resolutionNotes,
      buyerShare,
      farmerShare,
      params.disputeId
    ])

    // 2. Unfreeze order and set exact fulfillment & payment statuses
    const newPaymentStatus = buyerShare > 0 ? 'REFUNDED' : 'PAID'
    const newFulfillmentStatus = buyerShare > 0 && farmerShare === 0 ? 'REFUNDED' : 'COMPLETED'

    await client.query(`
      UPDATE produce_orders
      SET 
        fulfillment_status = $1,
        payment_status = $2,
        updated_at = NOW()
      WHERE id = $3;
    `, [newFulfillmentStatus, newPaymentStatus, dispute.order_id])
  })

  // 3. Recalculate trust scores for both farmer and buyer
  try {
    await calculateTrustScore(dispute.initiated_by)
    await calculateTrustScore(dispute.respondent_id)
  } catch (scoreErr) {
    console.warn('[Trust Score Refresh after Dispute] Warning:', scoreErr)
  }

  // 4. Immutable audit logging
  await logTrustAudit({
    actorId: params.adminId,
    actorRole: 'ADMIN',
    action: 'DISPUTE_RESOLVED',
    entity: 'DISPUTE',
    entityId: params.disputeId,
    metadata: {
      resolution: params.resolution,
      settlementAmountFarmer: farmerShare,
      settlementAmountBuyer: buyerShare,
      notes: params.resolutionNotes
    }
  })

  const updated = await getDisputeById(params.disputeId)
  if (!updated) throw new Error('Dispute resolved but could not be fetched')
  return updated
}

/**
 * Retrieves a single dispute with evidence and related order data.
 */
export async function getDisputeById(disputeId: string): Promise<DisputeRecord | null> {
  const row = await queryOne<any>(`
    SELECT 
      d.*,
      u1.name as raised_by_name,
      u2.name as raised_against_name,
      o.id as order_number,
      o.crop_name,
      o.quantity,
      o.total_amount,
      o.payment_status,
      o.fulfillment_status
    FROM disputes d
    LEFT JOIN users u1 ON d.initiated_by = u1.id
    LEFT JOIN users u2 ON d.respondent_id = u2.id
    LEFT JOIN produce_orders o ON d.order_id = o.id
    WHERE d.id = $1;
  `, [disputeId])

  if (!row) return null

  const evidenceRows = await query<any>(`
    SELECT * FROM dispute_evidence
    WHERE dispute_id = $1
    ORDER BY created_at ASC;
  `, [disputeId])

  const evidence: DisputeEvidenceRecord[] = evidenceRows.map(ev => ({
    id: String(ev.id),
    disputeId: ev.dispute_id,
    uploadedBy: ev.uploader_id,
    uploaderRole: ev.uploader_role,
    evidenceType: ev.evidence_type,
    fileUrl: ev.reference_url,
    notes: ev.description,
    createdAt: ev.created_at
  }))

  const resJson = typeof row.resolution === 'object' ? row.resolution : JSON.parse(row.resolution || '{}')

  return {
    id: row.id,
    orderId: row.order_id,
    raisedBy: row.initiated_by,
    raisedByName: row.raised_by_name,
    raisedAgainst: row.respondent_id,
    raisedAgainstName: row.raised_against_name,
    reason: row.category,
    category: row.category,
    description: row.description,
    status: row.status,
    priority: row.priority,
    disputedAmount: Number(row.claimed_amount || 0),
    claimedAmount: Number(row.claimed_amount || 0),
    refundAmount: Number(row.refund_amount || 0),
    settlementAmount: Number(row.settlement_amount || 0),
    assignedAdminId: row.reviewer_id,
    resolution: resJson?.decision,
    resolutionDetails: resJson,
    resolutionNotes: row.reviewer_notes,
    settlementAmountFarmer: Number(row.settlement_amount || resJson?.release_to_farmer || 0),
    settlementAmountBuyer: Number(row.refund_amount || resJson?.refund_to_buyer || 0),
    slaDeadline: row.due_at,
    dueAt: row.due_at,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    evidence,
    orderSummary: {
      orderNumber: row.order_number || '',
      cropName: row.crop_name || '',
      quantity: Number(row.quantity || 0),
      totalAmount: Number(row.total_amount || 0),
      paymentStatus: row.payment_status || '',
      fulfillmentStatus: row.fulfillment_status || ''
    }
  }
}

/**
 * Retrieves disputes with optional filters.
 */
export async function getDisputes(filter: {
  status?: DisputeStatus
  userId?: string
  priority?: DisputePriority
  limit?: number
  offset?: number
} = {}): Promise<DisputeRecord[]> {
  const whereClauses: string[] = []
  const params: any[] = []

  if (filter.status) {
    params.push(filter.status)
    whereClauses.push(`d.status = $${params.length}`)
  }

  if (filter.userId) {
    params.push(filter.userId, filter.userId)
    whereClauses.push(`(d.initiated_by = $${params.length - 1} OR d.respondent_id = $${params.length})`)
  }

  if (filter.priority) {
    params.push(filter.priority)
    whereClauses.push(`d.priority = $${params.length}`)
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
  const limit = filter.limit || 50
  const offset = filter.offset || 0

  const rows = await query<any>(`
    SELECT 
      d.*,
      u1.name as raised_by_name,
      u2.name as raised_against_name,
      o.id as order_number,
      o.crop_name,
      o.quantity,
      o.total_amount,
      o.payment_status,
      o.fulfillment_status
    FROM disputes d
    LEFT JOIN users u1 ON d.initiated_by = u1.id
    LEFT JOIN users u2 ON d.respondent_id = u2.id
    LEFT JOIN produce_orders o ON d.order_id = o.id
    ${whereSql}
    ORDER BY 
      CASE WHEN d.status = 'OPEN' THEN 1 WHEN d.status = 'UNDER_REVIEW' THEN 2 ELSE 3 END,
      d.created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `, params)

  return rows.map(row => {
    const resJson = typeof row.resolution === 'object' ? row.resolution : JSON.parse(row.resolution || '{}')
    return {
      id: row.id,
      orderId: row.order_id,
      raisedBy: row.initiated_by,
      raisedByName: row.raised_by_name,
      raisedAgainst: row.respondent_id,
      raisedAgainstName: row.raised_against_name,
      reason: row.category,
      category: row.category,
      description: row.description,
      status: row.status,
      priority: row.priority,
      disputedAmount: Number(row.claimed_amount || 0),
      claimedAmount: Number(row.claimed_amount || 0),
      refundAmount: Number(row.refund_amount || 0),
      settlementAmount: Number(row.settlement_amount || 0),
      assignedAdminId: row.reviewer_id,
      resolution: resJson?.decision,
      resolutionDetails: resJson,
      resolutionNotes: row.reviewer_notes,
      settlementAmountFarmer: Number(row.settlement_amount || resJson?.release_to_farmer || 0),
      settlementAmountBuyer: Number(row.refund_amount || resJson?.refund_to_buyer || 0),
      slaDeadline: row.due_at,
      dueAt: row.due_at,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      orderSummary: {
        orderNumber: row.order_number || '',
        cropName: row.crop_name || '',
        quantity: Number(row.quantity || 0),
        totalAmount: Number(row.total_amount || 0),
        paymentStatus: row.payment_status || '',
        fulfillmentStatus: row.fulfillment_status || ''
      }
    }
  })
}
