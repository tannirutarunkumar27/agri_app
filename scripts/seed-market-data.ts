import path from 'node:path'
import fs from 'node:fs'
import { Pool } from 'pg'
import { ingestMandiPriceBatch, generateSeedHistoricalDataset } from '../lib/market/ingestion'

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

async function seed() {
  console.log('🌾 Seeding Official Mandi Market Data...')
  const rawRecords = generateSeedHistoricalDataset()
  console.log(`Generated ${rawRecords.length} historical daily mandi price observations.`)

  const summary = await ingestMandiPriceBatch(rawRecords, 'Directorate of Marketing & Inspection, Agmarknet')

  console.log('\n✅ Ingestion Results:')
  console.log(` - Batch ID: ${summary.batchId}`)
  console.log(` - Records Received: ${summary.recordsReceived}`)
  console.log(` - Records Ingested & Validated: ${summary.recordsValid}`)
  console.log(` - Records Duplicate / Skipped: ${summary.recordsDuplicate}`)
  console.log(` - Records Rejected: ${summary.recordsRejected}`)
  console.log(` - Execution Duration: ${summary.executionTimeMs} ms`)
  console.log(` - Status: ${summary.status}`)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
