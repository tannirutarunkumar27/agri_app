import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodityId = searchParams.get('commodity_id')
    const marketId = searchParams.get('market_id')
    const state = searchParams.get('state')
    const varietyId = searchParams.get('variety_id')
    const date = searchParams.get('date')
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10)), 200)

    const conditions: string[] = ['1=1']
    const params: any[] = []
    let pIdx = 1

    if (commodityId) {
      conditions.push(`mp.commodity_id = $${pIdx++}`)
      params.push(commodityId)
    }

    if (marketId) {
      conditions.push(`mp.market_id = $${pIdx++}`)
      params.push(marketId)
    }

    if (state) {
      conditions.push(`LOWER(m.state) = LOWER($${pIdx++})`)
      params.push(state)
    }

    if (varietyId) {
      conditions.push(`mp.variety_id = $${pIdx++}`)
      params.push(varietyId)
    }

    if (date) {
      conditions.push(`mp.arrival_date = $${pIdx++}::date`)
      params.push(date)
    }

    params.push(limit)

    const sql = `
      SELECT 
        mp.id,
        mp.commodity_id,
        c.name as commodity_name,
        c.category as commodity_category,
        mp.market_id,
        m.market_name,
        m.state,
        m.district,
        m.latitude,
        m.longitude,
        mp.variety_id,
        v.name as variety_name,
        mp.arrival_date,
        mp.minimum_price,
        mp.maximum_price,
        mp.modal_price,
        mp.arrival_quantity,
        mp.unit,
        mp.source,
        mp.fetched_at,
        mp.created_at
      FROM market_prices mp
      JOIN commodities c ON mp.commodity_id = c.id
      JOIN markets m ON mp.market_id = m.id
      LEFT JOIN commodity_varieties v ON mp.variety_id = v.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY mp.arrival_date DESC, mp.modal_price DESC
      LIMIT $${pIdx}
    `

    const rows = await query(sql, params)

    return NextResponse.json({
      success: true,
      count: rows.length,
      prices: rows.map((r: any) => ({
        id: r.id,
        commodity_id: r.commodity_id,
        commodity_name: r.commodity_name,
        commodity_category: r.commodity_category,
        market_id: r.market_id,
        market_name: r.market_name,
        state: r.state,
        district: r.district,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        variety_id: r.variety_id,
        variety_name: r.variety_name || 'Common / Standard',
        arrival_date: r.arrival_date,
        minimum_price: Number(r.minimum_price),
        maximum_price: Number(r.maximum_price),
        modal_price: Number(r.modal_price),
        arrival_quantity: Number(r.arrival_quantity),
        unit: r.unit,
        source: r.source,
        fetched_at: r.fetched_at
      }))
    })
  } catch (error: any) {
    console.error('API /api/market/prices error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
