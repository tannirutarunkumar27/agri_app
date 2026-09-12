'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  ChevronLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface Commodity {
  id: string
  name: string
  category: string
  default_unit: string
}

interface Variety {
  id: string
  commodity_id: string
  name: string
}

export default function CreateBuyerDemandPage() {
  const router = useRouter()
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [varieties, setVarieties] = useState<Variety[]>([])

  // Form states
  const [commodityId, setCommodityId] = useState<string>('comm-redgram')
  const [varietyId, setVarietyId] = useState<string>('')
  const [gradeId, setGradeId] = useState<string>('grade-faq')
  const [requiredQuantity, setRequiredQuantity] = useState<number>(40)
  const [quantityUnit, setQuantityUnit] = useState<string>('Quintal')
  const [minimumQuantity, setMinimumQuantity] = useState<number>(10)
  const [targetPrice, setTargetPrice] = useState<number>(7350)
  const [maximumPrice, setMaximumPrice] = useState<number>(7500)
  const [requiredFromDate, setRequiredFromDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [requiredUntilDate, setRequiredUntilDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 15)
    return d.toISOString().split('T')[0]
  })
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Warangal Enamamula Market Yard, Telangana')
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(100)
  const [deliveryPreference, setDeliveryPreference] = useState<string>('FARM_GATE_PICKUP')
  const [qualityRequirements, setQualityRequirements] = useState<string>('FAQ Grade, clean sun-dried, moisture < 11%, zero weevils.')
  const [notes, setNotes] = useState<string>('Procuring for commercial processing. Direct digital weighbridge and instant escrow clearance.')
  const [expiresInDays, setExpiresInDays] = useState<number>(30)

  // Market benchmark states
  const [mandiModal, setMandiModal] = useState<number | null>(null)
  const [forecast30d, setForecast30d] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Fetch commodities and varieties
  useEffect(() => {
    async function loadMasters() {
      try {
        const res = await fetch('/api/market/commodities')
        const data = await res.json()
        if (data.success && data.commodities.length > 0) {
          setCommodities(data.commodities)
          setVarieties(data.varieties || [])
        }
      } catch (err) {
        console.error('Failed to load commodities:', err)
      }
    }
    loadMasters()
  }, [])

  // Fetch live mandi benchmark for selected crop
  useEffect(() => {
    async function loadPriceContext() {
      try {
        const res = await fetch(`/api/market/prices?commodity_id=${commodityId}&limit=1`)
        const data = await res.json()
        if (data.success && data.prices.length > 0) {
          const modal = data.prices[0].modal_price
          setMandiModal(modal)
          setForecast30d(Math.round(modal * 1.025))
          if (targetPrice === 7350 && commodityId !== 'comm-redgram') {
            setTargetPrice(modal)
            setMaximumPrice(Math.round(modal * 1.05))
          }
        }
      } catch (err) {
        console.error('Failed to load price context:', err)
      }
    }
    loadPriceContext()
  }, [commodityId])

  const filteredVarieties = varieties.filter(v => v.commodity_id === commodityId)
  const selectedComm = commodities.find(c => c.id === commodityId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/buyer/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_id: commodityId,
          variety_id: varietyId || null,
          grade_id: gradeId || null,
          required_quantity: Number(requiredQuantity),
          quantity_unit: quantityUnit,
          minimum_quantity: Number(minimumQuantity),
          target_price_per_unit: Number(targetPrice),
          maximum_price_per_unit: Number(maximumPrice),
          required_from_date: requiredFromDate,
          required_until_date: requiredUntilDate,
          delivery_location: deliveryLocation,
          delivery_radius_km: Number(deliveryRadiusKm),
          delivery_preference: deliveryPreference,
          quality_requirements: qualityRequirements,
          notes,
          expires_in_days: Number(expiresInDays)
        })
      })

      const data = await res.json()
      if (data.success) {
        router.push('/buyer/demand')
      } else {
        setErrorMsg(data.error || 'Failed to publish demand request.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error submitting demand.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/buyer/demand"
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <span>Publish Buyer Procurement Demand</span>
              </h1>
              <p className="text-xs text-slate-500">
                Broadcast your required crop volume and target price directly to local farmers
              </p>
            </div>
          </div>

          <Link
            href="/buyer/demand"
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
          >
            My Demands
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Market Price Intelligence Strip */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/30 p-4 border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Live Agmarknet Mandi Rates ({selectedComm?.name || 'Selected Commodity'}):</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span>Current Mandi Modal: <strong className="text-slate-900 dark:text-white">₹{mandiModal?.toLocaleString('en-IN') || '7,250'} / Qtl</strong></span>
                <span>·</span>
                <span>30-Day Forecast: <strong className="text-emerald-700 dark:text-emerald-400">₹{forecast30d?.toLocaleString('en-IN') || '7,450'} / Qtl</strong></span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              💡 Pricing within ±3% of mandi modal attracts fast farmer offers
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Commodity & Variety */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>1. Commodity Specifications</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Commodity: *
                </label>
                <select
                  value={commodityId}
                  onChange={(e) => setCommodityId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {commodities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Variety (Optional):
                </label>
                <select
                  value={varietyId}
                  onChange={(e) => setVarietyId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">Any Variety (Standard)</option>
                  {filteredVarieties.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Minimum Quality Grade:
                </label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="grade-faq">FAQ (Fair Average Quality)</option>
                  <option value="grade-a">Grade A (Premium / Bold)</option>
                  <option value="grade-b">Grade B (Standard Commercial)</option>
                  <option value="grade-export">Export Specification</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Quantity & Target Price */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>2. Quantity & Target Pricing</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Required Quantity: *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">{quantityUnit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Min Order Acceptance:
                </label>
                <input
                  type="number"
                  min="1"
                  value={minimumQuantity}
                  onChange={(e) => setMinimumQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Price (₹/{quantityUnit}): *
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Maximum Price Cap (₹/{quantityUnit}): *
                </label>
                <input
                  type="number"
                  min="1"
                  value={maximumPrice}
                  onChange={(e) => setMaximumPrice(Math.max(targetPrice, parseFloat(e.target.value) || targetPrice))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery & Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>3. Delivery Location & Timeline</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Procurement Delivery Hub / Mandi Yard: *
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="E.g. Warangal Enamamula Market Yard or Factory Mill Gate"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Delivery Radius (km):
                  </label>
                  <select
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value={50}>Within 50 km</option>
                    <option value={100}>Within 100 km</option>
                    <option value={150}>Within 150 km</option>
                    <option value={250}>Within 250 km (Regional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Logistics Preference:
                  </label>
                  <select
                    value={deliveryPreference}
                    onChange={(e) => setDeliveryPreference(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="FARM_GATE_PICKUP">Buyer Farm-Gate Pickup</option>
                    <option value="DELIVERY_TO_WAREHOUSE">Farmer Delivery to Mill</option>
                    <option value="EITHER">Either Pickup or Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Required From Date: *
                </label>
                <input
                  type="date"
                  value={requiredFromDate}
                  onChange={(e) => setRequiredFromDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Required Until Date: *
                </label>
                <input
                  type="date"
                  value={requiredUntilDate}
                  onChange={(e) => setRequiredUntilDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Quality Specs & Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              4. Quality Specs & Inspection Notes
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Quality Requirements:
              </label>
              <input
                type="text"
                value={qualityRequirements}
                onChange={(e) => setQualityRequirements(e.target.value)}
                placeholder="E.g. Moisture < 11%, zero weevils, ASTA 100+ color, machine cleaned"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer Notes & Payment Terms:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Immediate digital payment upon electronic weighbridge slip. Escrow protected."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/buyer/demand"
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 text-xs font-black shadow-md transition disabled:opacity-50"
            >
              <span>{submitting ? 'Publishing Demand...' : 'Broadcast Buyer Demand Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
