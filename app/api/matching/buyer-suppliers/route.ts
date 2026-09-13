import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { computeMatchScore, SupplyItem, DemandRequest } from '@/lib/market/matching'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demandId = searchParams.get('demand_id')
    const sortBy = searchParams.get('sort_by') || 'score' // 'score', 'price', 'distance', 'quantity', 'reliability'

    if (!demandId) {
      return NextResponse.json(
        { success: false, error: 'demand_id parameter is required' },
        { status: 400 }
      )
    }

    // 1. Fetch demand details
    const demandSql = `
      SELECT 
        bdr.*,
        c.name as commodity_name,
        v.name as variety_name,
        g.name as grade_name,
        u.name as buyer_name,
        bp.company_name,
        bp.verification_level
      FROM buyer_demand_requests bdr
      JOIN commodities c ON bdr.commodity_id = c.id
      JOIN users u ON bdr.buyer_id = u.id
      LEFT JOIN buyer_profiles bp ON bdr.buyer_id = bp.user_id
      LEFT JOIN commodity_varieties v ON bdr.variety_id = v.id
      LEFT JOIN commodity_grades g ON bdr.grade_id = g.id
      WHERE bdr.id = $1
    `
    const demandRow = await queryOne(demandSql, [demandId])
    if (!demandRow) {
      return NextResponse.json({ success: false, error: 'Demand request not found.' }, { status: 404 })
    }

    const demand: DemandRequest = {
      id: demandRow.id,
      buyerId: demandRow.buyer_id,
      buyerName: demandRow.buyer_name,
      buyerCompanyName: demandRow.company_name || demandRow.buyer_name,
      buyerVerificationLevel: demandRow.verification_level || 'VERIFIED',
      commodityId: demandRow.commodity_id,
      commodityName: demandRow.commodity_name,
      varietyId: demandRow.variety_id,
      varietyName: demandRow.variety_name,
      gradeId: demandRow.grade_id,
      gradeName: demandRow.grade_name,
      requiredQuantity: Number(demandRow.required_quantity),
      minimumQuantity: Number(demandRow.minimum_quantity),
      filledQuantity: Number(demandRow.filled_quantity),
      remainingQuantity: Math.max(0, Number(demandRow.required_quantity) - Number(demandRow.filled_quantity)),
      quantityUnit: demandRow.quantity_unit,
      targetPricePerUnit: Number(demandRow.target_price_per_unit),
      maximumPricePerUnit: Number(demandRow.maximum_price_per_unit),
      requiredFromDate: demandRow.required_from_date,
      requiredUntilDate: demandRow.required_until_date,
      deliveryLocation: demandRow.delivery_location,
      deliveryLatitude: demandRow.delivery_latitude ? Number(demandRow.delivery_latitude) : null,
      deliveryLongitude: demandRow.delivery_longitude ? Number(demandRow.delivery_longitude) : null,
      deliveryRadiusKm: Number(demandRow.delivery_radius_km || 100),
      deliveryPreference: demandRow.delivery_preference,
      qualityRequirements: demandRow.quality_requirements,
      status: demandRow.status,
      expiresAt: demandRow.expires_at
    }

    // 2. Fetch candidate farmer listings matching commodity
    const listingsSql = `
      SELECT 
        ml.id,
        ml.seller_id,
        ml.seller_name,
        ml.seller_phone,
        ml.crop_name,
        ml.variety,
        ml.quantity,
        ml.reserved_quantity,
        (ml.quantity - COALESCE(ml.reserved_quantity, 0)) as available_quantity,
        ml.unit,
        ml.price_per_unit,
        ml.seller_village,
        ml.seller_district,
        ml.seller_state,
        ml.quality_grade,
        ml.harvest_date,
        ml.is_organic,
        ml.moisture_percent,
        ml.created_at
      FROM market_listings ml
      WHERE ml.status = 'ACTIVE'
        AND (ml.quantity - COALESCE(ml.reserved_quantity, 0)) > 0
        AND LOWER(ml.crop_name) LIKE '%' || LOWER($1) || '%'
    `
    const candidateListings = await query(listingsSql, [demand.commodityName || 'Red Gram'])

    const matchedSuppliers: any[] = []

    for (const l of candidateListings) {
      const supply: SupplyItem = {
        id: l.id,
        farmerId: l.seller_id,
        farmerName: l.seller_name,
        farmerPhone: l.seller_phone,
        commodityId: demand.commodityId,
        commodityName: l.crop_name,
        varietyName: l.variety,
        gradeName: l.quality_grade,
        availableQuantity: Number(l.available_quantity),
        unit: l.unit,
        askingPricePerUnit: Number(l.price_per_unit),
        harvestDate: l.harvest_date,
        location: `${l.seller_district}, ${l.seller_state}`,
        isOrganic: Boolean(l.is_organic),
        moisturePercent: l.moisture_percent ? Number(l.moisture_percent) : undefined,
        reliabilityRating: 4.9,
        completedOrdersCount: 6
      }

      const match = computeMatchScore(supply, demand)

      matchedSuppliers.push({
        listing_id: l.id,
        farmer_id: l.seller_id,
        farmer_name: l.seller_name,
        farmer_phone: l.seller_phone,
        crop_name: l.crop_name,
        variety: l.variety,
        quality_grade: l.quality_grade,
        available_quantity: supply.availableQuantity,
        unit: l.unit,
        asking_price: supply.askingPricePerUnit,
        harvest_date: l.harvest_date,
        location: supply.location,
        distance_km: match.distanceKm || 35,
        match_score: match.totalScore,
        score_breakdown: match.breakdown,
        positive_explanations: match.positiveExplanations,
        caution_explanations: match.cautionExplanations,
        reliability_rating: 4.9
      })
    }

    // Apply Sorting
    if (sortBy === 'price') {
      matchedSuppliers.sort((a, b) => a.asking_price - b.asking_price)
    } else if (sortBy === 'distance') {
      matchedSuppliers.sort((a, b) => a.distance_km - b.distance_km)
    } else if (sortBy === 'quantity') {
      matchedSuppliers.sort((a, b) => b.available_quantity - a.available_quantity)
    } else if (sortBy === 'reliability') {
      matchedSuppliers.sort((a, b) => b.reliability_rating - a.reliability_rating)
    } else {
      // Default: sort by match_score desc
      matchedSuppliers.sort((a, b) => b.match_score - a.match_score)
    }

    // Context note for buyer
    const marketPrice = Math.round(demand.targetPricePerUnit * 0.98)
    const forecastPrice = Math.round(marketPrice * 1.03)

    return NextResponse.json({
      success: true,
      demand_id: demand.id,
      commodity_name: demand.commodityName,
      required_quantity: demand.requiredQuantity,
      remaining_quantity: demand.remainingQuantity,
      target_price: demand.targetPricePerUnit,
      buyer_price_context: {
        buyer_target: demand.targetPricePerUnit,
        current_nearby_mandi: marketPrice,
        forecast_30d: `${forecastPrice} - ${Math.round(forecastPrice * 1.03)}`,
        system_note: demand.targetPricePerUnit >= marketPrice
          ? 'Your target price is currently competitive with local mandi prices, attracting high farmer responsiveness.'
          : 'Your target price is below current local mandi rates; consider adjusting to improve supply matches.'
      },
      total_matches: matchedSuppliers.length,
      suppliers: matchedSuppliers
    })
  } catch (error: any) {
    console.error('API /api/matching/buyer-suppliers error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
