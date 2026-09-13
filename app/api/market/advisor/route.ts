import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generatePriceForecast, HistoricalDataPoint } from '@/lib/market/forecasting'
import { evaluateSellOrHold, AdvisorParams, NearbyMarketOption } from '@/lib/market/advisor'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      commodity_id,
      market_id,
      quantity = 50,
      unit = 'Quintal',
      storage_cost_per_month = 45,
      target_holding_days = 30
    } = body

    if (!commodity_id) {
      return NextResponse.json(
        { success: false, error: 'commodity_id is required' },
        { status: 400 }
      )
    }

    // 1. Fetch commodity and market names
    const commRows = await query('SELECT name FROM commodities WHERE id = $1', [commodity_id])
    const commodityName = commRows.length > 0 ? commRows[0].name : 'Commodity'

    let marketName = 'Regional Mandis'
    if (market_id) {
      const mktRows = await query('SELECT market_name FROM markets WHERE id = $1', [market_id])
      if (mktRows.length > 0) marketName = mktRows[0].market_name
    }

    // 2. Fetch historical observations
    const histConditions: string[] = ['mp.commodity_id = $1']
    const histParams: any[] = [commodity_id]
    if (market_id) {
      histConditions.push('mp.market_id = $2')
      histParams.push(market_id)
    }

    const histSql = `
      SELECT 
        mp.arrival_date,
        ROUND(MIN(mp.minimum_price), 2) as min_price,
        ROUND(MAX(mp.maximum_price), 2) as max_price,
        ROUND(AVG(mp.modal_price), 2) as modal_price,
        ROUND(SUM(mp.arrival_quantity), 2) as arrival_quantity
      FROM market_prices mp
      WHERE ${histConditions.join(' AND ')}
      GROUP BY mp.arrival_date
      ORDER BY mp.arrival_date ASC
    `

    const histRows = await query(histSql, histParams)

    if (histRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No market price history available to formulate an advisor decision.'
      }, { status: 404 })
    }

    const history: HistoricalDataPoint[] = histRows.map(r => ({
      date: r.arrival_date,
      minPrice: Number(r.min_price || r.modal_price),
      maxPrice: Number(r.max_price || r.modal_price),
      modalPrice: Number(r.modal_price),
      arrivals: Number(r.arrival_quantity)
    }))

    const currentPrice = history[history.length - 1].modalPrice

    // 3. Generate multi-horizon forecasts
    const fullForecast = generatePriceForecast(
      history,
      commodity_id,
      market_id || 'all-mandis'
    )

    // Select target horizon forecast (default 30 days)
    const horizonsAvailable = [7, 15, 30, 60, 90]
    const chosenHorizon = horizonsAvailable.reduce((prev, curr) =>
      Math.abs(curr - target_holding_days) < Math.abs(prev - target_holding_days) ? curr : prev
    )
    const forecast = fullForecast.horizons[chosenHorizon] || fullForecast.horizons[30]

    // 4. Fetch nearby markets for arbitrage analysis
    const nearbySql = `
      WITH ranked AS (
        SELECT 
          mp.market_id,
          m.market_name,
          m.latitude,
          m.longitude,
          mp.modal_price,
          ROW_NUMBER() OVER(PARTITION BY mp.market_id ORDER BY mp.arrival_date DESC) as rn
        FROM market_prices mp
        JOIN markets m ON mp.market_id = m.id
        WHERE mp.commodity_id = $1
      )
      SELECT * FROM ranked WHERE rn = 1
      ORDER BY modal_price DESC
    `

    const nearbyRows = await query(nearbySql, [commodity_id])
    const nearbyOptions: NearbyMarketOption[] = nearbyRows.map(m => {
      const modal = Number(m.modal_price)
      // Estimated average hauling freight ₹75/qtl between neighboring mandi districts
      const estimatedFreight = 75
      return {
        marketId: m.market_id,
        marketName: m.market_name,
        distanceKm: 85,
        modalPrice: modal,
        estimatedFreightPerUnit: estimatedFreight,
        netPricePerUnit: modal - estimatedFreight
      }
    })

    // 5. Evaluate decision
    const advisorParams: AdvisorParams = {
      commodityId: commodity_id,
      commodityName,
      quantity: Number(quantity),
      unit,
      currentMarketName: marketName,
      currentModalPrice: currentPrice,
      storageCostPerMonthPerUnit: Number(storage_cost_per_month),
      targetHoldingDays: Number(target_holding_days),
      forecast,
      nearbyMarkets: nearbyOptions
    }

    const recommendation = evaluateSellOrHold(advisorParams)

    return NextResponse.json({
      success: true,
      recommendation,
      forecast_summary: {
        as_of_date: fullForecast.asOfDate,
        validation_mape: fullForecast.validationMetrics.mape,
        directional_accuracy: fullForecast.validationMetrics.directionalAccuracy,
        chosen_horizon_days: chosenHorizon
      },
      all_horizons: fullForecast.horizons
    })
  } catch (error: any) {
    console.error('API /api/market/advisor error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
