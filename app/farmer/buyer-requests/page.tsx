'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Truck,
  Filter,
  Sparkles,
  ChevronRight,
  Clock,
  Send,
  X
} from 'lucide-react'

interface MarketContext {
  current_mandi_modal: number
  buyer_price_range: string
  farmer_asking_price: number
  forecast_30d_modal: number
  forecast_range: string
}

interface OfferPrefill {
  commodity_id: string
  commodity_name: string
  variety_name: string
  quantity: number
  unit: string
  buyer_target_price: number
  suggested_offer_price: number
  buyer_id: string
  buyer_name: string
  demand_id: string
}

interface BuyerOpportunity {
  demand_id: string
  buyer_id: string
  buyer_name: string
  company_name: string
  business_type: string
  verification_level: string
  buyer_rating: number
  buyer_completed_trades: number
  commodity_id: string
  commodity_name: string
  variety_name: string
  grade_name: string
  required_quantity: number
  remaining_quantity: number
  quantity_unit: string
  target_price_per_unit: number
  maximum_price_per_unit: number
  required_from_date: string
  required_until_date: string
  delivery_location: string
  delivery_radius_km: number
  delivery_preference: string
  quality_requirements: string
  notes: string
  match_score: number
  score_breakdown: any
  positive_explanations: string[]
  caution_explanations: string[]
  distance_km: number | null
  market_context: MarketContext
  offer_prefill: OfferPrefill
}

export default function FarmerBuyerRequestsPage() {
  const [opportunities, setOpportunities] = useState<BuyerOpportunity[]>([])
  const [selectedCrop, setSelectedCrop] = useState<string>('comm-redgram')
  const [farmerQuantity, setFarmerQuantity] = useState<number>(40)
  const [farmerAskingPrice, setFarmerAskingPrice] = useState<number>(7350)
  const [loading, setLoading] = useState<boolean>(true)

  // Direct Offer Drawer state
  const [activeOfferTarget, setActiveOfferTarget] = useState<BuyerOpportunity | null>(null)
  const [offerQty, setOfferQty] = useState<number>(40)
  const [offerPrice, setOfferPrice] = useState<number>(7350)
  const [deliveryMethod, setDeliveryMethod] = useState<string>('BUYER_PICKUP')
  const [offerMessage, setOfferMessage] = useState<string>('')
  const [submittingOffer, setSubmittingOffer] = useState<boolean>(false)
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string>('')
  const [offerErrorMsg, setOfferErrorMsg] = useState<string>('')

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const url = `/api/matching/farmer-opportunities?commodity_id=${selectedCrop}&quantity=${farmerQuantity}&asking_price=${farmerAskingPrice}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setOpportunities(data.opportunities || [])
      }
    } catch (err) {
      console.error('Failed to load farmer opportunities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [selectedCrop, farmerQuantity, farmerAskingPrice])

  // Open Direct Offer Modal
  const handleOpenOfferModal = (opp: BuyerOpportunity) => {
    setActiveOfferTarget(opp)
    setOfferQty(opp.offer_prefill.quantity)
    setOfferPrice(opp.offer_prefill.suggested_offer_price)
    setOfferMessage(`Hello ${opp.buyer_name}, I have a clean harvest lot of ${opp.commodity_name} (${opp.grade_name}) ready for inspection and delivery.`)
    setOfferSuccessMsg('')
    setOfferErrorMsg('')
  }

  // Submit Direct Offer to existing marketplace engine
  const handleSubmitDirectOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOfferTarget) return

    setSubmittingOffer(true)
    setOfferErrorMsg('')
    setOfferSuccessMsg('')

    try {
      // Find a listing id or use default
      const res = await fetch('/api/marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: 'list-mirchi-guntur', // reuses existing listing or links directly
          demandRequestId: activeOfferTarget.demand_id,
          buyerName: activeOfferTarget.buyer_name,
          buyerPhone: '9876543210',
          offeredPricePerUnit: Number(offerPrice),
          requestedQuantity: Number(offerQty),
          deliveryMethod,
          message: offerMessage
        })
      })

      const data = await res.json()
      if (data.success) {
        setOfferSuccessMsg(`Offer of ₹${offerPrice}/${activeOfferTarget.quantity_unit} successfully submitted to ${activeOfferTarget.buyer_name}!`)
        setTimeout(() => {
          setActiveOfferTarget(null)
          setOfferSuccessMsg('')
        }, 2200)
      } else {
        setOfferErrorMsg(data.error || 'Failed to submit offer.')
      }
    } catch (err: any) {
      setOfferErrorMsg(err.message || 'Network error submitting offer.')
    } finally {
      setSubmittingOffer(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-emerald-100 dark:border-emerald-950/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Buyer Demand Discovery & Matching
                </h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Direct Buyer Opportunities
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Discover verified agro-processors, mills, and traders currently seeking your harvest with target prices & match scores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/market"
              className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Mandi Rates
            </Link>

            <Link
              href="/buyer/demand"
              className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Buyer Desk
            </Link>

            <Link
              href="/marketplace/sell"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
            >
              Post Produce Listing
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Farmer Supply Simulation Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Your Available Harvest Lot
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Crop Selector */}
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="comm-redgram">Red Gram / Tur (तुवर दाल)</option>
                <option value="comm-mirchi">Mirchi / Chilli (मिर्ची)</option>
                <option value="comm-rice">Rice / Paddy (धान)</option>
                <option value="comm-cotton">Cotton / Kapas (कपास)</option>
                <option value="comm-onion">Onion / Kanda (प्याज)</option>
              </select>

              {/* Quantity */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">Lot:</span>
                <input
                  type="number"
                  min="1"
                  value={farmerQuantity}
                  onChange={(e) => setFarmerQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="font-bold text-slate-500">Quintals</span>
              </div>

              {/* Asking Price */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">Asking:</span>
                <input
                  type="number"
                  min="1"
                  value={farmerAskingPrice}
                  onChange={(e) => setFarmerAskingPrice(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400"
                />
                <span className="font-bold text-slate-500">₹/Qtl</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-right">
            <span className="text-slate-400 block">Matching Opportunities Found</span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {opportunities.length} Verified Buyers
            </span>
          </div>
        </div>

        {/* Matching Buyer Demand Cards List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Finding best matching buyers for your harvest...</div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-5">
            {opportunities.map((opp) => (
              <div
                key={opp.demand_id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition space-y-4 relative overflow-hidden"
              >
                {/* Top Strip: Buyer Identity & Match Score */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {opp.commodity_name} BUY REQUEST
                      </span>
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.2 text-[10px] font-bold">
                        {opp.grade_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {opp.company_name}
                      </h3>
                      {opp.verification_level === 'BUSINESS_VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                          <ShieldCheck className="h-3 w-3" /> Verified Mill / Processor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          ★ {opp.buyer_rating} ({opp.buyer_completed_trades} trades)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                      <span>{opp.business_type}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        {opp.delivery_location} {opp.distance_km ? `(Within ${opp.distance_km} km)` : ''}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        Window: {opp.required_from_date} – {opp.required_until_date}
                      </span>
                    </div>
                  </div>

                  {/* Match Percentage Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Compatibility</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          {opp.match_score}%
                        </span>
                        <span className="text-xs font-bold text-slate-500">Match</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Volume</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {opp.required_quantity} {opp.quantity_unit}s
                    </strong>
                    <span className="text-[11px] text-slate-500 block">
                      ({opp.required_quantity * 100} kg)
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Buyer Target Price</span>
                    <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{opp.target_price_per_unit.toLocaleString('en-IN')}
                    </strong>
                    <span className="text-[11px] text-slate-500 block">
                      Up to ₹{opp.maximum_price_per_unit.toLocaleString('en-IN')}/{opp.quantity_unit}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Logistics Mode</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                      {opp.delivery_preference === 'FARM_GATE_PICKUP' ? 'Farm-Gate Pickup' : 'Delivery to Warehouse'}
                    </strong>
                    <span className="text-[11px] text-slate-500">Within {opp.delivery_radius_km} km</span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Security</span>
                    <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      100% Advance Escrow
                    </strong>
                    <span className="text-[11px] text-slate-500">Mandi slip settlement</span>
                  </div>
                </div>

                {/* Transparent Match Explanations Strip */}
                <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Why This Buyer Matches Your Produce:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {opp.positive_explanations.map((p, idx) => (
                      <div key={idx} className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                    {opp.caution_explanations.map((c, idx) => (
                      <div key={idx} className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Price Context Comparison Strip */}
                <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 p-3.5 border border-amber-200/60 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Local Mandi Modal:</span>
                      <strong className="text-slate-900 dark:text-white">₹{opp.market_context.current_mandi_modal}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Buyer Range:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{opp.market_context.buyer_price_range}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Your Expected:</span>
                      <strong className="text-slate-900 dark:text-white">₹{opp.market_context.farmer_asking_price}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">30-Day Mandi Forecast:</span>
                      <strong className="text-indigo-700 dark:text-indigo-400">{opp.market_context.forecast_range}</strong>
                    </div>
                  </div>

                  <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                    💡 Buyer target is in premium range above local mandi modal rate
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    Quality requirements: {opp.quality_requirements || 'Standard Fair Average Quality (FAQ)'}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenOfferModal(opp)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-black shadow-md transition"
                    >
                      <span>MAKE OFFER</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <Users className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No active buyer demands found for this crop</h3>
            <p className="text-xs text-slate-500">Try selecting another crop or adjust your asking price to expand matching buyers.</p>
          </div>
        )}

      </main>

      {/* Direct Make Offer Drawer / Modal */}
      {activeOfferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Direct Trade Workflow</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Submit Offer to {activeOfferTarget.buyer_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Demand: {activeOfferTarget.commodity_name} ({activeOfferTarget.grade_name})
                </p>
              </div>

              <button
                onClick={() => setActiveOfferTarget(null)}
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {offerSuccessMsg && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{offerSuccessMsg}</span>
              </div>
            )}

            {offerErrorMsg && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{offerErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDirectOffer} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Offered Quantity ({activeOfferTarget.quantity_unit}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offerQty}
                    onChange={(e) => setOfferQty(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Offered Price (₹/{activeOfferTarget.quantity_unit}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-black text-emerald-700 dark:text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Estimated Gross Payout:</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                  ₹{(offerQty * offerPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Logistics & Delivery Method:
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="BUYER_PICKUP">Buyer Pickup at Farm-Gate</option>
                  <option value="FARMER_DELIVERY">Farmer Delivers to Mandi / Mill Yard</option>
                  <option value="TRANSPORTER">Third-Party Transporter Arranged</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Direct Message to Buyer:
                </label>
                <textarea
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveOfferTarget(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-black shadow-md transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingOffer ? 'Sending Offer...' : 'Send Formal Offer'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
