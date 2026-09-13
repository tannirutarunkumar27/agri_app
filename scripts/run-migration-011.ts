import fs from 'fs'
import path from 'path'
import { getPool } from '../lib/db'

async function runMigration() {
  console.log('🚀 Running Migration 011: Trust, Quality, Verification & Dispute Management Layer...')
  const pool = getPool()
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '011_trust_verification_disputes.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ Migration 011 applied successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration 011 failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
