import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Total counts
    const countsSql = `
      SELECT 
        (SELECT COUNT(*) FROM commodities WHERE is_active = true) as total_commodities,
        (SELECT COUNT(*) FROM markets WHERE is_active = true) as total_markets,
        (SELECT COUNT(*) FROM market_prices) as total_price_observations,
        (SELECT COUNT(*) FROM market_prices_raw) as total_raw_records,
        (SELECT COUNT(*) FROM market_prices_raw WHERE status = 'REJECTED') as rejected_raw_records,
        (SELECT COUNT(*) FROM market_price_forecasts) as total_forecasts
    `
    const countRows = await query(countsSql)
    const counts = countRows[0] || {}

    // 2. Recent sync logs
    const logsSql = `
      SELECT id, source, records_received, records_valid, records_rejected, records_duplicate, execution_time_ms, status, created_at
      FROM market_sync_logs
      ORDER BY created_at DESC
      LIMIT 10
    `
    const logs = await query(logsSql)

    // 3. Commodity breakdown
    const breakdownSql = `
      SELECT 
        c.name as commodity_name,
        COUNT(mp.id) as observation_count,
        MIN(mp.arrival_date) as earliest_date,
        MAX(mp.arrival_date) as latest_date,
        ROUND(AVG(mp.modal_price), 2) as avg_price,
        ROUND(MIN(mp.minimum_price), 2) as min_price,
        ROUND(MAX(mp.maximum_price), 2) as max_price
      FROM commodities c
      LEFT JOIN market_prices mp ON c.id = mp.commodity_id
      GROUP BY c.id, c.name
      ORDER BY observation_count DESC
    `
    const commodityBreakdown = await query(breakdownSql)

    return NextResponse.json({
      success: true,
      data_health: {
        total_commodities: Number(counts.total_commodities || 0),
        total_mandis: Number(counts.total_markets || 0),
        total_observations: Number(counts.total_price_observations || 0),
        total_raw_records: Number(counts.total_raw_records || 0),
        rejected_records: Number(counts.rejected_raw_records || 0),
        valid_percentage: counts.total_raw_records > 0 
          ? Number((((counts.total_raw_records - counts.rejected_raw_records) / counts.total_raw_records) * 100).toFixed(1))
          : 100,
        total_stored_forecasts: Number(counts.total_forecasts || 0)
      },
      commodity_breakdown: commodityBreakdown.map((c: any) => ({
        commodity_name: c.commodity_name,
        observations: Number(c.observation_count),
        earliest_date: c.earliest_date,
        latest_date: c.latest_date,
        avg_price: Number(c.avg_price || 0),
        price_range: `₹${c.min_price || 0} - ₹${c.max_price || 0}`
      })),
      recent_sync_logs: logs
    })
  } catch (error: any) {
    console.error('API /api/admin/market/status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
