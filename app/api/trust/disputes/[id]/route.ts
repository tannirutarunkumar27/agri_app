import { NextResponse } from 'next/server'
import { getDisputeById, resolveDispute, DisputeResolution } from '@/lib/trust/dispute-service'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view dispute details.' }, { status: 401 })
    }

    const { id } = await params
    const dispute = await getDisputeById(id)

    if (!dispute) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && dispute.raisedBy !== session.userId && dispute.raisedAgainst !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden: You are not authorized to view this dispute.' }, { status: 403 })
    }

    return NextResponse.json({ success: true, dispute })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id] GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to retrieve dispute' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to resolve disputes.' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Only platform administrators can resolve disputes.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const {
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
      adminId: session.userId,
      resolution: resolution as DisputeResolution,
      resolutionNotes: resolutionNotes || '',
      settlementAmountFarmer: Number(settlementAmountFarmer),
      settlementAmountBuyer: Number(settlementAmountBuyer)
    })

    return NextResponse.json({ success: true, dispute: resolved })
  } catch (error: any) {
    console.error('[API /api/trust/disputes/[id] PATCH] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to resolve dispute' }, { status: 500 })
  }
}
