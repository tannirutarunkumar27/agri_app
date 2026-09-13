import { NextResponse } from 'next/server'
import { getDisputeById, resolveDispute, DisputeResolution } from '@/lib/trust/dispute-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dispute = await getDisputeById(id)

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, dispute })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id] GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      adminId = 'admin-system',
      resolution,
      resolutionNotes,
      settlementAmountFarmer,
      settlementAmountBuyer
    } = body

    if (!resolution || settlementAmountFarmer === undefined || settlementAmountBuyer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required resolution fields: resolution, settlementAmountFarmer, settlementAmountBuyer' },
        { status: 400 }
      )
    }

    const resolved = await resolveDispute({
      disputeId: id,
      adminId,
      resolution: resolution as DisputeResolution,
      resolutionNotes: resolutionNotes || '',
      settlementAmountFarmer: Number(settlementAmountFarmer),
      settlementAmountBuyer: Number(settlementAmountBuyer)
    })

    return NextResponse.json({ success: true, dispute: resolved })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id] PATCH] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
