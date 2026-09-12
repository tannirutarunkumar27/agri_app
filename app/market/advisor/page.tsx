'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Truck,
  DollarSign,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Warehouse,
  ChevronLeft
} from 'lucide-react'

interface Commodity {
  id: string
  name: string
  default_unit: string
}

interface Mandi {
  id: string
  market_name: string
  state: string
  district: string
}

interface AdvisorRecommendation {
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

export default function SellHoldAdvisorPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [mandis, setMandis] = useState<Mandi[]>([])
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('comm-mirchi')
  const [selectedMarketId, setSelectedMarketId] = useState<string>('mkt-guntur')
  const [quantity, setQuantity] = useState<number>(50)
  const [storageCostPerMonth, setStorageCostPerMonth] = useState<number>(45)
  const [targetHoldingDays, setTargetHoldingDays] = useState<number>(30)

  const [loading, setLoading] = useState<boolean>(false)
  const [recommendation, setRecommendation] = useState<AdvisorRecommendation | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Load commodities and mandis
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, mRes] = await Promise.all([
          fetch('/api/market/commodities'),
          fetch('/api/market/markets')
        ])
        const [cData, mData] = await Promise.all([cRes.json(), mRes.json()])

        if (cData.success && cData.commodities.length > 0) {
          setCommodities(cData.commodities)
        }
        if (mData.success && mData.markets.length > 0) {
          setMandis(mData.markets)
        }
      } catch (err) {
        console.error('Failed to load masters:', err)
      }
    }
    loadData()
  }, [])

  // Evaluate Sell vs Hold
  const handleEvaluate = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/market/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_id: selectedCommodityId,
          market_id: selectedMarketId,
          quantity: Number(quantity),
          storage_cost_per_month: Number(storageCostPerMonth),
          target_holding_days: Number(targetHoldingDays)
        })
      })

      const data = await res.json()
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation)
      } else {
        setErrorMsg(data.error || 'Failed to formulate advisor evaluation.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error evaluating decision.')
    } finally {
      setLoading(false)
    }
  }

  // Trigger evaluation on initial load or when key params change
  useEffect(() => {
    if (selectedCommodityId) {
      handleEvaluate()
    }
  }, [selectedCommodityId, selectedMarketId, targetHoldingDays])

  const selectedCommodity = commodities.find(c => c.id === selectedCommodityId) || {
    id: selectedCommodityId,
    name: 'Crop',
    default_unit: 'Quintal'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-emerald-100 dark:border-emerald-950/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/market"
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Sell or Hold Decision Advisor</span>
              </h1>
              <p className="text-xs text-slate-500">
                Economic Analysis Factoring Warehouse Cost, Shrinkage & Nearby Market Transport Arbitrage
              </p>
            </div>
          </div>

          <Link
            href="/marketplace/sell"
            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
          >
            List Lot on Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Input Parameters Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Enter Your Crop & Holding Details
              </h2>
              <p className="text-xs text-slate-500">
                Adjust your lot size and holding duration to simulate real net profits
              </p>
            </div>
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? 'Analyzing...' : 'Recalculate Decision'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commodity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Commodity:
              </label>
              <select
                value={selectedCommodityId}
                onChange={(e) => setSelectedCommodityId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Local Mandi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nearest / Local APMC Mandi:
              </label>
              <select
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {mandis.map(m => (
                  <option key={m.id} value={m.id}>{m.market_name} ({m.state})</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Harvest Lot Quantity ({selectedCommodity.default_unit || 'Quintals'}):
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Holding Horizon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Holding Horizon Target:
              </label>
              <select
                value={targetHoldingDays}
                onChange={(e) => setTargetHoldingDays(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={15}>15 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (3 Months)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Warehouse className="h-3.5 w-3.5 text-emerald-600" />
              Monthly Storage Cost: <strong>₹{storageCostPerMonth} / Quintal / Month</strong>
            </span>
            <span>·</span>
            <span>
              Estimated Physical Shrinkage: <strong>1.0% / month</strong>
            </span>
          </div>
        </section>

        {/* Error Notice */}
        {errorMsg && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Recommendation Hero */}
        {recommendation && (
          <section className="space-y-6">
            
            {/* Main Verdict Card */}
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-md relative overflow-hidden transition ${
              recommendation.verdict === 'HOLD'
                ? 'bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white border-emerald-800'
                : 'bg-gradient-to-br from-amber-900 via-slate-900 to-slate-950 text-white border-amber-900/60'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      recommendation.verdict === 'HOLD'
                        ? 'bg-emerald-400 text-emerald-950'
                        : 'bg-amber-400 text-amber-950'
                    }`}>
                      {recommendation.verdict === 'HOLD' ? <TrendingUp className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                      RECOMMENDATION: {recommendation.verdict === 'HOLD' ? 'HOLD FOR TARGET' : 'SELL NOW ADVISED'}
                    </span>
                    <span className="text-xs text-white/70 font-medium">
                      (Confidence: {recommendation.confidence})
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
                    {recommendation.headline}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 text-right border border-white/10">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Net Economic Impact</span>
                  <div className={`text-2xl font-black mt-0.5 ${
                    recommendation.netDifference >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {recommendation.netDifference >= 0 ? `+₹${recommendation.netDifference.toLocaleString('en-IN')}` : `-₹${Math.abs(recommendation.netDifference).toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-xs text-white/80 mt-0.5">
                    ({recommendation.netDifferencePercent >= 0 ? `+${recommendation.netDifferencePercent}%` : `${recommendation.netDifferencePercent}%`} net change)
                  </div>
                </div>
              </div>

              {/* Realization Comparison Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Immediate Today */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-xs p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Immediate Sale Value (Today)</span>
                  <div className="text-xl font-black text-white mt-1">
                    ₹{recommendation.currentValue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Based on current mandi modal rate for {quantity} {selectedCommodity.default_unit || 'Quintals'}
                  </p>
                </div>

                {/* Storage Cost Deducted */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-xs p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Storage & Shrinkage Cost</span>
                  <div className="text-xl font-black text-rose-300 mt-1">
                    -₹{recommendation.storageCostTotal.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Deducted for {targetHoldingDays} days warehouse holding fee + physical shrinkage
                  </p>
                </div>

                {/* Projected Holding Value */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-xs p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Net Projected Realization</span>
                  <div className="text-xl font-black text-emerald-300 mt-1">
                    ₹{recommendation.expectedHoldingValue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Net cash in hand after deducting all warehouse and shrinkage costs
                  </p>
                </div>

              </div>
            </div>

            {/* Nearby Mandi Arbitrage Alert Card */}
            {!recommendation.recommendedMarket.isLocal && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-5 border border-amber-200 dark:border-amber-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <span>Nearby Mandi Arbitrage Detected: {recommendation.recommendedMarket.marketName}</span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    Hauling to <strong>{recommendation.recommendedMarket.marketName}</strong> yields a net realizable price of <strong>₹{recommendation.recommendedMarket.netRealizablePricePerUnit}/Qtl</strong> after deducting transport freight, generating <strong>+₹{recommendation.recommendedMarket.arbitrageGainPerUnit}/Qtl</strong> higher return than your local mandi.
                  </p>
                </div>

                <Link
                  href={`/marketplace/sell?crop=${encodeURIComponent(selectedCommodity.name)}&mandi=${encodeURIComponent(recommendation.recommendedMarket.marketName)}`}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap"
                >
                  List for {recommendation.recommendedMarket.marketName}
                </Link>
              </div>
            )}

            {/* Detailed Rationale & Risk Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Economic Rationale */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Objective Economic Rationale</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {recommendation.rationale.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Key Risk Factors Considered</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {recommendation.riskFactors.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Bottom Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ready to act on this decision?
                </h4>
                <p className="text-xs text-slate-500">
                  Sell directly to verified buyers or post your produce on FarmDirect Marketplace
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/marketplace/sell?crop=${encodeURIComponent(selectedCommodity.name)}`}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-xs flex items-center gap-2"
                >
                  <span>Publish Lot on Marketplace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/market"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  Back to Mandi Dashboard
                </Link>
              </div>
            </div>

          </section>
        )}

      </main>
    </div>
  )
}
