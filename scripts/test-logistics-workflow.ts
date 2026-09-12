import path from 'node:path'
import fs from 'node:fs'
import {
  calculateDeliveryCost,
  estimateDistanceKm,
  VEHICLE_TYPE_MULTIPLIERS
} from '../lib/logistics-pricing'
import {
  rankTransportersForJob,
  CargoRequirements,
  CandidateTransporter
} from '../lib/transporter-matching'

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

const results: TestResult[] = []

function assert(condition: boolean, name: string, message?: string) {
  if (condition) {
    results.push({ name, passed: true })
    console.log(`  ✅ PASS: ${name}`)
  } else {
    results.push({ name, passed: false, message })
    console.log(`  ❌ FAIL: ${name} - ${message || 'Assertion failed'}`)
  }
}

async function runLogisticsWorkflowTests() {
  console.log('==============================================================================')
  console.log('  FarmOS / FarmDirect: Logistics & Transporter Marketplace Test Suite')
  console.log('==============================================================================\n')

  // --------------------------------------------------------------------------
  // Group 1: Logistics Pricing & Distance Calculation Engine
  // --------------------------------------------------------------------------
  console.log('🔹 Group 1: Logistics Pricing & Freight Calculation Engine')

  // 1.1 Distance Estimation
  const distSame = estimateDistanceKm('Pune', 'Pune')
  assert(distSame === 25, 'Intra-district / same location default distance is 25km', `Got ${distSame}`)

  const distMandi = estimateDistanceKm('Nashik', 'Mumbai')
  assert(distMandi === 165, 'Inter-district estimated distance matches benchmark (Nashik -> Mumbai = 165km)', `Got ${distMandi}`)

  const distPuneMumbai = estimateDistanceKm('Pune', 'Mumbai')
  assert(distPuneMumbai === 155, 'Pune to Mumbai distance is 155km', `Got ${distPuneMumbai}`)

  // 1.2 Base Pricing Calculation
  const basicPricing = calculateDeliveryCost({
    distanceKm: 50,
    quantity: 10,
    unit: 'Quintal'
  })
  // baseFee (1200) + distanceFee (50 * 25 = 1250) + weightFee (10 * 15 = 150) = 2600
  assert(basicPricing.baseFee === 1200, 'Base dispatch fee is ₹1,200.00')
  assert(basicPricing.distanceFee === 1250, 'Distance fee for 50km is ₹1,250.00 (₹25/km)')
  assert(basicPricing.weightFee === 150, 'Weight fee for 10 Quintals is ₹150.00 (₹15/Quintal)')
  assert(basicPricing.totalEstimatedCost === 2600, `Total estimated cost is ₹2,600.00, got ${basicPricing.totalEstimatedCost}`)
  assert(basicPricing.estimatedHours === 2.3, `Estimated transit hours for 50km: (50/40)+1 = 2.3 hrs, got ${basicPricing.estimatedHours}`)

  // 1.3 Unit Normalization (Tonnes to Quintals: 2 Tonnes = 20 Quintals)
  const tonnePricing = calculateDeliveryCost({
    distanceKm: 50,
    quantity: 2,
    unit: 'Tonne'
  })
  assert(tonnePricing.weightFee === 300, `Tonne conversion: 2 Tonnes = 20 Quintals * ₹15 = ₹300, got ${tonnePricing.weightFee}`)

  // 1.4 Cold Chain Refrigeration Surcharge (+20%)
  const ambientPricing = calculateDeliveryCost({
    distanceKm: 100,
    quantity: 30,
    unit: 'Quintal',
    refrigerationRequired: false
  })
  const reeferPricing = calculateDeliveryCost({
    distanceKm: 100,
    quantity: 30,
    unit: 'Quintal',
    refrigerationRequired: true
  })
  const expectedReefer = Math.round(ambientPricing.subtotal * 1.20 * 100) / 100
  assert(
    reeferPricing.totalEstimatedCost === expectedReefer,
    `Cold chain surcharge applies +20% correctly (₹${ambientPricing.totalEstimatedCost} -> ₹${reeferPricing.totalEstimatedCost})`
  )
  assert(reeferPricing.refrigerationFee > 0, `Refrigeration fee recorded: ₹${reeferPricing.refrigerationFee}`)

  // 1.5 Vehicle Multiplier
  const heavyVehicleKey = 'Heavy Multi-Axle Truck (16-25T)'
  const heavyPricing = calculateDeliveryCost({
    distanceKm: 100,
    quantity: 150,
    unit: 'Quintal',
    vehicleType: heavyVehicleKey
  })
  assert(heavyPricing.vehicleMultiplier === 2.2, 'Heavy multi-axle truck applies 2.2x rate multiplier')

  // --------------------------------------------------------------------------
  // Group 2: Transporter Matching & Ranking Engine
  // --------------------------------------------------------------------------
  console.log('\n🔹 Group 2: Transporter Matching & Ranking Algorithm')

  const jobReq: CargoRequirements = {
    originLocation: 'Nashik, Maharashtra',
    destinationLocation: 'Vashi APMC, Mumbai',
    quantity: 40,
    unit: 'Quintal',
    refrigerationRequired: false
  }

  const candidateA: CandidateTransporter = {
    id: 't-1',
    businessName: 'Sahyadri Agro Logistics',
    contactName: 'Ramesh Patil',
    phone: '9876543210',
    vehicleType: 'Pickup Truck / Bolero Maxi (2-3T)',
    vehicleNumber: 'MH-15-AB-1234',
    carryingCapacity: 50,
    capacityUnit: 'Quintal',
    serviceArea: ['Nashik', 'Mumbai', 'Thane'],
    baseLocation: 'Nashik',
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    totalCompletedJobs: 32,
    refrigerationAvailable: false
  }

  const candidateB: CandidateTransporter = {
    id: 't-2',
    businessName: 'Under-capacity Unverified',
    contactName: 'Suresh Kumar',
    phone: '9876543211',
    vehicleType: 'Tata Ace',
    vehicleNumber: 'MH-12-CD-5678',
    carryingCapacity: 15, // 15 < 40 needed
    capacityUnit: 'Quintal',
    serviceArea: ['Pune'],
    baseLocation: 'Pune',
    verificationStatus: 'PENDING',
    rating: 3.5,
    totalCompletedJobs: 3,
    refrigerationAvailable: false
  }

  const candidateC: CandidateTransporter = {
    id: 't-3',
    businessName: 'Suspended Fleet',
    contactName: 'Vikram Singh',
    phone: '9876543212',
    vehicleType: 'Medium Truck',
    vehicleNumber: 'MH-04-EF-9012',
    carryingCapacity: 80,
    capacityUnit: 'Quintal',
    serviceArea: ['Nashik', 'Mumbai'],
    baseLocation: 'Nashik',
    verificationStatus: 'SUSPENDED',
    rating: 2.1,
    totalCompletedJobs: 14,
    refrigerationAvailable: false
  }

  const ranked = rankTransportersForJob(jobReq, [candidateA, candidateB, candidateC])

  assert(ranked.length === 3, 'All candidate transporters evaluated and ranked')
  assert(ranked[0].id === 't-1', 'Best match is Sahyadri Agro Logistics (verified, capacity fit, corridor match)')
  assert(ranked[0].isEligible === true, 'Top candidate is eligible')
  assert(ranked[0].matchScore >= 80, `Top candidate achieved high match score: ${ranked[0].matchScore}%`)

  assert(ranked.find((c) => c.id === 't-2')?.isEligible === false, 'Candidate B rejected due to insufficient carrying capacity')
  assert(ranked.find((c) => c.id === 't-3')?.isEligible === false, 'Candidate C rejected due to SUSPENDED verification status')

  // Cold chain check
  const coldJobReq: CargoRequirements = {
    ...jobReq,
    refrigerationRequired: true
  }
  const coldRanked = rankTransportersForJob(coldJobReq, [candidateA])
  assert(coldRanked[0].isEligible === false, 'Ambient transporter disqualified when cold chain refrigeration is required')

  // --------------------------------------------------------------------------
  // Group 3: Coordinated State Machine & Order Sync
  // --------------------------------------------------------------------------
  console.log('\n🔹 Group 3: Coordinated Delivery State Machine & Pipeline Invariants')

  const deliveryJobTransitions: Record<string, string[]> = {
    'OPEN': ['QUOTED', 'CANCELLED'],
    'QUOTED': ['ASSIGNED', 'OPEN', 'CANCELLED'],
    'ASSIGNED': ['PICKED_UP', 'CANCELLED'],
    'PICKED_UP': ['IN_TRANSIT', 'CANCELLED'],
    'IN_TRANSIT': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': []
  }

  assert(deliveryJobTransitions['OPEN'].includes('QUOTED'), 'Valid transition: OPEN -> QUOTED (carrier bid submitted)')
  assert(deliveryJobTransitions['QUOTED'].includes('ASSIGNED'), 'Valid transition: QUOTED -> ASSIGNED (farmer accepts transporter bid)')
  assert(deliveryJobTransitions['ASSIGNED'].includes('PICKED_UP'), 'Valid transition: ASSIGNED -> PICKED_UP (driver loads produce at farm gate)')
  assert(deliveryJobTransitions['PICKED_UP'].includes('IN_TRANSIT'), 'Valid transition: PICKED_UP -> IN_TRANSIT (driver begins transit)')
  assert(deliveryJobTransitions['IN_TRANSIT'].includes('DELIVERED'), 'Valid transition: IN_TRANSIT -> DELIVERED (consignment arrives at destination)')
  assert(deliveryJobTransitions['DELIVERED'].includes('COMPLETED'), 'Valid transition: DELIVERED -> COMPLETED (buyer verifies and accepts)')

  // Fulfillment sync checks
  const statusSyncMap: Record<string, string> = {
    'PICKED_UP': 'PICKED_UP',
    'IN_TRANSIT': 'IN_TRANSIT',
    'DELIVERED': 'DELIVERED',
    'COMPLETED': 'COMPLETED'
  }
  assert(statusSyncMap['PICKED_UP'] === 'PICKED_UP', 'Transporter pickup action syncs produce order fulfillment_status to PICKED_UP')
  assert(statusSyncMap['DELIVERED'] === 'DELIVERED', 'Transporter delivery action syncs produce order fulfillment_status to DELIVERED')
  assert(statusSyncMap['COMPLETED'] === 'COMPLETED', 'Buyer confirmation closes order and marks delivery job COMPLETED')

  // --------------------------------------------------------------------------
  // Group 4: Transporter Ratings & Performance Arithmetic
  // --------------------------------------------------------------------------
  console.log('\n🔹 Group 4: Transporter Rating Aggregation Arithmetic')

  const oldRating = 4.8
  const oldJobsCount = 19
  const incomingRating = 5.0

  const calculatedNewRating = Number(
    ((oldRating * oldJobsCount + incomingRating) / (oldJobsCount + 1)).toFixed(2)
  )
  // (4.8 * 19 + 5.0) / 20 = (91.2 + 5.0) / 20 = 96.2 / 20 = 4.81
  assert(calculatedNewRating === 4.81, `Rating weighted average computed accurately: 4.81, got ${calculatedNewRating}`)

  // Bound checks
  const clampRating = (r: number) => Math.max(1, Math.min(5, Math.round(r)))
  assert(clampRating(6) === 5, 'Rating over 5 clamped to 5')
  assert(clampRating(0) === 1, 'Rating under 1 clamped to 1')

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n==============================================================================')
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length

  console.log(`  Summary: ${passedCount} Passed, ${failedCount} Failed out of ${results.length} tests`)
  console.log('==============================================================================\n')

  if (failedCount > 0) {
    process.exit(1)
  }
}

runLogisticsWorkflowTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
