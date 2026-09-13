import { NextResponse } from 'next/server'
import { getDisputes, resolveDispute, DisputeResolution } from '@/lib/trust/dispute-service'
import { getRiskFlags, resolveRiskFlag } from '@/lib/trust/risk-rules'
import { query, queryOne } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const disputes = await getDisputes({ status: status || undefined })
    const riskFlags = await getRiskFlags({ status: 'DETECTED' })

    const metrics = await queryOne<any>(`
      SELECT 
        COUNT(*) as total_disputes,
        COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW', 'EVIDENCE_REQUIRED')) as active_disputes,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_disputes,
        COALESCE(SUM(disputed_amount) FILTER (WHERE status IN ('OPEN', 'UNDER_REVIEW')), 0) as total_frozen_escrow
      FROM disputes;
    `)

    return NextResponse.json({
      success: true,
      metrics: {
        totalDisputes: parseInt(metrics?.total_disputes || '0', 10),
        activeDisputes: parseInt(metrics?.active_disputes || '0', 10),
        resolvedDisputes: parseInt(metrics?.resolved_disputes || '0', 10),
        totalFrozenEscrow: Number(metrics?.total_frozen_escrow || 0)
      },
      disputes,
      riskFlags
    })
  } catch (error: any) {
    console.error('[API /api/admin/disputes GET] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      type = 'DISPUTE_RESOLUTION', 
      disputeId, 
      flagId, 
      resolution, 
      resolutionNotes, 
      settlementAmountFarmer, 
      settlementAmountBuyer, 
      flagStatus,
      adminId = 'admin-system'
    } = body

    if (type === 'RISK_FLAG_UPDATE') {
      if (!flagId || !flagStatus) {
        return NextResponse.json({ success: false, error: 'Missing flagId or flagStatus' }, { status: 400 })
      }
      await resolveRiskFlag({
        flagId,
        adminId,
        newStatus: flagStatus,
        notes: resolutionNotes
      })
      return NextResponse.json({ success: true, message: 'Risk flag status updated' })
    }

    if (!disputeId || !resolution || settlementAmountFarmer === undefined || settlementAmountBuyer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required dispute resolution fields' },
        { status: 400 }
      )
    }

    const resolved = await resolveDispute({
      disputeId,
      adminId,
      resolution: resolution as DisputeResolution,
      resolutionNotes: resolutionNotes || '',
      settlementAmountFarmer: Number(settlementAmountFarmer),
      settlementAmountBuyer: Number(settlementAmountBuyer)
    })

    return NextResponse.json({ success: true, dispute: resolved })
  } catch (error: any) {
    console.error('[API /api/admin/disputes POST] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
