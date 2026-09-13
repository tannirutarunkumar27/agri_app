import { NextRequest, NextResponse } from 'next/server'
import { getLotTraceability } from '@/lib/industry4/traceability-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lot identifier required' }, { status: 400 })
    }

    const traceability = await getLotTraceability(id)
    if (!traceability) {
      return NextResponse.json({ success: false, error: 'Produce lot not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: traceability
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/traceability/[id] GET] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
