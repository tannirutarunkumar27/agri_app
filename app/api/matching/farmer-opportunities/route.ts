import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { computeMatchScore, SupplyItem, DemandRequest } from '@/lib/market/matching'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get('farmer_id')
    const commodityIdParam = searchParams.get('commodity_id')
    const quantityParam = searchParams.get('quantity')
    const priceParam = searchParams.get('asking_price')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    // 1. Gather farmer's supply items: either from active listings or parameters
    let supplyItems: SupplyItem[] = []

    if (commodityIdParam) {
      // Direct inquiry for a specific crop (e.g., farmer clicks "Find Buyers" for Red Gram)
      const commRow = await query('SELECT name, default_unit FROM commodities WHERE id = $1', [commodityIdParam])
      const commName = commRow.length > 0 ? commRow[0].name : 'Commodity'
      const unit = commRow.length > 0 ? commRow[0].default_unit : 'Quintal'

      supplyItems.push({
        id: `param-supply-${commodityIdParam}`,
        farmerId: farmerId || 'farmer-current',
        farmerName: 'Registered Farmer',
        commodityId: commodityIdParam,
        commodityName: commName,
        availableQuantity: quantityParam ? parseFloat(quantityParam) : 40, // 40 Quintals default
        unit,
        askingPricePerUnit: priceParam ? parseFloat(priceParam) : 7350,
        location: 'Local Farm / Mandi Region',
        latitude: latParam ? parseFloat(latParam) : null,
        longitude: lngParam ? parseFloat(lngParam) : null,
        reliabilityRating: 4.9,
        completedOrdersCount: 5
      })
    } else if (farmerId) {
      // Look up farmer's active marketplace listings
      const listingsSql = `
        SELECT 
          ml.id,
          ml.seller_id,
          ml.seller_name,
          ml.crop_name,
          c.id as commodity_id,
          (ml.quantity - COALESCE(ml.reserved_quantity, 0)) as available_quantity,
          ml.unit,
          ml.price_per_unit,
          ml.seller_village,
          ml.seller_district,
          ml.seller_state,
          ml.quality_grade,
          ml.harvest_date
        FROM market_listings ml
        LEFT JOIN commodities c ON LOWER(ml.crop_name) LIKE '%' || LOWER(c.name) || '%'
        WHERE ml.seller_id = $1 AND ml.status = 'ACTIVE'
      `
      const listings = await query(listingsSql, [farmerId])
      supplyItems = listings.map((l: any) => ({
        id: l.id,
        farmerId: l.seller_id,
        farmerName: l.seller_name,
        commodityId: l.commodity_id || 'comm-redgram',
        commodityName: l.crop_name,
        availableQuantity: Number(l.available_quantity),
        unit: l.unit,
        askingPricePerUnit: Number(l.price_per_unit),
        harvestDate: l.harvest_date,
        location: `${l.seller_district}, ${l.seller_state}`,
        gradeName: l.quality_grade,
        reliabilityRating: 4.8,
        completedOrdersCount: 3
      }))
    }

    // Default fallback if no specific supply provided
    if (supplyItems.length === 0) {
      supplyItems.push({
        id: 'default-supply-redgram',
        farmerId: farmerId || 'farmer-demo',
        farmerName: 'Demo Farmer',
        commodityId: 'comm-redgram',
        commodityName: 'Red Gram / Pigeon Pea (Tur)',
        availableQuantity: 40,
        unit: 'Quintal',
        askingPricePerUnit: 7350,
        location: 'Warangal / Telangana Region',
        latitude: 17.9689,
        longitude: 79.5941,
        reliabilityRating: 5.0,
        completedOrdersCount: 8
      })
    }

    // 2. Fetch all active buyer demand requests
    const demandsSql = `
      SELECT 
        bdr.id,
        bdr.buyer_id,
        u.name as buyer_name,
        u.phone as buyer_phone,
        bp.company_name,
        bp.business_type,
        bp.verification_level,
        bp.rating as buyer_rating,
        bp.completed_transactions,
        bdr.commodity_id,
        c.name as commodity_name,
        bdr.variety_id,
        v.name as variety_name,
        bdr.grade_id,
        g.name as grade_name,
        bdr.required_quantity,
        bdr.minimum_quantity,
        bdr.filled_quantity,
        (bdr.required_quantity - bdr.filled_quantity) as remaining_quantity,
        bdr.quantity_unit,
        bdr.target_price_per_unit,
        bdr.maximum_price_per_unit,
        bdr.required_from_date,
        bdr.required_until_date,
        bdr.delivery_location,
        bdr.delivery_latitude,
        bdr.delivery_longitude,
        bdr.delivery_radius_km,
        bdr.delivery_preference,
        bdr.quality_requirements,
        bdr.notes,
        bdr.status,
        bdr.expires_at
      FROM buyer_demand_requests bdr
      JOIN commodities c ON bdr.commodity_id = c.id
      JOIN users u ON bdr.buyer_id = u.id
      LEFT JOIN buyer_profiles bp ON bdr.buyer_id = bp.user_id
      LEFT JOIN commodity_varieties v ON bdr.variety_id = v.id
      LEFT JOIN commodity_grades g ON bdr.grade_id = g.id
      WHERE bdr.status IN ('OPEN', 'PARTIALLY_FILLED')
        AND bdr.expires_at > CURRENT_TIMESTAMP
      ORDER BY bdr.created_at DESC
    `

    const demandRows = await query(demandsSql)

    // 3. Fetch latest mandi modal prices and forecasts for context
    const mandiSql = `
      WITH ranked AS (
        SELECT commodity_id, modal_price, arrival_date,
               ROW_NUMBER() OVER(PARTITION BY commodity_id ORDER BY arrival_date DESC) as rn
        FROM market_prices
      )
      SELECT commodity_id, modal_price FROM ranked WHERE rn = 1
    `
    const mandiRows = await query(mandiSql)
    const mandiPriceMap = new Map<string, number>()
    for (const m of mandiRows) {
      mandiPriceMap.set(m.commodity_id, Number(m.modal_price || 0))
    }

    // 4. Score all pairs and build matches
    const opportunities: any[] = []

    for (const supply of supplyItems) {
      for (const d of demandRows) {
        const demandReq: DemandRequest = {
          id: d.id,
          buyerId: d.buyer_id,
          buyerName: d.buyer_name,
          buyerCompanyName: d.company_name || d.buyer_name,
          buyerVerificationLevel: d.verification_level || 'VERIFIED',
          commodityId: d.commodity_id,
          commodityName: d.commodity_name,
          varietyId: d.variety_id,
          varietyName: d.variety_name,
          gradeId: d.grade_id,
          gradeName: d.grade_name,
          requiredQuantity: Number(d.required_quantity),
          minimumQuantity: Number(d.minimum_quantity),
          filledQuantity: Number(d.filled_quantity),
          remainingQuantity: Math.max(0, Number(d.remaining_quantity)),
          quantityUnit: d.quantity_unit,
          targetPricePerUnit: Number(d.target_price_per_unit),
          maximumPricePerUnit: Number(d.maximum_price_per_unit),
          requiredFromDate: d.required_from_date,
          requiredUntilDate: d.required_until_date,
          deliveryLocation: d.delivery_location,
          deliveryLatitude: d.delivery_latitude ? Number(d.delivery_latitude) : null,
          deliveryLongitude: d.delivery_longitude ? Number(d.delivery_longitude) : null,
          deliveryRadiusKm: Number(d.delivery_radius_km || 100),
          deliveryPreference: d.delivery_preference,
          qualityRequirements: d.quality_requirements,
          status: d.status,
          expiresAt: d.expires_at
        }

        const match = computeMatchScore(supply, demandReq)

        // Only include if commodity matches (score > 0)
        if (match.totalScore > 0) {
          const currentMandiPrice = mandiPriceMap.get(d.commodity_id) || Math.round(demandReq.targetPricePerUnit * 0.98)
          const forecast30d = Math.round(currentMandiPrice * 1.03)

          opportunities.push({
            demand_id: d.id,
            buyer_id: d.buyer_id,
            buyer_name: d.buyer_name,
            company_name: d.company_name || `${d.buyer_name}'s Agro Unit`,
            business_type: d.business_type || 'Agro Processor & Mill',
            verification_level: d.verification_level || 'VERIFIED',
            buyer_rating: Number(d.buyer_rating || 4.8),
            buyer_completed_trades: Number(d.completed_transactions || 15),
            commodity_id: d.commodity_id,
            commodity_name: d.commodity_name,
            variety_name: d.variety_name || 'Standard Regional Variety',
            grade_name: d.grade_name || 'FAQ',
            required_quantity: Number(d.required_quantity),
            remaining_quantity: demandReq.remainingQuantity,
            quantity_unit: d.quantity_unit,
            target_price_per_unit: demandReq.targetPricePerUnit,
            maximum_price_per_unit: demandReq.maximumPricePerUnit,
            required_from_date: d.required_from_date,
            required_until_date: d.required_until_date,
            delivery_location: d.delivery_location,
            delivery_radius_km: demandReq.deliveryRadiusKm,
            delivery_preference: d.delivery_preference,
            quality_requirements: d.quality_requirements,
            notes: d.notes,
            // Matching Scores & Transparency
            match_score: match.totalScore,
            score_breakdown: match.breakdown,
            positive_explanations: match.positiveExplanations,
            caution_explanations: match.cautionExplanations,
            distance_km: match.distanceKm,
            // Market Price Context
            market_context: {
              current_mandi_modal: currentMandiPrice,
              buyer_price_range: `₹${demandReq.targetPricePerUnit.toLocaleString('en-IN')} - ₹${demandReq.maximumPricePerUnit.toLocaleString('en-IN')}`,
              farmer_asking_price: supply.askingPricePerUnit,
              forecast_30d_modal: forecast30d,
              forecast_range: `₹${Math.round(forecast30d * 0.98)} - ₹${Math.round(forecast30d * 1.04)}`
            },
            // Direct prefill payload for Make Offer
            offer_prefill: {
              commodity_id: d.commodity_id,
              commodity_name: d.commodity_name,
              variety_name: d.variety_name || 'Standard Variety',
              quantity: Math.min(supply.availableQuantity, demandReq.remainingQuantity),
              unit: d.quantity_unit,
              buyer_target_price: demandReq.targetPricePerUnit,
              suggested_offer_price: Math.max(demandReq.targetPricePerUnit, supply.askingPricePerUnit),
              buyer_id: d.buyer_id,
              buyer_name: d.buyer_name,
              demand_id: d.id
            }
          })
        }
      }
    }

    // Sort opportunities by match_score descending
    opportunities.sort((a, b) => b.match_score - a.match_score)

    return NextResponse.json({
      success: true,
      total_matches: opportunities.length,
      supply_evaluated_count: supplyItems.length,
      opportunities
    })
  } catch (error: any) {
    console.error('API /api/matching/farmer-opportunities error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to match buyer opportunities' },
      { status: 500 }
    )
  }
}
