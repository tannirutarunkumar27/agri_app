import { NextResponse } from 'next/server'
import { query, queryOne, runTransaction } from '@/lib/db'
import { sanitizeText, normalizeAndValidatePhone } from '@/lib/validation'
import { getSessionFromCookies } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    const body = await request.json()

    const listingId = sanitizeText(body.listingId)
    const buyerName = sanitizeText(body.buyerName || session?.name || '')
    const buyerPhone = sanitizeText(body.buyerPhone || session?.phone || '')
    const buyerType = sanitizeText(body.buyerType || (session?.role === 'buyer' ? 'Commercial Buyer' : 'Wholesale Trader'))
    const buyerLocation = sanitizeText(body.buyerLocation || session?.district || 'Local Mandi')
    const offeredPricePerUnit = parseInt(body.offeredPricePerUnit, 10)
    const requestedQuantity = parseFloat(body.requestedQuantity)
    const message = sanitizeText(body.message || '')

    if (!listingId) {
      return NextResponse.json({ success: false, error: 'Listing ID is required' }, { status: 400 })
    }

    if (!buyerName || buyerName.length < 2) {
      return NextResponse.json({ success: false, error: 'Valid buyer name is required' }, { status: 400 })
    }

    const phoneValidation = normalizeAndValidatePhone(buyerPhone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Valid 10-digit phone number is required' },
        { status: 400 }
      )
    }

    if (!offeredPricePerUnit || offeredPricePerUnit <= 0) {
      return NextResponse.json({ success: false, error: 'Valid offered price is required' }, { status: 400 })
    }

    if (!requestedQuantity || requestedQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'Valid requested quantity is required' }, { status: 400 })
    }

    const inquiryId = `inq-${Date.now().toString(36)}`

    // Run within atomic PostgreSQL transaction
    await runTransaction(async (tx) => {
      // Verify listing exists
      const listing = await tx.queryOne<any>('SELECT * FROM market_listings WHERE id = $1', [listingId])
      if (!listing) {
        throw new Error('Listing not found')
      }

      await tx.execute(
        `INSERT INTO market_inquiries (
          id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
          offered_price_per_unit, requested_quantity, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')`,
        [
          inquiryId,
          listingId,
          buyerName,
          phoneValidation.normalized,
          buyerType,
          buyerLocation,
          offeredPricePerUnit,
          requestedQuantity,
          message
        ]
      )

      // Increment listing inquiry counter
      await tx.execute(
        'UPDATE market_listings SET inquiries_count = inquiries_count + 1 WHERE id = $1',
        [listingId]
      )

      // Insert notification to farmer
      const notifId = `notif-inq-${Date.now().toString(36)}`
      await tx.execute(
        `INSERT INTO notifications (id, user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, 'order', $5)`,
        [
          notifId,
          listing.seller_id,
          `New Buyer Offer for ${listing.crop_name}!`,
          `${buyerName} (${buyerType}) made an offer of ₹${offeredPricePerUnit.toLocaleString('en-IN')}/${listing.unit} for ${requestedQuantity} ${listing.unit}. Phone: ${buyerPhone}`,
          '/marketplace/my-listings'
        ]
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Your buying offer has been dispatched directly to the farmer via FarmDirect SMS & Portal!',
      inquiryId
    })
  } catch (error: any) {
    console.error('Error submitting market inquiry:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit inquiry' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view inquiries.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')

    if (!listingId) {
      return NextResponse.json({ success: false, error: 'listing_id is required' }, { status: 400 })
    }

    const listing = await queryOne<any>('SELECT seller_id FROM market_listings WHERE id = $1', [listingId])
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && session.userId !== listing.seller_id) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to view inquiries for this listing.' }, { status: 403 })
    }

    const inquiries = await query(
      `SELECT * FROM market_inquiries 
       WHERE listing_id = $1 
       ORDER BY created_at DESC`,
      [listingId]
    )

    return NextResponse.json({ success: true, inquiries })
  } catch (error: any) {
    console.error('Error fetching market inquiries:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
