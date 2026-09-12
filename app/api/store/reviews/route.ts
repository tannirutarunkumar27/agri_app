import { NextResponse } from 'next/server'
import { query, runTransaction } from '@/lib/db'
import { sanitizeText } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const ratingFilter = searchParams.get('rating')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId parameter is required.' }, { status: 400 })
    }

    let sql = 'SELECT * FROM reviews WHERE product_id = $1'
    const params: any[] = [productId]

    if (ratingFilter && Number(ratingFilter) > 0) {
      sql += ' AND rating = $2'
      params.push(Number(ratingFilter))
    }

    sql += ' ORDER BY created_at DESC'

    const reviews = await query<any>(sql, params)

    // Calculate star breakdown (Amazon style)
    const allReviewsForProduct = await query<{ rating: number }>(
      'SELECT rating FROM reviews WHERE product_id = $1',
      [productId]
    )

    const totalReviews = allReviewsForProduct.length
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let ratingSum = 0

    for (const r of allReviewsForProduct) {
      const rVal = Number(r.rating)
      distribution[rVal] = (distribution[rVal] || 0) + 1
      ratingSum += rVal
    }

    const averageRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '5.0'

    return NextResponse.json({
      success: true,
      productId,
      averageRating: Number(averageRating),
      totalReviews,
      distribution,
      reviews
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, farmerName, location, rating, comment, cropGrown } = body

    if (!productId || !farmerName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required review fields.' },
        { status: 400 }
      )
    }

    const numRating = Math.min(5, Math.max(1, Math.round(Number(rating))))
    const cleanFarmerName = sanitizeText(farmerName)
    const cleanLocation = sanitizeText(location || 'India')
    const cleanComment = sanitizeText(comment)
    const cleanCropGrown = sanitizeText(cropGrown || 'General Crops')

    if (cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please write a review comment of at least 5 characters.' },
        { status: 400 }
      )
    }

    const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // ACID transaction: insert review and update product rating and review_count
    await runTransaction(async (tx) => {
      // 1. Insert review
      await tx.execute(
        `INSERT INTO reviews (id, product_id, farmer_name, location, rating, comment, crop_grown, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [
          reviewId,
          productId,
          cleanFarmerName,
          cleanLocation,
          numRating,
          cleanComment,
          cleanCropGrown
        ]
      )

      // 2. Recalculate average rating for product
      const stats = await tx.queryOne<{ avg_rating: string | number; total: string | number }>(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = $1',
        [productId]
      )

      const roundedRating = Number(Number(stats?.avg_rating || 5).toFixed(1))
      const totalCount = parseInt(String(stats?.total || '1'), 10)

      // 3. Update products table atomically
      await tx.execute(
        'UPDATE products SET rating = $1, review_count = $2 WHERE id = $3',
        [roundedRating, totalCount, productId]
      )
    })

    return NextResponse.json({ success: true, message: 'Review added and product rating updated atomically.' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
