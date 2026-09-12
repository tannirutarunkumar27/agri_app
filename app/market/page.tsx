'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  Truck,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight,
  Users,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react'

interface Commodity {
  id: string
  name: string
  code: string
  category: string
  default_unit: string
  local_names?: Record<string, string>
}

interface MandiPrice {
  id: string
  commodity_id: string
  commodity_name: string
  market_id: string
  market_name: string
  state: string
  district: string
  arrival_date: string
  minimum_price: number
  maximum_price: number
  modal_price: number
  arrival_quantity: number
  unit: string
  source: string
  fetched_at: string
}

interface HistoryData {
  date: string
  modal_price: number
  min_price: number
  max_price: number
  arrivals: number
  ma7: number
}

interface ForecastHorizon {
  horizonDays: number
  predictedModalPrice: number
  lowerBound: number
  upperBound: number
  direction: 'UPWARD' | 'DOWNWARD' | 'STABLE'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  expectedChangePercent: number
  modelName: string
}

interface NearbyMandi {
  market_id: string
  market_name: string
  state: string
  district: string
  modal_price: number
  distance_km: number
  transport_cost_per_qtl: number
  net_realizable_price: number
  net_gain_over_local: number
  is_arbitrage_profitable: boolean
}

export default function MarketIntelligenceDashboard() {
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('comm-mirchi')
  const [selectedState, setSelectedState] = useState<string>('ALL')
  const [prices, setPrices] = useState<MandiPrice[]>([])
  const [historySeries, setHistorySeries] = useState<HistoryData[]>([])
  const [historyDays, setHistoryDays] = useState<number>(30)
  const [forecasts, setForecasts] = useState<Record<number, ForecastHorizon>>({})
  const [validationMape, setValidationMape] = useState<number | null>(null)
  const [nearbyMandis, setNearbyMandis] = useState<NearbyMandi[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Load active commodities
  useEffect(() => {
    async function loadCommodities() {
      try {
        const res = await fetch('/api/market/commodities')
        const data = await res.json()
        if (data.success && data.commodities.length > 0) {
          setCommodities(data.commodities)
        }
      } catch (err) {
        console.error('Failed to load commodities:', err)
      }
    }
    loadCommodities()
  }, [])

  // Load mandi prices, history, forecasts, and nearby arbitrage for selected commodity
  useEffect(() => {
    async function loadMarketData() {
      setLoading(true)
      try {
        // 1. Fetch daily prices
        const priceUrl = `/api/market/prices?commodity_id=${selectedCommodityId}${selectedState !== 'ALL' ? `&state=${encodeURIComponent(selectedState)}` : ''}`
        const pRes = await fetch(priceUrl)
        const pData = await pRes.json()
        if (pData.success) {
          setPrices(pData.prices || [])
        }

        // 2. Fetch history series
        const hRes = await fetch(`/api/market/history?commodity_id=${selectedCommodityId}&days=${historyDays}`)
        const hData = await hRes.json()
        if (hData.success) {
          setHistorySeries(hData.series || [])
        }

        // 3. Fetch forecasts
        const fRes = await fetch(`/api/market/forecast?commodity_id=${selectedCommodityId}`)
        const fData = await fRes.json()
        if (fData.success && fData.horizons) {
          setForecasts(fData.horizons)
          setValidationMape(fData.validation_metrics?.mape || null)
        } else {
          setForecasts({})
        }

        // 4. Fetch nearby mandis & arbitrage
        const nRes = await fetch(`/api/market/nearby?commodity_id=${selectedCommodityId}`)
        const nData = await nRes.json()
        if (nData.success) {
          setNearbyMandis(nData.markets || [])
        }
      } catch (err) {
        console.error('Error fetching market intelligence data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
  }, [selectedCommodityId, selectedState, historyDays])

  const selectedCommodity = commodities.find(c => c.id === selectedCommodityId) || {
    id: selectedCommodityId,
    name: 'Selected Commodity',
    default_unit: 'Quintal'
  }

  // Filter prices by search query
  const filteredPrices = prices.filter(p => 
    p.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Top reporting price
  const topPrice = prices.length > 0 ? prices[0] : null
  const fc30 = forecasts[30] || forecasts[15] || forecasts[7]

  // Unique states for filter dropdown
  const statesList = Array.from(new Set(prices.map(p => p.state))).filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Top Header Banner */}
      <header className="border-b border-emerald-100 dark:border-emerald-950/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Market Intelligence & Mandi Rates
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> Agmarknet Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Government Mandi Daily Modal Rates, Future Price Forecasts & Sell/Hold Guidance
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/farmer/buyer-requests"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Buyer Requests & Matches</span>
            </Link>
            <Link
              href="/market/liquidity"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-bold transition"
            >
              <span>Market Liquidity</span>
            </Link>
            <Link
              href="/market/advisor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2 text-xs font-bold transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sell vs Hold</span>
            </Link>
            <Link
              href="/buyer/demand/create"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-2 text-xs font-bold transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buyer Post Demand</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Crop Selection Quick Bar */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-600" /> Select Crop to Analyze
            </h2>
            <span className="text-[11px] text-slate-400">
              {commodities.length} Registered Commodities
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {commodities.map(comm => {
              const isSelected = comm.id === selectedCommodityId
              return (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommodityId(comm.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <span>{comm.name}</span>
                  {comm.local_names?.te && (
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      ({comm.local_names.te})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* 2. Headline Summary & Sell/Hold Guidance Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Best Price Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Live Daily Modal Price</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCommodity.name}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                Per {selectedCommodity.default_unit || 'Quintal'}
              </span>
            </div>

            {topPrice ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{topPrice.modal_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Spread: ₹{topPrice.minimum_price} - ₹{topPrice.maximum_price})
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Mandi / APMC:
                    </span>
                    <strong className="text-slate-900 dark:text-white">{topPrice.market_name} ({topPrice.state})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Latest Arrival:
                    </span>
                    <strong>{topPrice.arrival_date}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Truck className="h-3.5 w-3.5 text-emerald-600" /> Volume Reported:
                    </span>
                    <strong>{topPrice.arrival_quantity} Quintals</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/marketplace/sell?crop=${encodeURIComponent(selectedCommodity.name)}`}
                    className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold transition shadow-xs"
                  >
                    Sell {selectedCommodity.name} Now
                  </Link>
                  <Link
                    href="#buyers-section"
                    className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    Find Buyers
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-xs text-slate-400 py-6">
                No active mandi rate available for {selectedCommodity.name}
              </div>
            )}
          </div>

          {/* 30-Day Multi-Horizon Forecast Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Multi-Horizon Price Forecast</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                  <span>30-Day Target</span>
                  {fc30 && (
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      fc30.direction === 'UPWARD'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : fc30.direction === 'DOWNWARD'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {fc30.direction === 'UPWARD' && <TrendingUp className="h-3 w-3" />}
                      {fc30.direction === 'DOWNWARD' && <TrendingDown className="h-3 w-3" />}
                      {fc30.direction === 'STABLE' && <Minus className="h-3 w-3" />}
                      {fc30.direction} ({fc30.expectedChangePercent > 0 ? `+${fc30.expectedChangePercent}%` : `${fc30.expectedChangePercent}%`})
                    </span>
                  )}
                </h3>
              </div>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold border border-indigo-200 dark:border-indigo-900">
                Walk-Forward Validated
              </span>
            </div>

            {fc30 ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{fc30.predictedModalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Interval: [₹{fc30.lowerBound} - ₹{fc30.upperBound}]
                  </span>
                </div>

                {/* Horizon Grid */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  {[7, 15, 30, 60].map(h => {
                    const fc = forecasts[h]
                    if (!fc) return null
                    return (
                      <div key={h} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{h} Days</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          ₹{fc.predictedModalPrice}
                        </div>
                        <div className={`text-[10px] font-medium ${
                          fc.expectedChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {fc.expectedChangePercent >= 0 ? `+${fc.expectedChangePercent}%` : `${fc.expectedChangePercent}%`}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Confidence: <strong className="text-slate-700 dark:text-slate-300">{fc30.confidence}</strong></span>
                  {validationMape !== null && (
                    <span>Backtest Error (MAPE): <strong className="text-emerald-600">{validationMape}%</strong></span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-400 py-4">
                Forecasting model warming up for {selectedCommodity.name}
              </div>
            )}
          </div>

          {/* Sell vs Hold Decision Advisor Preview */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Economic Decision Advisor
              </div>
              <h3 className="text-xl font-black mt-1 text-white">
                Should You Sell Today or Hold?
              </h3>
              <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                Our economic engine deducts warehouse storage fees, physical shrinkage, and examines nearby mandi transport arbitrage before advising.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3 text-xs border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200">Standard Warehouse Fee:</span>
                  <span className="font-bold">₹45 / Quintal / Month</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-emerald-200">Nearby Mandi Arbitrage:</span>
                  <span className="font-bold text-amber-300">
                    {nearbyMandis.some(m => m.is_arbitrage_profitable) ? 'Arbitrage Opportunity Detected' : 'Local Mandi Optimal'}
                  </span>
                </div>
              </div>

              <Link
                href={`/market/advisor?commodity=${selectedCommodityId}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-950 py-2.5 text-xs font-black shadow-md hover:bg-emerald-50 transition"
              >
                <span>Run Interactive Sell / Hold Calculator</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </section>

        {/* 3. Historical Mandi Price Trend Chart & Time Horizons */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Historical Price Trend & Moving Average</span>
                <span className="text-xs font-medium text-slate-400">({selectedCommodity.name})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily modal price observations with rolling 7-day trendline and arrival volume
              </p>
            </div>

            {/* Time Horizon Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[7, 15, 30, 60, 90, 180, 365].map(days => (
                <button
                  key={days}
                  onClick={() => setHistoryDays(days)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    historyDays === days
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {days < 365 ? `${days}D` : '1Y'}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Visual Bar Trend Representation */}
          {historySeries.length > 0 ? (
            <div className="pt-2">
              <div className="h-48 w-full flex items-end gap-1 sm:gap-2 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {(() => {
                  const maxPrice = Math.max(...historySeries.map(s => s.modal_price), 1)
                  const minPrice = Math.min(...historySeries.map(s => s.modal_price), 0)
                  const range = maxPrice - minPrice || 1

                  // Limit display bars on smaller screens
                  const step = Math.max(1, Math.floor(historySeries.length / 30))
                  const sampled = historySeries.filter((_, idx) => idx % step === 0)

                  return sampled.map((pt, i) => {
                    const heightPercent = Math.max(15, Math.round(((pt.modal_price - minPrice) / range) * 80 + 15))
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                          <div className="bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                            <div className="font-bold">₹{pt.modal_price} / Qtl</div>
                            <div className="text-slate-400 text-[9px]">{pt.date} · {pt.arrivals} Qtl</div>
                            <div className="text-emerald-400 text-[9px]">7D MA: ₹{pt.ma7}</div>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>

                        {/* Visual Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[14px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm group-hover:from-emerald-500 group-hover:to-teal-300 transition"
                        />
                      </div>
                    )
                  })
                })()}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 px-2">
                <span>{historySeries[0]?.date}</span>
                <span>Latest Observation: {historySeries[historySeries.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              No historical price time-series available for {selectedCommodity.name} in selected period.
            </div>
          )}
        </section>

        {/* 4. Nearby Mandi Comparison & Arbitrage Table */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Inter-Mandi Comparison & Transport Arbitrage</span>
              </h3>
              <p className="text-xs text-slate-500">
                Compare prices across regional mandis with automatic transport freight deduction (₹0.80/km/Qtl)
              </p>
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All States</option>
                {statesList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Mandi / Market</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Reported Modal Price</th>
                  <th className="py-2.5 px-3 text-right">Distance & Hauling</th>
                  <th className="py-2.5 px-3 text-right">Net Realizable Price</th>
                  <th className="py-2.5 px-3 text-center">Arbitrage Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {nearbyMandis.map((m, idx) => (
                  <tr key={m.market_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.market_name}</div>
                      <div className="text-[10px] text-slate-400">APMC Principal Yard</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {m.district}, {m.state}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{m.modal_price.toLocaleString('en-IN')} / Qtl
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      <div>{m.distance_km > 0 ? `${m.distance_km} km` : 'Local Mandi'}</div>
                      <div className="text-[10px] text-slate-400">-₹{m.transport_cost_per_qtl}/Qtl freight</div>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                      ₹{m.net_realizable_price.toLocaleString('en-IN')} / Qtl
                    </td>
                    <td className="py-3 px-3 text-center">
                      {m.is_arbitrage_profitable ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                          <TrendingUp className="h-3 w-3" /> +₹{m.net_gain_over_local}/Qtl Net Gain
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard Realization</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        href={`/marketplace/sell?crop=${encodeURIComponent(selectedCommodity.name)}&mandi=${encodeURIComponent(m.market_name)}`}
                        className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-[11px] font-bold transition inline-block"
                      >
                        List Produce
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Direct Buyer Discovery Section */}
        <section id="buyers-section" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Direct Verified Buyers for {selectedCommodity.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Connect directly with agro-processors, mills, and export traders looking to procure this crop
              </p>
            </div>

            <Link
              href="/marketplace/sell"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
            >
              <span>Publish Lot & Receive Direct Inquiries</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {[
              {
                name: 'Kisan Agro Foods & Spices Mill',
                type: 'Processing Unit & Mill',
                targetQty: '250 Quintals',
                term: '100% Advance Escrow',
                rating: 4.9,
                verified: true
              },
              {
                name: 'National Grain & Pulse Wholesalers',
                type: 'Wholesale Mandi Merchant',
                targetQty: '500 Quintals',
                term: 'Immediate Mandi Gate Clearance',
                rating: 4.8,
                verified: true
              },
              {
                name: 'Apex Commodity Exports Pvt Ltd',
                type: 'Direct Exporter Hub',
                targetQty: '1000 Quintals',
                term: '3-Day Escrow Settlement',
                rating: 5.0,
                verified: true
              }
            ].map((buyer, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-500 transition space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      {buyer.name}
                      {buyer.verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{buyer.type}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    ★ {buyer.rating}
                  </span>
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Lot:</span>
                    <strong className="text-slate-900 dark:text-white">{buyer.targetQty}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{buyer.term}</strong>
                  </div>
                </div>

                <Link
                  href={`/marketplace/sell?crop=${encodeURIComponent(selectedCommodity.name)}&buyerId=${idx}`}
                  className="w-full block text-center rounded-xl bg-slate-900 text-white dark:bg-emerald-700 hover:bg-emerald-800 py-2 text-xs font-bold transition"
                >
                  Connect & Submit Lot Offer
                </Link>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
