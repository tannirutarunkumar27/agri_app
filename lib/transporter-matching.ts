/**
 * FarmDirect Deterministic Transporter Matching & Ranking Engine
 * Evaluates candidate transporters against delivery requirements and outputs ranked scores.
 */

export interface CargoRequirements {
  originLocation: string
  destinationLocation: string
  quantity: number
  unit: string
  refrigerationRequired: boolean
  specialRequirements?: string
}

export interface CandidateTransporter {
  id: string
  businessName: string
  contactName: string
  phone: string
  vehicleType: string
  vehicleNumber: string
  carryingCapacity: number
  capacityUnit: string
  serviceArea: string[]
  baseLocation: string
  verificationStatus: string
  rating: number
  totalCompletedJobs: number
  refrigerationAvailable?: boolean
}

export interface MatchedTransporter extends CandidateTransporter {
  matchScore: number // 0 - 100%
  matchReasons: string[]
  isEligible: boolean
  rejectionReason?: string
}

export function rankTransportersForJob(
  requirements: CargoRequirements,
  candidates: CandidateTransporter[]
): MatchedTransporter[] {
  const reqQty = Number(requirements.quantity) || 1
  const origin = (requirements.originLocation || '').toLowerCase()
  const dest = (requirements.destinationLocation || '').toLowerCase()

  const scored: MatchedTransporter[] = candidates.map((transporter) => {
    let score = 0
    const reasons: string[] = []
    let isEligible = true
    let rejectionReason: string | undefined

    // 1. Capacity Check (Weight in Quintals)
    const capacity = Number(transporter.carryingCapacity) || 0
    if (capacity < reqQty) {
      isEligible = false
      rejectionReason = `Insufficient capacity: Vehicle holds ${capacity} ${transporter.capacityUnit}, cargo is ${reqQty} ${requirements.unit}.`
    } else {
      score += 25
      reasons.push(`Capacity suitable (${capacity} ${transporter.capacityUnit} >= ${reqQty} needed)`)
    }

    // 2. Verification Status (25 pts)
    if (transporter.verificationStatus === 'VERIFIED') {
      score += 25
      reasons.push('Verified Commercial Fleet')
    } else if (transporter.verificationStatus === 'PENDING') {
      score += 10
      reasons.push('Verification Under Review')
    } else if (transporter.verificationStatus === 'SUSPENDED') {
      isEligible = false
      rejectionReason = 'Transporter account suspended by administration.'
    }

    // 3. Service Area & Geographic Proximity (20 pts)
    const serviceAreas = (transporter.serviceArea || []).map((s) => s.toLowerCase())
    const base = (transporter.baseLocation || '').toLowerCase()

    const matchesOrigin = serviceAreas.some((sa) => origin.includes(sa) || sa.includes(origin)) || origin.includes(base) || base.includes(origin)
    const matchesDest = serviceAreas.some((sa) => dest.includes(sa) || sa.includes(dest)) || dest.includes(base) || base.includes(dest)

    if (matchesOrigin && matchesDest) {
      score += 20
      reasons.push(`Serves both origin & destination regions`)
    } else if (matchesOrigin || matchesDest || serviceAreas.length === 0) {
      score += 15
      reasons.push(`Operates within regional transport corridor (${transporter.baseLocation})`)
    } else {
      score += 5
    }

    // 4. Rating & Track Record (20 pts)
    const rating = Number(transporter.rating) || 5.0
    const completedJobs = Number(transporter.totalCompletedJobs) || 0

    if (rating >= 4.5) {
      score += 15
      reasons.push(`Top-rated (${rating.toFixed(1)} ★)`)
    } else if (rating >= 4.0) {
      score += 10
      reasons.push(`Reliable service (${rating.toFixed(1)} ★)`)
    } else {
      score += 5
    }

    if (completedJobs >= 10) {
      score += 5
      reasons.push(`${completedJobs} completed deliveries`)
    } else if (completedJobs > 0) {
      score += 3
      reasons.push(`${completedJobs} completed trips`)
    }

    // 5. Refrigeration Check (10 pts)
    if (requirements.refrigerationRequired) {
      if (transporter.refrigerationAvailable) {
        score += 10
        reasons.push('Active Cold-Chain Refrigeration Equipped')
      } else {
        isEligible = false
        rejectionReason = 'Cold-chain refrigeration required for this perishable lot.'
      }
    } else {
      score += 10 // Not needed, full points
    }

    return {
      ...transporter,
      matchScore: Math.min(100, Math.max(0, score)),
      matchReasons: reasons,
      isEligible,
      rejectionReason
    }
  })

  // Sort eligible transporters first by matchScore descending, then by rating, then completed jobs
  return scored.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1
    if (!a.isEligible && b.isEligible) return 1
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.totalCompletedJobs - a.totalCompletedJobs
  })
}
