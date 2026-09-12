import { query, queryOne, execute, runTransaction } from './db'
import { PRODUCTS, DISCOUNT_COUPONS, SAMPLE_FARM_ADDRESSES } from './store-data'
import { hashPassword } from './auth'

let isInitialized = false

/**
 * Idempotently verifies and bootstraps essential tables and seed data on PostgreSQL.
 */
export async function initializeDatabase() {
  if (isInitialized) return

  try {
    // Check if products table exists
    const tableCheck = await queryOne<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists;
    `)

    if (!tableCheck || !tableCheck.exists) {
      console.log('[FarmOS DB] Note: Database schema appears uninitialized. Please run supabase migrations in supabase/migrations/ or migration script.')
      return
    }

    // Check if products table has rows
    const productCountRow = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM products;'
    )
    const productCount = parseInt(productCountRow?.count || '0', 10)

    if (productCount === 0) {
      console.log('[FarmOS DB] Seeding initial products...')
      await runTransaction(async (tx) => {
        for (const p of PRODUCTS) {
          await tx.execute(
            `INSERT INTO products (
              id, name, brand, type, category, crop, price, original_price,
              unit, badge, tone, rating, review_count, stock_count, in_stock,
              delivery_days, seller, composition, npk_ratio, dosage_per_acre,
              application_method, description, safety_advice, features_json, suitable_crops_json, image_url
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14, $15,
              $16, $17, $18, $19, $20,
              $21, $22, $23, $24, $25, $26
            ) ON CONFLICT (id) DO NOTHING;`,
            [
              p.id,
              p.name,
              p.brand,
              p.type,
              p.category,
              p.crop,
              p.price,
              p.originalPrice,
              p.unit,
              p.badge,
              p.tone,
              p.rating,
              p.reviewCount,
              p.stockCount,
              p.inStock,
              p.deliveryDays,
              p.seller,
              p.composition,
              p.npkRatio || null,
              p.dosagePerAcre,
              p.applicationMethod,
              p.description,
              p.safetyAdvice,
              JSON.stringify(p.features),
              JSON.stringify(p.suitableCrops),
              p.imageUrl || null
            ]
          )

          for (const r of p.reviews) {
            await tx.execute(
              `INSERT INTO reviews (
                id, product_id, farmer_name, location, rating, comment, crop_grown, verified
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              ON CONFLICT (id) DO NOTHING;`,
              [
                r.id,
                p.id,
                r.farmerName,
                r.location,
                r.rating,
                r.comment,
                r.cropGrown,
                r.verified
              ]
            )
          }
        }
      })
    }

    isInitialized = true
  } catch (error) {
    // Non-fatal warning if database credentials are not yet configured
    console.warn('[FarmOS DB] Initialization check notice:', (error as Error).message)
  }
}
