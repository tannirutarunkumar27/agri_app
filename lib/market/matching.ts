/**
 * FarmDirect Farmer-Buyer Deterministic Matching Engine
 * 
 * Scores compatibility between farmer supply (or marketplace listing) and buyer demand request
 * using transparent, configurable multi-factor weights.
 */

export interface MatchingWeights {
  commodityWeight: number   // default: 25%
  quantityWeight: number    // default: 15%
  priceWeight: number       // default: 20%
  distanceWeight: number    // default: 15%
  timingWeight: number      // default: 10%
  qualityWeight: number     // default: 10%
  reliabilityWeight: number // default: 5%
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  commodityWeight: 25,
  quantityWeight: 15,
  priceWeight: 20,
  distanceWeight: 15,
  timingWeight: 10,
  qualityWeight: 10,
  reliabilityWeight: 5
}

export interface SupplyItem {
  id: string
  farmerId: string
  farmerName: string
  farmerPhone?: string
  commodityId: string
  commodityName?: string
  varietyId?: string
  varietyName?: string
  gradeId?: string
  gradeName?: string
  availableQuantity: number
  unit: string
  askingPricePerUnit: number
  harvestDate?: string
  availableFromDate?: string
  availableUntilDate?: string
  location: string
  latitude?: number | null
  longitude?: number | null
  isOrganic?: boolean
  moisturePercent?: number
  reliabilityRating?: number // 1 to 5
  completedOrdersCount?: number
  farmerVerificationLevel?: string
  farmerTrustScore?: number
}

export interface DemandRequest {
  id: string
  buyerId: string
  buyerName: string
  buyerCompanyName?: string
  buyerVerificationLevel?: 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'BUSINESS_VERIFIED'
  commodityId: string
  commodityName?: string
  varietyId?: string
  varietyName?: string
  gradeId?: string
  gradeName?: string
  requiredQuantity: number
  minimumQuantity: number
  filledQuantity: number
  remainingQuantity: number
  quantityUnit: string
  targetPricePerUnit: number
  maximumPricePerUnit: number
  requiredFromDate: string
  requiredUntilDate: string
  deliveryLocation: string
  deliveryLatitude?: number | null
  deliveryLongitude?: number | null
  deliveryRadiusKm: number
  deliveryPreference?: string
  qualityRequirements?: string
  status: string
  expiresAt: string
}

export interface MatchScoreBreakdown {
  commodityScore: number
  quantityScore: number
  priceScore: number
  distanceScore: number
  timingScore: number
  qualityScore: number
  reliabilityScore: number
  rawFactors: {
    commodityFactor: number
    quantityFactor: number
    priceFactor: number
    distanceFactor: number
    timingFactor: number
    qualityFactor: number
    reliabilityFactor: number
  }
}

export interface MatchResult {
  totalScore: number // 0 to 100
  breakdown: MatchScoreBreakdown
  positiveExplanations: string[]
  cautionExplanations: string[]
  distanceKm: number | null
  priceDifference: number
  priceDifferencePercent: number
  isRecommended: boolean
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return null
  }

  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Computes deterministic match score and transparent human-readable explanations
 * between a supply item (farmer) and a buyer demand request.
 */
export function computeMatchScore(
  supply: SupplyItem,
  demand: DemandRequest,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchResult {
  const positive: string[] = []
  const caution: string[] = []

  // 1. COMMODITY & VARIETY MATCH (Weight: 25%)
  let commodityFactor = 0
  const normSupplyComm = (supply.commodityId || '').trim().toLowerCase()
  const normDemandComm = (demand.commodityId || '').trim().toLowerCase()

  if (normSupplyComm && normDemandComm && (normSupplyComm === normDemandComm || normSupplyComm.includes(normDemandComm) || normDemandComm.includes(normSupplyComm))) {
    commodityFactor = 1.0
    positive.push(`✓ Exact commodity match (${supply.commodityName || 'Selected Commodity'})`)

    // Check variety if requested
    if (demand.varietyId) {
      if (supply.varietyId && supply.varietyId.toLowerCase() === demand.varietyId.toLowerCase()) {
        positive.push(`✓ Exact variety match (${supply.varietyName || demand.varietyName})`)
      } else if (supply.varietyName && demand.varietyName && supply.varietyName.toLowerCase().includes(demand.varietyName.toLowerCase())) {
        positive.push(`✓ Compatible variety (${supply.varietyName})`)
      } else {
        commodityFactor = 0.90 // Minor deduction for variety difference
        caution.push(`⚠ Buyer specifically requested variety ${demand.varietyName || demand.varietyId}, supply offers ${supply.varietyName || 'standard'}`)
      }
    }
  } else {
    // If commodity does not match, overall match is zero
    return {
      totalScore: 0,
      breakdown: {
        commodityScore: 0,
        quantityScore: 0,
        priceScore: 0,
        distanceScore: 0,
        timingScore: 0,
        qualityScore: 0,
        reliabilityScore: 0,
        rawFactors: {
          commodityFactor: 0,
          quantityFactor: 0,
          priceFactor: 0,
          distanceFactor: 0,
          timingFactor: 0,
          qualityFactor: 0,
          reliabilityFactor: 0
        }
      },
      positiveExplanations: [],
      cautionExplanations: [`❌ Different commodity: Buyer requested ${demand.commodityName || demand.commodityId}`],
      distanceKm: null,
      priceDifference: 0,
      priceDifferencePercent: 0,
      isRecommended: false
    }
  }

  // 2. QUANTITY MATCH (Weight: 15%)
  let quantityFactor = 0
  const remDemandQty = Math.max(1, demand.remainingQuantity || (demand.requiredQuantity - demand.filledQuantity))
  const minQty = Math.max(1, demand.minimumQuantity || 1)

  if (supply.availableQuantity >= remDemandQty) {
    quantityFactor = 1.0
    positive.push(`✓ Sufficient volume (${supply.availableQuantity} ${supply.unit} completely fulfills ${remDemandQty} ${demand.quantityUnit} demand)`)
  } else if (supply.availableQuantity >= minQty) {
    // Partial fill that meets buyer's minimum lot acceptance threshold
    quantityFactor = 0.65 + 0.35 * (supply.availableQuantity / remDemandQty)
    positive.push(`✓ Meets minimum order quantity (${supply.availableQuantity} ${supply.unit} available vs min ${minQty} ${demand.quantityUnit})`)
  } else {
    quantityFactor = 0.25 * (supply.availableQuantity / minQty)
    caution.push(`⚠ Available quantity (${supply.availableQuantity} ${supply.unit}) is below buyer's minimum required lot (${minQty} ${demand.quantityUnit})`)
  }

  // 3. PRICE COMPATIBILITY (Weight: 20%)
  let priceFactor = 0
  const askingPrice = supply.askingPricePerUnit
  const targetPrice = demand.targetPricePerUnit
  const maxPrice = demand.maximumPricePerUnit || targetPrice

  const priceDiff = askingPrice - targetPrice
  const priceDiffPct = targetPrice > 0 ? Math.round((priceDiff / targetPrice) * 1000) / 10 : 0

  if (askingPrice <= targetPrice) {
    priceFactor = 1.0
    positive.push(`✓ Highly competitive price (₹${askingPrice} is at or below buyer target ₹${targetPrice}/${demand.quantityUnit})`)
  } else if (askingPrice <= maxPrice) {
    // Between target and maximum price
    const spread = maxPrice - targetPrice || 1
    priceFactor = 1.0 - 0.35 * ((askingPrice - targetPrice) / spread)
    positive.push(`✓ Price (₹${askingPrice}) is within buyer acceptable limit [₹${targetPrice} - ₹${maxPrice}]`)
  } else {
    // Above maximum price
    const overPct = (askingPrice - maxPrice) / (maxPrice || 1)
    if (overPct <= 0.15) {
      priceFactor = 0.40 - overPct * 1.5
      caution.push(`⚠ Asking price (₹${askingPrice}) is slightly higher than buyer ceiling ₹${maxPrice}`)
    } else {
      priceFactor = 0.05
      caution.push(`⚠ Asking price (₹${askingPrice}) significantly exceeds buyer maximum budget (₹${maxPrice})`)
    }
  }

  // 4. DISTANCE & LOCATION MATCH (Weight: 15%)
  let distanceFactor = 0.85 // Default reasonable regional proximity if GPS coordinates absent
  const distKm = calculateDistanceKm(
    supply.latitude,
    supply.longitude,
    demand.deliveryLatitude,
    demand.deliveryLongitude
  )

  const radius = demand.deliveryRadiusKm || 100

  if (distKm !== null) {
    if (distKm <= radius) {
      distanceFactor = 1.0 - 0.15 * (distKm / radius)
      positive.push(`✓ Located within preferred procurement radius (${distKm} km vs max ${radius} km)`)
    } else if (distKm <= radius * 1.5) {
      distanceFactor = 0.60
      caution.push(`⚠ Farm is ${distKm} km away, slightly beyond buyer's preferred ${radius} km radius`)
    } else if (distKm <= radius * 3) {
      distanceFactor = Math.max(0.05, 0.40 - ((distKm - radius) / radius) * 0.15)
      caution.push(`⚠ Significant transit distance (${distKm} km vs ${radius} km preferred radius)`)
    } else {
      distanceFactor = 0
      caution.push(`⚠ Location (${distKm} km away) is far outside buyer's ${radius} km delivery radius`)
    }
  } else {
    // Fallback based on text match
    if (supply.location && demand.deliveryLocation && supply.location.toLowerCase().includes(demand.deliveryLocation.toLowerCase())) {
      distanceFactor = 1.0
      positive.push(`✓ Regional location matches: ${demand.deliveryLocation}`)
    } else {
      distanceFactor = 0.80
    }
  }

  // 5. TIMING & HARVEST AVAILABILITY (Weight: 10%)
  let timingFactor = 0.90
  const reqFrom = demand.requiredFromDate ? new Date(demand.requiredFromDate) : null
  const reqUntil = demand.requiredUntilDate ? new Date(demand.requiredUntilDate) : null
  const availFrom = supply.availableFromDate || supply.harvestDate ? new Date(supply.availableFromDate || supply.harvestDate!) : new Date()

  if (reqFrom && reqUntil && !isNaN(reqFrom.getTime()) && !isNaN(reqUntil.getTime())) {
    if (availFrom >= reqFrom && availFrom <= reqUntil) {
      timingFactor = 1.0
      positive.push(`✓ Harvest availability perfectly aligns with buyer delivery window (${demand.requiredFromDate} to ${demand.requiredUntilDate})`)
    } else if (availFrom < reqFrom) {
      // Available earlier
      const daysEarly = Math.round((reqFrom.getTime() - availFrom.getTime()) / (1000 * 3600 * 24))
      if (daysEarly <= 14) {
        timingFactor = 0.90
        positive.push(`✓ Available now / ready for delivery ahead of deadline`)
      } else {
        timingFactor = 0.75
      }
    } else {
      // Available after required until date
      const daysLate = Math.round((availFrom.getTime() - reqUntil.getTime()) / (1000 * 3600 * 24))
      if (daysLate <= 5) {
        timingFactor = 0.60
        caution.push(`⚠ Ready ${daysLate} days after buyer's preferred window end date`)
      } else {
        timingFactor = 0.20
        caution.push(`⚠ Harvest date is too late for buyer's timeline`)
      }
    }
  }

  // 6. QUALITY & GRADE MATCH (Weight: 10%)
  let qualityFactor = 0.85
  if (demand.gradeId) {
    if (supply.gradeId && supply.gradeId.toLowerCase() === demand.gradeId.toLowerCase()) {
      qualityFactor = 1.0
      positive.push(`✓ Quality grade aligns (${supply.gradeName || demand.gradeName || 'Standard FAQ'})`)
    } else if (supply.gradeId && supply.gradeId.toLowerCase().includes('grade-a')) {
      qualityFactor = 1.0
      positive.push(`✓ Premium grade offered meets or exceeds specification`)
    } else {
      qualityFactor = 0.65
      caution.push(`⚠ Buyer requested ${demand.gradeName || 'Grade A'}, listing specified ${supply.gradeName || 'standard grade'}`)
    }
  } else {
    qualityFactor = 1.0
  }

  if (supply.isOrganic) {
    positive.push(`✓ Certified organic lot`)
  }

  // 7. RELIABILITY & TRUST (Weight: 5%)
  let reliabilityFactor = 0.80
  const rating = supply.reliabilityRating || 5.0
  const pastOrders = supply.completedOrdersCount || 0
  const trustScore = supply.farmerTrustScore !== undefined ? supply.farmerTrustScore : 65
  const vLevel = (supply.farmerVerificationLevel || '').toUpperCase()

  if (vLevel === 'FULLY_VERIFIED' || trustScore >= 85) {
    reliabilityFactor = 1.0
    positive.push(`✓ Highly trusted producer (${vLevel || 'Verified'}, Trust Score: ${trustScore}/100)`)
  } else if (vLevel.includes('VERIFIED') || trustScore >= 70) {
    reliabilityFactor = 0.90
    positive.push(`✓ Verified producer (${vLevel.replace(/_/g, ' ')}, Trust Score: ${trustScore}/100)`)
  } else if (pastOrders >= 3 && rating >= 4.5) {
    reliabilityFactor = 0.88
    positive.push(`✓ Experienced seller with ${pastOrders} successful marketplace sales`)
  } else if (vLevel === 'UNVERIFIED' || trustScore < 50) {
    reliabilityFactor = 0.60
    caution.push(`⚠ Producer has not completed accreditation verification`)
  }

  // CALCULATE WEIGHTED TOTAL SCORE (0 to 100)
  const commodityScore = Math.round(commodityFactor * weights.commodityWeight * 10) / 10
  const quantityScore = Math.round(quantityFactor * weights.quantityWeight * 10) / 10
  const priceScore = Math.round(priceFactor * weights.priceWeight * 10) / 10
  const distanceScore = Math.round(distanceFactor * weights.distanceWeight * 10) / 10
  const timingScore = Math.round(timingFactor * weights.timingWeight * 10) / 10
  const qualityScore = Math.round(qualityFactor * weights.qualityWeight * 10) / 10
  const reliabilityScore = Math.round(reliabilityFactor * weights.reliabilityWeight * 10) / 10

  const totalScore = Math.min(100, Math.max(0, Math.round(
    commodityScore + quantityScore + priceScore + distanceScore + timingScore + qualityScore + reliabilityScore
  )))

  return {
    totalScore,
    breakdown: {
      commodityScore,
      quantityScore,
      priceScore,
      distanceScore,
      timingScore,
      qualityScore,
      reliabilityScore,
      rawFactors: {
        commodityFactor,
        quantityFactor,
        priceFactor,
        distanceFactor,
        timingFactor,
        qualityFactor,
        reliabilityFactor
      }
    },
    positiveExplanations: positive,
    cautionExplanations: caution,
    distanceKm: distKm,
    priceDifference: priceDiff,
    priceDifferencePercent: priceDiffPct,
    isRecommended: totalScore >= 75
  }
}

export const calculateMatchScore = computeMatchScore
