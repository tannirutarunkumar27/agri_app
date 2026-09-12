import { computeMatchScore, calculateDistanceKm, SupplyItem, DemandRequest } from '../lib/market/matching';
import { getMarketLiquiditySummary } from '../lib/market/liquidity';
import { getPool, query } from '../lib/db';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING BUYER DEMAND & FARMER MATCHING SYSTEM');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // =========================================================================
  // TEST SUITE 1: Matching Engine Deterministic Score Calculations
  // =========================================================================
  console.log('--- TEST 1: Matching Engine Deterministic Calculations ---');

  const baseDemand: DemandRequest = {
    id: 'dem-test-1',
    buyerId: 'usr-buyer-agro',
    buyerName: 'Venkatesh Agro Industries',
    buyerCompanyName: 'Venkatesh Agro Foods & Pulse Mill Pvt Ltd',
    buyerVerificationLevel: 'BUSINESS_VERIFIED',
    commodityId: 'comm-redgram',
    commodityName: 'Red Gram (Tur / Arhar)',
    varietyId: 'var-redgram-maruti',
    varietyName: 'Maruti',
    gradeId: 'grade-faq',
    gradeName: 'FAQ Grade',
    requiredQuantity: 40,
    filledQuantity: 0,
    remainingQuantity: 40,
    minimumQuantity: 10,
    quantityUnit: 'Quintal',
    targetPricePerUnit: 7350,
    maximumPricePerUnit: 7500,
    requiredFromDate: new Date().toISOString().slice(0, 10),
    requiredUntilDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    deliveryLocation: 'Warangal Enamamula Market Yard, Telangana',
    deliveryLatitude: 17.9689,
    deliveryLongitude: 79.5941,
    deliveryRadiusKm: 100,
    deliveryPreference: 'FARM_GATE_PICKUP',
    qualityRequirements: 'Moisture < 11%',
    status: 'OPEN',
    expiresAt: new Date(Date.now() + 20 * 86400000).toISOString()
  };

  // 1a. Perfect Match
  const perfectSupply: SupplyItem = {
    id: 'sup-1',
    farmerId: 'farmer-1',
    farmerName: 'Kishore Reddy',
    commodityId: 'comm-redgram',
    commodityName: 'Red Gram (Tur / Arhar)',
    varietyId: 'var-redgram-maruti',
    varietyName: 'Maruti',
    gradeId: 'grade-faq',
    gradeName: 'FAQ Grade',
    availableQuantity: 40,
    unit: 'Quintal',
    askingPricePerUnit: 7350,
    availableFromDate: new Date().toISOString().slice(0, 10),
    availableUntilDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
    location: 'Warangal Rural, Telangana',
    latitude: 17.9800,
    longitude: 79.6000,
    moisturePercent: 10,
    reliabilityRating: 5.0,
    completedOrdersCount: 12
  };

  const perfectScore = computeMatchScore(perfectSupply, baseDemand);
  assert(perfectScore.totalScore >= 95, `Perfect match score is >= 95% (got ${perfectScore.totalScore}%)`);
  assert(perfectScore.positiveExplanations.some(e => e.includes('commodity match')), 'Explains commodity match');
  assert(perfectScore.positiveExplanations.some(e => e.includes('price') || e.includes('Price')), 'Explains competitive price');
  assert(perfectScore.isRecommended === true, 'Flagged as recommended match');

  // 1b. Commodity Mismatch (Strict 0% Hard Constraint)
  const wrongCommoditySupply: SupplyItem = {
    ...perfectSupply,
    commodityId: 'comm-cotton',
    commodityName: 'Cotton'
  };
  const mismatchScore = computeMatchScore(wrongCommoditySupply, baseDemand);
  assert(mismatchScore.totalScore === 0, `Different commodity yields 0% (got ${mismatchScore.totalScore}%)`);
  assert(mismatchScore.cautionExplanations.some(c => c.includes('Different commodity')), 'Has caution for commodity mismatch');
  assert(mismatchScore.isRecommended === false, 'Not recommended on commodity mismatch');

  // 1c. Price Out of Budget Penalty
  const expensiveSupply: SupplyItem = {
    ...perfectSupply,
    askingPricePerUnit: 9200 // Target 7350, Max 7500
  };
  const expensiveScore = computeMatchScore(expensiveSupply, baseDemand);
  assert(expensiveScore.breakdown.priceScore <= 2, `Price factor heavily penalized when asking ₹9200 vs max ₹7500 (got factor score ${expensiveScore.breakdown.priceScore}/20)`);
  assert(expensiveScore.cautionExplanations.some(c => c.includes('significantly exceeds')), 'Explains price exceeds budget');

  // 1d. Quantity Below Minimum Order Quantity
  const tinySupply: SupplyItem = {
    ...perfectSupply,
    availableQuantity: 4 // Min lot size is 10
  };
  const tinyScore = computeMatchScore(tinySupply, baseDemand);
  assert(tinyScore.breakdown.quantityScore < 3, `Quantity score penalized below minimum order lot (got score ${tinyScore.breakdown.quantityScore}/15)`);
  assert(tinyScore.cautionExplanations.some(c => c.includes('below buyer\'s minimum')), 'Has caution for below minimum lot size');

  // 1e. Far Long-Haul Distance (> 3x radius)
  const distantSupply: SupplyItem = {
    ...perfectSupply,
    latitude: 28.6139, // New Delhi ~1200km away
    longitude: 77.2090
  };
  const distantScore = computeMatchScore(distantSupply, baseDemand);
  assert(distantScore.breakdown.distanceScore === 0, `Distance score is 0 when 1200km away with 100km radius (got ${distantScore.breakdown.distanceScore}/15)`);
  assert(distantScore.cautionExplanations.some(c => c.includes('far outside buyer\'s')), 'Has caution for radius exceeded');

  // 1f. Haversine Distance helper calculation
  const distWarangalToHyd = calculateDistanceKm(17.9689, 79.5941, 17.3850, 78.4867);
  assert(distWarangalToHyd !== null && distWarangalToHyd >= 130 && distWarangalToHyd <= 160, `Haversine distance Warangal to Hyderabad is ~140km (got ${distWarangalToHyd}km)`);


  // =========================================================================
  // TEST SUITE 2: Database Persistence & Demand Requests
  // =========================================================================
  console.log('\n--- TEST 2: Database Demand & Match Verification ---');
  const pool = getPool();
  const client = await pool.connect();

  try {
    // 2a. Check buyer profiles
    const buyersRes = await client.query('SELECT count(*) FROM buyer_profiles');
    assert(parseInt(buyersRes.rows[0].count, 10) >= 4, `At least 4 buyer profiles active in DB (found ${buyersRes.rows[0].count})`);

    // 2b. Check open buyer demands
    const demandsRes = await client.query(`
      SELECT d.*, c.name as commodity_name, bp.company_name 
      FROM buyer_demand_requests d
      JOIN commodities c ON d.commodity_id = c.id
      JOIN buyer_profiles bp ON d.buyer_id = bp.user_id
      WHERE d.status IN ('OPEN', 'PARTIALLY_FILLED')
    `);
    assert(demandsRes.rows.length >= 4, `Found ${demandsRes.rows.length} open/partially-filled demands in DB`);

    // 2c. Score seeded demand against sample farmer supply
    if (demandsRes.rows.length > 0) {
      const redGramDemandRow = demandsRes.rows.find((r: any) => r.commodity_id === 'comm-redgram') || demandsRes.rows[0];
      const dbDemand: DemandRequest = {
        id: redGramDemandRow.id,
        buyerId: redGramDemandRow.buyer_id,
        buyerName: redGramDemandRow.company_name,
        buyerCompanyName: redGramDemandRow.company_name,
        commodityId: redGramDemandRow.commodity_id,
        commodityName: redGramDemandRow.commodity_name,
        varietyId: redGramDemandRow.variety_id,
        gradeId: redGramDemandRow.grade_id,
        requiredQuantity: Number(redGramDemandRow.required_quantity),
        minimumQuantity: Number(redGramDemandRow.minimum_quantity),
        filledQuantity: Number(redGramDemandRow.filled_quantity),
        remainingQuantity: Number(redGramDemandRow.required_quantity) - Number(redGramDemandRow.filled_quantity),
        quantityUnit: redGramDemandRow.quantity_unit,
        targetPricePerUnit: Number(redGramDemandRow.target_price_per_unit),
        maximumPricePerUnit: Number(redGramDemandRow.maximum_price_per_unit),
        requiredFromDate: redGramDemandRow.required_from_date,
        requiredUntilDate: redGramDemandRow.required_until_date,
        deliveryLocation: redGramDemandRow.delivery_location,
        deliveryLatitude: Number(redGramDemandRow.delivery_latitude),
        deliveryLongitude: Number(redGramDemandRow.delivery_longitude),
        deliveryRadiusKm: Number(redGramDemandRow.delivery_radius_km),
        deliveryPreference: redGramDemandRow.delivery_preference,
        status: redGramDemandRow.status,
        expiresAt: redGramDemandRow.expires_at
      };

      const matchRes = computeMatchScore(perfectSupply, dbDemand);
      assert(matchRes.totalScore >= 80, `Scored DB demand for ${dbDemand.commodityName}: got ${matchRes.totalScore}% match`);
      console.log(`    ℹ️ Buyer: ${dbDemand.buyerCompanyName} | Target: ₹${dbDemand.targetPricePerUnit}/${dbDemand.quantityUnit} | Score: ${matchRes.totalScore}%`);
      console.log(`    ℹ️ Positives: ${matchRes.positiveExplanations.slice(0, 2).join('; ')}`);
    }

  } finally {
    client.release();
  }


  // =========================================================================
  // TEST SUITE 3: Two-Sided Market Liquidity Overview
  // =========================================================================
  console.log('\n--- TEST 3: Two-Sided Market Liquidity Aggregation ---');
  const liquidityList = await getMarketLiquiditySummary();
  assert(liquidityList.length >= 4, `Liquidity summary covers ${liquidityList.length} active commodities`);

  const redGramLiq = liquidityList.find(l => l.commodityId === 'comm-redgram');
  assert(!!redGramLiq, 'Red Gram liquidity metric exists');
  if (redGramLiq) {
    assert(redGramLiq.activeDemandQuantity > 0, `Red Gram has active demand quantity: ${redGramLiq.activeDemandQuantity} ${redGramLiq.unit}`);
    assert(redGramLiq.demandSupplyRatio > 0, `Red Gram D/S ratio calculated: ${redGramLiq.demandSupplyRatio}x`);
    assert(['HIGH', 'MODERATE', 'LOW'].includes(redGramLiq.opportunityLevel), `Opportunity level is valid (${redGramLiq.opportunityLevel})`);
    console.log(`    ℹ️ Red Gram: Demand=${redGramLiq.activeDemandQuantity} ${redGramLiq.unit}, Supply=${redGramLiq.activeSupplyQuantity} ${redGramLiq.unit}, D/S Ratio=${redGramLiq.demandSupplyRatio}x [${redGramLiq.opportunityLevel}]`);
    console.log(`    ℹ️ Interpretation: ${redGramLiq.interpretation}`);
  }


  // =========================================================================
  // TEST SUITE 4: Demand Expiration & Schema Integrity
  // =========================================================================
  console.log('\n--- TEST 4: Demand Expiration & Schema Integrity ---');
  const testClient = await pool.connect();
  try {
    // Check if any expired demand is marked OPEN
    const expiredRes = await testClient.query(`
      SELECT count(*) FROM buyer_demand_requests 
      WHERE status = 'OPEN' AND expires_at < CURRENT_TIMESTAMP
    `);
    assert(parseInt(expiredRes.rows[0].count, 10) === 0, 'No expired demands have OPEN status');

    // Verify foreign key on market_inquiries
    const colRes = await testClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'market_inquiries' AND column_name = 'demand_request_id'
    `);
    assert(colRes.rows.length === 1, 'Column demand_request_id is present on market_inquiries table');

    // Verify match_history table exists
    const matchHistRes = await testClient.query(`
      SELECT count(*) FROM information_schema.tables 
      WHERE table_name = 'match_history'
    `);
    assert(parseInt(matchHistRes.rows[0].count, 10) === 1, 'Table match_history exists in schema');

    // Verify buyer_profiles table exists
    const buyerProfRes = await testClient.query(`
      SELECT count(*) FROM information_schema.tables 
      WHERE table_name = 'buyer_profiles'
    `);
    assert(parseInt(buyerProfRes.rows[0].count, 10) === 1, 'Table buyer_profiles exists in schema');

  } finally {
    testClient.release();
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
