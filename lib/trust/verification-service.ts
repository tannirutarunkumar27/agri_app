import { query, queryOne, execute, runTransaction } from '@/lib/db'

export type FarmerVerificationLevel = 'UNVERIFIED' | 'PHONE_VERIFIED' | 'BASIC_VERIFIED' | 'FULLY_VERIFIED'
export type BuyerVerificationLevel = 'UNVERIFIED' | 'PHONE_VERIFIED' | 'BUSINESS_VERIFIED' | 'FULLY_VERIFIED'
export type TransporterVerificationLevel = 'UNVERIFIED' | 'DOCUMENT_VERIFIED' | 'VEHICLE_VERIFIED' | 'FULLY_VERIFIED'
export type UserVerificationLevel = FarmerVerificationLevel | BuyerVerificationLevel | TransporterVerificationLevel

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED'

export interface UserVerificationRecord {
  id: string
  userId: string
  userName?: string
  userPhone?: string
  userRole: string
  verificationType: string
  submittedLevel: string
  status: VerificationStatus
  documentReference?: string
  documentMetadata: Record<string, any>
  rejectionReason?: string
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

/**
 * Log action into immutable trust_audit_logs table.
 */
export async function logTrustAudit(params: {
  actorId: string
  actorRole: string
  action: string
  entity: string
  entityId: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    await execute(`
      INSERT INTO trust_audit_logs (actor_id, actor_role, action, entity, entity_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      params.actorId,
      params.actorRole,
      params.action,
      params.entity,
      params.entityId,
      JSON.stringify(params.metadata || {})
    ])
  } catch (err) {
    console.error('[Trust Audit Log] error:', err)
  }
}

/**
 * Submit a new verification document or request.
 */
export async function submitVerification(params: {
  userId: string
  userRole?: string
  verificationType: string
  submittedLevel: string
  documentReference?: string
  documentMetadata?: Record<string, any>
  notes?: string
}): Promise<UserVerificationRecord> {
  let role = params.userRole
  if (!role) {
    const u = await queryOne<any>('SELECT role FROM users WHERE id = $1', [params.userId])
    role = u?.role || 'farmer'
  }

  const id = `verif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  await execute(`
    INSERT INTO user_verifications (
      id, user_id, user_role, verification_type, submitted_level, status,
      document_reference, document_metadata, notes
    ) VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8);
  `, [
    id,
    params.userId,
    role,
    params.verificationType,
    params.submittedLevel,
    params.documentReference || null,
    JSON.stringify(params.documentMetadata || {}),
    params.notes || null
  ])

  await logTrustAudit({
    actorId: params.userId,
    actorRole: role,
    action: 'VERIFICATION_SUBMITTED',
    entity: 'USER_VERIFICATION',
    entityId: id,
    metadata: {
      verification_type: params.verificationType,
      target_level: params.submittedLevel
    }
  })

  const inserted = await queryOne<any>('SELECT * FROM user_verifications WHERE id = $1', [id])
  return {
    id: inserted.id,
    userId: inserted.user_id,
    userRole: inserted.user_role,
    verificationType: inserted.verification_type,
    submittedLevel: inserted.submitted_level,
    status: inserted.status,
    documentReference: inserted.document_reference,
    documentMetadata: typeof inserted.document_metadata === 'object' ? inserted.document_metadata : {},
    rejectionReason: inserted.rejection_reason,
    notes: inserted.notes,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at
  }
}

/**
 * List verification requests for admin center with rich filters.
 */
export async function getVerificationRequests(filters?: {
  role?: string
  status?: VerificationStatus
  userId?: string
  limit?: number
}): Promise<UserVerificationRecord[]> {
  let sql = `
    SELECT 
      uv.*,
      u.name as user_name,
      u.phone as user_phone
    FROM user_verifications uv
    LEFT JOIN users u ON uv.user_id = u.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filters?.role && filters.role !== 'ALL') {
    params.push(filters.role)
    sql += ` AND uv.user_role = $${params.length}`
  }

  if (filters?.status) {
    params.push(filters.status)
    sql += ` AND uv.status = $${params.length}`
  }

  if (filters?.userId) {
    params.push(filters.userId)
    sql += ` AND uv.user_id = $${params.length}`
  }

  sql += ` ORDER BY uv.created_at DESC LIMIT $${params.length + 1};`
  params.push(filters?.limit || 50)

  const rows = await query<any>(sql, params)

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || 'Registered User',
    userPhone: r.user_phone || '',
    userRole: r.user_role,
    verificationType: r.verification_type,
    submittedLevel: r.submitted_level,
    status: r.status,
    documentReference: r.document_reference,
    documentMetadata: typeof r.document_metadata === 'object' ? r.document_metadata : {},
    rejectionReason: r.rejection_reason,
    notes: r.notes,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    expiryDate: r.expiry_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }))
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'SUSPEND' | 'REQUEST_MORE_INFORMATION'

/**
 * Admin action on verification request: APPROVE, REJECT, SUSPEND, REQUEST_MORE_INFORMATION.
 * Atomic update on verification record and user table.
 */
export async function reviewVerification(params: {
  verificationId: string
  reviewerId?: string
  adminId?: string
  action: ReviewAction
  rejectionReason?: string
  notes?: string
  awardedLevel?: UserVerificationLevel
  expiryDate?: string
}): Promise<{ success: boolean; status: VerificationStatus; newStatus: VerificationStatus }> {
  const adminActorId = params.reviewerId || params.adminId || 'admin-system'
  return await runTransaction(async (tx) => {
    const verif = await tx.queryOne<any>(
      'SELECT * FROM user_verifications WHERE id = $1 FOR UPDATE;',
      [params.verificationId]
    )

    if (!verif) {
      throw new Error(`Verification request #${params.verificationId} not found`)
    }

    let newStatus: VerificationStatus = 'PENDING'
    let levelToAward: UserVerificationLevel | null = null

    if (params.action === 'APPROVE') {
      newStatus = 'APPROVED'
      levelToAward = (params.awardedLevel || verif.submitted_level) as UserVerificationLevel
    } else if (params.action === 'REJECT') {
      newStatus = 'REJECTED'
    } else if (params.action === 'SUSPEND') {
      newStatus = 'SUSPENDED'
      levelToAward = 'UNVERIFIED'
    } else if (params.action === 'REQUEST_MORE_INFORMATION') {
      newStatus = 'PENDING'
    }

    // 1. Update verification record
    await tx.execute(`
      UPDATE user_verifications
      SET status = $1,
          reviewed_by = $2,
          reviewed_at = CURRENT_TIMESTAMP,
          rejection_reason = $3,
          notes = COALESCE($4, notes),
          expiry_date = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6;
    `, [
      newStatus,
      params.reviewerId,
      params.rejectionReason || null,
      params.notes || null,
      params.expiryDate || null,
      params.verificationId
    ])

    // 2. Update user profile if approved or suspended
    if (levelToAward) {
      await tx.execute(`
        UPDATE users
        SET verification_level = $1
        WHERE id = $2;
      `, [levelToAward, verif.user_id])

      // Synchronize with buyer_profiles or transporters if role matches
      if (verif.user_role === 'buyer') {
        await tx.execute(`
          UPDATE buyer_profiles
          SET verification_level = $1
          WHERE user_id = $2;
        `, [levelToAward, verif.user_id])
      } else if (verif.user_role === 'transporter') {
        const transStatus = levelToAward === 'UNVERIFIED' ? 'UNVERIFIED' : 'VERIFIED'
        await tx.execute(`
          UPDATE transporters
          SET verification_status = $1
          WHERE user_id = $2;
        `, [transStatus, verif.user_id])
      }
    }

    const auditAction = params.action === 'APPROVE' 
      ? 'VERIFICATION_APPROVED' 
      : params.action === 'REJECT' 
        ? 'VERIFICATION_REJECTED' 
        : `VERIFICATION_${params.action}`

    // 3. Log audit event
    await tx.execute(`
      INSERT INTO trust_audit_logs (actor_id, actor_role, action, entity, entity_id, metadata)
      VALUES ($1, 'admin', $2, 'USER_VERIFICATION', $3, $4);
    `, [
      adminActorId,
      auditAction,
      params.verificationId,
      JSON.stringify({
        user_id: verif.user_id,
        user_role: verif.user_role,
        action: params.action,
        awarded_level: levelToAward,
        reason: params.rejectionReason
      })
    ])

    return { success: true, status: newStatus, newStatus }
  })
}

export const getAllVerifications = getVerificationRequests
export const getVerificationsByUser = (userId: string) => getVerificationRequests({ userId })
