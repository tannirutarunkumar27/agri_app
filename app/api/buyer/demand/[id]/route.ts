import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sql = `
      SELECT 
        bdr.*,
        c.name as commodity_name,
        c.category as commodity_category,
        v.name as variety_name,
        g.name as grade_name,
        u.name as buyer_name,
        u.phone as buyer_phone,
        bp.company_name,
        bp.business_type,
        bp.verification_level,
        bp.rating as buyer_rating,
        bp.completed_transactions as buyer_completed_trades,
        (bdr.required_quantity - bdr.filled_quantity) as remaining_quantity
      FROM buyer_demand_requests bdr
      JOIN commodities c ON bdr.commodity_id = c.id
      JOIN users u ON bdr.buyer_id = u.id
      LEFT JOIN buyer_profiles bp ON bdr.buyer_id = bp.user_id
      LEFT JOIN commodity_varieties v ON bdr.variety_id = v.id
      LEFT JOIN commodity_grades g ON bdr.grade_id = g.id
      WHERE bdr.id = $1
    `

    const demand = await queryOne(sql, [id])
    if (!demand) {
      return NextResponse.json({ success: false, error: 'Demand request not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      demand: {
        ...demand,
        required_quantity: Number(demand.required_quantity),
        minimum_quantity: Number(demand.minimum_quantity),
        filled_quantity: Number(demand.filled_quantity),
        remaining_quantity: Math.max(0, Number(demand.remaining_quantity)),
        target_price_per_unit: Number(demand.target_price_per_unit),
        maximum_price_per_unit: Number(demand.maximum_price_per_unit),
        is_expired: new Date(demand.expires_at) < new Date()
      }
    })
  } catch (error: any) {
    console.error('API /api/buyer/demand/[id] GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch demand request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSessionFromCookies()
    const body = await request.json()

    const existing = await queryOne('SELECT buyer_id, status FROM buyer_demand_requests WHERE id = $1', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Demand request not found.' }, { status: 404 })
    }

    // Check authorization: if user is logged in, ensure they own the demand or are admin
    if (session && session.role !== 'admin' && session.userId !== existing.buyer_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized to modify this demand request.' }, { status: 403 })
    }

    const allowedStatuses = ['OPEN', 'PAUSED', 'CANCELLED', 'FILLED']
    const updates: string[] = []
    const values: any[] = []
    let pIdx = 1

    if (body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status value.' }, { status: 400 })
      }
      updates.push(`status = $${pIdx++}`)
      values.push(body.status)
    }

    if (body.target_price_per_unit) {
      updates.push(`target_price_per_unit = $${pIdx++}`)
      values.push(Number(body.target_price_per_unit))
    }

    if (body.maximum_price_per_unit) {
      updates.push(`maximum_price_per_unit = $${pIdx++}`)
      values.push(Number(body.maximum_price_per_unit))
    }

    if (body.notes !== undefined) {
      updates.push(`notes = $${pIdx++}`)
      values.push(body.notes)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields provided for update.' }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const updateSql = `
      UPDATE buyer_demand_requests
      SET ${updates.join(', ')}
      WHERE id = $${pIdx}
      RETURNING *
    `

    const updated = await queryOne(updateSql, values)

    return NextResponse.json({
      success: true,
      message: 'Demand request updated successfully.',
      demand: updated
    })
  } catch (error: any) {
    console.error('API /api/buyer/demand/[id] PATCH error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update demand request' },
      { status: 500 }
    )
  }
}
