import { NextResponse } from 'next/server'
import { query, queryOne, runTransaction } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'
import { calculateDeliveryCost, estimateDistanceKm } from '@/lib/logistics-pricing'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get('role') // 'transporter', 'farmer', 'buyer', 'admin'
    const status = searchParams.get('status')
    const orderId = searchParams.get('order_id')
    const userId = session?.userId || searchParams.get('user_id') || ''

    let sql = `
      SELECT 
        j.*,
        o.farmer_name,
        o.farmer_phone,
        o.buyer_name,
        o.buyer_phone,
        o.total_amount as order_total_amount,
        o.fulfillment_status as order_fulfillment_status,
        t.business_name as transporter_business_name,
        t.contact_name as transporter_contact_name,
        t.phone as transporter_phone,
        t.rating as transporter_rating,
        v.registration_number as vehicle_registration,
        v.vehicle_type as vehicle_name,
        (SELECT COUNT(*) FROM delivery_bids b WHERE b.delivery_job_id = j.id) as bids_count
      FROM delivery_jobs j
      JOIN produce_orders o ON j.produce_order_id = o.id
      LEFT JOIN transporters t ON j.transporter_id = t.id
      LEFT JOIN transporter_vehicles v ON j.assigned_vehicle_id = v.id
      WHERE 1=1
    `
    const params: any[] = []
    let pIdx = 1

    if (orderId) {
      sql += ` AND j.produce_order_id = $${pIdx}`
      params.push(orderId)
      pIdx++
    }

    if (role === 'transporter') {
      // Find transporter profile for user
      const transporter = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [userId])
      const transporterId = transporter?.id || userId

      if (status === 'available' || status === 'OPEN') {
        sql += ` AND j.delivery_status IN ('OPEN', 'QUOTED')`
      } else if (status === 'my_active') {
        sql += ` AND j.transporter_id = $${pIdx} AND j.delivery_status NOT IN ('COMPLETED', 'CANCELLED')`
        params.push(transporterId)
        pIdx++
      } else if (status === 'completed') {
        sql += ` AND j.transporter_id = $${pIdx} AND j.delivery_status = 'COMPLETED'`
        params.push(transporterId)
        pIdx++
      } else if (transporterId) {
        sql += ` AND (j.transporter_id = $${pIdx} OR j.delivery_status IN ('OPEN', 'QUOTED'))`
        params.push(transporterId)
        pIdx++
      }
    } else if (role === 'farmer' && userId) {
      sql += ` AND o.farmer_id = $${pIdx}`
      params.push(userId)
      pIdx++
    } else if (role === 'buyer' && userId) {
      sql += ` AND o.buyer_id = $${pIdx}`
      params.push(userId)
      pIdx++
    }

    if (status && !['all', 'available', 'my_active', 'completed'].includes(status)) {
      sql += ` AND j.delivery_status = $${pIdx}`
      params.push(status)
      pIdx++
    }

    sql += ` ORDER BY j.created_at DESC LIMIT 50`

    const rows = await query<any>(sql, params)

    const jobs = rows.map((r) => {
      let deliveryLocation = null
      try {
        deliveryLocation = typeof r.delivery_location === 'string' ? JSON.parse(r.delivery_location) : r.delivery_location
      } catch {
        deliveryLocation = null
      }

      return {
        id: r.id,
        produceOrderId: r.produce_order_id,
        transporterId: r.transporter_id,
        assignedVehicleId: r.assigned_vehicle_id,
        pickupLocation: r.pickup_location,
        deliveryLocation,
        cargoCropName: r.cargo_crop_name,
        cargoQuantity: Number(r.cargo_quantity),
        cargoUnit: r.cargo_unit,
        pickupDate: r.pickup_date,
        expectedDeliveryDate: r.expected_delivery_date,
        actualPickupAt: r.actual_pickup_at,
        actualDeliveryAt: r.actual_delivery_at,
        distanceKm: Number(r.distance_km),
        estimatedCost: Number(r.estimated_cost),
        agreedCost: r.agreed_cost ? Number(r.agreed_cost) : null,
        deliveryStatus: r.delivery_status,
        specialRequirements: r.special_requirements,
        refrigerationRequired: Boolean(r.refrigeration_required),
        pickupNotes: r.pickup_notes,
        deliveryNotes: r.delivery_notes,
        proofOfDeliveryUrl: r.proof_of_delivery_url,
        proofUploadedAt: r.proof_uploaded_at,
        createdAt: r.created_at,
        bidsCount: parseInt(String(r.bids_count || 0), 10),
        farmer: {
          name: r.farmer_name,
          phone: r.farmer_phone
        },
        buyer: {
          name: r.buyer_name,
          phone: r.buyer_phone
        },
        transporter: r.transporter_id
          ? {
              id: r.transporter_id,
              businessName: r.transporter_business_name,
              contactName: r.transporter_contact_name,
              phone: r.transporter_phone,
              rating: Number(r.transporter_rating || 5.0)
            }
          : null,
        vehicle: r.vehicle_registration
          ? {
              id: r.assigned_vehicle_id,
              registrationNumber: r.vehicle_registration,
              type: r.vehicle_name
            }
          : null
      }
    })

    return NextResponse.json({ success: true, count: jobs.length, jobs })
  } catch (error: any) {
    console.error('Error fetching delivery jobs:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch delivery jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const produceOrderId = sanitizeText(body.produceOrderId)
    if (!produceOrderId) {
      return NextResponse.json({ success: false, error: 'Produce order ID is required.' }, { status: 400 })
    }

    // Check if order exists
    const order = await queryOne<any>(
      `SELECT o.*, l.crop_name, l.variety, l.farm_gate_address, l.seller_district, l.seller_state
       FROM produce_orders o
       LEFT JOIN market_listings l ON o.listing_id = l.id
       WHERE o.id = $1`,
      [produceOrderId]
    )

    if (!order) {
      return NextResponse.json({ success: false, error: 'Produce order not found.' }, { status: 404 })
    }

    // Check existing job for this order
    const existingJob = await queryOne<any>('SELECT * FROM delivery_jobs WHERE produce_order_id = $1', [produceOrderId])
    if (existingJob) {
      return NextResponse.json({
        success: true,
        message: 'Delivery job already active for this order.',
        jobId: existingJob.id,
        deliveryStatus: existingJob.delivery_status
      })
    }

    const pickupLocation = sanitizeText(
      body.pickupLocation ||
      order.pickup_address ||
      order.farm_gate_address ||
      `${order.seller_district || 'Pune'}, ${order.seller_state || 'Maharashtra'}`
    )

    let deliveryLocation = body.deliveryLocation || order.delivery_address || {}
    if (typeof deliveryLocation === 'string') {
      try {
        deliveryLocation = JSON.parse(deliveryLocation)
      } catch {
        deliveryLocation = { address: deliveryLocation }
      }
    }

    const destString = `${deliveryLocation.district || deliveryLocation.city || 'Mandi Yard'}, ${deliveryLocation.state || 'Maharashtra'}`
    const distanceKm = Number(body.distanceKm) || estimateDistanceKm(pickupLocation, destString)
    const refrigerationRequired = Boolean(body.refrigerationRequired)

    // Calculate server-side cost estimate
    const pricing = calculateDeliveryCost({
      distanceKm,
      quantity: Number(order.quantity),
      unit: order.unit,
      refrigerationRequired
    })

    const jobId = `job-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`

    await runTransaction(async (tx) => {
      await tx.execute(
        `INSERT INTO delivery_jobs (
          id, produce_order_id, pickup_location, delivery_location, cargo_crop_name,
          cargo_quantity, cargo_unit, pickup_date, expected_delivery_date, distance_km,
          estimated_cost, delivery_status, special_requirements, refrigeration_required,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, 'OPEN', $12, $13,
          NOW(), NOW()
        )`,
        [
          jobId,
          produceOrderId,
          pickupLocation,
          JSON.stringify(deliveryLocation),
          order.crop_name,
          Number(order.quantity),
          order.unit,
          body.pickupDate || order.preferred_delivery_date || null,
          body.expectedDeliveryDate || null,
          distanceKm,
          pricing.totalEstimatedCost,
          sanitizeText(body.specialRequirements || ''),
          refrigerationRequired
        ]
      )

      await tx.execute(
        `INSERT INTO delivery_status_log (
          delivery_job_id, previous_status, new_status, changed_by, reason, created_at
        ) VALUES ($1, NULL, 'OPEN', $2, 'Delivery job generated for produce order.', NOW())`,
        [jobId, session?.userId || 'system']
      )

      // Notify nearby transporters
      const eligibleTransporters = await tx.query<any>(
        `SELECT user_id FROM transporters WHERE is_active = true AND verification_status != 'SUSPENDED' LIMIT 10`
      )

      for (const t of eligibleTransporters) {
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-job-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
            t.user_id,
            `New Cargo Delivery Job: ${order.crop_name}`,
            `${order.quantity} ${order.unit} from ${pickupLocation} (~${distanceKm} km). Estimated: ₹${pricing.totalEstimatedCost.toLocaleString('en-IN')}. Submit quote now.`,
            `/transporter/dashboard`
          ]
        )
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Delivery job posted to logistics network successfully.',
      jobId,
      estimatedCost: pricing.totalEstimatedCost,
      distanceKm,
      estimatedHours: pricing.estimatedHours
    })
  } catch (error: any) {
    console.error('Error creating delivery job:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to create delivery job' }, { status: 500 })
  }
}
