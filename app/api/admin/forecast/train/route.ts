import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generatePriceForecast, HistoricalDataPoint } from '@/lib/market/forecasting'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const pairsSql = `
      SELECT DISTINCT commodity_id, market_id
      FROM market_prices
      GROUP BY commodity_id, market_id
      HAVING COUNT(*) >= 5
    `
    const pairs = await query(pairsSql)

    let totalForecastsStored = 0

    for (const pair of pairs) {
      const { commodity_id, market_id } = pair

      const histSql = `
        SELECT arrival_date, minimum_price, maximum_price, modal_price, arrival_quantity
        FROM market_prices
        WHERE commodity_id = $1 AND market_id = $2
        ORDER BY arrival_date ASC
      `
      const hist = await query(histSql, [commodity_id, market_id])
      if (hist.length < 5) continue

      const history: HistoricalDataPoint[] = hist.map(h => ({
        date: h.arrival_date,
        minPrice: Number(h.minimum_price || h.modal_price),
        maxPrice: Number(h.maximum_price || h.modal_price),
        modalPrice: Number(h.modal_price),
        arrivals: Number(h.arrival_quantity)
      }))

      const fullForecast = generatePriceForecast(history, commodity_id, market_id)

      for (const horizonDays of [7, 15, 30, 60, 90]) {
        const fc = fullForecast.horizons[horizonDays]
        if (!fc) continue

        const forecastDate = new Date()
        forecastDate.setDate(forecastDate.getDate() + horizonDays)
        const dateStr = forecastDate.toISOString().split('T')[0]

        const insertSql = `
          INSERT INTO market_price_forecasts (
            id, market_id, commodity_id, forecast_date, horizon_days,
            model_name, model_version, predicted_modal_price,
            lower_bound, upper_bound, direction, confidence, metrics
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          )
          ON CONFLICT (market_id, commodity_id, variety_id, forecast_date, horizon_days, model_version)
          DO UPDATE SET
            predicted_modal_price = EXCLUDED.predicted_modal_price,
            lower_bound = EXCLUDED.lower_bound,
            upper_bound = EXCLUDED.upper_bound,
            direction = EXCLUDED.direction,
            confidence = EXCLUDED.confidence,
            metrics = EXCLUDED.metrics,
            generated_at = CURRENT_TIMESTAMP
        `

        const fcId = `fc-${market_id}-${commodity_id}-${fc.horizonDays}-${dateStr}`
        await query(insertSql, [
          fcId,
          market_id,
          commodity_id,
          dateStr,
          fc.horizonDays,
          fc.modelName,
          'v1.0',
          fc.predictedModalPrice,
          fc.lowerBound,
          fc.upperBound,
          fc.direction,
          fc.confidence,
          JSON.stringify(fullForecast.validationMetrics)
        ])
        totalForecastsStored++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Trained and stored ${totalForecastsStored} forecasts across ${pairs.length} commodity-market pairs.`,
      pairs_evaluated: pairs.length,
      forecasts_generated: totalForecastsStored
    })
  } catch (error: any) {
    console.error('API /api/admin/forecast/train error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Forecast training failed' },
      { status: 500 }
    )
  }
}
