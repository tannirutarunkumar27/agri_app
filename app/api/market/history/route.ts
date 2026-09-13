import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodityId = searchParams.get('commodity_id')
    const marketId = searchParams.get('market_id')
    const varietyId = searchParams.get('variety_id')
    const days = parseInt(searchParams.get('days') || '30', 10)

    if (!commodityId) {
      return NextResponse.json(
        { success: false, error: 'commodity_id parameter is required' },
        { status: 400 }
      )
    }

    const conditions: string[] = [
      'mp.commodity_id = $1',
      `mp.arrival_date >= CURRENT_DATE - INTERVAL '${Math.min(Math.max(7, days), 365)} days'`
    ]
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
        ROUND(AVG(mp.modal_price), 2) as avg_modal_price,
        ROUND(MIN(mp.minimum_price), 2) as min_price,
        ROUND(MAX(mp.maximum_price), 2) as max_price,
        ROUND(SUM(mp.arrival_quantity), 2) as total_arrivals,
        COUNT(DISTINCT mp.market_id) as reporting_mandis
      FROM market_prices mp
      WHERE ${conditions.join(' AND ')}
      GROUP BY mp.arrival_date
      ORDER BY mp.arrival_date ASC
    `

    const rows = await query(sql, params)

    // Calculate rolling 7-day moving average and summary metrics
    const series = rows.map((r: any, index: number) => {
      const windowStart = Math.max(0, index - 6)
      const windowSlice = rows.slice(windowStart, index + 1)
      const sumModal = windowSlice.reduce((acc: number, curr: any) => acc + Number(curr.avg_modal_price), 0)
      const ma7 = Math.round(sumModal / windowSlice.length)

      return {
        date: r.arrival_date,
        modal_price: Number(r.avg_modal_price),
        min_price: Number(r.min_price),
        max_price: Number(r.max_price),
        arrivals: Number(r.total_arrivals),
        reporting_mandis: Number(r.reporting_mandis),
        ma7
      }
    })

    let changePct = 0
    let periodMin = 0
    let periodMax = 0

    if (series.length > 0) {
      const firstPrice = series[0].modal_price
      const lastPrice = series[series.length - 1].modal_price
      changePct = firstPrice > 0 ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)) : 0
      periodMin = Math.min(...series.map((s: any) => s.modal_price))
      periodMax = Math.max(...series.map((s: any) => s.modal_price))
    }

    return NextResponse.json({
      success: true,
      commodity_id: commodityId,
      market_id: marketId || 'ALL',
      period_days: days,
      data_points: series.length,
      metrics: {
        change_percentage: changePct,
        period_min_modal: periodMin,
        period_max_modal: periodMax,
        latest_price: series.length > 0 ? series[series.length - 1].modal_price : 0,
        latest_date: series.length > 0 ? series[series.length - 1].date : null
      },
      series
    })
  } catch (error: any) {
    console.error('API /api/market/history error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
