import { NextResponse } from 'next/server'
import { createDispute, getDisputes, DisputeReason, DisputePriority, DisputeStatus } from '@/lib/trust/dispute-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as DisputeStatus | null
    const userId = searchParams.get('userId')
    const priority = searchParams.get('priority') as DisputePriority | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50

    const disputes = await getDisputes({
      status: status || undefined,
      userId: userId || undefined,
      priority: priority || undefined,
      limit
    })

    return NextResponse.json({ success: true, disputes })
  } catch (error: any) {
    console.error('[API /api/trust/disputes GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      orderId,
      raisedBy,
      raisedAgainst,
      reason,
      description,
      disputedAmount,
      claimedWeightLossKg,
      qualityGradeClaimed,
      priorityOverride,
      initialEvidence
    } = body

    if (!orderId || !raisedBy || !raisedAgainst || !reason || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required dispute fields: orderId, raisedBy, raisedAgainst, reason, description' },
        { status: 400 }
      )
    }

    const dispute = await createDispute({
      orderId,
      raisedBy,
      raisedAgainst,
      reason: reason as DisputeReason,
      description,
      disputedAmount: disputedAmount !== undefined ? Number(disputedAmount) : undefined,
      claimedWeightLossKg: claimedWeightLossKg !== undefined ? Number(claimedWeightLossKg) : undefined,
      qualityGradeClaimed,
      priorityOverride: priorityOverride as DisputePriority,
      initialEvidence
    })

    return NextResponse.json({ success: true, dispute })
  } catch (error: any) {
    console.error('[API /api/trust/disputes POST] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
