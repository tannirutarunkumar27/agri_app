'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Leaf,
  Store,
  PlusCircle,
  TrendingUp,
  Package,
  CheckCircle2,
  PhoneCall,
  Clock,
  Eye,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function MyListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'ACTIVE' | 'SOLD'>('all')

  useEffect(() => {
    fetchMyListings()
  }, [user])

  const fetchMyListings = async () => {
    setLoading(true)
    try {
      // If user logged in, use their id; otherwise use demo farmer
      const sellerId = user?.userId || user?.id || 'farmer-demo'
      const res = await fetch(`/api/marketplace/listings?seller_id=${sellerId}&status=all`)
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
      }
    } catch (e) {
      console.error('Failed to fetch farmer listings', e)
    } finally {
      setLoading(false)
    }
  }

  const markStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/marketplace/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        fetchMyListings()
      }
    } catch (e) {
      console.error('Failed to update listing status', e)
    }
  }

  const filteredListings = listings.filter((l) => activeTab === 'all' || l.status === activeTab)
  const totalBids = listings.reduce((acc, l) => acc + (l.inquiriesCount || 0), 0)
  const totalViews = listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0)
  const totalLotValue = listings.reduce((acc, l) => acc + (l.quantity * l.pricePerUnit), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-16">
      {/* Top Advisory Strip */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>Farmer Selling Dashboard:</strong> Track Buyer Bids, Manage Inventory & Close Deals</span>
      </div>

      {/* Nav */}
      <header className="border-b border-emerald-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/marketplace" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300">
            <ChevronLeft className="h-4 w-4" />
            <span>Mandi Direct Produce Bazaar</span>
          </Link>

          <Link
            href="/marketplace/sell"
            className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            <PlusCircle className="h-4 w-4 text-lime-300" />
            <span>List New Produce</span>
          </Link>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Produce Listings & Bids
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Farmer: <strong className="text-emerald-800 dark:text-emerald-300">{user?.name || 'Ramesh Patil'}</strong> (Baramati Rural / Latur)
            </p>
          </div>

          <Link
            href="/marketplace/sell"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-800"
          >
            <PlusCircle className="h-4 w-4 text-lime-300" />
            <span>Post Produce for Sale</span>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Total Produce Lots</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{listings.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Buyer Inquiries & Bids</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{totalBids}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Total Buyer Views</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalViews}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-400">Estimated Total Lot Value</span>
            <p className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1 truncate">
              ₹{totalLotValue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            All Lots ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Active ({listings.filter((l) => l.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('SOLD')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'SOLD'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Sold ({listings.filter((l) => l.status === 'SOLD').length})
          </button>
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No produce listings found in this category.
            </p>
            <Link
              href="/marketplace/sell"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-xs font-bold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Your First Lot</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'}
                      alt={item.cropName}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] text-slate-400">Harvest: {item.harvestDate}</span>
                      </div>

                      <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                        <Link href={`/marketplace/listing/${item.id}`} className="hover:underline">
                          {item.cropName}
                        </Link>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Variety: <strong>{item.variety}</strong> · Lot: <strong>{item.quantity} {item.unit}</strong> · Grade: <strong>{item.qualityGrade}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Stats */}
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Asking Rate:</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      ₹{item.pricePerUnit.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/{item.unit.split(' ')[0]}</span>
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      Total: ₹{(item.quantity * item.pricePerUnit).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Status toggle & Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {item.viewsCount} Views
                    </span>
                    <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                      <MessageSquare className="h-3.5 w-3.5" /> {item.inquiriesCount} Buyer Inquiries
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'ACTIVE' ? (
                      <button
                        onClick={() => markStatus(item.id, 'SOLD')}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        Mark as Sold
                      </button>
                    ) : (
                      <button
                        onClick={() => markStatus(item.id, 'ACTIVE')}
                        className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100"
                      >
                        Re-Activate Listing
                      </button>
                    )}

                    <Link
                      href={`/marketplace/listing/${item.id}`}
                      className="flex items-center gap-1 rounded-xl bg-emerald-700 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-800"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
