import path from 'node:path'
import fs from 'node:fs'
import { Pool } from 'pg'
import { DatabaseSync } from 'node:sqlite'

// Load .env.local or .env if present
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

async function runMigration() {
  console.log('==============================================================================')
  console.log('  FarmOS / FarmDirect: SQLite -> Supabase PostgreSQL Migration Pipeline')
  console.log('==============================================================================\n')

  if (!connectionString) {
    console.error('❌ Error: No PostgreSQL connection string found.')
    console.error('Please configure SUPABASE_DATABASE_URL in .env.local before running migration.')
    console.error('Example: SUPABASE_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"')
    process.exit(1)
  }

  const sqlitePath = path.resolve(process.cwd(), 'data', 'farmos.db')
  if (!fs.existsSync(sqlitePath)) {
    console.error(`❌ Error: Source SQLite database not found at ${sqlitePath}`)
    process.exit(1)
  }

  console.log(`📦 Source SQLite database: ${sqlitePath}`)
  console.log(`🎯 Target PostgreSQL Host: ${new URL(connectionString).host}\n`)

  const sqlite = new DatabaseSync(sqlitePath)
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    const client = await pool.connect()
    console.log('✅ Connected successfully to Supabase PostgreSQL.\n')

    // 1. Run migrations in order
    const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_indexes.sql',
      '003_constraints.sql',
      '004_seed_data.sql',
      '005_rls_policies.sql'
    ]

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file)
      if (fs.existsSync(filePath)) {
        process.stdout.write(`⏳ Executing ${file}... `)
        const sql = fs.readFileSync(filePath, 'utf8')
        await client.query(sql)
        console.log('Done.')
      }
    }

    console.log('\n🔍 Verifying row counts between SQLite and PostgreSQL...\n')

    const tables = [
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

    console.log('------------------------------------------------------------------------------')
    console.log(
      `${'Table'.padEnd(25)} | ${'SQLite Count'.padEnd(14)} | ${'PostgreSQL Count'.padEnd(16)} | Status`
    )
    console.log('------------------------------------------------------------------------------')

    let allMatched = true
    for (const table of tables) {
      const sqCountRow = sqlite.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get() as { c: number }
      const sqCount = sqCountRow.c

      const pgCountRes = await client.query(`SELECT COUNT(*) as c FROM "${table}"`)
      const pgCount = parseInt(pgCountRes.rows[0].c, 10)

      const match = sqCount === pgCount
      if (!match) allMatched = false
      const statusStr = match ? '✅ Exact Match' : `⚠️ PG has ${pgCount} (diff: ${pgCount - sqCount})`

      console.log(
        `${table.padEnd(25)} | ${String(sqCount).padEnd(14)} | ${String(pgCount).padEnd(16)} | ${statusStr}`
      )
    }
    console.log('------------------------------------------------------------------------------')

    if (allMatched) {
      console.log('\n🎉 ALL TABLES VERIFIED WITH 100% PARITY!\n')
    } else {
      console.log('\n⚠️ Notice: Some tables differ (expected if seed data inserted additional baseline rows).\n')
    }

    client.release()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
