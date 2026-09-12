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
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 })
    }

    const order = await queryOne<any>(
      `SELECT 
        o.*,
        l.images_json,
        l.quality_grade,
        l.farm_gate_address,
        l.seller_district,
        l.seller_state,
        l.quantity as listing_lot_quantity,
        l.reserved_quantity as listing_reserved_quantity,
        l.status as listing_status,
        p.id as payment_id,
        p.payment_provider,
        p.transaction_reference,
        p.payment_status as payment_record_status
      FROM produce_orders o
      LEFT JOIN market_listings l ON o.listing_id = l.id
      LEFT JOIN marketplace_payments p ON p.order_id = o.id
      WHERE o.id = $1`,
      [orderId]
    )

    if (!order) {
      return NextResponse.json({ success: false, error: 'Produce order not found.' }, { status: 404 })
    }

    const logs = await query<any>(
      `SELECT * FROM produce_order_status_log WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    )

    let images = []
    try {
      images = typeof order.images_json === 'string' ? JSON.parse(order.images_json) : order.images_json || []
    } catch {
      images = []
    }

    let deliveryAddress = null
    try {
      deliveryAddress = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address
    } catch {
      deliveryAddress = null
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        offerId: order.offer_id,
        listingId: order.listing_id,
        farmerId: order.farmer_id,
        farmerName: order.farmer_name,
        farmerPhone: order.farmer_phone,
        buyerId: order.buyer_id,
        buyerName: order.buyer_name,
        buyerPhone: order.buyer_phone,
        cropName: order.crop_name,
        variety: order.variety,
        quantity: Number(order.quantity),
        unit: order.unit,
        agreedPricePerUnit: Number(order.agreed_price_per_unit),
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.delivery_fee || 0),
        platformFee: Number(order.platform_fee || 0),
        totalAmount: Number(order.total_amount),
        paymentStatus: order.payment_status,
        fulfillmentStatus: order.fulfillment_status,
        deliveryMethod: order.delivery_method,
        pickupAddress: order.pickup_address,
        deliveryAddress,
        preferredDeliveryDate: order.preferred_delivery_date,
        confirmedAt: order.confirmed_at,
        cancelledBy: order.cancelled_by,
        cancellationReason: order.cancellation_reason,
        cancelledAt: order.cancelled_at,
        disputeCategory: order.dispute_category,
        disputeReason: order.dispute_reason,
        disputedAt: order.disputed_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        listing: {
          qualityGrade: order.quality_grade,
          district: order.seller_district,
          state: order.seller_state,
          farmGateAddress: order.farm_gate_address,
          lotQuantity: Number(order.listing_lot_quantity || 0),
          reservedQuantity: Number(order.listing_reserved_quantity || 0),
          status: order.listing_status,
          images
        },
        payment: order.payment_id
          ? {
              id: order.payment_id,
              provider: order.payment_provider,
              reference: order.transaction_reference,
              status: order.payment_record_status
            }
          : null,
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
    console.error('Error fetching produce order detail:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch produce order.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: Params) {
  try {
    const params = await props.params
    const orderId = params.id
    const session = await getSessionFromCookies()
    const body = await request.json()

    const action = sanitizeText(body.action || '').toUpperCase()
    const reason = sanitizeText(body.reason || '')
    const category = sanitizeText(body.category || '')
    const currentUserId = session?.userId || body.userId || 'system-user'

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 })
    }

    if (!['PAY', 'UPDATE_STATUS', 'CONFIRM_DELIVERY', 'CANCEL', 'DISPUTE'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Allowed: PAY, UPDATE_STATUS, CONFIRM_DELIVERY, CANCEL, DISPUTE.' },
        { status: 400 }
      )
    }

    // Fetch order
    const order = await queryOne<any>('SELECT * FROM produce_orders WHERE id = $1', [orderId])
    if (!order) {
      return NextResponse.json({ success: false, error: 'Produce order not found.' }, { status: 404 })
    }

    // ACTION: PAY (Mock payment / Development escrow confirmation)
    if (action === 'PAY') {
      if (order.fulfillment_status !== 'PENDING_PAYMENT' && order.payment_status === 'PAID') {
        return NextResponse.json({ success: false, error: 'Order has already been paid for.' }, { status: 400 })
      }

      if (['CANCELLED', 'COMPLETED', 'DISPUTED'].includes(order.fulfillment_status)) {
        return NextResponse.json({ success: false, error: `Cannot pay for order in ${order.fulfillment_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        // Update payment record
        await tx.execute(
          `UPDATE marketplace_payments
           SET payment_status = 'SUCCESS',
               updated_at = NOW()
           WHERE order_id = $1`,
          [orderId]
        )

        // Update order status
        await tx.execute(
          `UPDATE produce_orders
           SET payment_status = 'PAID',
               fulfillment_status = 'CONFIRMED',
               updated_at = NOW()
           WHERE id = $1`,
          [orderId]
        )

        // Insert audit log
        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'CONFIRMED', $3, 'Payment secured in escrow. Order confirmed.', NOW())`,
          [orderId, order.fulfillment_status, currentUserId]
        )

        // Notifications
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES 
           ($1, $2, $3, $4, 'order', $5),
           ($6, $7, $8, $9, 'order', $10)`,
          [
            `notif-pay-f-${Date.now().toString(36)}`,
            order.farmer_id,
            `Payment Received for Order #${orderId}`,
            `₹${Number(order.total_amount).toLocaleString('en-IN')} has been placed in escrow for ${order.crop_name}. Please begin preparation/dispatch.`,
            `/marketplace/orders/selling`,

            `notif-pay-b-${Date.now().toString(36)}`,
            order.buyer_id,
            `Payment Confirmed for Order #${orderId}`,
            `Payment of ₹${Number(order.total_amount).toLocaleString('en-IN')} held securely. The farmer will prepare your produce lot.`,
            `/marketplace/orders/buying`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Payment secured successfully. Order confirmed.',
        fulfillmentStatus: 'CONFIRMED',
        paymentStatus: 'PAID'
      })
    }

    // ACTION: UPDATE_STATUS (Farmer progression)
    if (action === 'UPDATE_STATUS') {
      const nextStatus = sanitizeText(body.status || '').toUpperCase()
      const allowedStatuses = ['PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']

      if (!allowedStatuses.includes(nextStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status transition to ${nextStatus}. Allowed: ${allowedStatuses.join(', ')}` },
          { status: 400 }
        )
      }

      if (['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(order.fulfillment_status)) {
        return NextResponse.json({ success: false, error: `Cannot update order in ${order.fulfillment_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [nextStatus, orderId]
        )

        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [orderId, order.fulfillment_status, nextStatus, currentUserId, reason || `Status updated to ${nextStatus}`]
        )

        // Notify buyer
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-st-${Date.now().toString(36)}`,
            order.buyer_id,
            `Order #${orderId} Updated: ${nextStatus.replace(/_/g, ' ')}`,
            `Your produce order for ${order.crop_name} is now: ${nextStatus.replace(/_/g, ' ')}.`,
            `/marketplace/orders/buying`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: `Order status updated to ${nextStatus}.`,
        fulfillmentStatus: nextStatus
      })
    }

    // ACTION: CONFIRM_DELIVERY (Buyer confirms delivery -> Settles inventory & Completes order)
    if (action === 'CONFIRM_DELIVERY') {
      if (order.fulfillment_status === 'COMPLETED') {
        return NextResponse.json({ success: false, error: 'Order is already marked as completed.' }, { status: 400 })
      }

      if (['CANCELLED', 'DISPUTED'].includes(order.fulfillment_status)) {
        return NextResponse.json({ success: false, error: `Cannot confirm receipt for order in ${order.fulfillment_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        // 1. Lock listing row to settle inventory permanently
        const listingRows = await tx.query<any>(
          `SELECT id, quantity, reserved_quantity, unit FROM market_listings WHERE id = $1 FOR UPDATE`,
          [order.listing_id]
        )

        if (listingRows.length > 0) {
          const listing = listingRows[0]
          const orderQty = Number(order.quantity)
          const newQty = Math.max(0, Number(listing.quantity) - orderQty)
          const newReserved = Math.max(0, Number(listing.reserved_quantity || 0) - orderQty)
          const newListingStatus = newQty <= 0 ? 'SOLD' : 'ACTIVE'

          await tx.execute(
            `UPDATE market_listings
             SET quantity = $1,
                 reserved_quantity = $2,
                 status = $3,
                 updated_at = NOW()
             WHERE id = $4`,
            [newQty, newReserved, newListingStatus, listing.id]
          )
        }

        // 2. Mark order as COMPLETED
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'COMPLETED',
               updated_at = NOW()
           WHERE id = $1`,
          [orderId]
        )

        // 2b. Sync associated delivery_jobs if exists
        const deliveryJobs = await tx.query<any>('SELECT id, transporter_id FROM delivery_jobs WHERE produce_order_id = $1', [orderId])
        if (deliveryJobs.length > 0) {
          const dj = deliveryJobs[0]
          await tx.execute(`UPDATE delivery_jobs SET delivery_status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [dj.id])
          await tx.execute(
            `INSERT INTO delivery_status_log (delivery_job_id, previous_status, new_status, changed_by, reason, created_at)
             VALUES ($1, 'DELIVERED', 'COMPLETED', $2, 'Buyer confirmed receipt. Job finalized.', NOW())`,
            [dj.id, currentUserId]
          )
          if (dj.transporter_id) {
            await tx.execute(`UPDATE transporters SET total_completed_jobs = total_completed_jobs + 1, updated_at = NOW() WHERE id = $1`, [dj.transporter_id])
          }
        }

        // 3. Log status transition
        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'COMPLETED', $3, 'Buyer confirmed receipt of produce lot. Transaction settled.', NOW())`,
          [orderId, order.fulfillment_status, currentUserId]
        )

        // 4. Notify farmer of completed transaction and payout release
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-cmp-${Date.now().toString(36)}`,
            order.farmer_id,
            `Order Completed! Payout Released: #${orderId}`,
            `Buyer confirmed receipt of ${order.quantity} ${order.unit} of ${order.crop_name}. ₹${Number(order.total_amount).toLocaleString('en-IN')} escrow has been released.`,
            `/marketplace/orders/selling`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Delivery confirmed and order settled successfully.',
        fulfillmentStatus: 'COMPLETED'
      })
    }

    // ACTION: CANCEL (Cancel order & Release reserved inventory)
    if (action === 'CANCEL') {
      if (['COMPLETED', 'CANCELLED'].includes(order.fulfillment_status)) {
        return NextResponse.json({ success: false, error: `Cannot cancel order in ${order.fulfillment_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        // 1. Lock listing and release reserved inventory
        const listingRows = await tx.query<any>(
          `SELECT id, quantity, reserved_quantity, unit FROM market_listings WHERE id = $1 FOR UPDATE`,
          [order.listing_id]
        )

        if (listingRows.length > 0) {
          const listing = listingRows[0]
          const orderQty = Number(order.quantity)
          const newReserved = Math.max(0, Number(listing.reserved_quantity || 0) - orderQty)

          await tx.execute(
            `UPDATE market_listings
             SET reserved_quantity = $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [newReserved, listing.id]
          )
        }

        // 2. Refund payment record if paid
        if (order.payment_status === 'PAID') {
          await tx.execute(
            `UPDATE marketplace_payments
             SET payment_status = 'REFUNDED',
                 updated_at = NOW()
             WHERE order_id = $1`,
            [orderId]
          )
        }

        // 3. Mark produce order as CANCELLED
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'CANCELLED',
               payment_status = CASE WHEN payment_status = 'PAID' THEN 'REFUNDED' ELSE payment_status END,
               cancelled_by = $1,
               cancellation_reason = $2,
               cancelled_at = NOW(),
               updated_at = NOW()
           WHERE id = $3`,
          [currentUserId, reason || 'Order cancelled.', orderId]
        )

        // 3b. Sync delivery_jobs cancellation if exists
        await tx.execute(
          `UPDATE delivery_jobs
           SET delivery_status = 'CANCELLED',
               updated_at = NOW()
           WHERE produce_order_id = $1 AND delivery_status NOT IN ('DELIVERED', 'COMPLETED')`,
          [orderId]
        )

        // 4. Log status change
        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'CANCELLED', $3, $4, NOW())`,
          [orderId, order.fulfillment_status, currentUserId, reason || 'Order cancelled and reserved stock released.']
        )

        // 5. Notify the opposite party
        const notifyTarget = currentUserId === order.farmer_id ? order.buyer_id : order.farmer_id
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-cnc-${Date.now().toString(36)}`,
            notifyTarget,
            `Order Cancelled: #${orderId}`,
            `Order for ${order.crop_name} was cancelled. Reason: ${reason || 'Not specified'}.`,
            currentUserId === order.farmer_id ? '/marketplace/orders/buying' : '/marketplace/orders/selling'
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Order cancelled and reserved inventory released back to produce lot.',
        fulfillmentStatus: 'CANCELLED'
      })
    }

    // ACTION: DISPUTE
    if (action === 'DISPUTE') {
      if (['CANCELLED', 'DISPUTED'].includes(order.fulfillment_status)) {
        return NextResponse.json({ success: false, error: `Order is already in ${order.fulfillment_status} state.` }, { status: 400 })
      }

      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE produce_orders
           SET fulfillment_status = 'DISPUTED',
               dispute_category = $1,
               dispute_reason = $2,
               disputed_at = NOW(),
               updated_at = NOW()
           WHERE id = $3`,
          [category || 'Quality/Delivery Issue', reason || 'Dispute raised by user.', orderId]
        )

        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, $2, 'DISPUTED', $3, $4, NOW())`,
          [orderId, order.fulfillment_status, currentUserId, `Dispute raised: ${category}. ${reason}`]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Dispute submitted successfully. FarmDirect mediator team notified.',
        fulfillmentStatus: 'DISPUTED'
      })
    }

    return NextResponse.json({ success: false, error: 'Unhandled action.' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating produce order:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to update produce order.' }, { status: 500 })
  }
}
