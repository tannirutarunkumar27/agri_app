import { ForecastHorizonResult } from './forecasting'

export interface NearbyMarketOption {
  marketId: string
  marketName: string
  distanceKm: number
  modalPrice: number
  estimatedFreightPerUnit: number
  netPricePerUnit: number // modalPrice - estimatedFreightPerUnit
}

export interface AdvisorParams {
  commodityId: string
  commodityName: string
  quantity: number
  unit: string
  qualityGrade?: string
  currentMarketName: string
  currentModalPrice: number
  storageCostPerMonthPerUnit?: number // default ₹45 / Quintal / month
  targetHoldingDays?: number // default 30 days
  forecast: ForecastHorizonResult
  nearbyMarkets?: NearbyMarketOption[]
}

export interface AdvisorRecommendation {
  verdict: 'SELL_NOW' | 'HOLD'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  headline: string
  currentValue: number
  expectedHoldingValue: number
  netDifference: number
  netDifferencePercent: number
  storageCostTotal: number
  recommendedMarket: {
    marketName: string
    isLocal: boolean
    netRealizablePricePerUnit: number
    arbitrageGainPerUnit: number
  }
  rationale: string[]
  riskFactors: string[]
}

/**
 * Evaluates market intelligence, price forecasts, storage costs, and nearby market arbitrage
 * to deliver objective sell/hold decision guidance for a farmer.
 */
export function evaluateSellOrHold(params: AdvisorParams): AdvisorRecommendation {
  const qty = Math.max(1, Number(params.quantity) || 10)
  const currentModal = params.currentModalPrice
  const targetDays = params.targetHoldingDays || 30
  const monthlyStorageCost = params.storageCostPerMonthPerUnit !== undefined
    ? params.storageCostPerMonthPerUnit
    : 45.0 // standard warehouse / godown storage cost in ₹/Quintal/month

  // Pro-rated storage cost over the holding horizon
  const storageCostPerUnit = Math.round((monthlyStorageCost * (targetDays / 30)) * 100) / 100
  const storageCostTotal = Math.round(storageCostPerUnit * qty)

  // Estimated physical shrinkage and quality risk (1.0% for 30 days)
  const shrinkageRiskFactor = 0.01 * (targetDays / 30)

  // Current realization at local market
  const currentTotal = Math.round(currentModal * qty)

  // Expected realization at forecasted future price
  const forecastedPrice = params.forecast.predictedModalPrice
  const netProjectedPricePerUnit = Math.round(
    (forecastedPrice * (1 - shrinkageRiskFactor) - storageCostPerUnit) * 100
  ) / 100
  const expectedHoldingTotal = Math.round(netProjectedPricePerUnit * qty)

  const netDifference = expectedHoldingTotal - currentTotal
  const netDifferencePercent = Math.round((netDifference / currentTotal) * 1000) / 10

  // Check nearby market arbitrage options
  let bestMarket = {
    marketName: params.currentMarketName,
    isLocal: true,
    netRealizablePricePerUnit: currentModal,
    arbitrageGainPerUnit: 0
  }

  if (params.nearbyMarkets && params.nearbyMarkets.length > 0) {
    for (const m of params.nearbyMarkets) {
      if (m.netPricePerUnit > bestMarket.netRealizablePricePerUnit) {
        const gain = m.netPricePerUnit - currentModal
        if (gain > 50) {
          // Significant arbitrage (> ₹50/quintal after transport)
          bestMarket = {
            marketName: m.marketName,
            isLocal: false,
            netRealizablePricePerUnit: m.netPricePerUnit,
            arbitrageGainPerUnit: Math.round(gain)
          }
        }
      }
    }
  }

  const rationale: string[] = []
  const riskFactors: string[] = []

  let verdict: 'SELL_NOW' | 'HOLD' = 'SELL_NOW'
  let confidence = params.forecast.confidence
  let headline = ''

  // Decision Threshold:
  // Requires net gain > +4.0% to justify holding risks and warehouse illiquidity
  if (netDifferencePercent >= 4.0 && params.forecast.direction === 'UPWARD') {
    verdict = 'HOLD'
    headline = `HOLD ADVISED: Expected net gain of ₹${Math.abs(netDifference).toLocaleString('en-IN')} (+${netDifferencePercent}%) over ${targetDays} days after storage expenses.`

    rationale.push(
      `Current modal price is ₹${currentModal.toLocaleString('en-IN')}/${params.unit}, while the ${targetDays}-day forecast projects an upward trajectory to ₹${forecastedPrice.toLocaleString('en-IN')}/${params.unit}.`
    )
    rationale.push(
      `Estimated warehouse storage cost is ₹${storageCostPerUnit}/${params.unit} (₹${storageCostTotal.toLocaleString('en-IN')} total), which is comfortably exceeded by the expected price increase.`
    )

    if (!bestMarket.isLocal) {
      rationale.push(
        `Alternative: If immediate liquidity is needed, ${bestMarket.marketName} offers ₹${bestMarket.netRealizablePricePerUnit.toLocaleString('en-IN')}/${params.unit} (+₹${bestMarket.arbitrageGainPerUnit} net after transport).`
      )
    }

    riskFactors.push(
      'Holding produce incurs crop shrinkage, moisture loss, and quality degradation risk if warehouse humidity is unmanaged.'
    )
    riskFactors.push(
      'Heavy sudden post-harvest mandi arrivals across neighboring districts could temper anticipated price increases.'
    )
  } else if (params.forecast.direction === 'DOWNWARD') {
    verdict = 'SELL_NOW'
    headline = `SELL NOW ADVISED: Forecast indicates downward trend (-${Math.abs(params.forecast.expectedChangePercent)}%). Avoid warehouse holding losses.`

    rationale.push(
      `The ${targetDays}-day forecast predicts downward price pressure towards ₹${forecastedPrice.toLocaleString('en-IN')}/${params.unit} due to seasonal arrival peaks.`
    )
    rationale.push(
      `Holding would result in an estimated loss of ₹${Math.abs(netDifference).toLocaleString('en-IN')} when factoring in storage costs of ₹${storageCostTotal.toLocaleString('en-IN')}.`
    )

    if (!bestMarket.isLocal) {
      rationale.push(
        `Maximize return by dispatching to ${bestMarket.marketName}, which yields ₹${bestMarket.netRealizablePricePerUnit.toLocaleString('en-IN')}/${params.unit} net after freight (+₹${bestMarket.arbitrageGainPerUnit * qty} total gain).`
      )
    } else {
      rationale.push(
        `Lock in current farm-gate or local mandi rates (₹${currentModal.toLocaleString('en-IN')}/${params.unit}) immediately to safeguard margin.`
      )
    }

    riskFactors.push(
      'Government policy adjustments (e.g. export tariff changes or MSP procurement drives) could alter downward trend.'
    )
  } else {
    // STABLE / Marginal
    verdict = 'SELL_NOW'
    headline = `SELL NOW ADVISED: Expected price delta (+${netDifferencePercent}%) does not justify warehouse storage fees and illiquidity.`

    rationale.push(
      `Market prices are projected to remain relatively flat (forecasted ₹${forecastedPrice.toLocaleString('en-IN')}/${params.unit} vs current ₹${currentModal.toLocaleString('en-IN')}).`
    )
    rationale.push(
      `Storage expenses of ₹${storageCostTotal.toLocaleString('en-IN')} would erode any marginal gains, resulting in an effective net difference of ${netDifference >= 0 ? '+' : ''}${netDifferencePercent}%.`
    )

    if (!bestMarket.isLocal) {
      rationale.push(
        `Optimal action: Sell immediately, considering ${bestMarket.marketName} for a +₹${bestMarket.arbitrageGainPerUnit}/${params.unit} higher net payout.`
      )
    }

    riskFactors.push(
      'Prolonged holding of stable-priced commodities locks working capital needed for upcoming sowing inputs.'
    )
  }

  return {
    verdict,
    confidence,
    headline,
    currentValue: currentTotal,
    expectedHoldingValue: expectedHoldingTotal,
    netDifference,
    netDifferencePercent,
    storageCostTotal,
    recommendedMarket: bestMarket,
    rationale,
    riskFactors
  }
}
