import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generatePriceForecast, HistoricalDataPoint } from '@/lib/market/forecasting'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodityId = searchParams.get('commodity_id')
    const marketId = searchParams.get('market_id')
    const varietyId = searchParams.get('variety_id')

    if (!commodityId) {
      return NextResponse.json(
        { success: false, error: 'commodity_id parameter is required' },
        { status: 400 }
      )
    }

    const conditions: string[] = ['mp.commodity_id = $1']
    const params: any[] = [commodityId]
    let pIdx = 2

    if (marketId) {
      conditions.push(`mp.market_id = $${pIdx++}`)
      params.push(marketId)
    }

    if (varietyId) {
      conditions.push(`mp.variety_id = $${pIdx++}`)
      params.push(varietyId)
    }

    const sql = `
      SELECT 
        mp.arrival_date,
        ROUND(MIN(mp.minimum_price), 2) as min_price,
        ROUND(MAX(mp.maximum_price), 2) as max_price,
        ROUND(AVG(mp.modal_price), 2) as modal_price,
        ROUND(SUM(mp.arrival_quantity), 2) as arrival_quantity
      FROM market_prices mp
      WHERE ${conditions.join(' AND ')}
      GROUP BY mp.arrival_date
      ORDER BY mp.arrival_date ASC
    `

    const rows = await query(sql, params)

    if (rows.length < 5) {
      return NextResponse.json({
        success: false,
        error: `Insufficient historical data to generate an accurate forecast (found ${rows.length} days, minimum 5 required).`
      }, { status: 422 })
    }

    const history: HistoricalDataPoint[] = rows.map(r => ({
      date: r.arrival_date,
      minPrice: Number(r.min_price || r.modal_price),
      maxPrice: Number(r.max_price || r.modal_price),
      modalPrice: Number(r.modal_price),
      arrivals: Number(r.arrival_quantity)
    }))

    const targetMarketId = marketId || 'all-mandis'
    const fullForecast = generatePriceForecast(history, commodityId, targetMarketId)

    return NextResponse.json({
      success: true,
      commodity_id: commodityId,
      market_id: marketId || 'AGGREGATE_ALL',
      data_points_used: rows.length,
      historical_start_date: rows[0].arrival_date,
      historical_end_date: rows[rows.length - 1].arrival_date,
      latest_modal_price: fullForecast.currentModalPrice,
      horizons: fullForecast.horizons,
      validation_metrics: fullForecast.validationMetrics,
      features: fullForecast.features
    })
  } catch (error: any) {
    console.error('API /api/market/forecast error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate price forecast' },
      { status: 500 }
    )
  }
}
