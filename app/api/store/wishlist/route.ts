import { NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getSessionFromCookies()
    const userId = session?.userId || searchParams.get('userId') || 'guest-farmer'

    const rows = await query<any>(
      `SELECT p.* FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    )

    const items = rows.map((r) => {
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
        reviewCount: Number(r.review_count),
        stockCount,
        inStock,
        deliveryDays: r.delivery_days,
        seller: r.seller,
        composition: r.composition,
        npkRatio: r.npk_ratio,
        dosagePerAcre: r.dosage_per_acre,
        applicationMethod: r.application_method,
        description: r.description,
        safetyAdvice: r.safety_advice,
        features: parsedFeatures,
        suitableCrops: parsedSuitable
      }
    })

    return NextResponse.json({ success: true, count: items.length, items, userId })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await getSessionFromCookies()
    const { productId } = body
    const userId = session?.userId || body.userId || 'guest-farmer'

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 })
    }

    // Toggle wishlist
    const exists = await queryOne(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    )

    if (exists) {
      await execute('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [userId, productId])
      return NextResponse.json({ success: true, action: 'removed', inWishlist: false })
    } else {
      await execute(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, productId]
      )
      return NextResponse.json({ success: true, action: 'added', inWishlist: true })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
