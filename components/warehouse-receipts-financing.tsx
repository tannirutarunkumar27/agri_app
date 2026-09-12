'use client'

import React, { useState } from 'react'
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Coins,
  CreditCard,
  QrCode,
  Download,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  PhoneCall,
  Check
} from 'lucide-react'

type Warehouse = {
  id: string
  name: string
  location: string
  distanceKm: number
  wdraNumber: string
  capacityAvailable: string
  dailyRatePerBag: number
  storageType: string
  features: string[]
}

const PARTNER_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Baramati Agri-Logistics & Modern Silo',
    location: 'MIDC Phase 2, Baramati, Pune',
    distanceKm: 8,
    wdraNumber: 'WDRA-REG-MH-2023-0941',
    capacityAvailable: '4,500 Quintals',
    dailyRatePerBag: 0.85,
    storageType: 'Moisture Controlled Grain Silo',
    features: ['24/7 CCTV & Fire Insured', 'Digital e-NWR Integration', 'On-Site Quality Testing Lab']
  },
  {
    id: 'wh-2',
    name: 'Sahyadri Farmer Producer Cold Chain & Storage',
    location: 'Mohol Road, Solapur Border',
    distanceKm: 24,
    wdraNumber: 'WDRA-REG-MH-2022-1872',
    capacityAvailable: '2,800 Quintals',
    dailyRatePerBag: 1.2,
    storageType: 'Climate Controlled Cold Storage (Onion & Fruits)',
    features: ['0-4°C Multi-Chamber', 'Sprout Inhibition Tech', 'SBI & HDFC Bank Pledge Empanelled']
  },
  {
    id: 'wh-3',
    name: 'Central Agro Warehousing Corp (CWC)',
    location: 'Near APMC Yard, Daund',
    distanceKm: 32,
    wdraNumber: 'WDRA-REG-CWC-2021-0412',
    capacityAvailable: '12,000 Quintals',
    dailyRatePerBag: 0.75,
    storageType: 'Dry Bulk Covered Godown',
    features: ['Govt Accredited', 'Fumigation Certified', 'Direct Mandi Linkage']
  }
]

export default function WarehouseReceiptsFinancing() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('wh-1')
  const [commodity, setCommodity] = useState('Soybean (Yellow)')
  const [quintals, setQuintals] = useState<number>(100)
  const [moisture, setMoisture] = useState<number>(10.8)
  const [grade, setGrade] = useState<'Grade A' | 'Grade B / FAQ'>('Grade A')
  const [holdingMonths, setHoldingMonths] = useState<number>(2)
  const [isLoanApplied, setIsLoanApplied] = useState(false)

  const selectedWarehouse =
    PARTNER_WAREHOUSES.find((w) => w.id === selectedWarehouseId) || PARTNER_WAREHOUSES[0]

  // Financial Metrics
  const estimatedPricePerQtl = commodity.includes('Soybean')
    ? 4720
    : commodity.includes('Cotton')
    ? 7150
    : 2850

  const totalCommodityValue = quintals * estimatedPricePerQtl
  // 75% Loan-to-Value (LTV) government subsidized warehouse loan
  const maxLoanAmount = Math.round(totalCommodityValue * 0.75)

  // 7% annual interest rate under priority sector lending (0.583% per month)
  const monthlyInterest = Math.round((maxLoanAmount * 0.07) / 12)
  const totalInterest = monthlyInterest * holdingMonths

  // Warehouse storage charges: ~₹30/qtl/month
  const totalStorageFee = Math.round(quintals * 30 * holdingMonths)

  // Price appreciation estimate from holding: ~12% in 2 months
  const projectedAppreciation = Math.round(totalCommodityValue * 0.12)
  const netFarmerProfit = projectedAppreciation - totalInterest - totalStorageFee

  const eNwrReceiptId = `eNWR-MH-${selectedWarehouse.wdraNumber.slice(-4)}-${quintals * 42}`

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-md md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-bold text-lime-300">
              <Building className="h-4 w-4" /> MVP 3 · Financial Exclusion Solution
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              Warehouse Receipts (e-NWR) & Pledge Financing
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
              Never get forced into a distress sale to pay off debts. Store your harvest in accredited WDRA partner
              warehouses, receive a tamper-proof digital receipt (e-NWR), and unlock an instant{' '}
              <strong className="text-lime-300">75% pledge loan at 7% subsidized interest</strong> so you can hold for
              peak prices without a cash crunch.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> Solves Financial Exclusion
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> WDRA Govt Accredited
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> 75% LTV Loan in 24 Hours
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-900/50 p-5 text-center backdrop-blur-xs">
            <p className="text-xs font-bold text-emerald-300">Pre-Approved Pledge Credit</p>
            <p className="mt-1 text-3xl font-black text-lime-400">75% LTV</p>
            <p className="mt-1 text-[11px] text-emerald-200">At 7% Annual Agri Rate</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Step 1: Warehouse Discovery & Harvest Details (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 1: Select Partner Warehouse
            </h3>

            <div className="mt-4 space-y-3">
              {PARTNER_WAREHOUSES.map((wh) => {
                const isSelected = selectedWarehouseId === wh.id
                return (
                  <label
                    key={wh.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="warehouse"
                      checked={isSelected}
                      onChange={() => setSelectedWarehouseId(wh.id)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{wh.name}</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                          {wh.distanceKm} km away
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-500">{wh.storageType}</p>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                        Accreditation: <strong>{wh.wdraNumber}</strong>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        {wh.features.map((f, i) => (
                          <span key={i} className="rounded bg-emerald-50 px-1.5 py-0.5 dark:bg-slate-800">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>

            <hr className="my-5 border-slate-100 dark:border-slate-800" />

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 2: Produce Storage Parameters
            </h3>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Commodity to Store</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Soybean (Yellow)">Soybean (Yellow) · Current: ₹4,720/qtl</option>
                  <option value="Cotton (Medium Staple)">Cotton (Medium Staple) · Current: ₹7,150/qtl</option>
                  <option value="Sharbati Wheat">Sharbati Wheat · Current: ₹2,850/qtl</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity (Quintals)</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={quintals}
                    onChange={(e) => setQuintals(Math.max(10, Number(e.target.value)))}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Moisture Content</label>
                  <input
                    type="number"
                    step={0.1}
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Intended Holding Tenure</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((months) => (
                    <button
                      key={months}
                      onClick={() => setHoldingMonths(months)}
                      className={`rounded-xl border p-2 text-xs font-bold transition ${
                        holdingMonths === months
                          ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {months} {months === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 & 3: Digital e-NWR Receipt & Instant Pledge Financing Card (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Digital Warehouse Receipt (e-NWR) Card */}
          <div className="overflow-hidden rounded-3xl border-2 border-emerald-500/80 bg-white shadow-sm dark:border-emerald-700 dark:bg-slate-900">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-800 to-green-800 px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-lime-300" />
                <div>
                  <h3 className="text-base font-black">Electronic Negotiable Warehouse Receipt (e-NWR)</h3>
                  <p className="text-[10px] text-emerald-200">
                    Regulated by Warehousing Development and Regulatory Authority (WDRA)
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-lime-400 px-3 py-1 font-mono text-[11px] font-black text-emerald-950">
                {eNwrReceiptId}
              </span>
            </div>

            <div className="p-6">
              {/* Receipt Parameters Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Commodity</p>
                  <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{commodity.split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Deposited Weight</p>
                  <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                    {quintals} Quintals ({quintals * 2} Bags)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Lab Moisture</p>
                  <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">{moisture}% (Safe)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Valuation</p>
                  <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                    ₹{totalCommodityValue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Warehouse & Insurance Details */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Stored at: <strong>{selectedWarehouse.name}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Comprehensive Fire & Flood Insured
                </span>
              </div>
            </div>
          </div>

          {/* Instant Pledge Loan Calculator & Application Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Instant Pledge Loan Against e-NWR
                  </h3>
                  <p className="text-xs text-slate-500">
                    Access immediate working capital without selling your harvest today
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                Subsidized Interest: 7% p.a. (~0.58%/mo)
              </div>
            </div>

            {/* Loan Breakdown */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Pre-Approved Loan (75% LTV)
                </p>
                <p className="mt-1 text-2xl font-black">₹{maxLoanAmount.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-[10px] text-emerald-600">Disbursed directly to Bank / KCC</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Interest ({holdingMonths} Mo @ 7%)
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  ₹{totalInterest.toLocaleString('en-IN')}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Only ₹{monthlyInterest}/month</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Net Profit From Holding
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  +₹{netFarmerProfit.toLocaleString('en-IN')}
                </p>
                <p className="mt-1 text-[10px] text-emerald-600">After interest & warehouse rent</p>
              </div>
            </div>

            {/* Benefit Equation & Slide 3 Transparent Monetization */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-850 dark:text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">Why this model eliminates farmer debt distress:</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Slide 3 · Earn When You Earn
                </span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[11px] list-disc pl-4">
                <li>
                  You get <strong>₹{maxLoanAmount.toLocaleString('en-IN')}</strong> in cash today to pay off laborers and debts.
                </li>
                <li>
                  Your produce remains safely preserved in a cold/dry warehouse while market prices climb.
                </li>
                <li>
                  When prices hit peak in {holdingMonths} months, the produce is sold directly from the warehouse at{' '}
                  <strong>₹{(totalCommodityValue + projectedAppreciation).toLocaleString('en-IN')}</strong>.
                </li>
                <li>
                  The bank loan (₹{maxLoanAmount}) and nominal interest (₹{totalInterest}) are deducted, and the remaining{' '}
                  <strong>+₹{netFarmerProfit.toLocaleString('en-IN')} extra net profit</strong> goes straight to your pocket!
                </li>
                <li className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  Zero Upfront Cost: Platform fee (1.5% = ₹{Math.round(maxLoanAmount * 0.015).toLocaleString('en-IN')}) is deducted directly from loan disbursal. Your local Kendra earns 50% channel share.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Zero Prepayment Penalty · Bullet Repayment on Harvest Sale</span>
              </div>

              {isLoanApplied ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 text-xs font-extrabold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  <Check className="h-4 w-4" />
                  <span>Application Submitted! Loan Sanctioning to Bank Account</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoanApplied(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-xs font-extrabold text-white shadow-md transition hover:bg-emerald-800 active:scale-95"
                >
                  <Coins className="h-4 w-4 text-lime-300" />
                  <span>Apply for Instant ₹{maxLoanAmount.toLocaleString('en-IN')} Pledge Loan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
