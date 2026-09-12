import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerId = searchParams.get('buyer_id')
    const commodityId = searchParams.get('commodity_id')
    const status = searchParams.get('status')
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10)), 100)

    const conditions: string[] = ['1=1']
    const params: any[] = []
    let pIdx = 1

    if (buyerId) {
      conditions.push(`bdr.buyer_id = $${pIdx++}`)
      params.push(buyerId)
    }

    if (commodityId) {
      conditions.push(`bdr.commodity_id = $${pIdx++}`)
      params.push(commodityId)
    }

    if (status && status !== 'ALL') {
      conditions.push(`bdr.status = $${pIdx++}`)
      params.push(status)
    }

    params.push(limit)

    const sql = `
      SELECT 
        bdr.id,
        bdr.buyer_id,
        u.name as buyer_name,
        u.phone as buyer_phone,
        bp.company_name,
        bp.business_type,
        bp.verification_level,
        bp.rating as buyer_rating,
        bp.completed_transactions as buyer_completed_trades,
        bdr.commodity_id,
        c.name as commodity_name,
        c.category as commodity_category,
        bdr.variety_id,
        v.name as variety_name,
        bdr.grade_id,
        g.name as grade_name,
        bdr.required_quantity,
        bdr.quantity_unit,
        bdr.minimum_quantity,
        bdr.filled_quantity,
        (bdr.required_quantity - bdr.filled_quantity) as remaining_quantity,
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
        bdr.expires_at,
        bdr.created_at,
        bdr.updated_at,
        (
          SELECT COUNT(DISTINCT ml.seller_id)
          FROM market_listings ml
          WHERE ml.status = 'ACTIVE'
            AND LOWER(ml.crop_name) LIKE '%' || LOWER(c.name) || '%'
        ) as matching_farmers_count
      FROM buyer_demand_requests bdr
      JOIN commodities c ON bdr.commodity_id = c.id
      JOIN users u ON bdr.buyer_id = u.id
      LEFT JOIN buyer_profiles bp ON bdr.buyer_id = bp.user_id
      LEFT JOIN commodity_varieties v ON bdr.variety_id = v.id
      LEFT JOIN commodity_grades g ON bdr.grade_id = g.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY bdr.created_at DESC
      LIMIT $${pIdx}
    `

    const rows = await query(sql, params)

    return NextResponse.json({
      success: true,
      count: rows.length,
      demands: rows.map((r: any) => ({
        id: r.id,
        buyer_id: r.buyer_id,
        buyer_name: r.buyer_name,
        buyer_phone: r.buyer_phone,
        company_name: r.company_name || `${r.buyer_name}'s Enterprise`,
        business_type: r.business_type || 'Wholesale Buyer & Processor',
        verification_level: r.verification_level || 'VERIFIED',
        buyer_rating: Number(r.buyer_rating || 4.8),
        buyer_completed_trades: Number(r.buyer_completed_trades || 12),
        commodity_id: r.commodity_id,
        commodity_name: r.commodity_name,
        commodity_category: r.commodity_category,
        variety_id: r.variety_id,
        variety_name: r.variety_name || 'All Standard Varieties',
        grade_id: r.grade_id,
        grade_name: r.grade_name || 'FAQ',
        required_quantity: Number(r.required_quantity),
        quantity_unit: r.quantity_unit,
        minimum_quantity: Number(r.minimum_quantity),
        filled_quantity: Number(r.filled_quantity),
        remaining_quantity: Math.max(0, Number(r.remaining_quantity)),
        target_price_per_unit: Number(r.target_price_per_unit),
        maximum_price_per_unit: Number(r.maximum_price_per_unit),
        required_from_date: r.required_from_date,
        required_until_date: r.required_until_date,
        delivery_location: r.delivery_location,
        delivery_latitude: r.delivery_latitude ? Number(r.delivery_latitude) : null,
        delivery_longitude: r.delivery_longitude ? Number(r.delivery_longitude) : null,
        delivery_radius_km: Number(r.delivery_radius_km || 100),
        delivery_preference: r.delivery_preference,
        quality_requirements: r.quality_requirements,
        notes: r.notes,
        status: r.status,
        expires_at: r.expires_at,
        is_expired: new Date(r.expires_at) < new Date(),
        matching_farmers_count: Number(r.matching_farmers_count || 0),
        created_at: r.created_at
      }))
    })
  } catch (error: any) {
    console.error('API /api/buyer/demand GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list buyer demands' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const buyerId = body.buyer_id || session?.userId || session?.id || 'usr-buyer-agro'
    const commodityId = body.commodity_id
    const varietyId = body.variety_id || null
    const gradeId = body.grade_id || null
    const requiredQuantity = Number(body.required_quantity)
    const quantityUnit = body.quantity_unit || 'Quintal'
    const minimumQuantity = Math.max(1, Number(body.minimum_quantity || 1))
    const targetPrice = Number(body.target_price_per_unit)
    const maxPrice = Number(body.maximum_price_per_unit || targetPrice)
    const requiredFromDate = body.required_from_date || new Date().toISOString().split('T')[0]
    const requiredUntilDate = body.required_until_date
    const deliveryLocation = body.delivery_location || 'Local APMC Mandi Yard'
    const deliveryRadiusKm = Math.max(10, Math.min(500, parseInt(body.delivery_radius_km || '100', 10)))
    const deliveryPreference = body.delivery_preference || 'FARM_GATE_PICKUP'
    const qualityRequirements = body.quality_requirements || ''
    const notes = body.notes || ''
    const expiresInDays = Math.max(1, Math.min(90, parseInt(body.expires_in_days || '30', 10)))

    // Validations
    if (!commodityId) {
      return NextResponse.json({ success: false, error: 'commodity_id is required.' }, { status: 400 })
    }

    if (!requiredQuantity || requiredQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'required_quantity must be greater than 0.' }, { status: 400 })
    }

    if (!targetPrice || targetPrice <= 0) {
      return NextResponse.json({ success: false, error: 'target_price_per_unit must be greater than 0.' }, { status: 400 })
    }

    if (maxPrice < targetPrice) {
      return NextResponse.json({ success: false, error: 'maximum_price_per_unit cannot be less than target price.' }, { status: 400 })
    }

    if (!requiredUntilDate) {
      return NextResponse.json({ success: false, error: 'required_until_date is required.' }, { status: 400 })
    }

    if (new Date(requiredUntilDate) < new Date(requiredFromDate)) {
      return NextResponse.json({ success: false, error: 'required_until_date must be on or after required_from_date.' }, { status: 400 })
    }

    // Ensure user exists
    const userCheck = await queryOne('SELECT id FROM users WHERE id = $1', [buyerId])
    if (!userCheck) {
      // Create user if not existing
      await query(
        `INSERT INTO users (id, name, phone, password_hash, role) 
         VALUES ($1, $2, $3, 'pbkdf2_demo_hash', 'buyer')
         ON CONFLICT (id) DO NOTHING`,
        [buyerId, body.buyer_name || 'Commercial Procurement Hub', body.buyer_phone || '9876543210']
      )
    }

    // Ensure buyer profile exists
    await query(
      `INSERT INTO buyer_profiles (user_id, company_name, business_type, verification_level)
       VALUES ($1, $2, $3, 'VERIFIED')
       ON CONFLICT (user_id) DO NOTHING`,
      [buyerId, body.company_name || 'Direct Agro Processing Unit', 'Agro Processing Mill']
    )

    const demandId = `dem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const insertSql = `
      INSERT INTO buyer_demand_requests (
        id, buyer_id, commodity_id, variety_id, grade_id,
        required_quantity, quantity_unit, minimum_quantity, filled_quantity,
        target_price_per_unit, maximum_price_per_unit,
        required_from_date, required_until_date,
        delivery_location, delivery_latitude, delivery_longitude, delivery_radius_km,
        delivery_preference, quality_requirements, notes, status, expires_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, 0,
        $9, $10,
        $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, 'OPEN', $20
      )
      RETURNING *
    `

    const insertedRows = await query(insertSql, [
      demandId,
      buyerId,
      commodityId,
      varietyId,
      gradeId,
      requiredQuantity,
      quantityUnit,
      minimumQuantity,
      targetPrice,
      maxPrice,
      requiredFromDate,
      requiredUntilDate,
      deliveryLocation,
      body.delivery_latitude || null,
      body.delivery_longitude || null,
      deliveryRadiusKm,
      deliveryPreference,
      qualityRequirements,
      notes,
      expiresAt.toISOString()
    ])

    return NextResponse.json({
      success: true,
      message: 'Buyer demand request published successfully.',
      demand: insertedRows[0]
    })
  } catch (error: any) {
    console.error('API /api/buyer/demand POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish buyer demand' },
      { status: 500 }
    )
  }
}
