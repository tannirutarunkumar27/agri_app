import { NextResponse } from 'next/server'
import {
  getMarketKPIs,
  getFarmerKPIs,
  getBuyerKPIs,
  getOperationsKPIs,
  getLogisticsKPIs,
  getFarmerRealizationAnalytics
} from '@/lib/industry4/kpi-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [market, farmer, buyer, operations, logistics, realization] = await Promise.all([
      getMarketKPIs(),
      getFarmerKPIs(),
      getBuyerKPIs(),
      getOperationsKPIs(),
      getLogisticsKPIs(),
      getFarmerRealizationAnalytics()
    ])

    return NextResponse.json({
      success: true,
      data: {
        market,
        farmer,
        buyer,
        operations,
        logistics,
        realization
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API /api/admin/industry4/kpis] error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
