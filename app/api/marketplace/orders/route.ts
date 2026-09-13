import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required to access orders.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roleParam = searchParams.get('role') // 'farmer' or 'buyer' (used when admin or explicitly specified)
    const status = searchParams.get('status')
    const userRole = session.role?.toLowerCase()
    const userId = session.userId
    const userPhone = session.phone || ''

    let sql = `
      SELECT 
        o.*,
        l.images_json,
        l.quality_grade,
        l.farm_gate_address,
        l.seller_district,
        l.seller_state,
        p.id as payment_id,
        p.payment_provider,
        p.transaction_reference,
        p.payment_status as payment_record_status,
        dj.id as delivery_job_id,
        dj.delivery_status as job_delivery_status,
        dj.transporter_id as job_transporter_id,
        dj.assigned_vehicle_id as job_assigned_vehicle_id,
        dj.estimated_cost as job_estimated_cost,
        dj.agreed_cost as job_agreed_cost,
        dj.proof_of_delivery_url as job_proof_of_delivery_url,
        t.business_name as transporter_business_name,
        t.phone as transporter_phone,
        t.rating as transporter_rating,
        v.registration_number as vehicle_registration,
        v.vehicle_type as vehicle_type,
        (SELECT COUNT(*) FROM delivery_bids b WHERE b.delivery_job_id = dj.id) as job_bids_count,
        (SELECT id FROM transporter_ratings tr WHERE tr.delivery_job_id = dj.id LIMIT 1) as rating_id
      FROM produce_orders o
      LEFT JOIN market_listings l ON o.listing_id = l.id
      LEFT JOIN marketplace_payments p ON p.order_id = o.id
      LEFT JOIN delivery_jobs dj ON dj.produce_order_id = o.id
      LEFT JOIN transporters t ON dj.transporter_id = t.id
      LEFT JOIN transporter_vehicles v ON dj.assigned_vehicle_id = v.id
      WHERE 1=1
    `
    const params: any[] = []
    let pIdx = 1

    if (userRole === 'admin') {
      const targetUserId = searchParams.get('user_id')
      if (roleParam === 'farmer' && targetUserId) {
        sql += ` AND o.farmer_id = $${pIdx++}`
        params.push(targetUserId)
      } else if (roleParam === 'buyer' && targetUserId) {
        sql += ` AND o.buyer_id = $${pIdx++}`
        params.push(targetUserId)
      }
    } else if (userRole === 'farmer' || roleParam === 'farmer') {
      sql += ` AND (o.farmer_id = $${pIdx} OR o.farmer_phone = $${pIdx + 1})`
      params.push(userId, userPhone)
      pIdx += 2
    } else if (userRole === 'buyer' || roleParam === 'buyer') {
      sql += ` AND (o.buyer_id = $${pIdx} OR o.buyer_phone = $${pIdx + 1})`
      params.push(userId, userPhone)
      pIdx += 2
    } else if (userRole === 'transporter') {
      sql += ` AND (dj.transporter_id = $${pIdx} OR t.phone = $${pIdx + 1})`
      params.push(userId, userPhone)
      pIdx += 2
    } else {
      sql += ` AND (o.farmer_id = $${pIdx} OR o.buyer_id = $${pIdx + 1} OR o.buyer_phone = $${pIdx + 2} OR o.farmer_phone = $${pIdx + 3})`
      params.push(userId, userId, userPhone, userPhone)
      pIdx += 4
    }

    if (status && status !== 'all') {
      sql += ` AND o.fulfillment_status = $${pIdx}`
      params.push(status)
      pIdx++
    }

    sql += ` ORDER BY o.created_at DESC LIMIT 100`

    const rows = await query<any>(sql, params)

    const orders = rows.map((r) => {
      let images = []
      try {
        images = typeof r.images_json === 'string' ? JSON.parse(r.images_json) : r.images_json || []
      } catch {
        images = []
      }

      let deliveryAddress = null
      try {
        deliveryAddress = typeof r.delivery_address === 'string' ? JSON.parse(r.delivery_address) : r.delivery_address
      } catch {
        deliveryAddress = null
      }

      return {
        id: r.id,
        offerId: r.offer_id,
        listingId: r.listing_id,
        farmerId: r.farmer_id,
        farmerName: r.farmer_name,
        farmerPhone: r.farmer_phone,
        buyerId: r.buyer_id,
        buyerName: r.buyer_name,
        buyerPhone: r.buyer_phone,
        cropName: r.crop_name,
        variety: r.variety,
        quantity: Number(r.quantity),
        unit: r.unit,
        agreedPricePerUnit: Number(r.agreed_price_per_unit),
        subtotal: Number(r.subtotal),
        deliveryFee: Number(r.delivery_fee || 0),
        platformFee: Number(r.platform_fee || 0),
        totalAmount: Number(r.total_amount),
        paymentStatus: r.payment_status,
        fulfillmentStatus: r.fulfillment_status,
        deliveryMethod: r.delivery_method,
        pickupAddress: r.pickup_address,
        deliveryAddress,
        preferredDeliveryDate: r.preferred_delivery_date,
        confirmedAt: r.confirmed_at,
        cancelledBy: r.cancelled_by,
        cancellationReason: r.cancellation_reason,
        cancelledAt: r.cancelled_at,
        disputeCategory: r.dispute_category,
        disputeReason: r.dispute_reason,
        disputedAt: r.disputed_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        listing: {
          qualityGrade: r.quality_grade,
          district: r.seller_district,
          state: r.seller_state,
          images
        },
        payment: r.payment_id
          ? {
              id: r.payment_id,
              provider: r.payment_provider,
              reference: r.transaction_reference,
              status: r.payment_record_status
            }
          : null,
        deliveryJob: r.delivery_job_id
          ? {
              id: r.delivery_job_id,
              status: r.job_delivery_status,
              transporterId: r.job_transporter_id,
              transporterName: r.transporter_business_name,
              transporterPhone: r.transporter_phone,
              transporterRating: Number(r.transporter_rating || 5.0),
              vehicleRegistration: r.vehicle_registration,
              vehicleType: r.vehicle_type,
              proofOfDeliveryUrl: r.job_proof_of_delivery_url,
              estimatedCost: Number(r.job_estimated_cost || 0),
              agreedCost: Number(r.job_agreed_cost || 0),
              bidsCount: Number(r.job_bids_count || 0),
              isRated: Boolean(r.rating_id)
            }
          : null
      }
    })

    return NextResponse.json({ success: true, count: orders.length, orders })
  } catch (error: any) {
    console.error('Error fetching produce orders:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
