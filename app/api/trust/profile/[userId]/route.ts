import { NextResponse } from 'next/server'
import { getTrustProfile, calculateTrustScore } from '@/lib/trust/trust-score-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const profile = await getTrustProfile(userId)
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error('[API /api/trust/profile/[userId] GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process trust profile request' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const breakdown = await calculateTrustScore(userId)
    const profile = await getTrustProfile(userId)
    return NextResponse.json({ success: true, breakdown, profile })
  } catch (error: any) {
    console.error('[API /api/trust/profile/[userId] POST] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process trust profile request' }, { status: 500 })
  }
}
