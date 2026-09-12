import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'
import { rankTransportersForJob, CandidateTransporter } from '@/lib/transporter-matching'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')
    const location = searchParams.get('location')
    const verifiedOnly = searchParams.get('verified') === 'true'

    // Load active transporters
    let sql = `
      SELECT 
        t.*,
        (SELECT COUNT(*) FROM transporter_vehicles v WHERE v.transporter_id = t.id AND v.vehicle_status = 'ACTIVE') as active_vehicles_count,
        EXISTS(SELECT 1 FROM transporter_vehicles v WHERE v.transporter_id = t.id AND v.refrigeration_available = true) as has_reefer
      FROM transporters t
      WHERE t.is_active = true
    `
    const params: any[] = []

    if (verifiedOnly) {
      sql += ` AND t.verification_status = 'VERIFIED'`
    }

    sql += ` ORDER BY t.rating DESC, t.total_completed_jobs DESC LIMIT 50`

    const rows = await query<any>(sql, params)

    const candidates: CandidateTransporter[] = rows.map((r) => {
      let serviceArea: string[] = []
      try {
        serviceArea = typeof r.service_area === 'string' ? JSON.parse(r.service_area) : r.service_area || []
      } catch {
        serviceArea = []
      }

      return {
        id: r.id,
        businessName: r.business_name,
        contactName: r.contact_name,
        phone: r.phone,
        vehicleType: r.vehicle_type,
        vehicleNumber: r.vehicle_number,
        carryingCapacity: Number(r.carrying_capacity),
        capacityUnit: r.capacity_unit || 'Quintal',
        serviceArea,
        baseLocation: r.base_location,
        verificationStatus: r.verification_status,
        rating: Number(r.rating || 5.0),
        totalCompletedJobs: Number(r.total_completed_jobs || 0),
        refrigerationAvailable: Boolean(r.has_reefer)
      }
    })

    // If job_id provided, rank using deterministic matching engine
    if (jobId) {
      const job = await queryOne<any>('SELECT * FROM delivery_jobs WHERE id = $1', [jobId])
      if (job) {
        let destLoc = job.delivery_location
        if (typeof destLoc === 'string') {
          try {
            destLoc = JSON.parse(destLoc)
          } catch {
            destLoc = {}
          }
        }
        const destString = `${destLoc.district || destLoc.city || ''}, ${destLoc.state || ''}`

        const ranked = rankTransportersForJob(
          {
            originLocation: job.pickup_location,
            destinationLocation: destString,
            quantity: Number(job.cargo_quantity),
            unit: job.cargo_unit,
            refrigerationRequired: Boolean(job.refrigeration_required),
            specialRequirements: job.special_requirements
          },
          candidates
        )

        return NextResponse.json({
          success: true,
          count: ranked.length,
          jobId,
          transporters: ranked
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: candidates.length,
      transporters: candidates
    })
  } catch (error: any) {
    console.error('Error discovering transporters:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to discover transporters' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const userId = session?.userId || body.userId
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User must be authenticated to register as transporter' }, { status: 401 })
    }

    const businessName = sanitizeText(body.businessName)
    const contactName = sanitizeText(body.contactName || session?.name || '')
    const phone = sanitizeText(body.phone || session?.phone || '')
    const vehicleType = sanitizeText(body.vehicleType || 'Pickup Truck / Bolero Maxi (2-3T)')
    const vehicleNumber = sanitizeText(body.vehicleNumber || 'MH-12-REG-PENDING')
    const carryingCapacity = Number(body.carryingCapacity || 30)
    const baseLocation = sanitizeText(body.baseLocation || 'Pune')
    const serviceArea = Array.isArray(body.serviceArea) ? body.serviceArea : ['Maharashtra']

    if (!businessName || businessName.length < 2) {
      return NextResponse.json({ success: false, error: 'Valid business or fleet name is required' }, { status: 400 })
    }

    // Check existing transporter profile
    const existing = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [userId])
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Transporter profile already exists',
        transporterId: existing.id
      })
    }

    const transporterId = `tr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`

    await execute(
      `INSERT INTO transporters (
        id, user_id, business_name, contact_name, phone, vehicle_type, vehicle_number,
        carrying_capacity, capacity_unit, service_area, base_location, verification_status,
        rating, total_completed_jobs, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, 'Quintal', $9, $10, 'PENDING',
        5.00, 0, true, NOW(), NOW()
      )`,
      [
        transporterId,
        userId,
        businessName,
        contactName,
        phone,
        vehicleType,
        vehicleNumber,
        carryingCapacity,
        JSON.stringify(serviceArea),
        baseLocation
      ]
    )

    // Also update users.role to 'transporter' if needed
    await execute(`UPDATE users SET role = 'transporter' WHERE id = $1`, [userId])

    return NextResponse.json({
      success: true,
      message: 'Transporter profile registered successfully.',
      transporterId
    })
  } catch (error: any) {
    console.error('Error creating transporter profile:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to create transporter profile' }, { status: 500 })
  }
}
