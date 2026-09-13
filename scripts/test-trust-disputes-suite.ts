import { config } from 'dotenv'
config({ path: '.env.local' })

import { query, queryOne, execute } from '../lib/db'
import { submitVerification, reviewVerification, getAllVerifications } from '../lib/trust/verification-service'
import { calculateTrustScore, getTrustProfile } from '../lib/trust/trust-score-service'
import { createDispute, addDisputeEvidence, resolveDispute, getDisputeById } from '../lib/trust/dispute-service'
import { createProduceQualityRecord, updateDeliveredQuantity } from '../lib/trust/quality-records-service'
import { evaluateOrderRisk, evaluateQualityVarianceRisk, getRiskFlags, resolveRiskFlag } from '../lib/trust/risk-rules'
import { generateLotQrCodeSvg, generateLotQrCodeDataUrl, getPublicTraceabilityPayload } from '../lib/trust/trace-qr-service'
import { calculateMatchScore, SupplyItem, DemandRequest, DEFAULT_MATCHING_WEIGHTS } from '../lib/market/matching'

async function runTestSuite() {
  console.log('=====================================================================')
  console.log('       FARMDIRECT TRUST, QUALITY, VERIFICATION & DISPUTES TEST       ')
  console.log('=====================================================================\n')

  let passedTests = 0
  let totalTests = 0

  function assert(condition: boolean, testName: string, detail?: any) {
    totalTests++
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passedTests++
    } else {
      console.error(`❌ [FAIL] ${testName}`, detail !== undefined ? detail : '')
      throw new Error(`Test failed: ${testName}`)
    }
  }

  try {
    // 0. Ensure test users & order exist
    const testFarmerId = 'farmer-demo'
    const testBuyerId = 'usr-buyer-agro'

    // Create a fresh test order for each test run to ensure clean escrow and dispute isolation
    const newOrderId = `ORD-TEST-${Date.now()}`
    const listing = await queryOne<any>(`SELECT id FROM market_listings LIMIT 1;`)
    const inquiry = await queryOne<any>(`SELECT id FROM market_inquiries LIMIT 1;`)

    await execute(`
      INSERT INTO produce_orders (
        id, offer_id, listing_id, farmer_id, farmer_name, farmer_phone,
        buyer_id, buyer_name, buyer_phone, crop_name, variety,
        quantity, unit, agreed_price_per_unit, subtotal, delivery_fee, platform_fee,
        total_amount, payment_status, fulfillment_status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'Ramesh Patil', '+919876543210',
        $5, 'AgroProcure Ltd', '+919876543299', 'Soybean', 'JS-335',
        5000, 'kg', 45, 225000, 0, 0,
        225000, 'PAID', 'CONFIRMED', NOW(), NOW()
      );
    `, [newOrderId, inquiry?.id || 'inq_sample', listing?.id || 'lst_sample', testFarmerId, testBuyerId])
    const order = await queryOne<any>(`SELECT id, id as order_number, total_amount FROM produce_orders WHERE id = $1`, [newOrderId])

    console.log(`Using order for dispute tests: ${order.id} (₹${order.total_amount})\n`)

    // -------------------------------------------------------------
    // TEST SUITE 1: VERIFICATION LIFECYCLE & AUDIT LOGS
    // -------------------------------------------------------------
    console.log('--- 1. Testing Verification Lifecycle & Admin Moderation ---')
    
    // A. Submit verification request
    const verRecord = await submitVerification({
      userId: testFarmerId,
      verificationType: 'AADHAAR_PAN',
      submittedLevel: 'FULLY_VERIFIED',
      documentReference: 'DOC-AADHAAR-99881122',
      documentMetadata: { documentType: 'GOVT_ID', maskedNumber: 'XXXX-XXXX-1234' },
      notes: 'Submitted signed 7/12 extract and Aadhaar copy'
    })

    assert(!!verRecord.id, 'Verification request created with unique ID')
    assert(verRecord.status === 'PENDING', 'New verification request has status PENDING')

    // B. Query pending list
    const pendingList = await getAllVerifications({ status: 'PENDING' })
    const foundPending = pendingList.find(v => v.id === verRecord.id)
    assert(!!foundPending, 'Submitted verification is present in Admin pending queue')

    // C. Admin approves verification
    const approvedRecord = await reviewVerification({
      verificationId: verRecord.id,
      action: 'APPROVE',
      adminId: 'admin-tribunal-01',
      notes: 'Documents confirmed against national agricultural database'
    })

    assert(approvedRecord.status === 'APPROVED', 'Verification status updated to APPROVED')

    // D. Verify user record updated
    const updatedUser = await queryOne<any>(`SELECT verification_level FROM users WHERE id = $1`, [testFarmerId])
    assert(updatedUser.verification_level === 'FULLY_VERIFIED', 'User record updated with new verification_level')

    // E. Verify immutable audit log exists
    const auditLogs = await query<any>(`
      SELECT * FROM trust_audit_logs 
      WHERE entity_id = $1 AND action = 'VERIFICATION_APPROVED';
    `, [verRecord.id])
    assert(auditLogs.length > 0, 'Immutable trust audit log record generated for approval action')

    // -------------------------------------------------------------
    // TEST SUITE 2: TRANSPARENT TRUST SCORE CALCULATION & EXPLAINABILITY
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Trust Score Engine & "Why?" Explainability ---')

    const scoreBreakdown = await calculateTrustScore(testFarmerId)
    assert(scoreBreakdown.totalScore >= 10 && scoreBreakdown.totalScore <= 100, 'Trust score bounded strictly between 10 and 100')
    assert(Array.isArray(scoreBreakdown.explanation) && scoreBreakdown.explanation.length > 0, 'Itemized "Why?" explanation array is returned')
    assert(scoreBreakdown.verificationPoints === 25, 'Fully verified status awards max 25 verification points')

    const profile = await getTrustProfile(testFarmerId)
    assert(profile.userId === testFarmerId, 'Trust profile returned with correct userId')
    assert(profile.verificationLevel === 'FULLY_VERIFIED', 'Trust profile displays FULLY_VERIFIED')
    assert(profile.trustScore === scoreBreakdown.totalScore, 'Trust profile score matches calculated breakdown')

    // -------------------------------------------------------------
    // TEST SUITE 3: PRODUCE QUALITY & WEIGHBRIDGE RECORDS
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Produce Quality, Weighbridge & Quantity Reconciliation ---')

    const testLotId = `LOT-TEST-${Date.now().toString(36).toUpperCase()}`
    const qualityRec = await createProduceQualityRecord({
      lotId: testLotId,
      orderId: order.id,
      inspectionSource: 'PLATFORM_VERIFIED',
      commodityName: 'Soybean',
      variety: 'JS-335',
      grade: 'A',
      moisturePercentage: 11.4,
      defectPercentage: 1.2,
      foreignMatterPercentage: 0.8,
      declaredQuantityKg: 5000,
      weighbridgeGrossKg: 12500,
      weighbridgeTareKg: 7500,
      weighbridgeNetKg: 5000,
      weighbridgeSlipNumber: 'WB-PUNE-8871',
      weighbridgeStationName: 'Baramati APMC Weighbridge #2',
      weighedAt: new Date().toISOString()
    })

    assert(qualityRec.lotId === testLotId, 'Produce quality record created with linked Lot ID')
    assert(qualityRec.weighbridgeNetKg === 5000, 'Weighbridge net weight correctly recorded')
    assert(qualityRec.grade === 'A', 'Quality grade A assigned')

    // Confirm buyer delivery with 4700 kg (6% loss)
    const updatedQuality = await updateDeliveredQuantity({
      recordId: qualityRec.id,
      deliveredQuantityKg: 4700
    })

    assert(updatedQuality.deliveredQuantityKg === 4700, 'Delivered quantity updated')
    assert(updatedQuality.quantityVariancePercentage === -6, 'Quantity variance accurately calculated (-6.0%)')

    // -------------------------------------------------------------
    // TEST SUITE 4: AUTOMATED RISK RULES DETECTION
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Deterministic Risk Detection Rules ---')

    // Check quantity shortage variance risk (> 5%)
    const riskFlag = await evaluateQualityVarianceRisk(qualityRec.id)
    assert(riskFlag !== null, 'Quality variance risk rule triggered for 6% weight shortage')
    assert(riskFlag?.riskType === 'QUANTITY_MISMATCH', 'Risk flag type is QUANTITY_MISMATCH')
    assert(riskFlag?.severity === 'MEDIUM' || riskFlag?.severity === 'HIGH', 'Appropriate severity assigned')

    // Resolve risk flag
    if (riskFlag) {
      await resolveRiskFlag({
        flagId: riskFlag.id,
        adminId: 'admin-system',
        newStatus: 'ACKNOWLEDGED',
        notes: 'Driver acknowledged minor spillage during transit'
      })
      const flagQuery = await queryOne<any>(`SELECT is_dismissed FROM transaction_risk_flags WHERE id = $1`, [riskFlag.id])
      assert(flagQuery.is_dismissed === true, 'Risk flag status transitioned to dismissed')
    }

    // -------------------------------------------------------------
    // TEST SUITE 5: DISPUTE ESCROW FREEZE & PARTIAL SETTLEMENT
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Trade Dispute, SLA & Decimal Escrow Settlement ---')

    const dispute = await createDispute({
      orderId: order.id,
      raisedBy: testBuyerId,
      raisedAgainst: testFarmerId,
      reason: 'WEIGHT_SHORTAGE',
      description: 'Weighbridge destination reading confirmed 300kg shortfall vs declared 5000kg lot.',
      claimedWeightLossKg: 300,
      disputedAmount: 13500 // 300 kg * Rs 45/kg
    })

    assert(!!dispute.id, 'Dispute successfully lodged with generated ID')
    assert(dispute.status === 'OPEN', 'Dispute initial status is OPEN')
    assert(new Date(dispute.slaDeadline) > new Date(), 'SLA deadline set in the future')

    // Verify order was automatically frozen into DISPUTED status
    const frozenOrder = await queryOne<any>(`SELECT fulfillment_status FROM produce_orders WHERE id = $1`, [order.id])
    assert(frozenOrder.fulfillment_status === 'DISPUTED', 'Order fulfillment status automatically frozen to DISPUTED')

    // Upload dispute evidence
    const evidence = await addDisputeEvidence({
      disputeId: dispute.id,
      uploadedBy: testBuyerId,
      evidenceType: 'WEIGHBRIDGE_SLIP',
      fileUrl: 'https://farmdirect.app/uploads/wb-slip-300kg.pdf',
      fileName: 'destination_weighbridge_slip.pdf',
      notes: 'Certified weighbridge slip showing 4700 kg tare weight'
    })
    assert(evidence.disputeId === dispute.id, 'Evidence successfully attached to dispute')

    // Adjudicate dispute with exact decimal partial settlement
    // Disputed amount: 13500. Buyer gets 13500 refund, Farmer gets 0 (or split)
    const resolvedDispute = await resolveDispute({
      disputeId: dispute.id,
      adminId: 'admin-adjudicator-01',
      resolution: 'PARTIAL_REFUND',
      resolutionNotes: 'Shortage confirmed against weighbridge slip. Refunding buyer for 300 kg @ Rs 45/kg.',
      settlementAmountFarmer: 0,
      settlementAmountBuyer: 13500
    })

    assert(resolvedDispute.status === 'RESOLVED', 'Dispute resolved status confirmed')
    assert(resolvedDispute.settlementAmountBuyer === 13500, 'Buyer settlement strictly recorded')

    const unfrozenOrder = await queryOne<any>(`SELECT fulfillment_status, payment_status FROM produce_orders WHERE id = $1`, [order.id])
    assert(unfrozenOrder.fulfillment_status === 'REFUNDED', 'Order unfrozen and marked REFUNDED')
    assert(unfrozenOrder.payment_status === 'REFUNDED', 'Order payment status updated to REFUNDED')

    // -------------------------------------------------------------
    // TEST SUITE 6: DIGITAL LOT ID & PUBLIC PROVENANCE REDACTION
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Digital Lot Provenance & Strict Redaction Invariant ---')

    const svgQr = await generateLotQrCodeSvg(testLotId)
    assert(svgQr.startsWith('<svg') && svgQr.includes('</svg>'), 'Generated valid SVG QR code')

    const dataUrlQr = await generateLotQrCodeDataUrl(testLotId)
    assert(dataUrlQr.startsWith('data:image/png;base64,'), 'Generated valid base64 data URL for QR code')

    const publicPayload = await getPublicTraceabilityPayload(testLotId)
    assert(publicPayload !== null, 'Public traceability payload retrieved for lot')
    assert(publicPayload?.lotId === testLotId, 'Lot ID matches')
    assert(publicPayload?.producer.verificationLevel === 'FULLY_VERIFIED', 'Producer verified level visible')

    // STRICT INVARIANT TEST: Ensure no sensitive private contact or financial fields leak
    const payloadStr = JSON.stringify(publicPayload)
    assert(!payloadStr.includes('99881122'), 'Private Aadhaar/PAN numbers strictly redacted')
    assert(!payloadStr.includes('password'), 'Passwords not present')
    assert(!payloadStr.includes('bank_account'), 'Bank details strictly redacted')
    assert(!payloadStr.includes('225000'), 'Commercial order financial trade value strictly redacted from consumer view')

    // -------------------------------------------------------------
    // TEST SUITE 7: TRUST-AWARE MARKETPLACE MATCHING ENGINE
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Trust-Aware Farmer-Buyer Matching Engine ---')

    const sampleSupply: SupplyItem = {
      id: 'lst_test_matching',
      farmerId: testFarmerId,
      farmerName: 'Ramesh Patil',
      farmerPhone: '+919876543210',
      commodityId: 'cmd_soybean',
      commodityName: 'Soybean',
      availableQuantity: 5000,
      unit: 'kg',
      askingPricePerUnit: 44,
      location: 'Baramati, Pune',
      gradeId: 'grade-a',
      gradeName: 'Grade A',
      farmerVerificationLevel: 'FULLY_VERIFIED',
      farmerTrustScore: 92
    }

    const sampleDemand: DemandRequest = {
      id: 'dmd_test_procurement',
      buyerId: testBuyerId,
      buyerName: 'AgroProcure Ltd',
      commodityId: 'cmd_soybean',
      commodityName: 'Soybean',
      gradeId: 'grade-a',
      gradeName: 'Grade A',
      requiredQuantity: 5000,
      minimumQuantity: 1000,
      filledQuantity: 0,
      remainingQuantity: 5000,
      quantityUnit: 'kg',
      targetPricePerUnit: 45,
      maximumPricePerUnit: 48,
      requiredFromDate: new Date().toISOString(),
      requiredUntilDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      deliveryLocation: 'Pune Central Silo',
      deliveryRadiusKm: 150,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    }

    const matchResult = calculateMatchScore(sampleSupply, sampleDemand, DEFAULT_MATCHING_WEIGHTS)
    assert(matchResult.totalScore >= 80, `High match score achieved (${matchResult.totalScore}/100)`)
    const hasTrustExplanation = matchResult.positiveExplanations.some(exp => exp.includes('Highly trusted') || exp.includes('Verified'))
    assert(hasTrustExplanation, 'Matching engine included positive Trust & Verification factor explanation')

    console.log('\n=====================================================================')
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} validations succeeded!`)
    console.log('=====================================================================\n')

  } catch (err: any) {
    console.error('\n❌ Test execution encountered an error:', err)
    process.exit(1)
  }
}

runTestSuite().catch(e => {
  console.error(e)
  process.exit(1)
})
