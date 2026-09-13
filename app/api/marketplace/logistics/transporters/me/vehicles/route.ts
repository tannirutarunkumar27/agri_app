import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const transporter = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [userId])
    if (!transporter) {
      return NextResponse.json({ success: false, error: 'Transporter profile not found' }, { status: 404 })
    }

    const vehicles = await query<any>(
      'SELECT * FROM transporter_vehicles WHERE transporter_id = $1 ORDER BY created_at DESC',
      [transporter.id]
    )

    return NextResponse.json({
      success: true,
      count: vehicles.length,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        vehicleType: v.vehicle_type,
        registrationNumber: v.registration_number,
        capacity: Number(v.capacity),
        capacityUnit: v.capacity_unit,
        refrigerationAvailable: Boolean(v.refrigeration_available),
        vehicleStatus: v.vehicle_status,
        createdAt: v.created_at
      }))
    })
  } catch (error: any) {
    console.error('Error listing transporter vehicles:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const userId = session?.userId
    const body = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const transporter = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [userId])
    if (!transporter) {
      return NextResponse.json({ success: false, error: 'Transporter profile not found' }, { status: 404 })
    }

    const vehicleType = sanitizeText(body.vehicleType || 'Pickup Truck / Bolero Maxi (2-3T)')
    const registrationNumber = sanitizeText(body.registrationNumber || '').toUpperCase()
    const capacity = Number(body.capacity)
    const capacityUnit = sanitizeText(body.capacityUnit || 'Quintal')
    const refrigerationAvailable = Boolean(body.refrigerationAvailable)

    if (!registrationNumber || registrationNumber.length < 5) {
      return NextResponse.json({ success: false, error: 'Valid vehicle registration number is required (e.g. MH-12-AB-1234)' }, { status: 400 })
    }

    if (!capacity || capacity <= 0) {
      return NextResponse.json({ success: false, error: 'Vehicle carrying capacity must be greater than 0' }, { status: 400 })
    }

    const vehicleId = `veh-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`

    await execute(
      `INSERT INTO transporter_vehicles (
        id, transporter_id, vehicle_type, registration_number, capacity,
        capacity_unit, refrigeration_available, vehicle_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', NOW())`,
      [vehicleId, transporter.id, vehicleType, registrationNumber, capacity, capacityUnit, refrigerationAvailable]
    )

    return NextResponse.json({
      success: true,
      message: 'Vehicle added to your fleet successfully.',
      vehicleId
    })
  } catch (error: any) {
    console.error('Error adding vehicle:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
