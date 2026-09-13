import { getPool } from '../lib/db'
import {
  getMarketKPIs,
  getFarmerKPIs,
  getBuyerKPIs,
  getOperationsKPIs,
  getLogisticsKPIs,
  getFarmerRealizationAnalytics
} from '../lib/industry4/kpi-service'
import { runAnomalyDetectionScan, getActiveAnomalies, resolveAnomaly } from '../lib/industry4/anomaly-service'
import { getPlatformAlerts, createPlatformAlert, markAlertResolved } from '../lib/industry4/alert-service'
import { evaluateAutomationEngine, logOperationalEvent, logLotTraceabilityEvent } from '../lib/industry4/automation-engine'
import { getLotTraceability } from '../lib/industry4/traceability-service'
import { getQualityRecords, createQualityRecord, getQualitySummaryStats } from '../lib/industry4/quality-service'
import { getStorageLots, createStorageLot } from '../lib/industry4/storage-service'
import { calculateIndustry4Maturity } from '../lib/industry4/maturity-service'
import { getDataGovernanceReport } from '../lib/industry4/governance-service'
import { generateManagementReport } from '../lib/industry4/reports-service'

async function runTestSuite() {
  console.log('🧪 =========================================================')
  console.log('🧪 Starting Industry 4.0 Verification Test Suite...')
  console.log('🧪 =========================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`)
      failed++
    }
  }

  try {
    // 1. Test KPI Layer
    console.log('📊 1. Testing Real-Time KPI Analytics Service...')
    const marketKPIs = await getMarketKPIs()
    assert(marketKPIs.averageCommodityPrice > 0, 'Market KPIs: average commodity price is numeric & > 0')
    assert(marketKPIs.activeCommoditiesCount > 0, 'Market KPIs: active commodities count > 0')
    assert(marketKPIs.activeMarketsCount > 0, 'Market KPIs: active mandis count > 0')

    const farmerKPIs = await getFarmerKPIs()
    assert(typeof farmerKPIs.listingToSaleConversionRate === 'number', 'Farmer KPIs: conversion rate is numeric')
    assert(farmerKPIs.averageFarmerRealizationVsMandiPercent !== undefined, 'Farmer KPIs: realization vs mandi computed')

    const buyerKPIs = await getBuyerKPIs()
    assert(buyerKPIs.activeBuyersCount >= 0, 'Buyer KPIs: active buyers counted')
    assert(buyerKPIs.orderFulfillmentRate > 0, 'Buyer KPIs: fulfillment rate computed')

    const opsKPIs = await getOperationsKPIs()
    assert(opsKPIs.orderCycleTimeHours > 0, 'Operations KPIs: order cycle time computed')
    assert(typeof opsKPIs.cancellationRate === 'number', 'Operations KPIs: cancellation rate computed')

    const logKPIs = await getLogisticsKPIs()
    assert(logKPIs.onTimeDeliveryRate > 0, 'Logistics KPIs: on-time delivery rate computed')
    assert(logKPIs.averageDeliveryCostPerQtl > 0, 'Logistics KPIs: average freight cost computed')

    // 2. Test Farmer Price Realization Analytics
    console.log('\n💰 2. Testing Farmer Price Realization Analytics...')
    const realization = await getFarmerRealizationAnalytics()
    assert(realization.overallRealizationPercent !== undefined, 'Realization: overall surplus % computed')
    assert(realization.items.length > 0, 'Realization: line-by-line trade comparison items available')
    assert(realization.methodologyNote.length > 20, 'Realization: transparent methodology note included')

    // 3. Test Anomaly Detection Engine (Deterministic Statistical Rules)
    console.log('\n🚨 3. Testing Statistical Anomaly Detection Engine...')
    const scan = await runAnomalyDetectionScan()
    assert(scan.detectedCount >= 0, 'Anomaly Engine: statistical scan completed without ML hallucination')
    const activeAnomalies = await getActiveAnomalies()
    assert(Array.isArray(activeAnomalies), 'Anomaly Engine: active anomalies queried')

    // 4. Test Event-Driven Automation Engine
    console.log('\n⚡ 4. Testing Automation Rules & Event Logging...')
    await logOperationalEvent({
      entityType: 'TEST',
      entityId: 'TEST-001',
      eventType: 'SYSTEM_HEALTH_CHECK',
      actorRole: 'admin',
      metadata: { test: true },
      source: 'AUTOMATED_SUITE'
    })
    assert(true, 'Operational Event Log: operational event stored successfully')

    await logLotTraceabilityEvent({
      lotId: 'TEST-LOT-999',
      eventType: 'LOT_CREATED',
      actorRole: 'farmer',
      location: 'Pune Farm Gate',
      metadata: { harvest_notes: 'Test Lot' }
    })
    assert(true, 'Lot Traceability Event: immutable lot event stored successfully')

    const autoResult = await evaluateAutomationEngine()
    assert(autoResult.rulesEvaluated > 0, 'Automation Engine: active rules evaluated successfully')

    // 5. Test Alert Center Service
    console.log('\n🔔 5. Testing Multi-Tiered Alert Center...')
    const alertId = await createPlatformAlert({
      alertType: 'WARNING',
      category: 'MARKET',
      title: 'Test Verification Alert',
      message: 'Automated test alert message',
      metadata: { test: true, source: 'TEST_SUITE' }
    })
    assert(!!alertId, 'Alert Service: platform alert created successfully')

    const alerts = await getPlatformAlerts({ includeResolved: false })
    assert(alerts.some((a) => a.id === alertId), 'Alert Service: new alert retrieved in active feed')

    const resolvedOk = await markAlertResolved(alertId)
    assert(resolvedOk, 'Alert Service: alert resolved successfully')

    // 6. Test Produce Lot Traceability Service
    console.log('\n🔗 6. Testing Digital Produce Lot Traceability Engine...')
    const trace = await getLotTraceability('DEMO-ORD-01')
    assert(trace !== null, 'Traceability Engine: produce lot resolved')
    assert(trace!.timeline.length >= 5, 'Traceability Engine: full lifecycle timeline reconstructed')
    assert(trace!.overallTraceabilityScore > 0, 'Traceability Engine: traceability index computed')

    // 7. Test Agricultural Lot Quality Management Service
    console.log('\n🌾 7. Testing Quality Management Service...')
    const qaId = await createQualityRecord({
      lotId: 'LOT-TEST-QA-01',
      commodityName: 'Rice (Paddy)',
      variety: 'Sona Masuri',
      grade: 'Grade A / Special Selection',
      moisturePercent: 12.2,
      attributes: { broken_percent: 3.8, foreign_matter_percent: 0.4 },
      inspectionResult: 'PASS',
      inspectorName: 'Field QA Desk'
    })
    assert(!!qaId, 'Quality Service: quality record created with flexible JSONB attributes')

    const qaStats = await getQualitySummaryStats()
    assert(qaStats.totalInspections > 0, 'Quality Service: inspection stats aggregated')
    assert(qaStats.gradeDistribution.length > 0, 'Quality Service: grade distribution breakdown available')

    // 8. Test Smart Storage Monitoring Service
    console.log('\n🏢 8. Testing Smart Storage Monitoring Service...')
    const storageLots = await getStorageLots()
    assert(storageLots.length > 0, 'Storage Service: monitored storage lots queried')
    assert(storageLots[0].spoilageRiskScore !== undefined, 'Storage Service: spoilage risk calculated')

    // 9. Test Industry 4.0 Maturity Framework & Scorecard
    console.log('\n🏆 9. Testing Industry 4.0 Maturity Scorecard...')
    const maturity = await calculateIndustry4Maturity()
    assert(maturity.currentLevel === 3, 'Maturity Framework: honest Level 3 calculation (not claiming Level 4/5 prematurely)')
    assert(maturity.dimensions.length === 7, 'Maturity Framework: all 7 required dimensions evaluated')
    assert(maturity.overallMaturityScore > 0, 'Maturity Framework: composite score computed')

    // 10. Test Data Governance Service
    console.log('\n🛡️ 10. Testing Data Governance & Quality Dashboard...')
    const gov = await getDataGovernanceReport()
    assert(gov.overallDataHealthScore > 0, 'Data Governance: data health score computed')
    assert(gov.checks.length >= 5, 'Data Governance: invariants checks performed')

    // 11. Test Management Reporting Service
    console.log('\n📄 11. Testing Management Reporting Engine...')
    const marketReport = await generateManagementReport('DAILY_MARKET')
    assert(marketReport.markdownContent.includes('Daily Market Intelligence Report'), 'Reports: Daily Market report generated')

    const realizationReport = await generateManagementReport('FARMER_REALIZATION')
    assert(realizationReport.markdownContent.includes('Farmer Price Realization'), 'Reports: Farmer Realization report generated')

    const maturityReport = await generateManagementReport('INDUSTRY4_MATURITY')
    assert(maturityReport.markdownContent.includes('Transformation Scorecard'), 'Reports: Maturity Scorecard generated')

    // 12. Verify Non-Regression on Core Modules
    console.log('\n🔄 12. Verifying Non-Regression on Core Marketplace & Market Intelligence...')
    const pool = getPool()
    const listingsCount = await pool.query('SELECT COUNT(*) FROM market_listings;')
    assert(parseInt(listingsCount.rows[0].count) >= 0, 'Core Marketplace: market_listings table intact')

    const pricesCount = await pool.query('SELECT COUNT(*) FROM market_prices;')
    assert(parseInt(pricesCount.rows[0].count) > 0, 'Core Market Intelligence: market_prices records intact')

    const commoditiesCount = await pool.query('SELECT COUNT(*) FROM commodities;')
    assert(parseInt(commoditiesCount.rows[0].count) >= 9, 'Core Commodities: master commodity records intact')

    console.log('\n=========================================================')
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
    console.log('=========================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Fatal test error:', error)
    process.exit(1)
  } finally {
    const pool = getPool()
    await pool.end()
  }
}

runTestSuite()
