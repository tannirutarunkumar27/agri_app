import { NextRequest, NextResponse } from 'next/server'
import { ingestMandiPriceBatch, generateSeedHistoricalDataset } from '@/lib/market/ingestion'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let rawRecords = []
    let source = 'AGMARKNET_DMI'

    const body = await request.json().catch(() => ({}))

    if (body.records && Array.isArray(body.records) && body.records.length > 0) {
      rawRecords = body.records
      source = body.source || source
    } else {
      // Default: Trigger standard Agmarknet dataset generation for recent days
      rawRecords = generateSeedHistoricalDataset()
      source = 'Agmarknet Automated Daily Sync'
    }

    const result = await ingestMandiPriceBatch(rawRecords, source)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${rawRecords.length} records.`,
      result
    })
  } catch (error: any) {
    console.error('API /api/admin/market/sync error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Mandi sync failed' },
      { status: 500 }
    )
  }
}
