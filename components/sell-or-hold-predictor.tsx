'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  Building,
  ArrowRight,
  CloudRain,
  Truck,
  Sparkles,
  BarChart3
} from 'lucide-react'

type CommodityData = {
  name: string
  hindiName: string
  currentPrice: number // per quintal
  projectedPrice: number
  recommendedAction: 'HOLD' | 'SELL'
  recommendedDays: number
  accuracyRate: number
  trendPercent: number
  signals: {
    arrivalsTrend: string
    weatherFactor: string
    demandCycle: string
  }
  historyDays: { day: string; price: number; projected?: boolean }[]
}

const COMMODITIES: Record<string, CommodityData> = {
  soybean: {
    name: 'Soybean (Yellow)',
    hindiName: 'सोयाबीन (पीला)',
    currentPrice: 4720,
    projectedPrice: 5350,
    recommendedAction: 'HOLD',
    recommendedDays: 12,
    accuracyRate: 91.2,
    trendPercent: 13.3,
    signals: {
      arrivalsTrend: 'Mandi arrivals expected to drop by 28% next week as harvesting peaks end.',
      weatherFactor: 'Late rains in central MP delaying secondary arrivals by 10 days.',
      demandCycle: 'Crushing mills and poultry feed exporters offering +₹600 spot premiums.'
    },
    historyDays: [
      { day: '6 Days Ago', price: 4610 },
      { day: '4 Days Ago', price: 4650 },
      { day: '2 Days Ago', price: 4690 },
      { day: 'Today', price: 4720 },
      { day: '+4 Days', price: 4910, projected: true },
      { day: '+8 Days', price: 5140, projected: true },
      { day: '+12 Days (Peak)', price: 5350, projected: true }
    ]
  },
  onion: {
    name: 'Red Onion (Nashik Quality)',
    hindiName: 'लाल कांदा / प्याज',
    currentPrice: 2350,
    projectedPrice: 1980,
    recommendedAction: 'SELL',
    recommendedDays: 2,
    accuracyRate: 88.7,
    trendPercent: -15.7,
    signals: {
      arrivalsTrend: 'Massive late Kharif harvest hitting Lasalgaon and Pimpalgaon mandis (+45% volume).',
      weatherFactor: 'Clear sunny weather allowing rapid truck dispatches from Ahmednagar.',
      demandCycle: 'Government buffer stock release in major metro consumption centers.'
    },
    historyDays: [
      { day: '6 Days Ago', price: 2550 },
      { day: '4 Days Ago', price: 2480 },
      { day: '2 Days Ago', price: 2410 },
      { day: 'Today', price: 2350 },
      { day: '+2 Days (Sell Now)', price: 2310, projected: true },
      { day: '+6 Days', price: 2150, projected: true },
      { day: '+10 Days', price: 1980, projected: true }
    ]
  },
  cotton: {
    name: 'Cotton (Medium Staple)',
    hindiName: 'कपास (मध्यम स्टेपल)',
    currentPrice: 7150,
    projectedPrice: 7890,
    recommendedAction: 'HOLD',
    recommendedDays: 14,
    accuracyRate: 92.5,
    trendPercent: 10.3,
    signals: {
      arrivalsTrend: 'CCI (Cotton Corporation of India) procurement centers absorbing low-grade stock.',
      weatherFactor: 'Pink bollworm damage in Punjab reduced national supply estimate.',
      demandCycle: 'Spinning mills in Tamil Nadu & Gujarat running low on export yarn inventory.'
    },
    historyDays: [
      { day: '6 Days Ago', price: 6980 },
      { day: '4 Days Ago', price: 7040 },
      { day: '2 Days Ago', price: 7100 },
      { day: 'Today', price: 7150 },
      { day: '+4 Days', price: 7350, projected: true },
      { day: '+8 Days', price: 7600, projected: true },
      { day: '+14 Days (Peak)', price: 7890, projected: true }
    ]
  },
  wheat: {
    name: 'Sharbati Wheat (Premium)',
    hindiName: 'शरबती गेहूं (प्रीमियम)',
    currentPrice: 2850,
    projectedPrice: 3220,
    recommendedAction: 'HOLD',
    recommendedDays: 10,
    accuracyRate: 94.1,
    trendPercent: 12.9,
    signals: {
      arrivalsTrend: 'Government MSP procurement active at ₹2,275; open market premium rising.',
      weatherFactor: 'Early summer heatwave expectations fueling flour miller stocking.',
      demandCycle: 'FMCG biscuit and atta brands booking direct warehouse bulk lots.'
    },
    historyDays: [
      { day: '6 Days Ago', price: 2780 },
      { day: '4 Days Ago', price: 2810 },
      { day: '2 Days Ago', price: 2830 },
      { day: 'Today', price: 2850 },
      { day: '+4 Days', price: 2980, projected: true },
      { day: '+8 Days', price: 3120, projected: true },
      { day: '+10 Days (Peak)', price: 3220, projected: true }
    ]
  }
}

export default function SellOrHoldPredictor() {
  const [selectedCropKey, setSelectedCropKey] = useState<string>('soybean')
  const [selectedMandi, setSelectedMandi] = useState('Indore APMC (Madhya Pradesh)')
  const [quantityQuintals, setQuantityQuintals] = useState<number>(80) // 80 quintals default
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)

  const crop = COMMODITIES[selectedCropKey] || COMMODITIES.soybean

  // Financial Calculations
  const currentTotalRevenue = quantityQuintals * crop.currentPrice
  const projectedTotalRevenue = quantityQuintals * crop.projectedPrice
  const grossDiff = projectedTotalRevenue - currentTotalRevenue

  // Storage cost estimate: ₹30 per quintal per 15 days in WDRA warehouse
  const storageCost = Math.round(quantityQuintals * 30 * (crop.recommendedDays / 15))
  const netHoldingProfit = grossDiff - storageCost

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-md md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-bold text-lime-300">
              <TrendingUp className="h-4 w-4" /> MVP 2 · Mandi Price Intelligence
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              Sell or Hold? The Mandi Price Predictor
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
              Stop distress selling right after harvest. Our multi-factor model synthesizes Mandi arrival volumes,
              competing belt weather disruptions, and agro-processor demand cycles to give one unambiguous directive:{' '}
              <strong className="text-lime-300">"Sell in 2 Days" or "Hold 10 Days"</strong>.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> Solves Switching-Cost Gap
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> Proven Net Profit Calculation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> 89.4% Verified APMC Accuracy
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-900/50 p-5 text-center backdrop-blur-xs">
            <p className="text-xs font-bold text-emerald-300">Historical Model Accuracy</p>
            <p className="mt-1 text-3xl font-black text-lime-400">{crop.accuracyRate}%</p>
            <p className="mt-1 text-[11px] text-emerald-200">Tested across 42 Major Mandis</p>
          </div>
        </div>
      </div>

      {/* Commodity & Mandi Selector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Controls Column (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Harvest & Market</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Commodity</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {Object.entries(COMMODITIES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCropKey(key)}
                      className={`rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                        selectedCropKey === key
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <p>{item.name.split(' ')[0]}</p>
                      <p className="text-[10px] font-normal text-slate-500">{item.hindiName}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reference APMC Mandi</label>
                <select
                  value={selectedMandi}
                  onChange={(e) => setSelectedMandi(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Indore APMC (Madhya Pradesh)">Indore APMC (Madhya Pradesh)</option>
                  <option value="Lasalgaon Mandi (Nashik, Maharashtra)">Lasalgaon Mandi (Nashik, Maharashtra)</option>
                  <option value="Baramati APMC (Pune, Maharashtra)">Baramati APMC (Pune, Maharashtra)</option>
                  <option value="Khanna Grain Market (Punjab)">Khanna Grain Market (Punjab)</option>
                  <option value="Guntur Mirchi Yard (Andhra Pradesh)">Guntur Mirchi Yard (Andhra Pradesh)</option>
                  <option value="Rajkot APMC (Gujarat)">Rajkot APMC (Gujarat)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Harvest Quantity</label>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    {quantityQuintals} Quintals ({quantityQuintals * 100} kg)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                  className="mt-2 h-2 w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10 qtl</span>
                  <span>250 qtl</span>
                  <span>500 qtl</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Decision & ROI Center (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* THE CORE DECISION CARD (Pitch Deck Highlight) */}
          <div
            className={`overflow-hidden rounded-3xl border-2 p-6 shadow-md ${
              crop.recommendedAction === 'HOLD'
                ? 'border-emerald-600 bg-gradient-to-br from-emerald-50/90 via-white to-green-50/70 dark:border-emerald-700 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/40'
                : 'border-amber-500 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 dark:border-amber-700 dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xs ${
                    crop.recommendedAction === 'HOLD' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {crop.recommendedAction === 'HOLD' ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      crop.recommendedAction === 'HOLD'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    PREDICTED DECISION: {crop.recommendedAction} {crop.recommendedDays} DAYS
                  </span>
                  <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                    {crop.recommendedAction === 'HOLD'
                      ? `Hold your harvest for ${crop.recommendedDays} days. Prices are surging.`
                      : `Sell your produce within ${crop.recommendedDays} days before prices drop.`}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">Projected Price Jump</p>
                <p
                  className={`text-2xl font-black ${
                    crop.trendPercent >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                  }`}
                >
                  {crop.trendPercent >= 0 ? `+${crop.trendPercent}%` : `${crop.trendPercent}%`}
                </p>
              </div>
            </div>

            {/* Price Movement Snapshot */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-800/90 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Current Mandi Rate</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  ₹{crop.currentPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-500">Per Quintal</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Target Price (+{crop.recommendedDays}d)
                </p>
                <p
                  className={`mt-1 text-xl font-extrabold ${
                    crop.projectedPrice >= crop.currentPrice
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600'
                  }`}
                >
                  ₹{crop.projectedPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-500">Per Quintal</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Gross Harvest Gain</p>
                <p
                  className={`mt-1 text-xl font-extrabold ${
                    grossDiff >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                  }`}
                >
                  {grossDiff >= 0 ? `+₹${grossDiff.toLocaleString('en-IN')}` : `-₹${Math.abs(grossDiff).toLocaleString('en-IN')}`}
                </p>
                <p className="text-[10px] text-slate-500">For {quantityQuintals} Quintals</p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/60">
                <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                  Net Holding Profit
                </p>
                <p className="mt-1 text-xl font-black text-emerald-700 dark:text-emerald-400">
                  +₹{netHoldingProfit.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-600">After -₹{storageCost} storage</p>
              </div>
            </div>

            {/* 15-Day Price Curve Trend */}
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                15-Day Price Trend & Forecast (Historical vs AI Prediction)
              </p>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                {crop.historyDays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 transition ${
                      item.projected
                        ? 'border border-dashed border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-500 line-clamp-1">{item.day}</span>
                    <p
                      className={`mt-1 text-xs font-black ${
                        item.projected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      ₹{item.price}
                    </p>
                    <span
                      className={`mt-1 inline-block text-[9px] font-bold ${
                        item.projected ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {item.projected ? 'Forecast' : 'Actual'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Call: Tri-Factor Predictive Signals */}
            <div className="mt-6 rounded-2xl bg-white p-4 dark:bg-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Why this call? Real-Time Intelligence Signals
              </h4>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Arrivals Pressure: </span>
                    <span className="text-slate-600 dark:text-slate-300">{crop.signals.arrivalsTrend}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Weather Influx: </span>
                    <span className="text-slate-600 dark:text-slate-300">{crop.signals.weatherFactor}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Processing & Export Demand: </span>
                    <span className="text-slate-600 dark:text-slate-300">{crop.signals.demandCycle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Freemium With Proof & Post-Harvest Billing (Pitch Deck Slides 1 & 3) */}
            <div className="mt-6 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-lime-50 to-white p-5 dark:border-emerald-900 dark:from-slate-800 dark:to-slate-850">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-xs font-bold text-white">
                    FREEMIUM WITH PROOF
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Free Trial Status: 3/3 accurate calls verified (94.2% accuracy)
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">₹499 / Season</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Post-Harvest Settlement: Pay ₹0 Today
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                    "We earn only when you earn." Premium SMS/WhatsApp Mandi alerts are billed after your harvest sale or deducted directly from your warehouse loan disbursal — never before you have cash in hand.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAlertSubscribed(true)
                    setShowSuccessModal(true)
                  }}
                  className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
                >
                  {alertSubscribed ? '✓ Post-Harvest Plan Active' : 'Activate Plan (₹0 Today)'}
                </button>
              </div>
            </div>

            {/* Bridge to Financing Callout (Direct tie to MVP 3) */}
            {crop.recommendedAction === 'HOLD' && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-950 p-5 text-white">
                <div>
                  <p className="text-sm font-extrabold text-lime-300">Need immediate cash while holding?</p>
                  <p className="text-xs text-emerald-200">
                    Store your {quantityQuintals} qtl in a partner warehouse, get a digital receipt (e-NWR), and get an instant 75% loan at 7% interest!
                  </p>
                </div>

                <button
                  onClick={() => {
                    const navBtn = document.getElementById('tab-warehouse')
                    if (navBtn) navBtn.click()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-black text-emerald-950 shadow-md transition hover:bg-lime-300 active:scale-95"
                >
                  <span>Explore Warehouse Financing</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Modal for Post-Harvest Plan Activation */}
            {showSuccessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
                <div className="max-w-md rounded-3xl border border-emerald-300 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                    Post-Harvest Plan Activated!
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    You have unlocked real-time WhatsApp & SMS Mandi surge alerts for <strong>{crop.name}</strong>.
                  </p>
                  <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                    <p className="font-bold">Monetization: Earn When You Earn</p>
                    <p className="mt-1 text-[11px]">
                      Cost: <strong>₹499 / Season</strong>. Billed ₹0 today. Automatically settled when your produce is sold at the Mandi or deducted from your warehouse loan.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    Got It, Continue to Predictor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
