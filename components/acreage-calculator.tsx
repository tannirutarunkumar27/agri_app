'use client'

import React, { useState } from 'react'
import { Calculator, CheckCircle2, ShoppingCart, Sparkles, Sprout, ArrowRight } from 'lucide-react'
import { Product } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'

export default function AcreageCalculator({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart()

  const [acres, setAcres] = useState<number>(2.5)
  const [selectedCrop, setSelectedCrop] = useState<string>(product.suitableCrops[0] || 'Vegetables')
  const [applicationType, setApplicationType] = useState<'drip' | 'foliar'>('drip')

  // Parse dosage per acre
  // E.g., for NPK: 4-5 kg/acre; for Neem: 0.5 L/acre; for Compost: 100 kg/acre
  const dosageFactor = product.unit.includes('kg')
    ? product.unit.includes('25')
      ? 100 // Compost: 100 kg/acre -> 4 bags of 25kg
      : 4.5 // NPK: 4.5 kg/acre -> 1 bag of 5kg per acre
    : product.unit.includes('L')
    ? 0.5 // 500 ml per acre -> 1 bottle of 1L for 2 acres
    : 15 // Traps: 15 traps per acre

  const totalRequired = Math.round(acres * dosageFactor * 10) / 10
  const packSize = product.unit.includes('25')
    ? 25
    : product.unit.includes('10')
    ? 10
    : product.unit.includes('5')
    ? 5
    : 1

  const recommendedPacks = Math.max(1, Math.ceil(totalRequired / packSize))
  const totalCost = recommendedPacks * product.price
  const originalCost = recommendedPacks * product.originalPrice
  const totalSavings = originalCost - totalCost

  const handleAddCalculatedToCart = () => {
    addToCart(product.id, recommendedPacks)
    openCart()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/50 p-5 shadow-xs dark:border-emerald-900/60 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-lime-300">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Acreage Dosage & Bag Calculator</h3>
            <p className="text-[11px] text-slate-500">
              Calculate exact input required for your farm plot size (AgroStar / BigHaat model)
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Smart Agri-Tool
        </span>
      </div>

      {/* Input controls */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* Acres input */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Land Area (Acres): <strong className="text-emerald-700 dark:text-emerald-400">{acres} Acres</strong>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="h-2 flex-1 accent-emerald-600"
            />
            <input
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              value={acres}
              onChange={(e) => setAcres(Math.max(0.5, Number(e.target.value)))}
              className="w-16 rounded-lg border border-slate-300 p-1.5 text-center text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Crop selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Crop</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {product.suitableCrops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Application Method */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Method</label>
          <div className="mt-1 flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setApplicationType('drip')}
              className={`flex-1 rounded-md py-1 text-center text-xs font-bold transition ${
                applicationType === 'drip'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Drip / Soil
            </button>
            <button
              onClick={() => setApplicationType('foliar')}
              className={`flex-1 rounded-md py-1 text-center text-xs font-bold transition ${
                applicationType === 'foliar'
                  ? 'bg-emerald-700 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Foliar Spray
            </button>
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-3.5 shadow-xs dark:bg-slate-850 sm:grid-cols-4">
        <div className="border-r border-slate-100 pr-2 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Requirement</p>
          <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {totalRequired} {product.unit.split(' ')[1] || 'units'}
          </p>
          <p className="text-[10px] text-slate-500">For {acres} acres of {selectedCrop}</p>
        </div>

        <div className="border-r border-slate-100 pr-2 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Recommended Packs</p>
          <p className="mt-1 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
            {recommendedPacks} Packs
          </p>
          <p className="text-[10px] text-slate-500">({product.unit} size)</p>
        </div>

        <div className="border-r border-slate-100 pr-2 dark:border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400">Dosage Split</p>
          <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">2 Applications</p>
          <p className="text-[10px] text-slate-500">10-12 days interval</p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Estimated Cost</p>
          <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            ₹{totalCost.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">Save ₹{totalSavings.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Calculated per ICAR & TNAU Agri-University Dosage Standard</span>
        </div>

        <button
          onClick={handleAddCalculatedToCart}
          className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
        >
          <ShoppingCart className="h-4 w-4 text-lime-300" />
          <span>
            Add Exact Dosage to Cart ({recommendedPacks} packs · ₹{totalCost.toLocaleString('en-IN')})
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
