'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Leaf,
  Store,
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Truck,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Coins,
  Package,
  Layers,
  ChevronRight,
  Eye,
  MessageSquare
} from 'lucide-react'
import { CROP_CATEGORIES, CropCategory } from '@/lib/crops-data'
import { useAuth } from '@/lib/auth-context'

type MarketListing = {
  id: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  sellerVillage: string
  sellerDistrict: string
  sellerState: string
  category: string
  cropId: string
  cropName: string
  variety: string
  quantity: number
  unit: string
  minOrderQuantity: number
  pricePerUnit: number
  mandiBenchmarkPrice?: number
  mspPrice?: number
  isNegotiable: boolean
  qualityGrade: string
  moisturePercent?: number
  harvestDate: string
  isOrganic: boolean
  packagingType: string
  logisticsMode: string
  farmGateAddress: string
  description: string
  images: string[]
  status: string
  viewsCount: number
  inquiriesCount: number
  createdAt: string
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [stateFilter, setStateFilter] = useState('all')
  const [listings, setListings] = useState<MarketListing[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchListings()
  }, [selectedCategory, searchQuery, sortBy, stateFilter])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchQuery.trim()) params.append('q', searchQuery.trim())
      if (stateFilter !== 'all') params.append('state', stateFilter)
      if (sortBy) params.append('sort', sortBy)

      const res = await fetch(`/api/marketplace/listings?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
        setTotalCount(data.totalCount)
      }
    } catch (e) {
      console.error('Failed to load marketplace listings', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      {/* Top Advisory Strip */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>FarmDirect Mandi Bazaar:</strong> Sell Your Harvest Directly to Mills, Traders & Retailers at 0% Commission</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline text-lime-300">📞 Farmer Helpdesk: 1800-FARM-DIRECT (Toll Free)</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-sm">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-emerald-900 dark:text-white">FarmDirect</span>
                <span className="ml-1 text-xs font-bold text-amber-600 dark:text-amber-400">Mandi</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/market" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Mandi Rates & Forecast</span>
              </Link>
              <Link href="/market/advisor" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sell/Hold Advisor</span>
              </Link>
              <Link href="/marketplace" className="rounded-lg bg-emerald-100/70 px-3 py-1.5 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200">
                Browse Produce
              </Link>
              <Link href="/marketplace/orders/selling" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                <span>Farmer Deals</span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Selling</span>
              </Link>
              <Link href="/marketplace/orders/buying" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                <span>Buyer Desk</span>
                <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">Escrow</span>
              </Link>
              <Link href="/transporter/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Transporters</span>
                <span className="rounded-full bg-indigo-100 px-1.5 py-0.2 text-[10px] font-black text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Logistics</span>
              </Link>
              <Link href="/marketplace/my-listings" className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
                <span>My Listings</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace/sell"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-green-800 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-lime-300" />
              <span>Post Produce for Sale</span>
            </Link>

            {user ? (
              <Link
                href="/marketplace/my-listings"
                className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
              >
                <Store className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline">My Shop:</span>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner with Selling CTA & Value Props */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-xl md:p-8">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold text-lime-300">
                <ShieldCheck className="h-4 w-4" /> 100% Direct Farmer-to-Buyer Portal · Zero Dalal Cut
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl text-white">
                Sell Your Harvest Directly at Fair Mandi Prices
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                Post your chillies, red gram, moong dal, vegetables, onions, and fresh orchard fruits.
                Connect with verified mills, wholesale traders, and exporters with farm-gate pickup & instant transparent payments.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href="/market"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2.5 font-bold text-slate-950 shadow-md hover:brightness-105 transition active:scale-95"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Check Today's Mandi Rates & Forecasts</span>
                </Link>
                <Link
                  href="/market/advisor"
                  className="flex items-center gap-2 rounded-xl bg-emerald-800/80 border border-emerald-400/40 px-4 py-2.5 font-bold text-white hover:bg-emerald-800 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Sell vs Hold Advisor</span>
                </Link>
                <Link
                  href="/marketplace/sell"
                  className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 font-bold text-emerald-950 shadow-md hover:bg-lime-300 transition active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>List My Produce for Sale</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" /> MSP Benchmark Protection
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-lime-400" /> Farm Gate Tractor/Truck Pickup
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <PhoneCall className="h-3.5 w-3.5 text-lime-400" /> Direct WhatsApp / Call Connect
                </span>
              </div>
            </div>

            {/* Quick Mandi Highlights Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/10 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-lime-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-lime-300">Live Mandi Benchmarks</span>
                </div>
                <span className="text-[10px] text-emerald-200">Today</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">🌶️ Guntur Red Chilli (Teja)</span>
                  <span className="font-bold text-white">₹18,500 / Qtl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">🫘 Red Gram / Tur (Latur)</span>
                  <span className="font-bold text-white">₹7,650 / Qtl <span className="text-[10px] text-lime-300">(MSP ₹7,550)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">🌱 Green Gram / Moong (Akola)</span>
                  <span className="font-bold text-white">₹8,400 / Qtl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">🧅 Red Onion (Nashik Garwa)</span>
                  <span className="font-bold text-white">₹2,400 / Qtl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-100">🍅 Hybrid Tomatoes (Kolar)</span>
                  <span className="font-bold text-white">₹490 / Crate</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <Link href="/marketplace/sell" className="text-[11px] font-bold text-lime-300 hover:underline">
                  Get high prices for your produce → List in 2 minutes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Strip */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
            }`}
          >
            <span>🌾 All Produce</span>
          </button>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section id="produce-catalog" className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop (e.g. Chilli, Tur, Moong, Tomato), variety, or district..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Punjab">Punjab</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="newest">Newest Harvests First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="views">Most Viewed Lots</option>
            </select>
          </div>
        </div>
      </section>

      {/* Produce Listings Grid */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">No Produce Listings Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              No crops found matching your filters. Try clearing your search or be the first farmer to list this produce!
            </p>
            <Link
              href="/marketplace/sell"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Produce for Sale</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => {
              const mainImage = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-xs transition hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Visual Header with Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={mainImage}
                      alt={item.cropName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Quality Grade Tag */}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 shadow-sm dark:bg-slate-900/90 dark:text-emerald-300">
                      {item.qualityGrade}
                    </span>

                    {/* Organic Badge */}
                    {item.isOrganic && (
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        🌱 Jaivik Organic
                      </span>
                    )}

                    {/* Lot Size overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                      <Package className="h-3.5 w-3.5 text-lime-400" />
                      <span>Lot Available: <strong>{item.quantity} {item.unit}</strong></span>
                    </div>

                    {/* Moisture % Tag */}
                    {item.moisturePercent && (
                      <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-emerald-200 backdrop-blur-xs">
                        Moisture {item.moisturePercent}%
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Location & Harvest Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-emerald-800 dark:text-emerald-400">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{item.sellerDistrict}, {item.sellerState}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Harvest: {item.harvestDate}</span>
                      </span>
                    </div>

                    {/* Crop Name & Variety */}
                    <h2 className="mt-2 text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                      <Link href={`/marketplace/listing/${item.id}`}>
                        {item.cropName}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      Variety: <strong className="text-slate-800 dark:text-slate-200">{item.variety}</strong>
                    </p>

                    {/* Farmer/Seller Profile */}
                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <span>{item.sellerName}</span>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        </p>
                        <p className="text-[10px] text-slate-500">{item.sellerVillage}</p>
                      </div>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Verified Farmer
                      </span>
                    </div>

                    {/* Price Block */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Asking Price:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₹{item.pricePerUnit.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            /{item.unit.split(' ')[0]}
                          </span>
                        </div>
                        {item.isNegotiable && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            ✓ Open to fair buyer negotiation
                          </span>
                        )}
                      </div>

                      {/* Mandi Benchmark comparison */}
                      {item.mandiBenchmarkPrice && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400">APMC Mandi Rate</span>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            ₹{item.mandiBenchmarkPrice.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Logistics Mode */}
                    <p className="mt-2 text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                      <Truck className="h-3 w-3 text-slate-400" />
                      <span>{item.logisticsMode}</span>
                    </p>

                    {/* Footer Stats & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {item.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {item.inquiriesCount} bids
                        </span>
                      </div>

                      <Link
                        href={`/marketplace/listing/${item.id}`}
                        className="flex items-center gap-1 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95"
                      >
                        <span>View & Bid</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* How Farmer Selling Works - 4 Simple Steps */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-green-950 p-8 text-white shadow-lg">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300">
              Transparent Farmer Direct Commerce
            </span>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">How It Works for Farmers & Buyers</h2>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/80">
              Skip middlemen delays and heavy commission cuts. Follow 4 simple steps to get paid transparently.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-emerald-950">
                1
              </div>
              <h3 className="mt-3 text-sm font-bold">List Your Produce</h3>
              <p className="mt-1 text-xs text-emerald-100/70">
                Select your crop (Chilli, Tur, Moong, Tomato, Fruits), enter quantity, upload field photos and set asking price.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-emerald-950">
                2
              </div>
              <h3 className="mt-3 text-sm font-bold">Receive Direct Bids</h3>
              <p className="mt-1 text-xs text-emerald-100/70">
                Dal mills, traders, and retail chains review your lot specs and send offers with requested quantities and rates.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-emerald-950">
                3
              </div>
              <h3 className="mt-3 text-sm font-bold">Farm Gate Pickup</h3>
              <p className="mt-1 text-xs text-emerald-100/70">
                Buyer sends their truck/trolley directly to your village or designated APMC hub. Weighing done transparently.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-emerald-950">
                4
              </div>
              <h3 className="mt-3 text-sm font-bold">Instant Bank Settlement</h3>
              <p className="mt-1 text-xs text-emerald-100/70">
                Receive direct payment via RTGS/NEFT/UPI into your bank account before dispatch with zero commission deducted.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/marketplace/sell"
              className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 font-bold text-emerald-950 hover:bg-lime-300 transition shadow-md"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Your Produce Now (Free for All Farmers)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
