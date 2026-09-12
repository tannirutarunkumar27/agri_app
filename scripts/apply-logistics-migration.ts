import path from 'node:path'
import fs from 'node:fs'
import { Pool } from 'pg'

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

async function main() {
  console.log('🚀 Applying Migration 007 (Logistics & Transporter Marketplace)...')

  if (!connectionString) {
    console.error('❌ Error: No database connection string found in environment.')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    const client = await pool.connect()
    console.log('Connected to PostgreSQL.')

    const migrationPath = path.resolve(process.cwd(), 'supabase', 'migrations', '007_logistics_marketplace.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    await client.query(sql)
    console.log('✅ Successfully applied 007_logistics_marketplace.sql!')

    // Check newly created tables
    const tables = [
      'transporters',
      'transporter_vehicles',
      'delivery_jobs',
      'delivery_bids',
      'delivery_status_log',
      'transporter_ratings'
    ]

    console.log('\nVerifying tables:')
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) as c FROM "${t}"`)
      console.log(` - Table "${t}": ${res.rows[0].c} records`)
    }

    client.release()
    await pool.end()
    console.log('\nMigration complete.')
  } catch (err) {
    console.error('❌ Error applying migration:', err)
    process.exit(1)
  }
}

main()
