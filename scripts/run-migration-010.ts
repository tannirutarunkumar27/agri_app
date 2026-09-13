import fs from 'fs'
import path from 'path'
import { getPool } from '../lib/db'

async function runMigration() {
  console.log('🚀 Running Migration 010: Industry 4.0 Operations & Intelligence Layer...')
  const pool = getPool()
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '010_industry4_core.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ Migration 010 applied successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration 010 failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
