import { NextResponse } from 'next/server'
import { calculateIndustry4Maturity } from '@/lib/industry4/maturity-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const report = await calculateIndustry4Maturity()
    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/maturity GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
