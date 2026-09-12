import fs from 'fs'
import path from 'path'
import { getPool } from '../lib/db'

async function runMigration() {
  console.log('🚀 Running Migration 009: Buyer Demand & Farmer Matching System...')
  const pool = getPool()
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '009_buyer_demand_matching.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ Migration 009 applied successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration 009 failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
