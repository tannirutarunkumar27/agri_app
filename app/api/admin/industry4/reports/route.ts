import { NextRequest, NextResponse } from 'next/server'
import { generateManagementReport } from '@/lib/industry4/reports-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'DAILY_MARKET'
    const report = await generateManagementReport(type)

    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/reports GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
