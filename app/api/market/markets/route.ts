import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const district = searchParams.get('district')
    const q = searchParams.get('q')

    let sql = `
      SELECT id, market_name, mandi_code, state, district, city, latitude, longitude, market_type, is_active, data_source
      FROM markets
      WHERE is_active = true
    `
    const params: any[] = []
    let pIdx = 1

    if (state && state !== 'all') {
      sql += ` AND state ILIKE $${pIdx}`
      params.push(state)
      pIdx++
    }

    if (district && district !== 'all') {
      sql += ` AND district ILIKE $${pIdx}`
      params.push(district)
      pIdx++
    }

    if (q) {
      sql += ` AND (market_name ILIKE $${pIdx} OR city ILIKE $${pIdx} OR district ILIKE $${pIdx})`
      params.push(`%${q}%`)
      pIdx++
    }

    sql += ` ORDER BY state ASC, district ASC, market_name ASC`

    const markets = await query<any>(sql, params)

    return NextResponse.json({
      success: true,
      count: markets.length,
      markets: markets.map((m) => ({
        id: m.id,
        marketName: m.market_name,
        mandiCode: m.mandi_code,
        state: m.state,
        district: m.district,
        city: m.city,
        latitude: Number(m.latitude || 0),
        longitude: Number(m.longitude || 0),
        marketType: m.market_type,
        dataSource: m.data_source
      }))
    })
  } catch (err: any) {
    console.error('Error fetching markets:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch markets.' }, { status: 500 })
  }
}
