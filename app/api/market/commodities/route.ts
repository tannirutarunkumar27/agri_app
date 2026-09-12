import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Fetch active commodities
    const commodities = await query<any>(
      `SELECT id, name, code, local_names, category, default_unit, is_active, description, created_at
       FROM commodities
       WHERE is_active = true
       ORDER BY name ASC`
    )

    // 2. Fetch varieties
    const varieties = await query<any>(
      `SELECT id, commodity_id, name, code, aliases, is_active
       FROM commodity_varieties
       WHERE is_active = true
       ORDER BY name ASC`
    )

    // 3. Fetch grades
    const grades = await query<any>(
      `SELECT id, name, code, description, is_active
       FROM commodity_grades
       WHERE is_active = true
       ORDER BY name ASC`
    )

    // 4. Fetch units
    const units = await query<any>(
      `SELECT id, name, code, to_base_multiplier, base_unit, is_active
       FROM measurement_units
       WHERE is_active = true
       ORDER BY to_base_multiplier ASC`
    )

    // Group varieties by commodity
    const varietiesByCommodity: Record<string, any[]> = {}
    for (const v of varieties) {
      if (!varietiesByCommodity[v.commodity_id]) {
        varietiesByCommodity[v.commodity_id] = []
      }
      varietiesByCommodity[v.commodity_id].push(v)
    }

    const payload = commodities.map((c) => ({
      ...c,
      localNames: typeof c.local_names === 'string' ? JSON.parse(c.local_names) : c.local_names || {},
      varieties: varietiesByCommodity[c.id] || []
    }))

    return NextResponse.json({
      success: true,
      count: payload.length,
      commodities: payload,
      grades,
      units
    })
  } catch (err: any) {
    console.error('Error fetching commodities:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch commodities.' }, { status: 500 })
  }
}
