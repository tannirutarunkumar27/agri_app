import { NextResponse } from 'next/server'
import { queryOne, runTransaction } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, props: Params) {
  try {
    const params = await props.params
    const jobId = params.id
    const session = await getSessionFromCookies()
    const body = await request.json()

    const bidId = sanitizeText(body.bidId)
    const vehicleId = sanitizeText(body.vehicleId || '')

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 })
    }

    if (!bidId) {
      return NextResponse.json({ success: false, error: 'Selected Bid ID is required for assignment.' }, { status: 400 })
    }

    // Load bid
    const bid = await queryOne<any>(
      `SELECT b.*, t.user_id as transporter_user_id, t.business_name, t.phone as transporter_phone
       FROM delivery_bids b
       JOIN transporters t ON b.transporter_id = t.id
       WHERE b.id = $1 AND b.delivery_job_id = $2`,
      [bidId, jobId]
    )

    if (!bid) {
      return NextResponse.json({ success: false, error: 'Selected quote not found for this delivery job.' }, { status: 404 })
    }

    const currentUserId = session?.userId || body.userId || 'system'

    await runTransaction(async (tx) => {
      // 1. Pessimistic concurrency row-lock on delivery_jobs
      const lockedJobRows = await tx.query<any>(
        `SELECT id, produce_order_id, delivery_status, cargo_crop_name, cargo_quantity, cargo_unit, pickup_location
         FROM delivery_jobs
         WHERE id = $1
         FOR UPDATE`,
        [jobId]
      )

      if (lockedJobRows.length === 0) {
        throw new Error('Delivery job not found during assignment locking.')
      }

      const job = lockedJobRows[0]

      if (!['OPEN', 'QUOTED'].includes(job.delivery_status)) {
        throw new Error(`Job cannot be assigned. It is currently in '${job.delivery_status}' status.`)
      }

      // 2. Assign job to transporter
      await tx.execute(
        `UPDATE delivery_jobs
         SET transporter_id = $1,
             assigned_vehicle_id = NULLIF($2, ''),
             agreed_cost = $3,
             delivery_status = 'ASSIGNED',
             updated_at = NOW()
         WHERE id = $4`,
        [bid.transporter_id, vehicleId, bid.proposed_cost, jobId]
      )

      // 3. Mark selected bid ACCEPTED and other bids REJECTED
      await tx.execute(`UPDATE delivery_bids SET status = 'ACCEPTED' WHERE id = $1`, [bidId])
      await tx.execute(`UPDATE delivery_bids SET status = 'REJECTED' WHERE delivery_job_id = $1 AND id != $2`, [jobId, bidId])

      // 4. Log status change
      await tx.execute(
        `INSERT INTO delivery_status_log (
          delivery_job_id, previous_status, new_status, changed_by, reason, created_at
        ) VALUES ($1, $2, 'ASSIGNED', $3, $4, NOW())`,
        [
          jobId,
          job.delivery_status,
          currentUserId,
          `Transporter ${bid.business_name} selected at ₹${Number(bid.proposed_cost).toLocaleString('en-IN')}.`
        ]
      )

      // 5. Update produce_orders delivery fee and total amount
      await tx.execute(
        `UPDATE produce_orders
         SET delivery_fee = $1,
             total_amount = subtotal + $1 + platform_fee,
             updated_at = NOW()
         WHERE id = $2`,
        [bid.proposed_cost, job.produce_order_id]
      )

      // 6. Notify Transporter
      await tx.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, 'order', $5)`,
        [
          `notif-asg-t-${Date.now().toString(36)}`,
          bid.transporter_user_id,
          `Delivery Job Assigned! #${jobId}`,
          `Your quote of ₹${Number(bid.proposed_cost).toLocaleString('en-IN')} was accepted for ${job.cargo_quantity} ${job.cargo_unit} of ${job.cargo_crop_name}. Please prepare for pickup.`,
          `/transporter/dashboard`
        ]
      )
    })

    return NextResponse.json({
      success: true,
      message: `Delivery job assigned successfully to ${bid.business_name}.`,
      deliveryStatus: 'ASSIGNED',
      transporterId: bid.transporter_id,
      agreedCost: Number(bid.proposed_cost)
    })
  } catch (error: any) {
    console.error('Error assigning transporter to job:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
