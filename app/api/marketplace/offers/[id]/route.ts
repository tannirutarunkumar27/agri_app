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
    const offerId = params.id

    if (!offerId) {
      return NextResponse.json({ success: false, error: 'Offer ID is required.' }, { status: 400 })
    }

    const offer = await queryOne<any>(
      `SELECT 
        i.*,
        l.crop_name,
        l.variety,
        l.unit,
        l.price_per_unit as asking_price,
        l.quantity as total_lot_quantity,
        l.reserved_quantity,
        l.quality_grade,
        l.seller_id,
        l.seller_name,
        l.seller_phone,
        l.seller_district,
        l.seller_state,
        l.farm_gate_address,
        l.images_json,
        o.id as produce_order_id,
        o.fulfillment_status as order_fulfillment_status
      FROM market_inquiries i
      JOIN market_listings l ON i.listing_id = l.id
      LEFT JOIN produce_orders o ON o.offer_id = i.id
      WHERE i.id = $1`,
      [offerId]
    )

    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found.' }, { status: 404 })
    }

    const history = await query<any>(
      `SELECT * FROM market_offer_history WHERE offer_id = $1 ORDER BY created_at ASC`,
      [offerId]
    )

    let images = []
    try {
      images = typeof offer.images_json === 'string' ? JSON.parse(offer.images_json) : offer.images_json || []
    } catch {
      images = []
    }

    const isExpired = offer.expires_at ? new Date(offer.expires_at) < new Date() : false
    const availableQty = Math.max(0, Number(offer.total_lot_quantity) - Number(offer.reserved_quantity || 0))

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        listingId: offer.listing_id,
        buyerId: offer.buyer_id,
        farmerId: offer.farmer_id || offer.seller_id,
        buyerName: offer.buyer_name,
        buyerPhone: offer.buyer_phone,
        buyerType: offer.buyer_type,
        buyerLocation: offer.buyer_location,
        offeredPricePerUnit: Number(offer.offered_price_per_unit),
        requestedQuantity: Number(offer.requested_quantity),
        totalValue: Number(offer.total_value || offer.offered_price_per_unit * offer.requested_quantity),
        deliveryMethod: offer.delivery_method || 'BUYER_PICKUP',
        message: offer.message,
        status: isExpired && (offer.status === 'PENDING' || offer.status === 'COUNTERED') ? 'EXPIRED' : offer.status,
        isExpired,
        expiresAt: offer.expires_at,
        produceOrderId: offer.produce_order_id,
        orderFulfillmentStatus: offer.order_fulfillment_status,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at,
        listing: {
          cropName: offer.crop_name,
          variety: offer.variety,
          unit: offer.unit,
          askingPrice: Number(offer.asking_price),
          availableQuantity: availableQty,
          totalQuantity: Number(offer.total_lot_quantity),
          reservedQuantity: Number(offer.reserved_quantity || 0),
          qualityGrade: offer.quality_grade,
          sellerId: offer.seller_id,
          sellerName: offer.seller_name,
          sellerPhone: offer.seller_phone,
          district: offer.seller_district,
          state: offer.seller_state,
          farmGateAddress: offer.farm_gate_address,
          images
        },
        history: history.map((h) => ({
          id: h.id,
          senderId: h.sender_id,
          senderName: h.sender_name,
          senderRole: h.sender_role,
          offeredPricePerUnit: Number(h.offered_price_per_unit),
          requestedQuantity: Number(h.requested_quantity),
          totalValue: Number(h.total_value),
          message: h.message,
          action: h.action,
          createdAt: h.created_at
        }))
      }
    })
  } catch (error: any) {
    console.error('Error getting marketplace offer detail:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to get offer.' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: Params) {
  try {
    const params = await props.params
    const offerId = params.id
    const session = await getSessionFromCookies()
    const body = await request.json()

    const action = sanitizeText(body.action || '').toUpperCase()
    const message = sanitizeText(body.message || '')

    if (!offerId) {
      return NextResponse.json({ success: false, error: 'Offer ID is required.' }, { status: 400 })
    }

    if (!['ACCEPT', 'COUNTER', 'REJECT', 'CANCEL'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Allowed: ACCEPT, COUNTER, REJECT, CANCEL.' },
        { status: 400 }
      )
    }

    // Load offer
    const offer = await queryOne<any>(
      `SELECT i.*, l.crop_name, l.variety, l.unit, l.seller_id, l.seller_name, l.seller_phone, l.farm_gate_address, l.seller_district, l.seller_state
       FROM market_inquiries i
       JOIN market_listings l ON i.listing_id = l.id
       WHERE i.id = $1`,
      [offerId]
    )

    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found.' }, { status: 404 })
    }

    if (offer.status === 'ACCEPTED') {
      return NextResponse.json({ success: false, error: 'Offer has already been accepted and finalized into an order.' }, { status: 400 })
    }

    if (offer.status === 'REJECTED' || offer.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: `Offer has already been ${offer.status.toLowerCase()}.` }, { status: 400 })
    }

    const isExpired = offer.expires_at ? new Date(offer.expires_at) < new Date() : false
    if (isExpired) {
      return NextResponse.json({ success: false, error: 'This offer has expired. Please submit a fresh offer.' }, { status: 400 })
    }

    // Determine party/role
    const currentUserId = session?.userId || body.userId || offer.buyer_id
    const currentUserName = session?.name || body.userName || (currentUserId === offer.seller_id ? offer.seller_name : offer.buyer_name)
    const isFarmer = currentUserId === offer.seller_id || currentUserId === offer.farmer_id || body.role === 'farmer'
    const isBuyer = currentUserId === offer.buyer_id || body.role === 'buyer'

    // ACTION: COUNTER
    if (action === 'COUNTER') {
      const counterPrice = Number(body.counterPrice)
      const counterQuantity = Number(body.counterQuantity || offer.requested_quantity)

      if (!counterPrice || counterPrice <= 0) {
        return NextResponse.json({ success: false, error: 'Counter price must be greater than 0.' }, { status: 400 })
      }
      if (!counterQuantity || counterQuantity <= 0) {
        return NextResponse.json({ success: false, error: 'Counter quantity must be greater than 0.' }, { status: 400 })
      }

      const totalValue = counterPrice * counterQuantity
      const senderRole = isFarmer ? 'farmer' : 'buyer'

      await runTransaction(async (tx) => {
        // Update inquiry
        await tx.execute(
          `UPDATE market_inquiries
           SET offered_price_per_unit = $1,
               requested_quantity = $2,
               total_value = $3,
               message = $4,
               status = 'COUNTERED',
               expires_at = NOW() + INTERVAL '48 hours',
               updated_at = NOW()
           WHERE id = $5`,
          [counterPrice, counterQuantity, totalValue, message, offerId]
        )

        // Insert history
        await tx.execute(
          `INSERT INTO market_offer_history (
            offer_id, sender_id, sender_name, sender_role, offered_price_per_unit, requested_quantity,
            total_value, message, action, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'COUNTER', NOW())`,
          [offerId, currentUserId, currentUserName, senderRole, counterPrice, counterQuantity, totalValue, message]
        )

        // Notify recipient
        const recipientId = isFarmer ? offer.buyer_id : offer.seller_id
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-cnt-${Date.now().toString(36)}`,
            recipientId,
            `Counter-Offer Received: ${offer.crop_name}`,
            `${currentUserName} proposed ₹${counterPrice.toLocaleString('en-IN')}/${offer.unit} for ${counterQuantity} ${offer.unit} (Total ₹${totalValue.toLocaleString('en-IN')}).`,
            isFarmer ? '/marketplace/orders/buying' : '/marketplace/orders/selling'
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Counter-offer submitted successfully.',
        status: 'COUNTERED',
        counterPrice,
        counterQuantity,
        totalValue
      })
    }

    // ACTION: ACCEPT
    if (action === 'ACCEPT') {
      let createdOrderId = ''
      let paymentRecordId = ''

      await runTransaction(async (tx) => {
        // 1. Pessimistic concurrency row-lock on market_listings
        const listingRows = await tx.query<any>(
          `SELECT id, crop_name, variety, quantity, reserved_quantity, status, price_per_unit, unit, seller_id, seller_name, seller_phone, farm_gate_address, seller_district, seller_state
           FROM market_listings 
           WHERE id = $1 
           FOR UPDATE`,
          [offer.listing_id]
        )

        if (listingRows.length === 0) {
          throw new Error('Listing not found during inventory reservation.')
        }

        const listing = listingRows[0]
        if (listing.status !== 'ACTIVE') {
          throw new Error('This produce lot is no longer active.')
        }

        const agreedQuantity = Number(offer.requested_quantity)
        const agreedPrice = Number(offer.offered_price_per_unit)
        const currentReserved = Number(listing.reserved_quantity || 0)
        const totalQty = Number(listing.quantity)
        const availableStock = totalQty - currentReserved

        if (agreedQuantity > availableStock) {
          throw new Error(
            `Insufficient available inventory to accept offer. Requested: ${agreedQuantity} ${listing.unit}, Available: ${availableStock} ${listing.unit}.`
          )
        }

        // 2. Reserve inventory
        const newReserved = currentReserved + agreedQuantity
        await tx.execute(
          `UPDATE market_listings
           SET reserved_quantity = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [newReserved, listing.id]
        )

        // 3. Mark offer as ACCEPTED
        await tx.execute(
          `UPDATE market_inquiries
           SET status = 'ACCEPTED',
               updated_at = NOW()
           WHERE id = $1`,
          [offerId]
        )

        // 4. Record action in audit history
        const senderRole = isFarmer ? 'farmer' : 'buyer'
        await tx.execute(
          `INSERT INTO market_offer_history (
            offer_id, sender_id, sender_name, sender_role, offered_price_per_unit, requested_quantity,
            total_value, message, action, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACCEPT', NOW())`,
          [
            offerId,
            currentUserId,
            currentUserName,
            senderRole,
            agreedPrice,
            agreedQuantity,
            offer.total_value || agreedPrice * agreedQuantity,
            message || 'Offer formally accepted.'
          ]
        )

        // 5. Generate Produce Order
        const orderId = `po-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
        createdOrderId = orderId
        const subtotal = agreedPrice * agreedQuantity
        const deliveryFee = Number(body.deliveryFee || 0)
        const platformFee = 0
        const totalAmount = subtotal + deliveryFee + platformFee
        const deliveryMethod = sanitizeText(body.deliveryMethod || offer.delivery_method || 'BUYER_PICKUP')
        const pickupAddress = listing.farm_gate_address || `${listing.seller_district}, ${listing.seller_state}`
        const deliveryAddressJson = body.deliveryAddress ? JSON.stringify(body.deliveryAddress) : null

        await tx.execute(
          `INSERT INTO produce_orders (
            id, offer_id, listing_id, farmer_id, farmer_name, farmer_phone,
            buyer_id, buyer_name, buyer_phone, crop_name, variety, quantity,
            unit, agreed_price_per_unit, subtotal, delivery_fee, platform_fee,
            total_amount, payment_status, fulfillment_status, delivery_method,
            pickup_address, delivery_address, preferred_delivery_date,
            confirmed_by, confirmed_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17,
            $18, 'PENDING', 'PENDING_PAYMENT', $19,
            $20, $21, $22,
            $23, NOW(), NOW(), NOW()
          )`,
          [
            orderId,
            offerId,
            listing.id,
            listing.seller_id,
            listing.seller_name,
            listing.seller_phone,
            offer.buyer_id,
            offer.buyer_name,
            offer.buyer_phone,
            listing.crop_name,
            listing.variety,
            agreedQuantity,
            listing.unit,
            agreedPrice,
            subtotal,
            deliveryFee,
            platformFee,
            totalAmount,
            deliveryMethod,
            pickupAddress,
            deliveryAddressJson,
            body.preferredDeliveryDate || null,
            currentUserId
          ]
        )

        // 6. Create Order Status Audit Log
        await tx.execute(
          `INSERT INTO produce_order_status_log (
            order_id, previous_status, new_status, changed_by, reason, created_at
          ) VALUES ($1, NULL, 'PENDING_PAYMENT', $2, 'Offer accepted. Order created and produce inventory reserved.', NOW())`,
          [orderId, currentUserId]
        )

        // 7. Create Payment record abstraction
        const paymentId = `pay-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
        paymentRecordId = paymentId
        await tx.execute(
          `INSERT INTO marketplace_payments (
            id, order_id, amount, payment_provider, transaction_reference, payment_status, created_at, updated_at
          ) VALUES ($1, $2, $3, 'development_escrow', $4, 'CREATED', NOW(), NOW())`,
          [paymentId, orderId, totalAmount, `TXN-DEV-${Date.now()}`]
        )

        // 7b. If delivery method is TRANSPORTER, create delivery job
        if (deliveryMethod === 'TRANSPORTER') {
          const jobId = `job-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
          await tx.execute(
            `INSERT INTO delivery_jobs (
              id, produce_order_id, pickup_location, delivery_location, cargo_crop_name,
              cargo_quantity, cargo_unit, pickup_date, distance_km, estimated_cost,
              delivery_status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, 65.00, 2800.00,
              'OPEN', NOW(), NOW()
            )`,
            [
              jobId,
              orderId,
              pickupAddress,
              deliveryAddressJson || JSON.stringify({ district: listing.seller_district || 'Pune', state: listing.seller_state || 'Maharashtra' }),
              listing.crop_name,
              agreedQuantity,
              listing.unit,
              body.preferredDeliveryDate || null
            ]
          )
          await tx.execute(
            `INSERT INTO delivery_status_log (
              delivery_job_id, previous_status, new_status, changed_by, reason, created_at
            ) VALUES ($1, NULL, 'OPEN', $2, 'Delivery job generated for third-party transport.', NOW())`,
            [jobId, currentUserId]
          )
        }

        // 8. Send Notifications to both farmer and buyer
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES 
           ($1, $2, $3, $4, 'order', $5),
           ($6, $7, $8, $9, 'order', $10)`,
          [
            `notif-acc-b-${Date.now().toString(36)}`,
            offer.buyer_id,
            `Offer Accepted! Order #${orderId}`,
            `Deal confirmed for ${agreedQuantity} ${listing.unit} of ${listing.crop_name}. Please proceed with payment/confirmation.`,
            `/marketplace/orders/buying`,

            `notif-acc-f-${Date.now().toString(36)}`,
            listing.seller_id,
            `Order Created! #${orderId}`,
            `You accepted the deal with ${offer.buyer_name} for ${agreedQuantity} ${listing.unit} of ${listing.crop_name}. Inventory reserved.`,
            `/marketplace/orders/selling`
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Offer accepted, inventory reserved, and produce order created successfully.',
        status: 'ACCEPTED',
        orderId: createdOrderId,
        paymentId: paymentRecordId
      })
    }

    // ACTION: REJECT
    if (action === 'REJECT') {
      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE market_inquiries
           SET status = 'REJECTED',
               updated_at = NOW()
           WHERE id = $1`,
          [offerId]
        )

        const senderRole = isFarmer ? 'farmer' : 'buyer'
        await tx.execute(
          `INSERT INTO market_offer_history (
            offer_id, sender_id, sender_name, sender_role, offered_price_per_unit, requested_quantity,
            total_value, message, action, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'REJECT', NOW())`,
          [
            offerId,
            currentUserId,
            currentUserName,
            senderRole,
            offer.offered_price_per_unit,
            offer.requested_quantity,
            offer.total_value,
            message || 'Offer declined.'
          ]
        )

        const recipientId = isFarmer ? offer.buyer_id : offer.seller_id
        await tx.execute(
          `INSERT INTO notifications (id, user_id, title, message, type, link)
           VALUES ($1, $2, $3, $4, 'order', $5)`,
          [
            `notif-rej-${Date.now().toString(36)}`,
            recipientId,
            `Offer Declined: ${offer.crop_name}`,
            `The offer for ${offer.requested_quantity} ${offer.unit} of ${offer.crop_name} was declined.`,
            isFarmer ? '/marketplace/orders/buying' : '/marketplace/orders/selling'
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Offer rejected.',
        status: 'REJECTED'
      })
    }

    // ACTION: CANCEL
    if (action === 'CANCEL') {
      await runTransaction(async (tx) => {
        await tx.execute(
          `UPDATE market_inquiries
           SET status = 'CANCELLED',
               updated_at = NOW()
           WHERE id = $1`,
          [offerId]
        )

        const senderRole = isFarmer ? 'farmer' : 'buyer'
        await tx.execute(
          `INSERT INTO market_offer_history (
            offer_id, sender_id, sender_name, sender_role, offered_price_per_unit, requested_quantity,
            total_value, message, action, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CANCEL', NOW())`,
          [
            offerId,
            currentUserId,
            currentUserName,
            senderRole,
            offer.offered_price_per_unit,
            offer.requested_quantity,
            offer.total_value,
            message || 'Offer withdrawn/cancelled.'
          ]
        )
      })

      return NextResponse.json({
        success: true,
        message: 'Offer cancelled.',
        status: 'CANCELLED'
      })
    }

    return NextResponse.json({ success: false, error: 'Unhandled action.' }, { status: 400 })
  } catch (error: any) {
    console.error('Error handling marketplace offer action:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to process offer action.' }, { status: 500 })
  }
}
