import { NextResponse } from 'next/server'
import { query, queryOne, runTransaction } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Params) {
  try {
    const params = await props.params
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required.' }, { status: 400 })
    }

    const job = await queryOne<any>(
      `SELECT 
        j.*,
        o.id as order_id,
        o.farmer_id,
        o.farmer_name,
        o.farmer_phone,
        o.buyer_id,
        o.buyer_name,
        o.buyer_phone,
        o.crop_name,
        o.variety,
        o.quantity as order_quantity,
        o.unit as order_unit,
        o.agreed_price_per_unit,
        o.subtotal,
        o.total_amount,
        o.fulfillment_status as order_fulfillment_status,
        t.business_name,
        t.contact_name,
        t.phone as transporter_phone,
        t.rating as transporter_rating,
        t.total_completed_jobs,
        v.registration_number,
        v.vehicle_type as vehicle_model,
        v.refrigeration_available as vehicle_has_reefer
      FROM delivery_jobs j
      JOIN produce_orders o ON j.produce_order_id = o.id
      LEFT JOIN transporters t ON j.transporter_id = t.id
      LEFT JOIN transporter_vehicles v ON j.assigned_vehicle_id = v.id
      WHERE j.id = $1`,
      [jobId]
    )

    if (!job) {
      return NextResponse.json({ success: false, error: 'Delivery job not found.' }, { status: 404 })
    }

    const bids = await query<any>(
      `SELECT 
        b.*,
        t.business_name,
        t.contact_name,
        t.phone,
        t.rating,
        t.total_completed_jobs,
        t.verification_status,
        t.vehicle_type
      FROM delivery_bids b
      JOIN transporters t ON b.transporter_id = t.id
      WHERE b.delivery_job_id = $1
      ORDER BY b.proposed_cost ASC, b.created_at ASC`,
      [jobId]
    )

    const logs = await query<any>(
      `SELECT * FROM delivery_status_log WHERE delivery_job_id = $1 ORDER BY created_at ASC`,
      [jobId]
    )

    let deliveryLocation = null
    try {
      deliveryLocation = typeof job.delivery_location === 'string' ? JSON.parse(job.delivery_location) : job.delivery_location
    } catch {
      deliveryLocation = null
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        produceOrderId: job.produce_order_id,
        transporterId: job.transporter_id,
        assignedVehicleId: job.assigned_vehicle_id,
        pickupLocation: job.pickup_location,
        deliveryLocation,
        cargoCropName: job.cargo_crop_name,
        cargoQuantity: Number(job.cargo_quantity),
        cargoUnit: job.cargo_unit,
        pickupDate: job.pickup_date,
        expectedDeliveryDate: job.expected_delivery_date,
        actualPickupAt: job.actual_pickup_at,
        actualDeliveryAt: job.actual_delivery_at,
        distanceKm: Number(job.distance_km),
        estimatedCost: Number(job.estimated_cost),
        agreedCost: job.agreed_cost ? Number(job.agreed_cost) : null,
        deliveryStatus: job.delivery_status,
        specialRequirements: job.special_requirements,
        refrigerationRequired: Boolean(job.refrigeration_required),
        pickupNotes: job.pickup_notes,
        deliveryNotes: job.delivery_notes,
        proofOfDeliveryUrl: job.proof_of_delivery_url,
        proofUploadedAt: job.proof_uploaded_at,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        order: {
          id: job.order_id,
          farmerId: job.farmer_id,
          farmerName: job.farmer_name,
          farmerPhone: job.farmer_phone,
          buyerId: job.buyer_id,
          buyerName: job.buyer_name,
          buyerPhone: job.buyer_phone,
          cropName: job.crop_name,
          variety: job.variety,
          fulfillmentStatus: job.order_fulfillment_status,
          totalAmount: Number(job.total_amount)
        },
        transporter: job.transporter_id
          ? {
              id: job.transporter_id,
              businessName: job.business_name,
              contactName: job.contact_name,
              phone: job.transporter_phone,
              rating: Number(job.transporter_rating || 5.0),
              totalCompletedJobs: Number(job.total_completed_jobs || 0)
            }
          : null,
        vehicle: job.assigned_vehicle_id
          ? {
              id: job.assigned_vehicle_id,
              registrationNumber: job.registration_number,
              model: job.vehicle_model,
              refrigerationAvailable: Boolean(job.vehicle_has_reefer)
            }
          : null,
        bids: bids.map((b) => ({
          id: b.id,
          transporterId: b.transporter_id,
          proposedCost: Number(b.proposed_cost),
          estimatedPickupTime: b.estimated_pickup_time,
          estimatedDeliveryTime: b.estimated_delivery_time,
          message: b.message,
          status: b.status,
          createdAt: b.created_at,
          transporter: {
            businessName: b.business_name,
            contactName: b.contact_name,
            phone: b.phone,
            rating: Number(b.rating || 5.0),
            totalCompletedJobs: Number(b.total_completed_jobs || 0),
            verificationStatus: b.verification_status,
            vehicleType: b.vehicle_type
          }
        })),
        statusHistory: logs.map((l) => ({
          id: l.id,
          previousStatus: l.previous_status,
          newStatus: l.new_status,
          changedBy: l.changed_by,
          reason: l.reason,
          createdAt: l.created_at
        }))
      }
    })
  } catch (error: any) {
    console.error('Error fetching job details:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch job details' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: Params) {
  try {
    const params = await props.params
    const jobId = params.id
    const session = await getSessionFromCookies()
    const body = await request.json()

    const action = sanitizeText(body.action || '').toUpperCase()
    const notes = sanitizeText(body.notes || '')
    const currentUserId = session?.userId || body.userId || 'system'

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required.' }, { status: 400 })
    }

    if (!['CONFIRM_PICKUP', 'DISPATCH', 'MARK_DELIVERED', 'CANCEL'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Allowed: CONFIRM_PICKUP, DISPATCH, MARK_DELIVERED, CANCEL.' },
        { status: 400 }
      )
    }

    const job = await queryOne<any>(
      `SELECT j.*, o.id as order_id, o.farmer_id, o.buyer_id, o.crop_name
       FROM delivery_jobs j
       JOIN produce_orders o ON j.produce_order_id = o.id
       WHERE j.id = $1`,
      [jobId]
    )

    if (!job) {
      return NextResponse.json({ success: false, error: 'Delivery job not found.' }, { status: 404 })
    }

    // ACTION 1: CONFIRM_PICKUP
    if (action === 'CONFIRM_PICKUP') {
      if (job.delivery_status === 'PICKED_UP' || job.delivery_status === 'DELIVERED') {
        return NextResponse.json({ success: false, error: `Job has already been marked ${job.delivery_status}.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE delivery_jobs
           SET delivery_status = 'PICKED_UP',
               actual_pickup_at = NOW(),
               pickup_notes = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [notes || 'Cargo inspected and loaded at farm gate.', jobId]
        )

        await tx.execute(
          `INSERT INTO delivery_status_log (
            delivery_job_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'PICKED_UP', $3, $4, NOW())`,
          [jobId, job.delivery_status, currentUserId, notes || 'Cargo loaded in vehicle.']
        )

        // Sync with produce_orders
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'PICKED_UP',
               updated_at = NOW()
           WHERE id = $1`,
          [job.produce_order_id]
        )

        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, 'CONFIRMED', 'PICKED_UP', $2, 'Transporter confirmed cargo pickup at farm gate.', NOW())`,
          [job.produce_order_id, currentUserId]
        )

        // Notifications
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES 
           ($1, $2, $3, $4, 'order', $5),
           ($6, $7, $8, $9, 'order', $10)`,
          [
            `notif-pic-f-${Date.now().toString(36)}`,
            job.farmer_id,
            `Cargo Picked Up: #${job.produce_order_id}`,
            `Transporter has loaded your ${job.cargo_quantity} ${job.cargo_unit} of ${job.cargo_crop_name}.`,
            `/marketplace/orders/selling`,

            `notif-pic-b-${Date.now().toString(36)}`,
            job.buyer_id,
            `Produce Picked Up: #${job.produce_order_id}`,
            `Transporter has collected your produce from the farm gate and will begin transit.`,
            `/marketplace/orders/buying`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Cargo pickup confirmed and synchronized with produce order.',
        deliveryStatus: 'PICKED_UP'
      })
    }

    // ACTION 2: DISPATCH / IN_TRANSIT
    if (action === 'DISPATCH') {
      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE delivery_jobs
           SET delivery_status = 'IN_TRANSIT',
               updated_at = NOW()
           WHERE id = $1`,
          [jobId]
        )

        await tx.execute(
          `INSERT INTO delivery_status_log (
            delivery_job_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'IN_TRANSIT', $3, 'Vehicle en route to destination.', NOW())`,
          [jobId, job.delivery_status, currentUserId]
        )

        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'IN_TRANSIT',
               updated_at = NOW()
           WHERE id = $1`,
          [job.produce_order_id]
        )

        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'IN_TRANSIT', $3, 'Transporter en route with produce.', NOW())`,
          [job.produce_order_id, job.delivery_status, currentUserId]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Delivery status updated to IN_TRANSIT.',
        deliveryStatus: 'IN_TRANSIT'
      })
    }

    // ACTION 3: MARK_DELIVERED
    if (action === 'MARK_DELIVERED') {
      const proofUrl = sanitizeText(body.proofUrl || job.proof_of_delivery_url || '')

      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE delivery_jobs
           SET delivery_status = 'DELIVERED',
               actual_delivery_at = NOW(),
               delivery_notes = $1,
               proof_of_delivery_url = COALESCE(NULLIF($2, ''), proof_of_delivery_url),
               proof_uploaded_at = CASE WHEN NULLIF($2, '') IS NOT NULL THEN NOW() ELSE proof_uploaded_at END,
               updated_at = NOW()
           WHERE id = $3`,
          [notes || 'Cargo arrived and unloaded at destination.', proofUrl, jobId]
        )

        await tx.execute(
          `INSERT INTO delivery_status_log (
            delivery_job_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'DELIVERED', $3, $4, NOW())`,
          [jobId, job.delivery_status, currentUserId, notes || 'Vehicle unloaded at destination.']
        )

        // Sync with produce_orders
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'DELIVERED',
               updated_at = NOW()
           WHERE id = $1`,
          [job.produce_order_id]
        )

        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'DELIVERED', $3, 'Transporter arrived and delivered produce. Awaiting buyer confirmation.', NOW())`,
          [job.produce_order_id, job.delivery_status, currentUserId]
        )

        // Notify buyer to confirm receipt
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-del-b-${Date.now().toString(36)}`,
            job.buyer_id,
            `Produce Delivered: #${job.produce_order_id}`,
            `Transporter has delivered your ${job.cargo_quantity} ${job.cargo_unit} of ${job.cargo_crop_name}. Please inspect and confirm receipt to release escrow payout.`,
            `/marketplace/orders/buying`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Delivery marked as DELIVERED. Buyer notified to confirm receipt.',
        deliveryStatus: 'DELIVERED'
      })
    }

    // ACTION 4: CANCEL
    if (action === 'CANCEL') {
      if (['DELIVERED', 'COMPLETED'].includes(job.delivery_status)) {
        return NextResponse.json({ success: false, error: `Cannot cancel job in ${job.delivery_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE delivery_jobs
           SET delivery_status = 'CANCELLED',
               updated_at = NOW()
           WHERE id = $1`,
          [jobId]
        )

        await tx.execute(
          `INSERT INTO delivery_status_log (
            delivery_job_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'CANCELLED', $3, $4, NOW())`,
          [jobId, job.delivery_status, currentUserId, notes || 'Delivery job cancelled.']
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Delivery job cancelled.',
        deliveryStatus: 'CANCELLED'
      })
    }

    return NextResponse.json({ success: false, error: 'Unhandled action.' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating delivery job:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to update delivery job' }, { status: 500 })
  }
}
