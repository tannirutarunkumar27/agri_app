import { NextRequest, NextResponse } from 'next/server'
import {
  getQualityRecords,
  createQualityRecord,
  getQualitySummaryStats
} from '@/lib/industry4/quality-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const summaryOnly = searchParams.get('summary') === 'true'

    if (summaryOnly) {
      const stats = await getQualitySummaryStats()
      return NextResponse.json({ success: true, data: stats })
    }

    const [stats, records] = await Promise.all([
      getQualitySummaryStats(),
      getQualityRecords(50)
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats,
        records
      }
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/quality GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.lotId || !body.commodityName || !body.grade || !body.inspectionResult) {
      return NextResponse.json(
        { success: false, error: 'Missing required quality inspection fields' },
        { status: 400 }
      )
    }

    const id = await createQualityRecord({
      lotId: body.lotId,
      listingId: body.listingId,
      orderId: body.orderId,
      commodityId: body.commodityId,
      commodityName: body.commodityName,
      variety: body.variety,
      grade: body.grade,
      moisturePercent: body.moisturePercent ? parseFloat(body.moisturePercent) : undefined,
      attributes: body.attributes,
      inspectionResult: body.inspectionResult,
      evidenceUrl: body.evidenceUrl,
      notes: body.notes,
      inspectorSource: body.inspectorSource,
      inspectorName: body.inspectorName
    })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('[API /api/admin/industry4/quality POST] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
