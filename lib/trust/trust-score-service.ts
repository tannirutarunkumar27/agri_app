import { query, queryOne, execute } from '@/lib/db'
import { logTrustAudit } from './verification-service'

export interface TrustFactorExplanation {
  category: string
  points: number
  maxPoints: number
  description: string
  status: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
}

export interface TrustScoreBreakdown {
  verificationPoints: number
  fulfillmentPoints: number
  volumePoints: number
  tenurePoints: number
  disputePenalty: number
  cancellationPenalty: number
  totalScore: number
  explanation: TrustFactorExplanation[]
  calculatedAt: string
}

export interface TrustProfile {
  userId: string
  name: string
  phone: string
  role: string
  verificationLevel: string
  trustScore: number
  trustBreakdown: TrustScoreBreakdown
  totalCompletedOrders: number
  disputeCount: number
  resolvedDisputeCount: number
  cancellationCount: number
  memberSince: string
}

/**
 * Calculates deterministic and explainable Trust Score (0-100) for a given user.
 * Prevents single-strike score destruction and returns an itemized "Why?" explanation.
 */
export async function calculateTrustScore(userId: string): Promise<TrustScoreBreakdown> {
  const user = await queryOne<any>(`
    SELECT id, name, phone, role, verification_level, created_at, trust_score, trust_breakdown
    FROM users
    WHERE id = $1;
  `, [userId])

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // 1. Verification Level Component (0 to 25 pts)
  let verificationPoints = 5 // base
  let verificationDesc = 'Basic account created'
  const vLevel = (user.verification_level || 'UNVERIFIED').toUpperCase()

  if (vLevel === 'FULLY_VERIFIED') {
    verificationPoints = 25
    verificationDesc = 'Account is Fully Verified with confirmed legal identity and documentation.'
  } else if (vLevel === 'BUSINESS_VERIFIED' || vLevel === 'BASIC_VERIFIED' || vLevel === 'VEHICLE_VERIFIED') {
    verificationPoints = 20
    verificationDesc = 'Standard entity and identity verification documents submitted and approved.'
  } else if (vLevel === 'DOCUMENT_VERIFIED') {
    verificationPoints = 15
    verificationDesc = 'Commercial documents submitted and approved.'
  } else if (vLevel === 'PHONE_VERIFIED') {
    verificationPoints = 10
    verificationDesc = 'Contact phone number authenticated.'
  } else {
    verificationPoints = 5
    verificationDesc = 'Unverified account. Submit credentials to increase trust standing.'
  }

  // 2. Completed Orders & Volume Component (0 to 25 pts)
  // Queries produce_orders as farmer or buyer
  const orderStats = await queryOne<any>(`
    SELECT 
      COUNT(*) FILTER (WHERE fulfillment_status IN ('DELIVERED', 'COMPLETED') OR payment_status = 'PAID') as completed_count,
      COUNT(*) FILTER (WHERE fulfillment_status = 'CANCELLED') as cancelled_count,
      COUNT(*) as total_orders
    FROM produce_orders
    WHERE farmer_id = $1 OR buyer_id = $1;
  `, [userId])

  const completedOrders = parseInt(orderStats?.completed_count || '0', 10)
  const cancelledOrders = parseInt(orderStats?.cancelled_count || '0', 10)

  // 2.5 pts per completed order, up to 25 pts
  const volumePoints = Math.min(25, Math.round(completedOrders * 2.5))
  const volumeDesc = completedOrders > 0
    ? `${completedOrders} successfully completed commercial trade(s) on FarmDirect.`
    : 'No completed trades recorded yet.'

  // 3. Fulfillment Rate & Dispute Track Record (0 to 20 pts)
  const disputeStats = await queryOne<any>(`
    SELECT 
      COUNT(*) as total_disputes,
      COUNT(*) FILTER (WHERE status = 'RESOLVED' AND (resolution->>'decision') IN ('BUYER_REFUND', 'PARTIAL_REFUND') AND respondent_id = $1) as lost_disputes,
      COUNT(*) FILTER (WHERE status = 'RESOLVED' AND (resolution->>'decision') = 'FARMER_PAYOUT' AND initiated_by = $1) as won_disputes,
      COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_disputes
    FROM disputes
    WHERE initiated_by = $1 OR respondent_id = $1;
  `, [userId])

  const totalDisputes = parseInt(disputeStats?.total_disputes || '0', 10)
  const lostDisputes = parseInt(disputeStats?.lost_disputes || '0', 10)

  let fulfillmentPoints = 20
  if (completedOrders === 0) {
    fulfillmentPoints = 10 // Neutral default for new users
  } else if (totalDisputes > 0) {
    const disputeRatio = totalDisputes / Math.max(completedOrders, 1)
    if (disputeRatio > 0.2) fulfillmentPoints = 5
    else if (disputeRatio > 0.1) fulfillmentPoints = 12
  }

  // 4. Platform Tenure (0 to 10 pts)
  const createdAt = new Date(user.created_at || Date.now())
  const daysActive = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
  const tenurePoints = Math.min(10, Math.max(3, Math.floor(daysActive / 10) + 3))
  const tenureDesc = `Account registered for ${daysActive} day(s).`

  // 5. Penalties (Strictly capped to prevent unexplainable single-strike drops)
  // Max dispute penalty: -25 pts (-10 per lost dispute)
  const disputePenalty = Math.min(25, lostDisputes * 10)
  // Max cancellation penalty: -15 pts (-5 per unexcused cancellation)
  const cancellationPenalty = Math.min(15, cancelledOrders * 5)

  // Raw sum calculation
  let rawScore = verificationPoints + volumePoints + fulfillmentPoints + tenurePoints - disputePenalty - cancellationPenalty
  // Normalize between 10 and 100
  const totalScore = Math.min(100, Math.max(10, rawScore))

  // Construct transparent explanations
  const explanation: TrustFactorExplanation[] = [
    {
      category: 'Identity & Accreditation',
      points: verificationPoints,
      maxPoints: 25,
      description: verificationDesc,
      status: verificationPoints >= 20 ? 'POSITIVE' : (verificationPoints >= 10 ? 'NEUTRAL' : 'NEGATIVE')
    },
    {
      category: 'Commercial Order History',
      points: volumePoints,
      maxPoints: 25,
      description: volumeDesc,
      status: volumePoints >= 15 ? 'POSITIVE' : 'NEUTRAL'
    },
    {
      category: 'Fulfillment & Reliability',
      points: fulfillmentPoints,
      maxPoints: 20,
      description: totalDisputes === 0 ? 'Exemplary fulfillment without outstanding disputes.' : `${totalDisputes} total trade dispute(s) reported.`,
      status: fulfillmentPoints >= 15 ? 'POSITIVE' : 'NEGATIVE'
    },
    {
      category: 'Platform Tenure',
      points: tenurePoints,
      maxPoints: 10,
      description: tenureDesc,
      status: 'NEUTRAL'
    }
  ]

  if (disputePenalty > 0) {
    explanation.push({
      category: 'Dispute Penalty',
      points: -disputePenalty,
      maxPoints: 0,
      description: `Deduction of ${disputePenalty} pts for ${lostDisputes} resolved dispute fault(s).`,
      status: 'NEGATIVE'
    })
  }

  if (cancellationPenalty > 0) {
    explanation.push({
      category: 'Order Cancellation Penalty',
      points: -cancellationPenalty,
      maxPoints: 0,
      description: `Deduction of ${cancellationPenalty} pts for ${cancelledOrders} post-booking trade cancellation(s).`,
      status: 'NEGATIVE'
    })
  }

  const breakdown: TrustScoreBreakdown = {
    verificationPoints,
    fulfillmentPoints,
    volumePoints,
    tenurePoints,
    disputePenalty,
    cancellationPenalty,
    totalScore,
    explanation,
    calculatedAt: new Date().toISOString()
  }

  // Update user in DB
  await execute(`
    UPDATE users
    SET trust_score = $1, trust_breakdown = $2
    WHERE id = $3;
  `, [totalScore, JSON.stringify(breakdown), userId])

  return breakdown
}

/**
 * Returns user trust profile with complete explainability data.
 */
export async function getTrustProfile(userId: string): Promise<TrustProfile> {
  let user = await queryOne<any>(`
    SELECT id, name, phone, role, verification_level, trust_score, trust_breakdown, created_at
    FROM users
    WHERE id = $1;
  `, [userId])

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // If score has never been calculated or breakdown is missing, compute it now
  let breakdown: TrustScoreBreakdown
  if (!user.trust_breakdown || typeof user.trust_breakdown !== 'object') {
    breakdown = await calculateTrustScore(userId)
    user.trust_score = breakdown.totalScore
  } else {
    breakdown = user.trust_breakdown as TrustScoreBreakdown
  }

  const orderStats = await queryOne<any>(`
    SELECT 
      COUNT(*) FILTER (WHERE fulfillment_status IN ('DELIVERED', 'COMPLETED') OR payment_status = 'PAID') as completed_count,
      COUNT(*) FILTER (WHERE fulfillment_status = 'CANCELLED') as cancelled_count
    FROM produce_orders
    WHERE farmer_id = $1 OR buyer_id = $1;
  `, [userId])

  const disputeStats = await queryOne<any>(`
    SELECT 
      COUNT(*) as total_disputes,
      COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_disputes
    FROM disputes
    WHERE initiated_by = $1 OR respondent_id = $1;
  `, [userId])

  return {
    userId: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    verificationLevel: user.verification_level || 'UNVERIFIED',
    trustScore: user.trust_score || 50,
    trustBreakdown: breakdown,
    totalCompletedOrders: parseInt(orderStats?.completed_count || '0', 10),
    disputeCount: parseInt(disputeStats?.total_disputes || '0', 10),
    resolvedDisputeCount: parseInt(disputeStats?.resolved_disputes || '0', 10),
    cancellationCount: parseInt(orderStats?.cancelled_count || '0', 10),
    memberSince: user.created_at
  }
}
