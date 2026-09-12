'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  MapPin,
  Calendar,
  ArrowRight,
  MessageSquare,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function FarmerSellingOrdersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'offers' | 'orders'>('offers')
  const [offers, setOffers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // Counter Modal State
  const [counterModalOffer, setCounterModalOffer] = useState<any | null>(null)
  const [counterPrice, setCounterPrice] = useState<number>(0)
  const [counterQty, setCounterQty] = useState<number>(0)
  const [counterNote, setCounterNote] = useState<string>('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Transporter Quotes Modal State
  const [assignModalJob, setAssignModalJob] = useState<any | null>(null)
  const [jobBids, setJobBids] = useState<any[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [assigningBidId, setAssigningBidId] = useState<string | null>(null)

  // Expand Offer History State
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)
  const [offerHistory, setOfferHistory] = useState<any[]>([])

  const handleOpenAssignModal = async (job: any) => {
    setAssignModalJob(job)
    setLoadingBids(true)
    try {
      const res = await fetch(`/api/marketplace/logistics/jobs/${job.id}/bids`)
      const data = await res.json()
      if (data.success) {
        setJobBids(data.bids || [])
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to load quotes.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error fetching bids.' })
    } finally {
      setLoadingBids(false)
    }
  }

  const handleAssignTransporter = async (bid: any) => {
    if (!assignModalJob) return
    if (!confirm(`Confirm assigning ${bid.transporterName} at ₹${bid.proposedPrice} for freight?`)) return

    setAssigningBidId(bid.id)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/logistics/jobs/${assignModalJob.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: bid.id,
          vehicleId: bid.vehicleId
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Transporter ${bid.transporterName} assigned! Freight locked at ₹${bid.proposedPrice}.` })
        setAssignModalJob(null)
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to assign transporter.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error assigning transporter.' })
    } finally {
      setAssigningBidId(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const sellerId = user?.userId || user?.id || ''
      const [offersRes, ordersRes] = await Promise.all([
        fetch(`/api/marketplace/offers?role=farmer${sellerId ? `&user_id=${sellerId}` : ''}`),
        fetch(`/api/marketplace/orders?role=farmer${sellerId ? `&user_id=${sellerId}` : ''}`)
      ])

      const offersData = await offersRes.json()
      const ordersData = await ordersRes.json()

      if (offersData.success) setOffers(offersData.offers || [])
      if (ordersData.success) setOrders(ordersData.orders || [])
    } catch (err) {
      console.error('Error fetching farmer selling data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleAcceptOffer = async (offer: any) => {
    if (!confirm(`Accept offer from ${offer.buyerName} for ₹${offer.offeredPricePerUnit}/${offer.listing.unit} (${offer.requestedQuantity} ${offer.listing.unit})?\n\nThis will lock the produce inventory and generate Order #${offer.id}.`)) {
      return
    }

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          role: 'farmer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Deal Accepted! Produce order #${data.orderId} created and inventory reserved.` })
        await fetchData()
        setActiveTab('orders')
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to accept offer.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleRejectOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to decline this offer?')) return

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          role: 'farmer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Offer declined.' })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to decline offer.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleOpenCounter = (offer: any) => {
    setCounterModalOffer(offer)
    setCounterPrice(offer.offeredPricePerUnit || offer.listing.askingPrice)
    setCounterQty(offer.requestedQuantity)
    setCounterNote(`We can supply ${offer.requestedQuantity} ${offer.listing.unit} at ₹${offer.listing.askingPrice}/${offer.listing.unit} farm-gate.`)
  }

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!counterModalOffer) return

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/offers/${counterModalOffer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COUNTER',
          counterPrice,
          counterQuantity: counterQty,
          message: counterNote,
          role: 'farmer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Counter-offer sent to buyer!' })
        setCounterModalOffer(null)
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to submit counter-offer.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string, reason?: string) => {
    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          status: nextStatus,
          reason
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Order updated to ${nextStatus.replace(/_/g, ' ')}.` })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update order status.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Please enter cancellation reason (this releases reserved inventory back to your produce lot):', 'Lot damaged or unexpected supply change')
    if (reason === null) return

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          reason
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Order cancelled and reserved stock restored.' })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to cancel order.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const loadHistory = async (offerId: string) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null)
      return
    }
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}`)
      const data = await res.json()
      if (data.success) {
        setOfferHistory(data.offer.history || [])
        setExpandedOfferId(offerId)
      }
    } catch (err) {
      console.error('Failed to load history', err)
    }
  }

  // Summary Metrics
  const pendingOffersCount = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED').length
  const activeOrdersCount = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.fulfillmentStatus)).length
  const completedRevenue = orders
    .filter((o) => o.fulfillmentStatus === 'COMPLETED')
    .reduce((acc, o) => acc + o.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/20 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-20">
      {/* Top Banner */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>Farmer Transaction Control:</strong> Review Buyer Offers · Lock Inventory · Manage Fulfillment & Escrow</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-emerald-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300">
              <ChevronLeft className="h-4 w-4" />
              <span>Mandi Produce</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">Farmer Selling Orders</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace/orders/buying"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300 hidden sm:inline-block"
            >
              Switch to Buying Dashboard →
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Page Title & KPI Cards */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Farmer Selling & Deals Desk
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Negotiate directly with buyers, reserve produce inventory safely, and advance order fulfillment to payout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/marketplace/my-listings"
              className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Manage Produce Lots
            </Link>
            <Link
              href="/marketplace/sell"
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              + List Harvest
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`flex items-center justify-between rounded-2xl p-3.5 text-xs font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Pending Bids</span>
              <MessageSquare className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingOffersCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Awaiting your review / counter</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Fulfillment Orders</span>
              <Truck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{activeOrdersCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Reserved & in preparation/transit</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Completed Revenue</span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-400">
              ₹{completedRevenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">Released from escrow</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Protection Level</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">100% Escrow Secured</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Zero default guarantee</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setActiveTab('offers'); setStatusFilter('all') }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'offers'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Buyer Offers & Negotiations ({offers.length})</span>
            {pendingOffersCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                {pendingOffersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setStatusFilter('all') }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Active Produce Orders & Fulfillment ({orders.length})</span>
            {activeOrdersCount > 0 && (
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-black text-white">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs font-bold text-slate-500">Loading farmer deals desk...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: BUYER OFFERS */}
            {activeTab === 'offers' && (
              <div className="space-y-4">
                {offers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <MessageSquare className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No buyer offers received yet</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      When wholesale traders, mills, or exporters place bids on your produce lots, they will appear here.
                    </p>
                    <Link
                      href="/marketplace/sell"
                      className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Post New Harvest Lot
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {offers.map((offer) => {
                      const isPending = offer.status === 'PENDING'
                      const isCountered = offer.status === 'COUNTERED'
                      const isAccepted = offer.status === 'ACCEPTED'
                      const isExpired = offer.isExpired || offer.status === 'EXPIRED'

                      return (
                        <div
                          key={offer.id}
                          className={`rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                            isAccepted
                              ? 'border-emerald-200 dark:border-emerald-900/60'
                              : isPending
                              ? 'border-amber-300 dark:border-amber-900/80 ring-1 ring-amber-400/20'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {/* Offer Header Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">Offer #{offer.id.slice(0, 10)}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(offer.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isAccepted && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Deal Finalized
                                </span>
                              )}
                              {isPending && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Action Required (New Bid)
                                </span>
                              )}
                              {isCountered && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  Counter-Offer Sent
                                </span>
                              )}
                              {isExpired && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  Expired
                                </span>
                              )}
                              {offer.status === 'REJECTED' && (
                                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                                  Declined
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Offer Body */}
                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            {/* Col 1: Produce & Lot Info */}
                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Lot</span>
                              <div className="text-sm font-black text-slate-900 dark:text-white">
                                {offer.listing.cropName} ({offer.listing.variety})
                              </div>
                              <div className="text-xs text-slate-500">
                                Asking: <span className="font-bold text-slate-700 dark:text-slate-300">₹{offer.listing.askingPrice}/{offer.listing.unit}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Available Lot: <span className="font-bold text-emerald-700 dark:text-emerald-400">{offer.listing.availableQuantity} {offer.listing.unit}</span>
                                {offer.listing.reservedQuantity > 0 && (
                                  <span className="text-slate-400"> (Reserved: {offer.listing.reservedQuantity})</span>
                                )}
                              </div>
                            </div>

                            {/* Col 2: Buyer's Terms & Values */}
                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer Offer</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                  ₹{offer.offeredPricePerUnit.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-slate-500">per {offer.listing.unit}</span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                Quantity: <span className="font-black">{offer.requestedQuantity} {offer.listing.unit}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                Deal Total: ₹{offer.totalValue.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Logistics: <span className="font-semibold">{offer.deliveryMethod === 'BUYER_PICKUP' ? 'Buyer will pick up at farm gate' : 'Farmer delivery requested'}</span>
                              </div>
                            </div>

                            {/* Col 3: Buyer Details & Message */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer Details</span>
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                <span>{offer.buyerName}</span>
                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {offer.buyerType}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{offer.buyerLocation}</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <PhoneCall className="h-3 w-3" />
                                <span>+91 {offer.buyerPhone}</span>
                              </div>
                              {offer.message && (
                                <p className="mt-1 rounded-xl bg-slate-50 p-2 text-[11px] italic text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                  "{offer.message}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons & History Expansion */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => loadHistory(offer.id)}
                              className="text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-400 flex items-center gap-1"
                            >
                              <span>{expandedOfferId === offer.id ? 'Hide Deal Trail' : `Deal History (${offer.roundsCount || 1} rounds)`}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {/* If Pending or Countered by buyer: Farmer can Accept, Counter, Reject */}
                              {(isPending || isCountered) && !isExpired && (
                                <>
                                  <button
                                    onClick={() => handleRejectOffer(offer.id)}
                                    disabled={actionSubmitting}
                                    className="rounded-xl border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => handleOpenCounter(offer)}
                                    disabled={actionSubmitting}
                                    className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  >
                                    Counter-Offer
                                  </button>
                                  <button
                                    onClick={() => handleAcceptOffer(offer)}
                                    disabled={actionSubmitting}
                                    className="rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95"
                                  >
                                    Accept Deal & Lock Stock
                                  </button>
                                </>
                              )}

                              {isAccepted && (
                                <button
                                  onClick={() => setActiveTab('orders')}
                                  className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-1"
                                >
                                  <span>View Order in Fulfillment</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Negotiation Trail */}
                          {expandedOfferId === offer.id && (
                            <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 space-y-2.5">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Deal Negotiation Trail (Immutable Audit Record)
                              </h4>
                              {offerHistory.length === 0 ? (
                                <p className="text-xs text-slate-400">Initial offer submitted.</p>
                              ) : (
                                <div className="space-y-2">
                                  {offerHistory.map((h: any, idx: number) => (
                                    <div key={idx} className="flex items-start justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                      <div>
                                        <div className="flex items-center gap-2 font-bold">
                                          <span className={h.senderRole === 'farmer' ? 'text-amber-600' : 'text-emerald-700'}>
                                            {h.senderName} ({h.senderRole.toUpperCase()})
                                          </span>
                                          <span className="text-[10px] font-normal text-slate-400">
                                            {new Date(h.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <div className="text-slate-600 dark:text-slate-300">
                                          {h.action}: Proposed ₹{h.offeredPricePerUnit.toLocaleString('en-IN')} for {h.requestedQuantity} units (Total: ₹{h.totalValue.toLocaleString('en-IN')})
                                        </div>
                                        {h.message && <p className="text-[11px] text-slate-500 italic mt-0.5">"{h.message}"</p>}
                                      </div>
                                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                        {h.action}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCE ORDERS & FULFILLMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <Package className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No active produce orders</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      When you accept a buyer offer, an official produce order is generated and inventory is automatically locked.
                    </p>
                    <button
                      onClick={() => setActiveTab('offers')}
                      className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Review Incoming Offers
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => {
                      const isPaid = order.paymentStatus === 'PAID'
                      const isCompleted = order.fulfillmentStatus === 'COMPLETED'
                      const isCancelled = order.fulfillmentStatus === 'CANCELLED'
                      const isDisputed = order.fulfillmentStatus === 'DISPUTED'

                      return (
                        <div
                          key={order.id}
                          className={`rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                            isCompleted
                              ? 'border-emerald-300 dark:border-emerald-900'
                              : isCancelled
                              ? 'border-slate-200 opacity-80 dark:border-slate-800'
                              : isDisputed
                              ? 'border-rose-300 dark:border-rose-900'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">Order #{order.id}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Escrow Payment Badge */}
                              {isPaid ? (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Escrow Paid: ₹{order.totalAmount.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Awaiting Buyer Payment
                                </span>
                              )}

                              {/* Fulfillment Badge */}
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : isCancelled
                                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    : isDisputed
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                }`}
                              >
                                {order.fulfillmentStatus.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Details</span>
                              <div className="text-sm font-black text-slate-900 dark:text-white">
                                {order.cropName} ({order.variety})
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                Quantity: <span className="font-black">{order.quantity} {order.unit}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Agreed Price: ₹{order.agreedPricePerUnit}/{order.unit}
                              </div>
                              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                Total Deal Value: ₹{order.totalAmount.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyer Information</span>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{order.buyerName}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <PhoneCall className="h-3 w-3" />
                                <span>+91 {order.buyerPhone}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Delivery: <span className="font-semibold">{order.deliveryMethod === 'BUYER_PICKUP' ? 'Farm-Gate Pickup by Buyer' : 'Farmer / Transporter Delivery'}</span>
                              </div>
                            </div>

                            {/* Fulfillment Action Pipeline */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment Next Step</span>
                              
                              {order.fulfillmentStatus === 'PENDING_PAYMENT' && (
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                                  Waiting for buyer to complete payment into secure escrow. Produce inventory is locked.
                                </p>
                              )}

                              {order.fulfillmentStatus === 'CONFIRMED' && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Payment secured! You can begin grading, bagging, or loading produce.
                                  </p>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING', 'Produce packing started.')}
                                    disabled={actionSubmitting}
                                    className="w-full rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                                  >
                                    Start Preparing Lot
                                  </button>
                                </div>
                              )}

                              {order.fulfillmentStatus === 'PREPARING' && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Produce is being bagged/weighed.
                                  </p>
                                  {order.deliveryMethod === 'BUYER_PICKUP' ? (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP', 'Lot ready at farm gate weighbridge.')}
                                      disabled={actionSubmitting}
                                      className="w-full rounded-xl bg-blue-700 py-2 text-xs font-bold text-white hover:bg-blue-800"
                                    >
                                      Mark Ready for Farm-Gate Pickup
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'IN_TRANSIT', 'Loaded on truck for dispatch.')}
                                      disabled={actionSubmitting}
                                      className="w-full rounded-xl bg-blue-700 py-2 text-xs font-bold text-white hover:bg-blue-800"
                                    >
                                      Mark Loaded & In Transit
                                    </button>
                                  )}
                                </div>
                              )}

                              {order.fulfillmentStatus === 'READY_FOR_PICKUP' && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Buyer truck arriving for inspection and loading.
                                  </p>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'PICKED_UP', 'Handed over to buyer vehicle.')}
                                    disabled={actionSubmitting}
                                    className="w-full rounded-xl bg-indigo-700 py-2 text-xs font-bold text-white hover:bg-indigo-800"
                                  >
                                    Confirm Handover (Picked Up)
                                  </button>
                                </div>
                              )}

                              {(order.fulfillmentStatus === 'IN_TRANSIT' || order.fulfillmentStatus === 'PICKED_UP') && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Consignment en route to buyer.
                                  </p>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED', 'Delivered at destination.')}
                                    disabled={actionSubmitting}
                                    className="w-full rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                                  >
                                    Mark Delivered at Destination
                                  </button>
                                </div>
                              )}

                              {order.fulfillmentStatus === 'DELIVERED' && (
                                <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
                                  Produce delivered! Awaiting buyer's final weighbridge confirmation to release escrow payout.
                                </div>
                              )}

                              {isCompleted && (
                                <div className="rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Deal Closed · Escrow Payout Released</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Transporter Logistics Section if 3rd Party Delivery */}
                          {order.deliveryJob && (
                            <div className="mt-3 rounded-2xl bg-indigo-50/70 p-3.5 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/60">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                    Transporter Logistics Service
                                  </span>
                                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                                    {order.deliveryJob.status.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                {(order.deliveryJob.status === 'OPEN' || order.deliveryJob.status === 'QUOTED') && (
                                  <button
                                    onClick={() => handleOpenAssignModal(order.deliveryJob)}
                                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-black text-white hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs active:scale-95"
                                  >
                                    <span>Review Quotes ({order.deliveryJob.bidsCount || 0})</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500">Logistics Route: </span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">Farm Gate → Buyer Destination</span>
                                  <div className="text-[11px] text-slate-500">
                                    Calculated Freight Benchmark: <span className="font-bold text-slate-700 dark:text-slate-300">₹{order.deliveryJob.estimatedCost.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>

                                {order.deliveryJob.transporterName ? (
                                  <div className="space-y-0.5">
                                    <div>
                                      <span className="text-slate-500">Assigned Carrier: </span>
                                      <span className="font-black text-indigo-900 dark:text-indigo-300">{order.deliveryJob.transporterName}</span>
                                      <span className="ml-1 text-[11px] text-amber-600 font-bold">★ {order.deliveryJob.transporterRating?.toFixed(1) || '5.0'}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                      Vehicle: <span className="font-mono font-bold">{order.deliveryJob.vehicleRegistration || 'Assigned Fleet'}</span> ({order.deliveryJob.vehicleType || 'Truck'})
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                      Agreed Freight: <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{order.deliveryJob.agreedCost.toLocaleString('en-IN')}</span>
                                    </div>
                                    {order.deliveryJob.proofOfDeliveryUrl && (
                                      <div className="pt-1">
                                        <a
                                          href={order.deliveryJob.proofOfDeliveryUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                          <span>View Delivery Proof Photo</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-slate-500 italic text-[11px] flex items-center">
                                    {order.deliveryJob.bidsCount > 0
                                      ? `${order.deliveryJob.bidsCount} transporter quote(s) received. Click "Review Quotes" to assign.`
                                      : 'Job is listed on the Transporter Marketplace. Awaiting carrier quotes.'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Order Footer */}
                          {!isCompleted && !isCancelled && (
                            <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={actionSubmitting}
                                className="text-xs font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400"
                              >
                                Cancel Order & Release Stock
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* COUNTER-OFFER MODAL */}
      {counterModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Propose Counter-Offer</h3>
                <p className="text-xs text-slate-500">
                  Negotiating for {counterModalOffer.listing.cropName} with {counterModalOffer.buyerName}
                </p>
              </div>
              <button
                onClick={() => setCounterModalOffer(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCounter} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Counter Price per {counterModalOffer.listing.unit} (₹): *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">
                  Buyer offered ₹{counterModalOffer.offeredPricePerUnit}. Your lot asking: ₹{counterModalOffer.listing.askingPrice}.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Counter Quantity ({counterModalOffer.listing.unit}): *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={counterModalOffer.listing.availableQuantity}
                  value={counterQty}
                  onChange={(e) => setCounterQty(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">
                  Available in this lot: {counterModalOffer.listing.availableQuantity} {counterModalOffer.listing.unit}.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Negotiation Note to Buyer:
                </label>
                <textarea
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="E.g. Grade A clean lot, electronic weighment at my farm gate."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">
                Calculated Deal Value: <span className="font-black text-emerald-700 dark:text-emerald-400">₹{(counterPrice * counterQty).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCounterModalOffer(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {actionSubmitting ? 'Sending...' : 'Send Counter-Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSPORTER QUOTE REVIEW & ASSIGNMENT MODAL */}
      {assignModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-black">Transporter Bids & Quotes</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the best transporter based on verified ratings, vehicle capacity, and freight rates.
                </p>
              </div>
              <button
                onClick={() => setAssignModalJob(null)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {loadingBids ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                Loading quotes...
              </div>
            ) : jobBids.length === 0 ? (
              <div className="py-10 text-center">
                <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Bids Submitted Yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  This job is listed on the marketplace for certified transporters. As soon as carriers submit quotes, they will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {jobBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {bid.transporterName}
                          </span>
                          {bid.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                          <span className="text-xs font-bold text-amber-600">
                            ★ {bid.transporterRating?.toFixed(1) || '5.0'}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                          <div>
                            Vehicle: <span className="font-semibold">{bid.vehicleType || 'Truck'}</span> ({bid.vehicleRegistration || 'Fleet unit'})
                          </div>
                          {bid.estimatedTransitHours && (
                            <div>Estimated Transit: <span className="font-semibold">{bid.estimatedTransitHours} hrs</span></div>
                          )}
                          {bid.notes && (
                            <p className="text-[11px] italic text-slate-500 mt-1">"{bid.notes}"</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                          ₹{bid.proposedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">Fixed Freight Quote</div>
                        <button
                          onClick={() => handleAssignTransporter(bid)}
                          disabled={assigningBidId === bid.id}
                          className="mt-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-black text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                        >
                          {assigningBidId === bid.id ? 'Assigning...' : 'Assign Job'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
