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
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
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

    return NextResponse.json({
      success: true,
      count: bids.length,
      bids: bids.map((b) => ({
        id: b.id,
        jobId: b.delivery_job_id,
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
      }))
    })
  } catch (error: any) {
    console.error('Error fetching delivery bids:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch bids' }, { status: 500 })
  }
}

export async function POST(request: Request, props: Params) {
  try {
    const params = await props.params
    const jobId = params.id
    const session = await getSessionFromCookies()
    const body = await request.json()

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
    }

    const proposedCost = Number(body.proposedCost)
    if (!proposedCost || proposedCost <= 0) {
      return NextResponse.json({ success: false, error: 'Valid proposed transport cost is required.' }, { status: 400 })
    }

    // Determine transporter ID from session or body
    let transporterId = body.transporterId
    if (!transporterId && session?.userId) {
      const transporter = await queryOne<any>('SELECT id FROM transporters WHERE user_id = $1', [session.userId])
      transporterId = transporter?.id
    }

    if (!transporterId) {
      return NextResponse.json(
        { success: false, error: 'Transporter profile not found for this user. Please complete registration.' },
        { status: 403 }
      )
    }

    // Verify transporter status
    const transporter = await queryOne<any>('SELECT * FROM transporters WHERE id = $1', [transporterId])
    if (!transporter || !transporter.is_active || transporter.verification_status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: 'Your transporter account is not eligible to submit bids.' },
        { status: 403 }
      )
    }

    // Check delivery job status
    const job = await queryOne<any>(
      `SELECT j.*, o.farmer_id, o.buyer_id, o.crop_name
       FROM delivery_jobs j
       JOIN produce_orders o ON j.produce_order_id = o.id
       WHERE j.id = $1`,
      [jobId]
    )

    if (!job) {
      return NextResponse.json({ success: false, error: 'Delivery job not found' }, { status: 404 })
    }

    if (!['OPEN', 'QUOTED'].includes(job.delivery_status)) {
      return NextResponse.json(
        { success: false, error: `This job is already ${job.delivery_status.toLowerCase()} and no longer accepting bids.` },
        { status: 400 }
      )
    }

    const bidId = `bid-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
    const estimatedPickupTime = sanitizeText(body.estimatedPickupTime || 'Within 24 hours')
    const estimatedDeliveryTime = sanitizeText(body.estimatedDeliveryTime || 'Within 48 hours')
    const message = sanitizeText(body.message || '')

    await runTransaction(async (tx) => {
      // 1. Insert bid
      await tx.execute(
        `INSERT INTO delivery_bids (
          id, delivery_job_id, transporter_id, proposed_cost, estimated_pickup_time,
          estimated_delivery_time, message, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NOW())`,
        [bidId, jobId, transporterId, proposedCost, estimatedPickupTime, estimatedDeliveryTime, message]
      )

      // 2. Update job status to QUOTED if currently OPEN
      if (job.delivery_status === 'OPEN') {
        await tx.execute(`UPDATE delivery_jobs SET delivery_status = 'QUOTED', updated_at = NOW() WHERE id = $1`, [jobId])
        await tx.execute(
          `INSERT INTO delivery_status_log (
            delivery_job_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, 'OPEN', 'QUOTED', $2, 'First transporter bid received.', NOW())`,
          [jobId, session?.userId || transporterId]
        )
      }

      // 3. Notify Farmer and Buyer
      await tx.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES 
         ($1, $2, $3, $4, 'order', $5),
         ($6, $7, $8, $9, 'order', $10)`,
        [
          `notif-bid-f-${Date.now().toString(36)}`,
          job.farmer_id,
          `New Transporter Quote: ${job.crop_name}`,
          `${transporter.business_name} quoted ₹${proposedCost.toLocaleString('en-IN')} for transporting your produce lot.`,
          `/marketplace/orders/selling`,

          `notif-bid-b-${Date.now().toString(36)}`,
          job.buyer_id,
          `New Transporter Quote: ${job.crop_name}`,
          `${transporter.business_name} quoted ₹${proposedCost.toLocaleString('en-IN')} for order delivery.`,
          `/marketplace/orders/buying`
        ]
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Transport quote submitted successfully to the farmer and buyer.',
      bidId,
      proposedCost
    })
  } catch (error: any) {
    console.error('Error submitting delivery bid:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit quote' }, { status: 500 })
  }
}
