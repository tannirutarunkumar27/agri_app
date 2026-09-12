import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') || 'All'
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
    const sortBy = searchParams.get('sort') || 'featured'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '24', 10)))
    const offset = (page - 1) * limit

    let countSql = `SELECT COUNT(*) as total FROM products p WHERE 1=1`
    let dataSql = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as real_review_count,
        (SELECT COUNT(*) FROM product_questions q WHERE q.product_id = p.id) as question_count
      FROM products p
      WHERE 1=1
    `
    const filterParams: any[] = []
    let paramIndex = 1

    if (category !== 'All') {
      const catClause = ` AND (p.category = $${paramIndex} OR p.type ILIKE $${paramIndex + 1})`
      countSql += catClause
      dataSql += catClause
      filterParams.push(category, `%${category}%`)
      paramIndex += 2
    }

    if (searchQuery) {
      const searchClause = ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.crop ILIKE $${paramIndex + 1} OR 
        p.composition ILIKE $${paramIndex + 2} OR 
        p.brand ILIKE $${paramIndex + 3}
      )`
      countSql += searchClause
      dataSql += searchClause
      const likePattern = `%${searchQuery}%`
      filterParams.push(likePattern, likePattern, likePattern, likePattern)
      paramIndex += 4
    }

    // Sorting
    if (sortBy === 'price-low') {
      dataSql += ` ORDER BY p.price ASC`
    } else if (sortBy === 'price-high') {
      dataSql += ` ORDER BY p.price DESC`
    } else if (sortBy === 'rating') {
      dataSql += ` ORDER BY p.rating DESC, p.review_count DESC`
    } else {
      dataSql += ` ORDER BY p.created_at DESC`
    }

    // Count total matches
    const totalRow = await queryOne<{ total: string | number }>(countSql, filterParams)
    const totalCount = totalRow ? parseInt(String(totalRow.total), 10) : 0
    const totalPages = Math.ceil(totalCount / limit)

    // Pagination
    dataSql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    const queryParams = [...filterParams, limit, offset]

    const rows = await query<any>(dataSql, queryParams)

    const products = rows.map((r) => {
      let parsedFeatures = []
      let parsedSuitable = []

      try {
        parsedFeatures = typeof r.features_json === 'string' ? JSON.parse(r.features_json) : r.features_json || []
      } catch {
        parsedFeatures = []
      }

      try {
        parsedSuitable = typeof r.suitable_crops_json === 'string' ? JSON.parse(r.suitable_crops_json) : r.suitable_crops_json || []
      } catch {
        parsedSuitable = []
      }

      const stockCount = Number(r.stock_count)
      const inStock = Boolean(r.in_stock) && stockCount > 0

      return {
        id: r.id,
        name: r.name,
        brand: r.brand,
        type: r.type,
        category: r.category,
        crop: r.crop,
        price: Number(r.price),
        originalPrice: Number(r.original_price),
        unit: r.unit,
        badge: r.badge,
        tone: r.tone,
        rating: Number(r.rating),
        reviewCount: parseInt(String(r.real_review_count || r.review_count), 10),
        stockCount,
        inStock,
        isLowStock: stockCount > 0 && stockCount < 10,
        deliveryDays: r.delivery_days,
        seller: r.seller,
        composition: r.composition,
        npkRatio: r.npk_ratio,
        dosagePerAcre: r.dosage_per_acre,
        applicationMethod: r.application_method,
        description: r.description,
        safetyAdvice: r.safety_advice,
        features: parsedFeatures,
        suitableCrops: parsedSuitable,
        questionCount: parseInt(String(r.question_count || 0), 10),
        imageUrl: r.image_url || null
      }
    })

    return NextResponse.json({
      success: true,
      count: products.length,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      products
    })
  } catch (error: any) {
    console.error('Error fetching products from PostgreSQL database:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
