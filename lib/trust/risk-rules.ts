import { query, queryOne, execute } from '@/lib/db'
import { logTrustAudit } from './verification-service'

export type RiskType = 
  | 'QUANTITY_MISMATCH' 
  | 'PRICE_DEVIATION' 
  | 'REPEAT_DISPUTE' 
  | 'RAPID_CANCELLATION' 
  | 'UNVERIFIED_HIGH_VALUE'

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskFlagStatus = 'DETECTED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE'

export interface RiskFlagRecord {
  id: string
  transactionType: string
  transactionId: string
  userId: string
  userName?: string
  riskType: RiskType
  ruleName: string
  severity: RiskSeverity
  details: Record<string, any>
  explanation: string
  status: RiskFlagStatus
  isDismissed: boolean
  flaggedAt: string
}

/**
 * Evaluates an order for risk anomalies:
 * 1. Unverified user placing/fulfilling high-value trade (> Rs. 100,000)
 * 2. Repeat disputes on active accounts
 * 3. Extreme price divergence (>35%) from modal mandi reference
 */
export async function evaluateOrderRisk(orderId: string): Promise<RiskFlagRecord[]> {
  const order = await queryOne<any>(`
    SELECT 
      o.*,
      buyer.verification_level as buyer_vlevel,
      buyer.name as buyer_name,
      seller.verification_level as seller_vlevel,
      seller.name as seller_name
    FROM produce_orders o
    LEFT JOIN users buyer ON o.buyer_id = buyer.id
    LEFT JOIN users seller ON o.farmer_id = seller.id
    WHERE o.id = $1;
  `, [orderId])

  if (!order) return []

  const generatedFlags: RiskFlagRecord[] = []
  const totalAmount = Number(order.total_amount || 0)

  // 1. High value trade with unverified counterpart
  if (totalAmount >= 100000) {
    if (order.buyer_vlevel === 'UNVERIFIED' || !order.buyer_vlevel) {
      const flag = await insertRiskFlag({
        orderId,
        userId: order.buyer_id,
        ruleName: 'UNVERIFIED_HIGH_VALUE',
        severity: 'HIGH',
        explanation: `High value transaction (₹${totalAmount.toLocaleString()}) initiated by unverified buyer.`,
        detectedValues: {
          role: 'BUYER',
          orderAmount: totalAmount,
          verificationLevel: order.buyer_vlevel || 'UNVERIFIED'
        }
      })
      generatedFlags.push(flag)
    }

    if (order.seller_vlevel === 'UNVERIFIED' || !order.seller_vlevel) {
      const flag = await insertRiskFlag({
        orderId,
        userId: order.farmer_id,
        ruleName: 'UNVERIFIED_HIGH_VALUE',
        severity: 'HIGH',
        explanation: `High value transaction (₹${totalAmount.toLocaleString()}) committed by unverified farmer.`,
        detectedValues: {
          role: 'SELLER',
          orderAmount: totalAmount,
          verificationLevel: order.seller_vlevel || 'UNVERIFIED'
        }
      })
      generatedFlags.push(flag)
    }
  }

  // 2. Repeat dispute check for buyer or seller
  const buyerDisputes = await queryOne<any>(`
    SELECT COUNT(*) as count FROM disputes WHERE initiated_by = $1 OR respondent_id = $1;
  `, [order.buyer_id])
  if (parseInt(buyerDisputes?.count || '0', 10) >= 3) {
    const flag = await insertRiskFlag({
      orderId,
      userId: order.buyer_id,
      ruleName: 'REPEAT_DISPUTE',
      severity: 'MEDIUM',
      explanation: `Buyer has ${buyerDisputes.count} prior dispute records.`,
      detectedValues: {
        role: 'BUYER',
        priorDisputeCount: parseInt(buyerDisputes.count, 10)
      }
    })
    generatedFlags.push(flag)
  }

  // 3. Price deviation check vs mandi modal price if available
  const unitPriceVal = Number(order.agreed_price_per_unit || order.unit_price || 0)
  if (order.crop_name && unitPriceVal > 0) {
    const mandiPrice = await queryOne<any>(`
      SELECT modal_price 
      FROM mandi_prices 
      WHERE LOWER(commodity) = LOWER($1) 
      ORDER BY arrival_date DESC 
      LIMIT 1;
    `, [order.crop_name])

    if (mandiPrice && Number(mandiPrice.modal_price) > 0) {
      const benchmarkKg = Number(mandiPrice.modal_price) / 100
      const deviationPct = Math.abs(((unitPriceVal - benchmarkKg) / benchmarkKg) * 100)

      if (deviationPct > 35) {
        const flag = await insertRiskFlag({
          orderId,
          userId: order.farmer_id,
          ruleName: 'PRICE_DEVIATION',
          severity: deviationPct > 60 ? 'HIGH' : 'MEDIUM',
          explanation: `Unit trade price ₹${unitPriceVal}/kg deviates ${deviationPct.toFixed(1)}% from mandi benchmark ₹${benchmarkKg.toFixed(1)}/kg.`,
          detectedValues: {
            orderUnitPrice: unitPriceVal,
            benchmarkMandiKg: benchmarkKg,
            deviationPct: Number(deviationPct.toFixed(1))
          }
        })
        generatedFlags.push(flag)
      }
    }
  }

  return generatedFlags
}

/**
 * Evaluates produce quality and weighbridge records for significant shrinkage or weight discrepancy.
 */
export async function evaluateQualityVarianceRisk(qualityRecordId: string): Promise<RiskFlagRecord | null> {
  const row = await queryOne<any>(`
    SELECT * FROM produce_quality_records WHERE id = $1;
  `, [qualityRecordId])

  if (!row) return null

  const declared = Number(row.declared_quantity || 0)
  const delivered = Number(row.delivered_quantity || 0)

  if (declared > 0 && delivered > 0) {
    const shortageKg = declared - delivered
    const shortagePct = (shortageKg / declared) * 100

    // Trigger flag if loss is greater than 5%
    if (shortagePct > 5.0) {
      const severity: RiskSeverity = shortagePct > 15 ? 'CRITICAL' : (shortagePct > 10 ? 'HIGH' : 'MEDIUM')
      
      const flag = await insertRiskFlag({
        orderId: row.order_id,
        listingId: row.listing_id,
        ruleName: 'QUANTITY_MISMATCH',
        severity,
        explanation: `Weight shortage of ${shortagePct.toFixed(2)}% (${shortageKg.toFixed(1)} kg) exceeds the 5% acceptable transit tolerance threshold.`,
        detectedValues: {
          lotId: row.lot_id,
          declaredKg: declared,
          deliveredKg: delivered,
          shortageKg: Number(shortageKg.toFixed(2)),
          shortagePercentage: Number(shortagePct.toFixed(2))
        }
      })
      return flag
    }
  }

  return null
}

async function insertRiskFlag(params: {
  orderId?: string
  userId?: string
  listingId?: string
  ruleName: string
  severity: RiskSeverity
  explanation: string
  detectedValues: Record<string, any>
}): Promise<RiskFlagRecord> {
  const res = await queryOne<any>(`
    INSERT INTO transaction_risk_flags (
      order_id, user_id, listing_id, rule_name, severity, explanation, detected_values, is_dismissed, created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, false, NOW()
    ) RETURNING *;
  `, [
    params.orderId || null,
    params.userId || null,
    params.listingId || null,
    params.ruleName,
    params.severity,
    params.explanation,
    JSON.stringify(params.detectedValues)
  ])

  await logTrustAudit({
    actorId: 'system',
    actorRole: 'SYSTEM',
    action: 'RISK_FLAG_TRIGGERED',
    entity: 'TRANSACTION_RISK_FLAG',
    entityId: String(res.id),
    metadata: {
      ruleName: params.ruleName,
      severity: params.severity,
      orderId: params.orderId
    }
  })

  return {
    id: String(res.id),
    transactionType: params.orderId ? 'ORDER' : 'QUALITY_RECORD',
    transactionId: params.orderId || String(res.id),
    userId: params.userId || '',
    riskType: params.ruleName as RiskType,
    ruleName: params.ruleName,
    severity: params.severity,
    details: params.detectedValues,
    explanation: params.explanation,
    status: 'DETECTED',
    isDismissed: false,
    flaggedAt: res.created_at
  }
}

export async function getRiskFlags(filter: {
  severity?: RiskSeverity
  limit?: number
  isDismissed?: boolean
} = {}): Promise<RiskFlagRecord[]> {
  const whereClauses: string[] = []
  const params: any[] = []

  if (filter.isDismissed !== undefined) {
    params.push(filter.isDismissed)
    whereClauses.push(`rf.is_dismissed = $${params.length}`)
  } else {
    whereClauses.push(`rf.is_dismissed = false`)
  }

  if (filter.severity) {
    params.push(filter.severity)
    whereClauses.push(`rf.severity = $${params.length}`)
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
  const limit = filter.limit || 50

  const rows = await query<any>(`
    SELECT 
      rf.*,
      u.name as user_name
    FROM transaction_risk_flags rf
    LEFT JOIN users u ON rf.user_id = u.id
    ${whereSql}
    ORDER BY 
      CASE WHEN rf.severity = 'CRITICAL' THEN 1 WHEN rf.severity = 'HIGH' THEN 2 WHEN rf.severity = 'MEDIUM' THEN 3 ELSE 4 END,
      rf.created_at DESC
    LIMIT ${limit};
  `, params)

  return rows.map(r => ({
    id: String(r.id),
    transactionType: r.order_id ? 'ORDER' : 'QUALITY_RECORD',
    transactionId: r.order_id || String(r.id),
    userId: r.user_id,
    userName: r.user_name,
    riskType: r.rule_name as RiskType,
    ruleName: r.rule_name,
    severity: r.severity,
    details: typeof r.detected_values === 'object' ? r.detected_values : JSON.parse(r.detected_values || '{}'),
    explanation: r.explanation,
    status: r.is_dismissed ? 'RESOLVED' : 'DETECTED',
    isDismissed: r.is_dismissed,
    flaggedAt: r.created_at
  }))
}

export async function resolveRiskFlag(params: {
  flagId: string
  adminId: string
  newStatus?: string
  notes?: string
}): Promise<void> {
  await execute(`
    UPDATE transaction_risk_flags
    SET is_dismissed = true, dismissed_by = $1, dismissed_at = NOW()
    WHERE id = $2;
  `, [params.adminId, params.flagId])

  await logTrustAudit({
    actorId: params.adminId,
    actorRole: 'ADMIN',
    action: 'RISK_FLAG_DISMISSED',
    entity: 'TRANSACTION_RISK_FLAG',
    entityId: params.flagId,
    metadata: { notes: params.notes }
  })
}
