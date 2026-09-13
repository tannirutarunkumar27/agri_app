import { NextResponse } from 'next/server'
import { getDataGovernanceReport } from '@/lib/industry4/governance-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const report = await getDataGovernanceReport()
    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/data-quality GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
