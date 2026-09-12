'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  Leaf,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Truck,
  TrendingUp,
  Package,
  PhoneCall,
  MessageCircle,
  MessageSquare,
  AlertCircle,
  Eye,
  Store,
  Share2,
  Coins,
  Send
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function ProduceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()

  const [listing, setListing] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [similarListings, setSimilarListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Inquiry form modal state
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [buyerName, setBuyerName] = useState(user?.name || '')
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '')
  const [buyerType, setBuyerType] = useState('Wholesale Trader / Commission Agent')
  const [buyerLocation, setBuyerLocation] = useState('Local APMC Yard')
  const [offeredPrice, setOfferedPrice] = useState<number>(0)
  const [requestedQty, setRequestedQty] = useState<number>(0)
  const [buyerMessage, setBuyerMessage] = useState('')
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState('')
  const [inquiryErrorMsg, setInquiryErrorMsg] = useState('')

  useEffect(() => {
    fetchListingDetails()
  }, [id])

  const fetchListingDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/marketplace/listings/${id}`)
      const data = await res.json()
      if (data.success) {
        setListing(data.listing)
        setInquiries(data.inquiries || [])
        setSimilarListings(data.similarListings || [])
        setOfferedPrice(data.listing.pricePerUnit)
        setRequestedQty(data.listing.minOrderQuantity || 1)
      }
    } catch (e) {
      console.error('Failed to load listing details', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryErrorMsg('')
    setInquirySuccessMsg('')
    setInquirySubmitting(true)

    try {
      const res = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          buyerName,
          buyerPhone,
          buyerType,
          buyerLocation,
          offeredPricePerUnit: offeredPrice,
          requestedQuantity: requestedQty,
          message: buyerMessage
        })
      })

      const data = await res.json()
      if (data.success) {
        setInquirySuccessMsg(data.message || 'Offer submitted successfully!')
        // Refresh inquiries
        fetchListingDetails()
        setTimeout(() => {
          setShowInquiryModal(false)
          setInquirySuccessMsg('')
        }, 2500)
      } else {
        setInquiryErrorMsg(data.error || 'Failed to submit bid')
      }
    } catch (err: any) {
      setInquiryErrorMsg(err.message || 'Error occurred while submitting')
    } finally {
      setInquirySubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Loading Produce Details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center dark:bg-slate-950">
        <h2 className="text-xl font-bold">Produce Listing Not Found</h2>
        <Link href="/marketplace" className="mt-4 inline-block text-xs font-bold text-emerald-700 underline">
          Return to Mandi
        </Link>
      </div>
    )
  }

  const mainImage = listing.images && listing.images[0] ? listing.images[0] : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  const grossValue = listing.quantity * listing.pricePerUnit

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-16">
      {/* Top Advisory Strip */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>FarmOS Mandi Direct:</strong> Verified Farmer Produce Listing · Zero Middleman Markup</span>
      </div>

      {/* Nav */}
      <header className="border-b border-emerald-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/marketplace" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to All Produce</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/marketplace/sell"
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
            >
              Post My Produce
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Col Left: Image & Visuals (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-96 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <img
                src={mainImage}
                alt={listing.cropName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Quality Grade Tag */}
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm dark:bg-slate-900/95 dark:text-emerald-300">
                {listing.qualityGrade}
              </span>

              {/* Organic Tag */}
              {listing.isOrganic && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  🌱 Certified Organic
                </span>
              )}

              {/* Lot Badge */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                Available Lot: <strong className="text-lime-400">{listing.quantity} {listing.unit}</strong>
              </div>
            </div>

            {/* Farmer Card */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black text-base dark:bg-emerald-950 dark:text-emerald-300">
                    {listing.sellerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{listing.sellerName}</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-slate-500">
                      {listing.sellerVillage}, {listing.sellerDistrict}, {listing.sellerState}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified Farmer
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`tel:${listing.sellerPhone}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Call Farmer</span>
                </a>
                <a
                  href={`https://wa.me/${listing.sellerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(listing.sellerName)},%20I%20saw%20your%20listing%20for%20${encodeURIComponent(listing.cropName)}%20on%20FarmOS.%20I%20am%20interested%20in%20buying.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col Right: Produce Specs, Price & Bidding (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Variety */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="capitalize font-bold text-emerald-700 dark:text-emerald-400">{listing.category}</span>
                <span>•</span>
                <span>Posted {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN') : 'Recently'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.viewsCount} views</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {listing.cropName}
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                Variety: <span className="text-emerald-800 dark:text-emerald-400 font-bold">{listing.variety}</span>
              </p>
            </div>

            {/* Price Box with Mandi Benchmark */}
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Farmer Asking Price:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ₹{listing.pricePerUnit.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      /{listing.unit}
                    </span>
                  </div>
                  {listing.isNegotiable && (
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      ✓ Farmer open to fair negotiation for bulk lifted lots
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Gross Lot Value:</span>
                  <p className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                    ₹{grossValue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400">({listing.quantity} {listing.unit})</span>
                </div>
              </div>

              {/* Mandi & MSP Comparison Strip */}
              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs">
                {listing.mandiBenchmarkPrice && (
                  <div>
                    <span className="text-slate-500 block">APMC Mandi Modal Rate:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      ₹{listing.mandiBenchmarkPrice.toLocaleString('en-IN')} /{listing.unit.split(' ')[0]}
                    </strong>
                  </div>
                )}

                {listing.mspPrice && (
                  <div>
                    <span className="text-slate-500 block">Govt MSP Price:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      ₹{listing.mspPrice.toLocaleString('en-IN')} /{listing.unit.split(' ')[0]}
                    </strong>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block">Minimum Order:</span>
                  <strong>{listing.minOrderQuantity} {listing.unit}</strong>
                </div>
              </div>

              {/* Action: Send Bid / Inquiry CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-800 transition active:scale-95"
                >
                  <Send className="h-4 w-4 text-lime-300" />
                  <span>Submit Buy Offer / Negotiate Price</span>
                </button>
              </div>
            </div>

            {/* Produce Technical Specifications Grid */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Harvest & Quality Specifications
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{listing.qualityGrade}</strong>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Moisture Level</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {listing.moisturePercent ? `${listing.moisturePercent}%` : 'Standard Field Dry'}
                  </strong>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{listing.harvestDate}</strong>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Packaging Type</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{listing.packagingType}</strong>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Logistics / Loading</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{listing.logisticsMode}</strong>
                </div>
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Farmer's Lot Description:
                </span>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {listing.description}
                </p>
              </div>

              {/* Farm Gate Address */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>Farm Gate Address:</strong> {listing.farmGateAddress}, {listing.sellerDistrict}, {listing.sellerState}
                </span>
              </div>
            </div>

            {/* Transparent Buyer Inquiries Activity */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Buyer Inquiries & Bids ({inquiries.length})
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">Transparent Mandi Discovery</span>
              </div>

              {inquiries.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No bids yet. Be the first trader or mill to submit an offer!
                </p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((iq) => (
                    <div
                      key={iq.id}
                      className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs dark:bg-slate-800/60 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {iq.buyerName.split('(')[0]} <span className="text-[10px] text-slate-400 font-normal">({iq.buyerType})</span>
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">
                          Offered: ₹{iq.offeredPricePerUnit.toLocaleString('en-IN')}/{listing.unit.split(' ')[0]}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Requested: {iq.requestedQuantity} {listing.unit}</span>
                        <span>Location: {iq.buyerLocation}</span>
                      </div>
                      {iq.message && (
                        <p className="mt-1 text-[11px] italic text-slate-600 dark:text-slate-400">
                          "{iq.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* BUYER INQUIRY / BID MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Submit Buy Offer to Farmer</h3>
                <p className="text-[11px] text-slate-500">
                  {listing.cropName} ({listing.variety}) · Asking: ₹{listing.pricePerUnit.toLocaleString('en-IN')}/{listing.unit}
                </p>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {inquiryErrorMsg && (
              <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200">
                {inquiryErrorMsg}
              </div>
            )}

            {inquirySuccessMsg && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                {inquirySuccessMsg}
              </div>
            )}

            <form onSubmit={handleSendInquiry} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name / Firm Name: *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="E.g. Sri Balaji Agro Traders"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone Number: *
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buyer Category:
                  </label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Wholesale Trader / Commission Agent">Wholesale Trader / Dalal</option>
                    <option value="Dal / Flour Mill Owner">Dal / Flour Mill Owner</option>
                    <option value="Spice Processing Exporter">Spice Processing Exporter</option>
                    <option value="Retail Chain / Supermarket">Retail Chain / Supermarket</option>
                    <option value="FPO / Agri Cooperative">FPO / Agri Cooperative</option>
                    <option value="Individual Buyer">Individual Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Location / Mandi:
                  </label>
                  <input
                    type="text"
                    value={buyerLocation}
                    onChange={(e) => setBuyerLocation(e.target.value)}
                    placeholder="E.g. Guntur / Latur / Mumbai"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Offered Price per {listing.unit.split(' ')[0]} (in ₹): *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity Needed ({listing.unit}): *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={listing.quantity}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message / Pickup Timeline:
                </label>
                <textarea
                  rows={2}
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  placeholder="E.g. We have truck ready in Pune, payment immediate RTGS after electronic weighbridge check."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inquirySubmitting}
                  className="rounded-xl bg-emerald-700 px-6 py-2 font-bold text-white shadow-md hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {inquirySubmitting ? 'Sending Offer...' : 'Send Offer to Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
