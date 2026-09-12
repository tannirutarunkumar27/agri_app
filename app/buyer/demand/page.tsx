'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  Truck,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  XCircle,
  PauseCircle,
  PlayCircle
} from 'lucide-react'

interface DemandItem {
  id: string
  commodity_name: string
  commodity_category: string
  variety_name: string
  grade_name: string
  required_quantity: number
  filled_quantity: number
  remaining_quantity: number
  quantity_unit: string
  target_price_per_unit: number
  maximum_price_per_unit: number
  delivery_location: string
  delivery_radius_km: number
  delivery_preference: string
  required_from_date: string
  required_until_date: string
  status: string
  expires_at: string
  is_expired: boolean
  matching_farmers_count: number
}

interface SupplierMatch {
  listing_id: string
  farmer_name: string
  farmer_phone: string
  crop_name: string
  variety: string
  quality_grade: string
  available_quantity: number
  unit: string
  asking_price: number
  distance_km: number
  match_score: number
  positive_explanations: string[]
  caution_explanations: string[]
  reliability_rating?: number
  location?: string
}

export default function BuyerDemandDashboard() {
  const [demands, setDemands] = useState<DemandItem[]>([])
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'EXPIRED'>('ALL')
  const [loading, setLoading] = useState<boolean>(true)

  // Supplier modal state
  const [selectedDemand, setSelectedDemand] = useState<DemandItem | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierMatch[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('score')

  const fetchDemands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/buyer/demand')
      const data = await res.json()
      if (data.success) {
        setDemands(data.demands || [])
      }
    } catch (err) {
      console.error('Failed to load demands:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemands()
  }, [])

  // Open supplier discovery drawer
  const openSupplierDiscovery = async (demand: DemandItem) => {
    setSelectedDemand(demand)
    setLoadingSuppliers(true)
    try {
      const res = await fetch(`/api/matching/buyer-suppliers?demand_id=${demand.id}&sort_by=${sortBy}`)
      const data = await res.json()
      if (data.success) {
        setSuppliers(data.suppliers || [])
      }
    } catch (err) {
      console.error('Failed to load matching suppliers:', err)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (demandId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/buyer/demand/${demandId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        fetchDemands()
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const filteredDemands = demands.filter(d => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'EXPIRED') return d.is_expired || d.status === 'EXPIRED'
    return d.status === activeTab && !d.is_expired
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Buyer Demand & Procurement Desk
                </h1>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                  Active Procurement
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage your open crop requests, monitor remaining volumes, and discover matched farmer supplies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/farmer/buyer-requests"
              className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Farmer View
            </Link>

            <Link
              href="/buyer/demand/create"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Crop Demand</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'OPEN', label: 'Open & Active' },
            { id: 'PARTIALLY_FILLED', label: 'Partially Filled' },
            { id: 'FILLED', label: 'Completed / Filled' },
            { id: 'EXPIRED', label: 'Expired' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demand Cards List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading your procurement requests...</div>
        ) : filteredDemands.length > 0 ? (
          <div className="space-y-4">
            {filteredDemands.map(demand => {
              const fillPercent = demand.required_quantity > 0
                ? Math.round((demand.filled_quantity / demand.required_quantity) * 100)
                : 0

              return (
                <div
                  key={demand.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {demand.commodity_name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          ({demand.variety_name})
                        </span>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {demand.grade_name}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          demand.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : demand.status === 'PARTIALLY_FILLED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : demand.status === 'FILLED'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {demand.is_expired ? 'EXPIRED' : demand.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                          {demand.delivery_location} (±{demand.delivery_radius_km} km)
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          Required: {demand.required_from_date} to {demand.required_until_date}
                        </span>
                      </div>
                    </div>

                    {/* Price Range Badge */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 border border-slate-200/60 dark:border-slate-800 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Price</span>
                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                        ₹{demand.target_price_per_unit.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Cap: ₹{demand.maximum_price_per_unit.toLocaleString('en-IN')} /{demand.quantity_unit}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Procurement Progress: <strong>{demand.filled_quantity} / {demand.required_quantity} {demand.quantity_unit}</strong>
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">
                        Remaining: {demand.remaining_quantity} {demand.quantity_unit} ({100 - fillPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${fillPercent}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all"
                      />
                    </div>
                  </div>

                  {/* Actions & Farmer Matches Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1 font-bold">
                        <Users className="h-3.5 w-3.5" />
                        {demand.matching_farmers_count} Matching Farmers in Procurement Radius
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {demand.status === 'OPEN' && (
                        <button
                          onClick={() => handleStatusUpdate(demand.id, 'PAUSED')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                        >
                          Pause
                        </button>
                      )}
                      {demand.status === 'PAUSED' && (
                        <button
                          onClick={() => handleStatusUpdate(demand.id, 'OPEN')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                        >
                          Resume
                        </button>
                      )}
                      {['OPEN', 'PAUSED'].includes(demand.status) && (
                        <button
                          onClick={() => handleStatusUpdate(demand.id, 'CANCELLED')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => openSupplierDiscovery(demand)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold transition shadow-xs"
                      >
                        <span>Find Matching Farmers</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No demand requests in this filter</h3>
              <p className="text-xs text-slate-500 mt-1">Publish your first commodity demand to start receiving direct farmer lots.</p>
            </div>
            <Link
              href="/buyer/demand/create"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Crop Demand</span>
            </Link>
          </div>
        )}

      </main>

      {/* Supplier Discovery Modal */}
      {selectedDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Matching Engine</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Best Matching Farmers for {selectedDemand.commodity_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedDemand.remaining_quantity} {selectedDemand.quantity_unit} at ₹{selectedDemand.target_price_per_unit}/{selectedDemand.quantity_unit}
                </p>
              </div>

              <button
                onClick={() => setSelectedDemand(null)}
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Sort Bar */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{suppliers.length} candidate farmers found</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    openSupplierDiscovery(selectedDemand)
                  }}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="score">Match Score (%)</option>
                  <option value="price">Lowest Asking Price</option>
                  <option value="distance">Nearest Distance (km)</option>
                  <option value="quantity">Largest Quantity</option>
                  <option value="reliability">Farmer Reliability</option>
                </select>
              </div>
            </div>

            {/* Supplier List */}
            {loadingSuppliers ? (
              <div className="text-center py-10 text-xs text-slate-400">Scoring farmer compatibility...</div>
            ) : suppliers.length > 0 ? (
              <div className="space-y-3">
                {suppliers.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500 transition space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.farmer_name}</h4>
                          <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-bold">
                            ★ {s.reliability_rating}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {s.location} · {s.distance_km} km away · {s.variety}
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right">
                        <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-black">
                          {s.match_score}% Match
                        </span>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-1">
                          ₹{s.asking_price.toLocaleString('en-IN')} /{s.unit}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white dark:bg-slate-800 p-3 text-xs space-y-1">
                      <div className="text-[11px] font-bold text-slate-500">Available Volume: {s.available_quantity} {s.unit}</div>
                      <div className="space-y-0.5 pt-1">
                        {s.positive_explanations.slice(0, 3).map((exp, eIdx) => (
                          <div key={eIdx} className="text-emerald-700 dark:text-emerald-400 text-[11px]">{exp}</div>
                        ))}
                        {s.caution_explanations.slice(0, 2).map((cExp, cIdx) => (
                          <div key={cIdx} className="text-amber-700 dark:text-amber-400 text-[11px]">{cExp}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Link
                        href={`/marketplace?search=${encodeURIComponent(s.farmer_name)}`}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition"
                      >
                        Contact & Request Produce
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No active farmers matching this demand currently.</div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDemand(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
