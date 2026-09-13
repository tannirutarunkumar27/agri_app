import { NextRequest, NextResponse } from 'next/server'
import { getActiveAnomalies, runAnomalyDetectionScan, resolveAnomaly } from '@/lib/industry4/anomaly-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const anomalies = await getActiveAnomalies(category)

    return NextResponse.json({
      success: true,
      data: anomalies,
      count: anomalies.length
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/anomalies GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await runAnomalyDetectionScan()
    return NextResponse.json({
      success: true,
      message: `Statistical scan completed. ${result.detectedCount} active anomalies monitored.`,
      data: result.anomalies,
      detectedCount: result.detectedCount
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/anomalies POST] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { anomalyId } = body
    if (!anomalyId) {
      return NextResponse.json({ success: false, error: 'anomalyId is required' }, { status: 400 })
    }

    const success = await resolveAnomaly(anomalyId)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('[API /api/admin/industry4/anomalies PATCH] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
