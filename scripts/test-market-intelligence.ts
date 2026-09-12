import { query } from '../lib/db'
import { validateMarketRecord } from '../lib/market/ingestion'
import { generatePriceForecast, HistoricalDataPoint } from '../lib/market/forecasting'
import { evaluateSellOrHold } from '../lib/market/advisor'

async function runTests() {
  console.log('🌾 =========================================================')
  console.log('🌾 FarmDirect Market Intelligence Automated Verification Suite')
  console.log('🌾 =========================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`)
      failed++
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Masters Verification (Commodities, Mandis, Units, Grades)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Master Records ---')
    const commodities = await query('SELECT id, name, code FROM commodities WHERE is_active = true')
    assert(commodities.length >= 8, `Commodity Master active count >= 8 (Found: ${commodities.length})`)

    const mirchi = commodities.find(c => c.id === 'comm-mirchi')
    const rice = commodities.find(c => c.id === 'comm-rice')
    const redgram = commodities.find(c => c.id === 'comm-redgram')
    assert(!!mirchi && !!rice && !!redgram, 'Key commodities Mirchi, Rice, and Red Gram exist in Master')

    const mandis = await query('SELECT id, market_name, state, district FROM markets WHERE is_active = true')
    assert(mandis.length >= 10, `Mandi Master count >= 10 (Found: ${mandis.length})`)

    const guntur = mandis.find(m => m.id === 'mkt-guntur')
    assert(!!guntur && guntur.state === 'Andhra Pradesh', 'Guntur Mandi is correctly configured in AP')

    // -------------------------------------------------------------------------
    // TEST 2: Ingestion & Data Validation Pipeline
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Ingestion Validation Engine ---')

    // 2.1 Valid record
    const validRes = validateMarketRecord({
      commodity: 'Mirchi',
      market: 'Guntur APMC',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      arrival_date: '2026-09-10',
      min_price: 18500,
      max_price: 21500,
      modal_price: 20000,
      arrival_quantity: 1200
    })
    assert(validRes.isValid && validRes.normalizedData?.commodityId === 'comm-mirchi', 'Valid Mirchi record successfully normalized')

    // 2.2 Invalid: min_price > max_price
    const invalidPriceRes = validateMarketRecord({
      commodity: 'Rice',
      market: 'Warangal',
      state: 'Telangana',
      district: 'Warangal',
      arrival_date: '2026-09-10',
      min_price: 3500,
      max_price: 2500, // Max < Min!
      modal_price: 3000,
      arrival_quantity: 400
    })
    assert(!invalidPriceRes.isValid && invalidPriceRes.status === 'REJECTED', 'Impossible price interval (Max < Min) correctly rejected')

    // 2.3 Invalid: Future arrival date
    const futureDateRes = validateMarketRecord({
      commodity: 'Red Gram',
      market: 'Kalaburagi',
      state: 'Karnataka',
      district: 'Kalaburagi',
      arrival_date: '2029-01-01',
      min_price: 6800,
      max_price: 7500,
      modal_price: 7200,
      arrival_quantity: 500
    })
    assert(!futureDateRes.isValid && futureDateRes.status === 'REJECTED', 'Future arrival date correctly rejected')

    // -------------------------------------------------------------------------
    // TEST 3: Stored Mandi Prices & Daily Observations
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Stored Daily Mandi Observations ---')
    const mirchiPrices = await query(
      'SELECT mp.*, m.market_name FROM market_prices mp JOIN markets m ON mp.market_id = m.id WHERE mp.commodity_id = $1 ORDER BY mp.arrival_date DESC LIMIT 5',
      ['comm-mirchi']
    )
    assert(mirchiPrices.length > 0, `Mirchi price observations found in DB (Count: ${mirchiPrices.length})`)
    assert(Number(mirchiPrices[0].modal_price) >= 15000, `Mirchi modal price is realistic (₹${mirchiPrices[0].modal_price}/Qtl)`)

    const ricePrices = await query(
      'SELECT mp.*, m.market_name FROM market_prices mp JOIN markets m ON mp.market_id = m.id WHERE mp.commodity_id = $1 ORDER BY mp.arrival_date DESC LIMIT 5',
      ['comm-rice']
    )
    assert(ricePrices.length > 0, `Rice price observations found in DB (Count: ${ricePrices.length})`)

    const redgramPrices = await query(
      'SELECT mp.*, m.market_name FROM market_prices mp JOIN markets m ON mp.market_id = m.id WHERE mp.commodity_id = $1 ORDER BY mp.arrival_date DESC LIMIT 5',
      ['comm-redgram']
    )
    assert(redgramPrices.length > 0, `Red Gram price observations found in DB (Count: ${redgramPrices.length})`)

    // -------------------------------------------------------------------------
    // TEST 4: Multi-Horizon Forecasting Engine & Walk-Forward Validation
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Multi-Horizon Forecasting Engine ---')
    const gunturHist = await query(
      'SELECT arrival_date, minimum_price, maximum_price, modal_price, arrival_quantity FROM market_prices WHERE commodity_id = $1 AND market_id = $2 ORDER BY arrival_date ASC',
      ['comm-mirchi', 'mkt-guntur']
    )
    assert(gunturHist.length >= 10, `Historical observation count for Guntur Mirchi >= 10 (Found: ${gunturHist.length})`)

    const history: HistoricalDataPoint[] = gunturHist.map(h => ({
      date: h.arrival_date,
      minPrice: Number(h.minimum_price || h.modal_price),
      maxPrice: Number(h.maximum_price || h.modal_price),
      modalPrice: Number(h.modal_price),
      arrivals: Number(h.arrival_quantity)
    }))

    const fullForecast = generatePriceForecast(history, 'comm-mirchi', 'mkt-guntur')
    const horizonKeys = Object.keys(fullForecast.horizons).map(Number)
    assert(horizonKeys.length === 5, `Generated 5 forecast horizons (7, 15, 30, 60, 90 days)`)

    const fc30 = fullForecast.horizons[30]
    assert(!!fc30, '30-day forecast horizon generated')
    if (fc30) {
      assert(fc30.lowerBound <= fc30.predictedModalPrice && fc30.upperBound >= fc30.predictedModalPrice, 
        'Forecast bounds contain predicted modal price')
      assert(fullForecast.validationMetrics.mae >= 0 && fullForecast.validationMetrics.mape >= 0, 
        `Backtest validation metrics present (MAPE: ${fullForecast.validationMetrics.mape}%)`)
      console.log(`   ℹ️ 30-Day Mirchi Forecast: ₹${fc30.predictedModalPrice} [₹${fc30.lowerBound} - ₹${fc30.upperBound}], Direction: ${fc30.direction}, Confidence: ${fc30.confidence}`)
    }

    // -------------------------------------------------------------------------
    // TEST 5: Sell/Hold Decision Advisor Engine
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Sell/Hold Decision Advisor ---')
    const latestPrice = history[history.length - 1].modalPrice
    const decision = evaluateSellOrHold({
      commodityId: 'comm-mirchi',
      commodityName: 'Mirchi (Chilli)',
      quantity: 50,
      unit: 'Quintal',
      currentMarketName: 'Guntur APMC',
      currentModalPrice: latestPrice,
      storageCostPerMonthPerUnit: 45,
      targetHoldingDays: 30,
      forecast: fc30!
    })

    assert(
      ['SELL_NOW', 'HOLD'].includes(decision.verdict),
      `Advisor returned recognized recommendation: ${decision.verdict}`
    )
    assert(decision.rationale.length > 0, 'Advisor produced transparent human-readable rationale')
    assert(decision.currentValue > 0, 'Economic breakdown calculated immediate gross sale')
    console.log(`   ℹ️ Verdict: ${decision.verdict} ("${decision.headline}")`)
    console.log(`   ℹ️ Net Difference: ₹${decision.netDifference} (${decision.netDifferencePercent}%) for 50 Quintals`)

    // -------------------------------------------------------------------------
    // TEST 6: Arbitrage & Nearby Market Discovery
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Nearby Mandi Arbitrage ---')
    const decisionWithArbitrage = evaluateSellOrHold({
      commodityId: 'comm-mirchi',
      commodityName: 'Mirchi (Chilli)',
      quantity: 50,
      unit: 'Quintal',
      currentMarketName: 'Warangal Mandi',
      currentModalPrice: 18000,
      storageCostPerMonthPerUnit: 45,
      targetHoldingDays: 30,
      forecast: fc30!,
      nearbyMarkets: [
        {
          marketId: 'mkt-guntur',
          marketName: 'Guntur APMC',
          distanceKm: 160,
          modalPrice: 21500,
          estimatedFreightPerUnit: 120,
          netPricePerUnit: 21380
        }
      ]
    })
    assert(
      decisionWithArbitrage.recommendedMarket.isLocal === false && decisionWithArbitrage.recommendedMarket.arbitrageGainPerUnit > 0,
      `Arbitrage detected when nearby mandi offers higher net realizable price (Gain: ₹${decisionWithArbitrage.recommendedMarket.arbitrageGainPerUnit}/Qtl)`
    )

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n=========================================================')
    console.log(`🌾 Market Intelligence Test Suite Completed: ${passed} PASSED, ${failed} FAILED`)
    console.log('=========================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Test execution error:', err)
    process.exit(1)
  }
}

runTests()
