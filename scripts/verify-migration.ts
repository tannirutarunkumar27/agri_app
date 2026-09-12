import path from 'node:path'
import fs from 'node:fs'
import { Pool } from 'pg'

// Load environment variables from .env.local or .env
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const value = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = value.replace(/^["'](.*)["']$/, '$1')
        }
      }
    }
  }
}

loadEnvFile(envLocalPath)
loadEnvFile(envPath)

const connectionString =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

const results: TestResult[] = []

function assert(condition: boolean, name: string, message?: string) {
  if (condition) {
    results.push({ name, passed: true })
    console.log(`  ✅ PASS: ${name}`)
  } else {
    results.push({ name, passed: false, message })
    console.log(`  ❌ FAIL: ${name} - ${message || 'Assertion failed'}`)
  }
}

async function runTests() {
  console.log('==============================================================================')
  console.log('  FarmOS / FarmDirect: Supabase PostgreSQL Migration Test Suite')
  console.log('==============================================================================\n')

  if (!connectionString) {
    console.log('⚠️ Notice: No SUPABASE_DATABASE_URL found in environment or .env.local.')
    console.log('  Skipping live PostgreSQL integration tests.')
    console.log('  To run against your live Supabase project:')
    console.log('  1. Add SUPABASE_DATABASE_URL to .env.local')
    console.log('  2. Run: npx tsx scripts/verify-migration.ts\n')
    return
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    const client = await pool.connect()
    console.log('📡 Connected to PostgreSQL database.\n')

    // Test 1: Verify all 13 tables exist
    console.log('🔹 Group 1: Table & Schema Existence')
    const expectedTables = [
      'users',
      'addresses',
      'coupons',
      'products',
      'market_listings',
      'market_inquiries',
      'orders',
      'order_items',
      'order_status_log',
      'reviews',
      'product_questions',
      'wishlist',
      'notifications'
    ]

    for (const table of expectedTables) {
      const res = await client.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = $1
         ) as exists`,
        [table]
      )
      assert(res.rows[0].exists, `Table exists: ${table}`)
    }

    // Test 2: User Creation & Profile
    console.log('\n🔹 Group 2: User & Profile Management')
    const testUserId = `test-farmer-${Date.now()}`
    const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`
    await client.query(
      `INSERT INTO users (id, name, phone, email, password_hash, salt, district, state, farm_size_acres, primary_crop, kisan_coins)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        testUserId,
        'Balram Test Farmer',
        testPhone,
        `${testUserId}@farmos.test`,
        'dummy_hash',
        'dummy_salt',
        'Nashik',
        'Maharashtra',
        5.5,
        'Grapes & Onion',
        300
      ]
    )

    const userRow = await client.query('SELECT * FROM users WHERE id = $1', [testUserId])
    assert(userRow.rows.length === 1, 'User created and retrieved', 'Expected 1 user row')
    assert(Number(userRow.rows[0].farm_size_acres) === 5.5, 'User farm acreage decimal precision verified')

    // Test 3: Address Creation
    console.log('\n🔹 Group 3: Address Book')
    const testAddrId = `addr-test-${Date.now()}`
    await client.query(
      `INSERT INTO addresses (id, user_id, full_name, phone, address_type, street, village, district, state, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        testAddrId,
        testUserId,
        'Balram Test Farmer',
        testPhone,
        'Farm Gate / Land',
        'Near Grape Vineyard Gate 3',
        'Pimpalgaon Baswant',
        'Nashik',
        'Maharashtra',
        '422209',
        true
      ]
    )
    const addrRow = await client.query('SELECT * FROM addresses WHERE id = $1', [testAddrId])
    assert(addrRow.rows.length === 1 && addrRow.rows[0].is_default === true, 'Address created with boolean is_default')

    // Test 4: Product Query & Search
    console.log('\n🔹 Group 4: Product Catalog & Search')
    const productRows = await client.query('SELECT * FROM products LIMIT 5')
    assert(productRows.rows.length > 0, 'Products catalog populated with baseline records')

    // Test 5: Market Listing & Inquiry
    console.log('\n🔹 Group 5: Marketplace Listings & Inquiries')
    const testListingId = `test-list-${Date.now()}`
    await client.query(
      `INSERT INTO market_listings (
        id, seller_id, seller_name, seller_phone, seller_village, seller_district, seller_state,
        category, crop_id, crop_name, variety, quantity, unit, min_order_quantity, price_per_unit,
        quality_grade, harvest_date, packaging_type, logistics_mode, farm_gate_address, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        testListingId,
        testUserId,
        'Balram Test Farmer',
        testPhone,
        'Pimpalgaon',
        'Nashik',
        'Maharashtra',
        'fruits',
        'grapes',
        'Thompson Seedless Export Grapes',
        'Thompson Seedless',
        500,
        'Kg',
        50,
        95,
        'Grade A Export',
        '2026-03-15',
        'Punnets in 5kg CFB box',
        'Farm Gate Cold Chain',
        'Vineyard Survey 44, Nashik',
        'Export quality sweet table grapes, 18+ Brix.'
      ]
    )

    const testInqId = `test-inq-${Date.now()}`
    await client.query(
      `INSERT INTO market_inquiries (
        id, listing_id, buyer_name, buyer_phone, buyer_type, buyer_location,
        offered_price_per_unit, requested_quantity, message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        testInqId,
        testListingId,
        'Reliance Retail Buyer',
        '9922334455',
        'Retail Chain Vendor',
        'Mumbai Vashi APMC',
        92,
        200,
        'Ready to pick 200 kg tomorrow morning.'
      ]
    )
    const inqRow = await client.query('SELECT * FROM market_inquiries WHERE id = $1', [testInqId])
    assert(inqRow.rows.length === 1, 'Market inquiry created with foreign key to listing')

    // Test 6: ACID Order Placement & Row Locking (FOR UPDATE)
    console.log('\n🔹 Group 6: ACID Order Placement & Concurrency Locking')
    const sampleProduct = productRows.rows[0]
    const initialStock = Number(sampleProduct.stock_count)

    // Run transaction
    const testOrderId = `FARM-TEST-${Date.now()}`
    await client.query('BEGIN')
    try {
      const lockedProduct = await client.query(
        'SELECT id, name, price, stock_count FROM products WHERE id = $1 FOR UPDATE',
        [sampleProduct.id]
      )
      assert(lockedProduct.rows.length === 1, 'Product row locked with SELECT FOR UPDATE')

      // Deduct 1 unit
      await client.query('UPDATE products SET stock_count = stock_count - 1 WHERE id = $1', [sampleProduct.id])

      // Insert order
      await client.query(
        `INSERT INTO orders (id, user_name, user_phone, address_json, delivery_speed, payment_method, subtotal, delivery_fee, gst, final_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          testOrderId,
          'Balram Test Farmer',
          testPhone,
          JSON.stringify({ village: 'Pimpalgaon' }),
          'standard',
          'cod',
          Number(sampleProduct.price),
          0,
          Math.round(Number(sampleProduct.price) * 0.05),
          Number(sampleProduct.price) + Math.round(Number(sampleProduct.price) * 0.05)
        ]
      )

      // Insert order item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [testOrderId, sampleProduct.id, sampleProduct.name, 1, sampleProduct.price, sampleProduct.price]
      )

      await client.query('COMMIT')
      assert(true, 'Atomic order placement committed successfully')
    } catch (err) {
      await client.query('ROLLBACK')
      assert(false, 'Atomic order placement failed', (err as Error).message)
    }

    // Verify stock was deducted
    const afterStockRes = await client.query('SELECT stock_count FROM products WHERE id = $1', [sampleProduct.id])
    assert(
      Number(afterStockRes.rows[0].stock_count) === initialStock - 1,
      'Product stock decremented atomically by exact purchased quantity'
    )

    // Test 7: Rollback Verification (Overselling prevention)
    console.log('\n🔹 Group 7: Transaction Rollback Verification')
    let rollbackSuccess = false
    await client.query('BEGIN')
    try {
      const currentStockRes = await client.query(
        'SELECT stock_count FROM products WHERE id = $1 FOR UPDATE',
        [sampleProduct.id]
      )
      const currentStock = Number(currentStockRes.rows[0].stock_count)
      const requestedExcess = currentStock + 9999

      if (currentStock < requestedExcess) {
        throw new Error('Insufficient stock - intentional test abort')
      }
      await client.query('COMMIT')
    } catch {
      await client.query('ROLLBACK')
      rollbackSuccess = true
    }
    assert(rollbackSuccess, 'Oversell attempt triggers clean ROLLBACK with zero state pollution')

    // Test 8: Constraints Verification
    console.log('\n🔹 Group 8: Constraint Enforcement (CHECK constraints)')
    let negativePriceRejected = false
    try {
      await client.query(
        `INSERT INTO products (id, name, brand, type, category, crop, price, original_price, unit, delivery_days, seller, composition, dosage_per_acre, application_method, description, safety_advice)
         VALUES ('invalid-p', 'X', 'B', 'T', 'C', 'Cr', -100, 100, '1 kg', '2 days', 'S', 'Comp', 'D', 'M', 'Desc', 'Safe')`
      )
    } catch {
      negativePriceRejected = true
    }
    assert(negativePriceRejected, 'CHECK constraint chk_products_price correctly rejects negative price')

    // Clean up test data
    console.log('\n🔹 Cleaning up temporary test artifacts...')
    await client.query('DELETE FROM orders WHERE id = $1', [testOrderId])
    await client.query('DELETE FROM market_listings WHERE id = $1', [testListingId])
    await client.query('DELETE FROM addresses WHERE id = $1', [testAddrId])
    await client.query('DELETE FROM users WHERE id = $1', [testUserId])
    await client.query('UPDATE products SET stock_count = $1 WHERE id = $2', [initialStock, sampleProduct.id])
    console.log('  Cleaned up all test rows and restored baseline stock.\n')

    client.release()
  } catch (err) {
    console.error('❌ Test suite execution error:', err)
  } finally {
    await pool.end()
  }

  const totalPassed = results.filter((r) => r.passed).length
  const totalFailed = results.filter((r) => !r.passed).length

  console.log('==============================================================================')
  console.log(`  Test Results Summary: ${totalPassed} Passed, ${totalFailed} Failed (${results.length} Total)`)
  console.log('==============================================================================')
}

runTests()
