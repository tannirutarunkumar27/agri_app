import { NextResponse } from 'next/server'
import { createDispute, getDisputes, DisputeReason, DisputePriority, DisputeStatus } from '@/lib/trust/dispute-service'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to view disputes.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as DisputeStatus | null
    const userId = searchParams.get('userId')
    const priority = searchParams.get('priority') as DisputePriority | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50

    // Non-admins can only see their own disputes
    const effectiveUserId = session.role === 'admin' ? (userId || undefined) : session.userId

    const disputes = await getDisputes({
      status: status || undefined,
      userId: effectiveUserId,
      priority: priority || undefined,
      limit
    })

    return NextResponse.json({ success: true, disputes })
  } catch (error: any) {
    console.error('[API /api/trust/disputes GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to retrieve disputes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to file a dispute.' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderId,
      raisedAgainst,
      reason,
      description,
      disputedAmount,
      claimedWeightLossKg,
      qualityGradeClaimed,
      priorityOverride,
      initialEvidence
    } = body

    const raisedBy = session.role === 'admin' ? (body.raisedBy || session.userId) : session.userId

    if (!orderId || !raisedBy || !raisedAgainst || !reason || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required dispute fields: orderId, raisedAgainst, reason, description' },
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
    return NextResponse.json({ success: false, error: 'Failed to create dispute' }, { status: 500 })
  }
}
