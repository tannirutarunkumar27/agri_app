import { NextResponse } from 'next/server'
import { query, queryOne, runTransaction } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText, normalizeAndValidatePhone } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const listingId = sanitizeText(body.listingId)
    const buyerName = sanitizeText(session?.name || body.buyerName || '')
    const buyerPhone = sanitizeText(session?.phone || body.buyerPhone || '')
    const buyerType = sanitizeText(body.buyerType || 'Wholesale Trader / Commercial Buyer')
    const buyerLocation = sanitizeText(body.buyerLocation || 'Local APMC Mandi')
    const deliveryMethod = sanitizeText(body.deliveryMethod || 'BUYER_PICKUP')
    const offeredPricePerUnit = Number(body.offeredPricePerUnit)
    const requestedQuantity = Number(body.requestedQuantity)
    const message = sanitizeText(body.message || '')
    const expirationHours = Math.max(1, Math.min(168, Number(body.expirationHours) || 48)) // 1 hr to 7 days, default 48h

    if (!listingId) {
      return NextResponse.json({ success: false, error: 'Listing ID is required.' }, { status: 400 })
    }

    if (!buyerName || buyerName.length < 2) {
      return NextResponse.json({ success: false, error: 'Valid buyer name is required.' }, { status: 400 })
    }

    const phoneValidation = normalizeAndValidatePhone(buyerPhone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Valid 10-digit mobile number is required.' },
        { status: 400 }
      )
    }

    if (!offeredPricePerUnit || offeredPricePerUnit <= 0) {
      return NextResponse.json({ success: false, error: 'Offered price per unit must be greater than 0.' }, { status: 400 })
    }

    if (!requestedQuantity || requestedQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'Requested quantity must be greater than 0.' }, { status: 400 })
    }

    // Verify listing
    const listing = await queryOne<any>('SELECT * FROM market_listings WHERE id = $1', [listingId])
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Produce listing not found.' }, { status: 404 })
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'This listing is no longer active for offers.' }, { status: 400 })
    }

    const availableQty = Number(listing.quantity) - Number(listing.reserved_quantity || 0)
    if (requestedQuantity > availableQty) {
      return NextResponse.json(
        {
          success: false,
          error: `Requested quantity (${requestedQuantity} ${listing.unit}) exceeds currently available lot inventory (${availableQty} ${listing.unit}).`
        },
        { status: 400 }
      )
    }

    const buyerId = session?.userId || `buyer-${phoneValidation.normalized}`
    const farmerId = listing.seller_id
    const offerId = `off-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
    const totalValue = offeredPricePerUnit * requestedQuantity
    const demandRequestId = body.demandRequestId ? sanitizeText(body.demandRequestId) : null

    // If offer is linked to a buyer demand request, enforce expiration and status
    if (demandRequestId) {
      const demandCheck = await queryOne<any>(
        'SELECT id, buyer_id, status, expires_at FROM buyer_demand_requests WHERE id = $1',
        [demandRequestId]
      )
      if (!demandCheck) {
        return NextResponse.json({ success: false, error: 'Linked buyer demand request not found.' }, { status: 404 })
      }
      if (demandCheck.status === 'EXPIRED' || new Date(demandCheck.expires_at) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'This buyer demand request has expired. New offers cannot be submitted against expired demands.' },
          { status: 400 }
        )
      }
      if (demandCheck.status === 'CANCELLED') {
        return NextResponse.json(
          { success: false, error: 'This buyer demand request has been cancelled.' },
          { status: 400 }
        )
      }
    }

    // Execute atomic creation
    await runTransaction(async (tx) => {
      // 1. Insert into market_inquiries as formal offer
      await tx.execute(
        `INSERT INTO market_inquiries (
          id, listing_id, buyer_id, farmer_id, buyer_name, buyer_phone, buyer_type, buyer_location,
          offered_price_per_unit, requested_quantity, total_value, delivery_method, message, status,
          demand_request_id, expires_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, 'PENDING',
          $14, NOW() + ($15 || ' hours')::interval, NOW(), NOW()
        )`,
        [
          offerId,
          listingId,
          buyerId,
          farmerId,
          buyerName,
          phoneValidation.normalized,
          buyerType,
          buyerLocation,
          offeredPricePerUnit,
          requestedQuantity,
          totalValue,
          deliveryMethod,
          message,
          demandRequestId,
          `${expirationHours}`
        ]
      )

      // 2. Insert initial entry in market_offer_history
      await tx.execute(
        `INSERT INTO market_offer_history (
          offer_id, sender_id, sender_name, sender_role, offered_price_per_unit, requested_quantity,
          total_value, message, action, created_at
        ) VALUES ($1, $2, $3, 'buyer', $4, $5, $6, $7, 'OFFER', NOW())`,
        [
          offerId,
          buyerId,
          buyerName,
          offeredPricePerUnit,
          requestedQuantity,
          totalValue,
          message
        ]
      )

      // 3. Increment inquiries_count on listing
      await tx.execute('UPDATE market_listings SET inquiries_count = inquiries_count + 1 WHERE id = $1', [listingId])

      // 4. Record in match_history if demand linked
      if (demandRequestId) {
        await tx.execute(
          `INSERT INTO match_history (farmer_id, buyer_id, demand_request_id, listing_id, score, outcome, notes)
           VALUES ($1, $2, $3, $4, 90.00, 'OFFER_SUBMITTED', 'Farmer submitted direct offer from demand discovery')`,
          [farmerId, buyerId, demandRequestId, listingId]
        )
      }

      // 5. Send notification to farmer
      await tx.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, 'order', $5)`,
        [
          `notif-off-${Date.now().toString(36)}`,
          farmerId,
          `New Offer on ${listing.crop_name}!`,
          `${buyerName} offered ₹${offeredPricePerUnit.toLocaleString('en-IN')}/${listing.unit} for ${requestedQuantity} ${listing.unit} (Total: ₹${totalValue.toLocaleString('en-IN')}).`,
          `/marketplace/orders/selling`
        ]
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Offer submitted successfully and sent directly to the farmer.',
      offerId,
      totalValue
    })
  } catch (error: any) {
    console.error('Error creating marketplace offer:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit offer.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const { searchParams } = new URL(request.url)

    const role = searchParams.get('role') // 'farmer' or 'buyer'
    const listingId = searchParams.get('listing_id')
    const status = searchParams.get('status')
    const userId = session?.userId || searchParams.get('user_id') || ''

    let sql = `
      SELECT 
        i.*,
        l.crop_name,
        l.variety,
        l.unit,
        l.price_per_unit as asking_price,
        l.quantity as total_lot_quantity,
        l.reserved_quantity,
        l.quality_grade,
        l.seller_name,
        l.seller_phone,
        l.seller_district,
        l.seller_state,
        l.farm_gate_address,
        l.images_json,
        (SELECT COUNT(*) FROM market_offer_history h WHERE h.offer_id = i.id) as rounds_count
      FROM market_inquiries i
      JOIN market_listings l ON i.listing_id = l.id
      WHERE 1=1
    `
    const params: any[] = []
    let pIdx = 1

    if (role === 'farmer' && userId) {
      sql += ` AND (i.farmer_id = $${pIdx} OR l.seller_id = $${pIdx})`
      params.push(userId)
      pIdx++
    } else if (role === 'buyer' && (userId || session?.phone)) {
      sql += ` AND (i.buyer_id = $${pIdx} OR i.buyer_phone = $${pIdx + 1})`
      params.push(userId, session?.phone || '')
      pIdx += 2
    }

    if (listingId) {
      sql += ` AND i.listing_id = $${pIdx}`
      params.push(listingId)
      pIdx++
    }

    if (status && status !== 'all') {
      sql += ` AND i.status = $${pIdx}`
      params.push(status)
      pIdx++
    }

    sql += ` ORDER BY i.created_at DESC LIMIT 50`

    const rows = await query<any>(sql, params)

    const offers = rows.map((r) => {
      let images = []
      try {
        images = typeof r.images_json === 'string' ? JSON.parse(r.images_json) : r.images_json || []
      } catch {
        images = []
      }

      const isExpired = r.expires_at ? new Date(r.expires_at) < new Date() : false
      let displayStatus = r.status
      if (isExpired && (r.status === 'PENDING' || r.status === 'COUNTERED')) {
        displayStatus = 'EXPIRED'
      }

      const availableQty = Number(r.total_lot_quantity) - Number(r.reserved_quantity || 0)

      return {
        id: r.id,
        listingId: r.listing_id,
        buyerId: r.buyer_id,
        farmerId: r.farmer_id,
        buyerName: r.buyer_name,
        buyerPhone: r.buyer_phone,
        buyerType: r.buyer_type,
        buyerLocation: r.buyer_location,
        offeredPricePerUnit: Number(r.offered_price_per_unit),
        requestedQuantity: Number(r.requested_quantity),
        totalValue: Number(r.total_value || r.offered_price_per_unit * r.requested_quantity),
        deliveryMethod: r.delivery_method || 'BUYER_PICKUP',
        message: r.message,
        status: displayStatus,
        isExpired,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        roundsCount: parseInt(String(r.rounds_count || '1'), 10),
        listing: {
          cropName: r.crop_name,
          variety: r.variety,
          unit: r.unit,
          askingPrice: Number(r.asking_price),
          availableQuantity: availableQty,
          totalQuantity: Number(r.total_lot_quantity),
          qualityGrade: r.quality_grade,
          sellerName: r.seller_name,
          sellerPhone: r.seller_phone,
          district: r.seller_district,
          state: r.seller_state,
          farmGateAddress: r.farm_gate_address,
          images
        }
      }
    })

    return NextResponse.json({ success: true, count: offers.length, offers })
  } catch (error: any) {
    console.error('Error fetching marketplace offers:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch offers.' }, { status: 500 })
  }
}
