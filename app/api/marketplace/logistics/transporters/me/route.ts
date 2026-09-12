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

    const transporter = await queryOne<any>('SELECT * FROM transporters WHERE user_id = $1', [userId])
    if (!transporter) {
      return NextResponse.json({ success: false, error: 'Transporter profile not found for this user' }, { status: 404 })
    }

    const vehicles = await query<any>(
      'SELECT * FROM transporter_vehicles WHERE transporter_id = $1 ORDER BY created_at DESC',
      [transporter.id]
    )

    // Calculate total earnings from completed jobs
    const earningsRes = await queryOne<any>(
      `SELECT COALESCE(SUM(agreed_cost), 0) as total_earnings, COUNT(*) as completed_count
       FROM delivery_jobs
       WHERE transporter_id = $1 AND delivery_status = 'COMPLETED'`,
      [transporter.id]
    )

    // Count active jobs
    const activeJobsRes = await queryOne<any>(
      `SELECT COUNT(*) as active_count
       FROM delivery_jobs
       WHERE transporter_id = $1 AND delivery_status NOT IN ('COMPLETED', 'CANCELLED')`,
      [transporter.id]
    )

    let serviceArea = []
    try {
      serviceArea = typeof transporter.service_area === 'string' ? JSON.parse(transporter.service_area) : transporter.service_area || []
    } catch {
      serviceArea = []
    }

    return NextResponse.json({
      success: true,
      transporter: {
        id: transporter.id,
        userId: transporter.user_id,
        businessName: transporter.business_name,
        contactName: transporter.contact_name,
        phone: transporter.phone,
        vehicleType: transporter.vehicle_type,
        vehicleNumber: transporter.vehicle_number,
        carryingCapacity: Number(transporter.carrying_capacity),
        capacityUnit: transporter.capacity_unit,
        serviceArea,
        baseLocation: transporter.base_location,
        verificationStatus: transporter.verification_status,
        rating: Number(transporter.rating || 5.0),
        totalCompletedJobs: Number(transporter.total_completed_jobs || 0),
        isActive: transporter.is_active,
        metrics: {
          totalEarnings: Number(earningsRes?.total_earnings || 0),
          completedJobs: Number(earningsRes?.completed_count || 0),
          activeDeliveries: Number(activeJobsRes?.active_count || 0),
          vehiclesCount: vehicles.length
        },
        vehicles: vehicles.map((v) => ({
          id: v.id,
          vehicleType: v.vehicle_type,
          registrationNumber: v.registration_number,
          capacity: Number(v.capacity),
          capacityUnit: v.capacity_unit,
          refrigerationAvailable: Boolean(v.refrigeration_available),
          vehicleStatus: v.vehicle_status
        }))
      }
    })
  } catch (error: any) {
    console.error('Error fetching transporter profile:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const businessName = sanitizeText(body.businessName)
    const contactName = sanitizeText(body.contactName || '')
    const phone = sanitizeText(body.phone || '')
    const baseLocation = sanitizeText(body.baseLocation || '')
    const vehicleType = sanitizeText(body.vehicleType || '')
    const vehicleNumber = sanitizeText(body.vehicleNumber || '')
    const carryingCapacity = Number(body.carryingCapacity)
    const serviceArea = Array.isArray(body.serviceArea) ? body.serviceArea : undefined

    const transporter = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [userId])
    if (!transporter) {
      return NextResponse.json({ success: false, error: 'Transporter profile not found' }, { status: 404 })
    }

    await execute(
      `UPDATE transporters
       SET business_name = COALESCE(NULLIF($1, ''), business_name),
           contact_name = COALESCE(NULLIF($2, ''), contact_name),
           phone = COALESCE(NULLIF($3, ''), phone),
           base_location = COALESCE(NULLIF($4, ''), base_location),
           vehicle_type = COALESCE(NULLIF($5, ''), vehicle_type),
           vehicle_number = COALESCE(NULLIF($6, ''), vehicle_number),
           carrying_capacity = CASE WHEN $7 > 0 THEN $7 ELSE carrying_capacity END,
           service_area = CASE WHEN $8::jsonb IS NOT NULL THEN $8::jsonb ELSE service_area END,
           updated_at = NOW()
       WHERE id = $9`,
      [
        businessName,
        contactName,
        phone,
        baseLocation,
        vehicleType,
        vehicleNumber,
        carryingCapacity || 0,
        serviceArea ? JSON.stringify(serviceArea) : null,
        transporter.id
      ]
    )

    return NextResponse.json({ success: true, message: 'Transporter profile updated successfully.' })
  } catch (error: any) {
    console.error('Error updating transporter profile:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
