import { NextRequest, NextResponse } from 'next/server'
import { getMarketLiquiditySummary } from '@/lib/market/liquidity'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const liquidity = await getMarketLiquiditySummary()
    return NextResponse.json({
      success: true,
      count: liquidity.length,
      liquidity
    })
  } catch (error: any) {
    console.error('API /api/market/liquidity error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch market liquidity metrics' },
      { status: 500 }
    )
  }
}
