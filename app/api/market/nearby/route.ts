import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodityId = searchParams.get('commodity_id')
    const baseMarketId = searchParams.get('base_market_id')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const freightRatePerKmQtl = parseFloat(searchParams.get('freight_rate') || '0.80')

    if (!commodityId) {
      return NextResponse.json(
        { success: false, error: 'commodity_id parameter is required' },
        { status: 400 }
      )
    }

    // 1. Fetch latest prices for this commodity across all reporting markets
    const pricesSql = `
      WITH ranked_prices AS (
        SELECT 
          mp.id,
          mp.market_id,
          m.market_name,
          m.state,
          m.district,
          m.latitude,
          m.longitude,
          mp.arrival_date,
          mp.minimum_price,
          mp.maximum_price,
          mp.modal_price,
          mp.arrival_quantity,
          mp.unit,
          mp.source,
          ROW_NUMBER() OVER(PARTITION BY mp.market_id ORDER BY mp.arrival_date DESC) as rn
        FROM market_prices mp
        JOIN markets m ON mp.market_id = m.id
        WHERE mp.commodity_id = $1
      )
      SELECT * FROM ranked_prices WHERE rn = 1
      ORDER BY modal_price DESC
    `

    const marketPrices = await query(pricesSql, [commodityId])

    if (marketPrices.length === 0) {
      return NextResponse.json({
        success: true,
        commodity_id: commodityId,
        markets: [],
        message: 'No active mandi price observations found for this commodity.'
      })
    }

    // Determine reference coordinate (farmer GPS or base market coordinates)
    let refLat: number | null = latParam ? parseFloat(latParam) : null
    let refLng: number | null = lngParam ? parseFloat(lngParam) : null
    let baseModalPrice: number = 0

    if (baseMarketId) {
      const baseMkt = marketPrices.find((m: any) => m.market_id === baseMarketId)
      if (baseMkt) {
        baseModalPrice = Number(baseMkt.modal_price)
        if (refLat === null && baseMkt.latitude) refLat = Number(baseMkt.latitude)
        if (refLng === null && baseMkt.longitude) refLng = Number(baseMkt.longitude)
      }
    }

    // Default to first market if no base market provided
    if (baseModalPrice === 0 && marketPrices.length > 0) {
      baseModalPrice = Number(marketPrices[0].modal_price)
      if (refLat === null && marketPrices[0].latitude) refLat = Number(marketPrices[0].latitude)
      if (refLng === null && marketPrices[0].longitude) refLng = Number(marketPrices[0].longitude)
    }

    const evaluatedMarkets = marketPrices.map((m: any) => {
      const modal = Number(m.modal_price)
      let distanceKm = 0
      if (refLat !== null && refLng !== null && m.latitude && m.longitude) {
        distanceKm = calculateHaversineDistanceKm(refLat, refLng, Number(m.latitude), Number(m.longitude))
      }

      const transportCostPerQtl = Math.round(distanceKm * freightRatePerKmQtl)
      const netRealizablePrice = modal - transportCostPerQtl
      const netGainOverBase = netRealizablePrice - baseModalPrice
      const isArbitrageProfitable = netGainOverBase > 100 // At least ₹100/qtl net gain to justify hauling

      return {
        market_id: m.market_id,
        market_name: m.market_name,
        state: m.state,
        district: m.district,
        arrival_date: m.arrival_date,
        modal_price: modal,
        min_price: Number(m.minimum_price),
        max_price: Number(m.maximum_price),
        arrival_quantity: Number(m.arrival_quantity),
        unit: m.unit,
        distance_km: distanceKm,
        transport_cost_per_qtl: transportCostPerQtl,
        net_realizable_price: netRealizablePrice,
        price_difference: modal - baseModalPrice,
        net_gain_over_local: netGainOverBase,
        is_arbitrage_profitable: isArbitrageProfitable,
        source: m.source
      }
    })

    // Sort by Net Realizable Price descending
    evaluatedMarkets.sort((a: any, b: any) => b.net_realizable_price - a.net_realizable_price)

    return NextResponse.json({
      success: true,
      commodity_id: commodityId,
      base_market_id: baseMarketId || (marketPrices[0] ? marketPrices[0].market_id : null),
      base_modal_price: baseModalPrice,
      freight_rate_per_km_qtl: freightRatePerKmQtl,
      best_market: evaluatedMarkets[0] || null,
      markets: evaluatedMarkets
    })
  } catch (error: any) {
    console.error('API /api/market/nearby error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
