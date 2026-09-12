/**
 * FarmDirect Logistics & Transport Pricing Engine
 * Server-side deterministic cost calculation and distance estimation.
 */

export interface PricingParams {
  distanceKm: number
  quantity: number
  unit: string
  vehicleType?: string
  refrigerationRequired?: boolean
}

export interface PricingResult {
  baseFee: number
  distanceFee: number
  weightFee: number
  refrigerationFee: number
  vehicleMultiplier: number
  subtotal: number
  platformFee: number
  totalEstimatedCost: number
  estimatedHours: number
}

// Vehicle multipliers based on standard commercial fleet classifications
export const VEHICLE_TYPE_MULTIPLIERS: Record<string, { multiplier: number; label: string; maxCapacityQuintal: number }> = {
  'Tata Ace / Small Commercial Vehicle (1-1.5T)': { multiplier: 1.0, label: 'Tata Ace (1.5T)', maxCapacityQuintal: 15 },
  'Pickup Truck / Bolero Maxi (2-3T)': { multiplier: 1.2, label: 'Pickup (3T)', maxCapacityQuintal: 30 },
  'Medium Commercial Vehicle / Eicher (7-10T)': { multiplier: 1.6, label: 'Medium Truck (10T)', maxCapacityQuintal: 100 },
  'Heavy Multi-Axle Truck (16-25T)': { multiplier: 2.2, label: 'Heavy Truck (25T)', maxCapacityQuintal: 250 },
  'Refrigerated Reefer Container': { multiplier: 1.8, label: 'Reefer Van', maxCapacityQuintal: 80 }
}

/**
 * Standard server-side delivery cost calculation.
 * Formula:
 * - Base Dispatch & Toll allowance: ₹1,200
 * - Distance Rate: ₹25 / km
 * - Cargo Weight Surcharge: ₹15 / Quintal (normalized)
 * - Refrigerated Cold-chain Surcharge: +20%
 * - Vehicle Multiplier applied
 */
export function calculateDeliveryCost(params: PricingParams): PricingResult {
  const distanceKm = Math.max(10, Number(params.distanceKm) || 50)
  
  // Normalize weight to Quintals (1 Quintal = 100 kg, 1 Tonne = 10 Quintals)
  let weightInQuintals = Number(params.quantity) || 10
  const normalizedUnit = (params.unit || 'Quintal').toLowerCase()
  if (normalizedUnit.includes('ton') || normalizedUnit.includes('mt')) {
    weightInQuintals = weightInQuintals * 10
  } else if (normalizedUnit.includes('kg')) {
    weightInQuintals = weightInQuintals / 100
  }

  const baseFee = 1200.00
  const distanceRatePerKm = 25.00
  const distanceFee = Math.round(distanceKm * distanceRatePerKm * 100) / 100

  const weightRatePerQuintal = 15.00
  const weightFee = Math.round(weightInQuintals * weightRatePerQuintal * 100) / 100

  const rawSum = baseFee + distanceFee + weightFee

  // Vehicle multiplier
  const vehicleConfig = params.vehicleType ? VEHICLE_TYPE_MULTIPLIERS[params.vehicleType] : undefined
  const vehicleMultiplier = vehicleConfig ? vehicleConfig.multiplier : 1.0

  let costWithVehicle = rawSum * vehicleMultiplier

  // Cold-chain refrigeration surcharge (+20%)
  let refrigerationFee = 0.00
  if (params.refrigerationRequired) {
    refrigerationFee = Math.round(costWithVehicle * 0.20 * 100) / 100
    costWithVehicle += refrigerationFee
  }

  const subtotal = Math.round(costWithVehicle * 100) / 100
  const platformFee = 0.00 // 0% commission for logistics network
  const totalEstimatedCost = Math.round((subtotal + platformFee) * 100) / 100

  // Estimated transit time: 40 km/h average rural highway speed + 1 hour loading/unloading
  const estimatedHours = Math.round(((distanceKm / 40) + 1) * 10) / 10

  return {
    baseFee,
    distanceFee,
    weightFee,
    refrigerationFee,
    vehicleMultiplier,
    subtotal,
    platformFee,
    totalEstimatedCost,
    estimatedHours
  }
}

/**
 * Deterministic distance estimator between common agricultural trading hubs and mandis in India.
 * Defaults to 65 km if coordinates/locations are not in dictionary.
 */
export function estimateDistanceKm(originText: string, destinationText: string): number {
  const o = (originText || '').toLowerCase()
  const d = (destinationText || '').toLowerCase()

  if (o === d) return 25

  // Common inter-city mandi distances (km)
  const mandiPairs: Array<{ match: [string, string]; distance: number }> = [
    { match: ['pune', 'mumbai'], distance: 155 },
    { match: ['nashik', 'mumbai'], distance: 165 },
    { match: ['indore', 'bhopal'], distance: 195 },
    { match: ['guntur', 'hyderabad'], distance: 270 },
    { match: ['nagpur', 'pune'], distance: 710 },
    { match: ['latur', 'solapur'], distance: 120 },
    { match: ['ahmednagar', 'pune'], distance: 125 },
    { match: ['kolhapur', 'pune'], distance: 235 },
    { match: ['indore', 'sanwer'], distance: 35 },
    { match: ['nashik', 'pimpalgaon'], distance: 32 }
  ]

  for (const pair of mandiPairs) {
    if (
      (o.includes(pair.match[0]) && d.includes(pair.match[1])) ||
      (o.includes(pair.match[1]) && d.includes(pair.match[0]))
    ) {
      return pair.distance
    }
  }

  // Cross-state default
  if (
    (o.includes('maharashtra') && d.includes('madhya pradesh')) ||
    (o.includes('madhya pradesh') && d.includes('maharashtra'))
  ) {
    return 450
  }

  // Intra-district default
  return 65
}
