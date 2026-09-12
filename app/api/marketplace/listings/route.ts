import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'
import { sanitizeText } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') || 'all'
    const cropId = searchParams.get('crop') || ''
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
    const state = searchParams.get('state') || ''
    const sellerId = searchParams.get('seller_id') || ''
    const status = searchParams.get('status') || 'ACTIVE'
    const sortBy = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '30', 10)))
    const offset = (page - 1) * limit

    let countSql = `SELECT COUNT(*) as total FROM market_listings WHERE 1=1`
    let dataSql = `SELECT * FROM market_listings WHERE 1=1`
    const filterParams: any[] = []
    let paramIndex = 1

    if (status !== 'all') {
      countSql += ` AND status = $${paramIndex}`
      dataSql += ` AND status = $${paramIndex}`
      filterParams.push(status)
      paramIndex++
    }

    if (sellerId) {
      countSql += ` AND seller_id = $${paramIndex}`
      dataSql += ` AND seller_id = $${paramIndex}`
      filterParams.push(sellerId)
      paramIndex++
    }

    if (category && category !== 'all') {
      countSql += ` AND category = $${paramIndex}`
      dataSql += ` AND category = $${paramIndex}`
      filterParams.push(category)
      paramIndex++
    }

    if (cropId) {
      countSql += ` AND crop_id = $${paramIndex}`
      dataSql += ` AND crop_id = $${paramIndex}`
      filterParams.push(cropId)
      paramIndex++
    }

    if (state) {
      countSql += ` AND seller_state ILIKE $${paramIndex}`
      dataSql += ` AND seller_state ILIKE $${paramIndex}`
      filterParams.push(`%${state}%`)
      paramIndex++
    }

    if (searchQuery) {
      const searchClause = ` AND (
        crop_name ILIKE $${paramIndex} OR 
        variety ILIKE $${paramIndex + 1} OR 
        seller_district ILIKE $${paramIndex + 2} OR 
        seller_state ILIKE $${paramIndex + 3} OR 
        seller_village ILIKE $${paramIndex + 4} OR 
        description ILIKE $${paramIndex + 5}
      )`
      countSql += searchClause
      dataSql += searchClause
      const pattern = `%${searchQuery}%`
      filterParams.push(pattern, pattern, pattern, pattern, pattern, pattern)
      paramIndex += 6
    }

    // Sort
    if (sortBy === 'price-low') {
      dataSql += ` ORDER BY price_per_unit ASC`
    } else if (sortBy === 'price-high') {
      dataSql += ` ORDER BY price_per_unit DESC`
    } else if (sortBy === 'views') {
      dataSql += ` ORDER BY views_count DESC`
    } else {
      dataSql += ` ORDER BY created_at DESC`
    }

    const totalRow = await queryOne<{ total: string | number }>(countSql, filterParams)
    const totalCount = totalRow ? parseInt(String(totalRow.total), 10) : 0
    const totalPages = Math.ceil(totalCount / limit)

    dataSql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    const queryParams = [...filterParams, limit, offset]
    const rows = await query<any>(dataSql, queryParams)

    const listings = rows.map((r) => {
      let parsedImages = []
      try {
        parsedImages = typeof r.images_json === 'string' ? JSON.parse(r.images_json) : r.images_json || []
      } catch {
        parsedImages = []
      }

      return {
        id: r.id,
        sellerId: r.seller_id,
        sellerName: r.seller_name,
        sellerPhone: r.seller_phone,
        sellerVillage: r.seller_village,
        sellerDistrict: r.seller_district,
        sellerState: r.seller_state,
        category: r.category,
        cropId: r.crop_id,
        cropName: r.crop_name,
        variety: r.variety,
        quantity: Number(r.quantity),
        unit: r.unit,
        minOrderQuantity: Number(r.min_order_quantity),
        pricePerUnit: Number(r.price_per_unit),
        mandiBenchmarkPrice: r.mandi_benchmark_price ? Number(r.mandi_benchmark_price) : null,
        mspPrice: r.msp_price ? Number(r.msp_price) : null,
        isNegotiable: Boolean(r.is_negotiable),
        qualityGrade: r.quality_grade,
        moisturePercent: r.moisture_percent ? Number(r.moisture_percent) : null,
        harvestDate: r.harvest_date,
        isOrganic: Boolean(r.is_organic),
        packagingType: r.packaging_type,
        logisticsMode: r.logistics_mode,
        farmGateAddress: r.farm_gate_address,
        description: r.description,
        images: parsedImages,
        status: r.status,
        viewsCount: Number(r.views_count),
        inquiriesCount: Number(r.inquiries_count),
        createdAt: r.created_at
      }
    })

    return NextResponse.json({
      success: true,
      count: listings.length,
      totalCount,
      totalPages,
      currentPage: page,
      listings
    })
  } catch (error: any) {
    console.error('Error fetching marketplace listings:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionFromCookies()
    const body = await request.json()

    // Seller info from auth or form fallback
    const sellerId = sessionUser?.userId || sessionUser?.id || body.sellerId || 'farmer-demo'
    const sellerName = sanitizeText(sessionUser?.name || body.sellerName || 'Farmer Partner')
    const sellerPhone = sanitizeText(sessionUser?.phone || body.sellerPhone || '+91 98220 12345')
    const sellerVillage = sanitizeText(body.sellerVillage || 'Baramati Rural')
    const sellerDistrict = sanitizeText(body.sellerDistrict || sessionUser?.district || 'Pune')
    const sellerState = sanitizeText(body.sellerState || sessionUser?.state || 'Maharashtra')

    const category = sanitizeText(body.category || 'vegetables')
    const cropId = sanitizeText(body.cropId || 'tomato')
    const cropName = sanitizeText(body.cropName || 'Fresh Produce')
    const variety = sanitizeText(body.variety || 'Desi Farm Quality')
    const quantity = parseFloat(body.quantity)
    const unit = sanitizeText(body.unit || 'Quintal (100 kg)')
    const minOrderQuantity = parseFloat(body.minOrderQuantity || '1')
    const pricePerUnit = parseInt(body.pricePerUnit, 10)
    const mandiBenchmarkPrice = body.mandiBenchmarkPrice ? parseInt(body.mandiBenchmarkPrice, 10) : null
    const mspPrice = body.mspPrice ? parseInt(body.mspPrice, 10) : null
    const isNegotiable = body.isNegotiable !== false
    const qualityGrade = sanitizeText(body.qualityGrade || 'Grade A')
    const moisturePercent = body.moisturePercent ? parseFloat(body.moisturePercent) : null
    const harvestDate = sanitizeText(body.harvestDate || new Date().toISOString().split('T')[0])
    const isOrganic = Boolean(body.isOrganic)
    const packagingType = sanitizeText(body.packagingType || 'Standard Gunny / Crates')
    const logisticsMode = sanitizeText(body.logisticsMode || 'Farm Gate Pickup')
    const farmGateAddress = sanitizeText(body.farmGateAddress || `${sellerVillage}, ${sellerDistrict}`)
    const description = sanitizeText(body.description || `Freshly harvested ${cropName} directly from farmer.`)
    const images = Array.isArray(body.images) && body.images.length > 0 ? body.images : [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
    ]

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ success: false, error: 'Valid quantity greater than 0 is required' }, { status: 400 })
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      return NextResponse.json({ success: false, error: 'Valid asking price per unit is required' }, { status: 400 })
    }

    const id = `list-${cropId}-${Date.now().toString(36)}`

    const insertSql = `
      INSERT INTO market_listings (
        id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
        category, crop_id, crop_name, variety, quantity, unit, min_order_quantity,
        price_per_unit, mandi_benchmark_price, msp_price, is_negotiable, quality_grade,
        moisture_percent, harvest_date, is_organic, packaging_type, logistics_mode,
        farm_gate_address, description, images_json, status, views_count, inquiries_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26, $27, 'ACTIVE', 1, 0
      )
    `

    await execute(insertSql, [
      id, sellerId, sellerName, sellerPhone, sellerVillage, sellerDistrict, sellerState,
      category, cropId, cropName, variety, quantity, unit, minOrderQuantity,
      pricePerUnit, mandiBenchmarkPrice, mspPrice, isNegotiable, qualityGrade,
      moisturePercent, harvestDate, isOrganic, packagingType, logisticsMode,
      farmGateAddress, description, JSON.stringify(images)
    ])

    return NextResponse.json({
      success: true,
      message: 'Produce listed successfully on FarmOS Mandi!',
      listingId: id
    })
  } catch (error: any) {
    console.error('Error creating market listing:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
