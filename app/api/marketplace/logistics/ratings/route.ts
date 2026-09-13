import { NextResponse } from 'next/server'
import { queryOne, runTransaction } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const deliveryJobId = sanitizeText(body.deliveryJobId)
    const rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5))
    const comment = sanitizeText(body.comment || '')
    const reviewerId = session?.userId || body.reviewerId

    if (!deliveryJobId) {
      return NextResponse.json({ success: false, error: 'Delivery Job ID is required.' }, { status: 400 })
    }

    if (!reviewerId) {
      return NextResponse.json({ success: false, error: 'Reviewer must be authenticated.' }, { status: 401 })
    }

    // Load job and order
    const job = await queryOne<any>(
      `SELECT j.*, o.farmer_id, o.buyer_id
       FROM delivery_jobs j
       JOIN produce_orders o ON j.produce_order_id = o.id
       WHERE j.id = $1`,
      [deliveryJobId]
    )

    if (!job) {
      return NextResponse.json({ success: false, error: 'Delivery job not found.' }, { status: 404 })
    }

    if (!job.transporter_id) {
      return NextResponse.json({ success: false, error: 'No transporter assigned to this delivery.' }, { status: 400 })
    }

    // Determine reviewer role
    const reviewerRole = reviewerId === job.buyer_id ? 'buyer' : 'farmer'

    // Prevent duplicate rating
    const existingRating = await queryOne<any>(
      'SELECT id FROM transporter_ratings WHERE delivery_job_id = $1 AND reviewer_id = $2',
      [deliveryJobId, reviewerId]
    )

    if (existingRating) {
      return NextResponse.json({ success: false, error: 'You have already submitted a rating for this delivery.' }, { status: 409 })
    }

    await runTransaction(async (tx) => {
      // 1. Insert rating
      await tx.execute(
        `INSERT INTO transporter_ratings (
          order_id, delivery_job_id, reviewer_id, reviewer_role, transporter_id, rating, comment, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [job.produce_order_id, deliveryJobId, reviewerId, reviewerRole, job.transporter_id, rating, comment]
      )

      // 2. Recalculate transporter aggregate rating
      const aggRes = await tx.query<any>(
        `SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating FROM transporter_ratings WHERE transporter_id = $1`,
        [job.transporter_id]
      )
      const newAvg = Number(aggRes[0]?.avg_rating || rating)

      await tx.execute(
        `UPDATE transporters
         SET rating = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [newAvg, job.transporter_id]
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Transporter rating submitted successfully. Thank you for your feedback!'
    })
  } catch (error: any) {
    console.error('Error submitting transporter rating:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
