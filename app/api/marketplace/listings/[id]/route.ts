import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSessionFromCookies()

    // Increment view count
    await execute('UPDATE market_listings SET views_count = views_count + 1 WHERE id = $1', [id])

    const row = await queryOne<any>('SELECT * FROM market_listings WHERE id = $1', [id])
    if (!row) {
      return NextResponse.json({ success: false, error: 'Produce listing not found' }, { status: 404 })
    }

    const isOwnerOrAdmin = Boolean(session && (session.userId === row.seller_id || session.role === 'admin'))

    let parsedImages = []
    try {
      parsedImages = typeof row.images_json === 'string' ? JSON.parse(row.images_json) : row.images_json || []
    } catch {
      parsedImages = []
    }

    const listing = {
      id: row.id,
      sellerId: row.seller_id,
      sellerName: row.seller_name,
      sellerPhone: isOwnerOrAdmin
        ? row.seller_phone
        : (row.seller_phone ? row.seller_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : ''),
      sellerVillage: row.seller_village,
      sellerDistrict: row.seller_district,
      sellerState: row.seller_state,
      category: row.category,
      cropId: row.crop_id,
      cropName: row.crop_name,
      variety: row.variety,
      quantity: Number(row.quantity),
      unit: row.unit,
      minOrderQuantity: Number(row.min_order_quantity),
      pricePerUnit: Number(row.price_per_unit),
      mandiBenchmarkPrice: row.mandi_benchmark_price ? Number(row.mandi_benchmark_price) : null,
      mspPrice: row.msp_price ? Number(row.msp_price) : null,
      isNegotiable: Boolean(row.is_negotiable),
      qualityGrade: row.quality_grade,
      moisturePercent: row.moisture_percent ? Number(row.moisture_percent) : null,
      harvestDate: row.harvest_date,
      isOrganic: Boolean(row.is_organic),
      packagingType: row.packaging_type,
      logisticsMode: row.logistics_mode,
      farmGateAddress: row.farm_gate_address,
      description: row.description,
      images: parsedImages,
      status: row.status,
      viewsCount: Number(row.views_count),
      inquiriesCount: Number(row.inquiries_count),
      createdAt: row.created_at
    }

    // Fetch inquiries for this listing
    const inquiryRows = await query<any>(
      `SELECT * FROM market_inquiries 
       WHERE listing_id = $1 
       ORDER BY created_at DESC`,
      [id]
    )

    const inquiries = inquiryRows.map((iq) => ({
      id: iq.id,
      buyerName: iq.buyer_name,
      buyerPhone: isOwnerOrAdmin
        ? iq.buyer_phone
        : (iq.buyer_phone ? iq.buyer_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : ''),
      buyerType: iq.buyer_type,
      buyerLocation: iq.buyer_location,
      offeredPricePerUnit: Number(iq.offered_price_per_unit),
      requestedQuantity: Number(iq.requested_quantity),
      message: iq.message,
      status: iq.status,
      createdAt: iq.created_at
    }))

    // Fetch similar nearby listings
    const similarRows = await query<any>(
      `SELECT * FROM market_listings 
       WHERE category = $1 AND id != $2 AND status = 'ACTIVE' 
       ORDER BY created_at DESC LIMIT 4`,
      [row.category, id]
    )

    const similarListings = similarRows.map((s) => {
      let sImages = []
      try {
        sImages = typeof s.images_json === 'string' ? JSON.parse(s.images_json) : s.images_json || []
      } catch {
        sImages = []
      }
      return {
        id: s.id,
        cropName: s.crop_name,
        variety: s.variety,
        quantity: Number(s.quantity),
        unit: s.unit,
        pricePerUnit: Number(s.price_per_unit),
        sellerDistrict: s.seller_district,
        qualityGrade: s.quality_grade,
        images: sImages
      }
    })

    return NextResponse.json({
      success: true,
      listing,
      inquiries,
      similarListings
    })
  } catch (error: any) {
    console.error('Error fetching listing details:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch listing details' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to update this listing.' }, { status: 401 })
    }

    const { id } = await context.params
    const listing = await queryOne<any>('SELECT * FROM market_listings WHERE id = $1', [id])
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && session.userId !== listing.seller_id) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to modify this listing.' }, { status: 403 })
    }

    const body = await request.json()

    // Optional status update
    if (body.status) {
      await execute('UPDATE market_listings SET status = $1 WHERE id = $2', [body.status, id])
    }

    // Optional price update
    if (body.pricePerUnit) {
      await execute('UPDATE market_listings SET price_per_unit = $1 WHERE id = $2', [
        parseInt(body.pricePerUnit, 10),
        id
      ])
    }

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating listing:', error)
    return NextResponse.json({ success: false, error: 'Failed to update listing' }, { status: 500 })
  }
}
