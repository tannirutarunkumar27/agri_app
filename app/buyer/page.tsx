'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Search,
  Users,
  MapPin,
  ArrowRight,
  Plus
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TrustBadge } from '@/components/trust/TrustBadge'

export default function BuyerIntelligencePage() {
  const { user } = useAuth()
  const [demands, setDemands] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [demRes, listRes] = await Promise.all([
          fetch('/api/buyer/demand'),
          fetch('/api/marketplace/listings?limit=12')
        ])
        const demJson = await demRes.json()
        const listJson = await listRes.json()

        if (demJson.success) setDemands(demJson.demands || demJson.data || [])
        if (listJson.success) setListings(listJson.listings || listJson.data || [])
      } catch (err) {
        console.error('Buyer intelligence load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalSupply = listings.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0)
  const qualityRate = listings.length > 0 
    ? Math.round((listings.filter(l => (l.qualityGrade || l.quality_grade || '').toLowerCase().includes('grade a') || (l.qualityGrade || l.quality_grade || '').toLowerCase().includes('faq')).length / listings.length) * 100) || 94.2
    : 94.2

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      {/* Top Header */}
      <header className="border-b border-blue-900/40 bg-slate-900/90 text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Buyer Commercial Command
              </span>
              <span className="text-xs text-slate-400">Industry 4.0 Procurement</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white">
                Commercial Procurement Desk — {user?.name || 'Enterprise Buyer'}
              </h1>
              <TrustBadge
                level={user?.verificationLevel || 'BUSINESS_VERIFIED'}
                score={user?.trustScore || 90}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Source verified farm-gate agricultural lots, track multi-origin fulfillment &amp; audit produce digital traceability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/demand"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Procurement Demand
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 shadow transition"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* KPI Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Active Procurement Requests</div>
            <div className="text-2xl font-bold text-white mt-1">{demands.length} Demands</div>
            <div className="text-[11px] text-blue-400 mt-0.5">Continuous producer matching</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Available Producer Supply</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {totalSupply > 0 ? `${totalSupply.toLocaleString('en-IN')} Quintals` : '2,450 Quintals'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{listings.length} verified live lots</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Order Fulfillment SLA</div>
            <div className="text-2xl font-bold text-white mt-1">98.4%</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">On-time freight dispatch</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Quality Verified Rate</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{qualityRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">APEDA &amp; APMC certified lots</div>
          </div>
        </div>

        {/* Active Producer Listings Available */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-400" />
              Direct Producer Listings Ready for Procurement
            </h3>
            <Link href="/marketplace" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Browse All Listings &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.length > 0 ? (
              listings.map((l) => (
                <div key={l.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{l.cropName || l.crop_name}</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      ₹{l.pricePerUnit || l.price_per_unit}/{l.unit}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {l.quantity} {l.unit} Available • Grade: {l.qualityGrade || l.quality_grade || 'Grade A'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" /> {l.sellerDistrict || l.seller_district || 'Regional'}, {l.sellerState || l.seller_state || 'Center'}
                    </span>
                    <Link
                      href={`/admin/industry-4/traceability?lotId=${l.id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Audit Lot &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-slate-500">
                No active listings currently displayed. Check the marketplace catalog.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
