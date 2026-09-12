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
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function BuyerPurchasingOrdersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'offers' | 'orders'>('offers')
  const [offers, setOffers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Counter Back Modal
  const [counterModalOffer, setCounterModalOffer] = useState<any | null>(null)
  const [counterPrice, setCounterPrice] = useState<number>(0)
  const [counterQty, setCounterQty] = useState<number>(0)
  const [counterNote, setCounterNote] = useState<string>('')

  // Dispute Modal
  const [disputeModalOrder, setDisputeModalOrder] = useState<any | null>(null)
  const [disputeCategory, setDisputeCategory] = useState<string>('Quality below agreed grade')
  const [disputeReason, setDisputeReason] = useState<string>('')

  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const buyerId = user?.userId || user?.id || ''
      const buyerPhone = user?.phone || ''
      const [offersRes, ordersRes] = await Promise.all([
        fetch(`/api/marketplace/offers?role=buyer${buyerId ? `&user_id=${buyerId}` : ''}`),
        fetch(`/api/marketplace/orders?role=buyer${buyerId ? `&user_id=${buyerId}` : ''}${buyerPhone ? `&phone=${buyerPhone}` : ''}`)
      ])

      const offersData = await offersRes.json()
      const ordersData = await ordersRes.json()

      if (offersData.success) setOffers(offersData.offers || [])
      if (ordersData.success) setOrders(ordersData.orders || [])
    } catch (err) {
      console.error('Error fetching buyer purchasing data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // Accept Counter-Offer from Farmer
  const handleAcceptFarmerCounter = async (offer: any) => {
    if (!confirm(`Accept farmer's proposal: ₹${offer.offeredPricePerUnit}/${offer.listing.unit} for ${offer.requestedQuantity} ${offer.listing.unit}?\n\nThis will lock the produce lot and generate Order #${offer.id}.`)) {
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
          role: 'buyer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Deal finalized! Produce order #${data.orderId} generated. Please complete escrow payment.` })
        await fetchData()
        setActiveTab('orders')
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to accept deal.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  // Submit Counter-Back from Buyer
  const handleSubmitBuyerCounter = async (e: React.FormEvent) => {
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
          role: 'buyer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Counter-offer submitted back to farmer!' })
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

  // Cancel / Withdraw Offer
  const handleCancelOffer = async (offerId: string) => {
    if (!confirm('Withdraw this offer?')) return

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          role: 'buyer'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Offer withdrawn.' })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to withdraw offer.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  // Simulated Escrow Payment
  const handlePayOrder = async (order: any) => {
    if (!confirm(`Confirm simulated escrow deposit of ₹${order.totalAmount.toLocaleString('en-IN')} for Order #${order.id}?\n\nFunds will be securely held in FarmDirect Escrow until you inspect and confirm receipt of produce.`)) {
      return
    }

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Payment secured in escrow! Order confirmed. Farmer notified to prepare produce.` })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Payment failed.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  // Buyer Confirms Delivery (Completes deal and settles inventory)
  const handleConfirmDelivery = async (order: any) => {
    if (!confirm(`Confirm receipt of ${order.quantity} ${order.unit} of ${order.cropName} for Order #${order.id}?\n\nThis will release the ₹${order.totalAmount.toLocaleString('en-IN')} escrow payment to the farmer and finalize the transaction.`)) {
      return
    }

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_DELIVERY'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Produce receipt confirmed! Escrow payout released to farmer. Deal successfully completed.' })
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to confirm receipt.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  // Submit Dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disputeModalOrder) return

    setActionSubmitting(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/orders/${disputeModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPUTE',
          category: disputeCategory,
          reason: disputeReason
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Dispute submitted. FarmDirect mediator team will contact both parties within 2 hours.' })
        setDisputeModalOrder(null)
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to submit dispute.' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred.' })
    } finally {
      setActionSubmitting(false)
    }
  }

  // Summary Metrics
  const activeOffersCount = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED').length
  const pendingPaymentCount = orders.filter((o) => o.fulfillmentStatus === 'PENDING_PAYMENT').length
  const inFulfillmentCount = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(o.fulfillmentStatus)).length
  const totalPurchasedValue = orders
    .filter((o) => o.fulfillmentStatus === 'COMPLETED')
    .reduce((acc, o) => acc + o.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/20 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-20">
      {/* Top Banner */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>Commercial Buyer Desk:</strong> Track Bids · Escrow Protected Payments · Direct Farm Sourcing</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-emerald-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300">
              <ChevronLeft className="h-4 w-4" />
              <span>Browse Produce Lots</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">Buyer Purchasing Orders</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace/orders/selling"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-300 hidden sm:inline-block"
            >
              Switch to Farmer Selling Dashboard →
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

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Title & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Buyer Deals & Purchasing Desk
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Monitor your produce offers, accept farmer counter-proposals, deposit escrow payments, and confirm receipt.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            Explore Mandi Produce Lots
          </Link>
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Offers</span>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{activeOffersCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">In negotiation with farmers</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Awaiting Escrow Deposit</span>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingPaymentCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Inventory reserved for you</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">In Fulfillment</span>
              <Truck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{inFulfillmentCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Preparing / In transit</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Completed Sourcing</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
              ₹{totalPurchasedValue.toLocaleString('en-IN')}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">Verified & settled</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'offers'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>My Submitted Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Produce Orders & Escrow Tracking ({orders.length})</span>
            {pendingPaymentCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                {pendingPaymentCount} Pay
              </span>
            )}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs font-bold text-slate-500">Loading buyer dashboard...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: BUYER OFFERS */}
            {activeTab === 'offers' && (
              <div className="space-y-4">
                {offers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <MessageSquare className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No offers placed yet</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Explore fresh farmer harvest lots in the Mandi and place direct purchase bids without middleman markups.
                    </p>
                    <Link
                      href="/marketplace"
                      className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Browse Mandi Listings
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
                            isCountered
                              ? 'border-amber-300 dark:border-amber-900/80 ring-1 ring-amber-400/20'
                              : isAccepted
                              ? 'border-emerald-200 dark:border-emerald-900/60'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">Offer #{offer.id.slice(0, 10)}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(offer.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCountered && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Farmer Sent Counter-Offer!
                                </span>
                              )}
                              {isPending && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                  Sent to Farmer · Under Review
                                </span>
                              )}
                              {isAccepted && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Deal Accepted!
                                </span>
                              )}
                              {offer.status === 'REJECTED' && (
                                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                                  Declined by Farmer
                                </span>
                              )}
                              {isExpired && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  Expired
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Body */}
                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produce Lot</span>
                              <div className="text-sm font-black text-slate-900 dark:text-white">
                                {offer.listing.cropName} ({offer.listing.variety})
                              </div>
                              <div className="text-xs text-slate-500">
                                Farmer: <span className="font-bold text-slate-700 dark:text-slate-300">{offer.listing.sellerName}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Location: {offer.listing.district}, {offer.listing.state}
                              </div>
                            </div>

                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {isCountered ? 'Current Proposal' : 'Your Offer'}
                              </span>
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
                                Total Value: ₹{offer.totalValue.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status & Message</span>
                              {offer.message && (
                                <p className="rounded-xl bg-slate-50 p-2 text-[11px] italic text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                  "{offer.message}"
                                </p>
                              )}
                              <div className="text-[11px] text-slate-500">
                                Logistics: {offer.deliveryMethod === 'BUYER_PICKUP' ? 'Self Farm-Gate Pickup' : 'Farmer Delivery'}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400">
                              Negotiation round {offer.roundsCount || 1}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* If Countered by Farmer: Buyer can Accept counter or counter back */}
                              {isCountered && !isExpired && (
                                <>
                                  <button
                                    onClick={() => handleCancelOffer(offer.id)}
                                    disabled={actionSubmitting}
                                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                                  >
                                    Withdraw
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCounterModalOffer(offer)
                                      setCounterPrice(offer.offeredPricePerUnit)
                                      setCounterQty(offer.requestedQuantity)
                                      setCounterNote('')
                                    }}
                                    disabled={actionSubmitting}
                                    className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  >
                                    Propose Revised Price
                                  </button>
                                  <button
                                    onClick={() => handleAcceptFarmerCounter(offer)}
                                    disabled={actionSubmitting}
                                    className="rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95"
                                  >
                                    Accept Farmer Counter & Create Order
                                  </button>
                                </>
                              )}

                              {isPending && !isExpired && (
                                <button
                                  onClick={() => handleCancelOffer(offer.id)}
                                  disabled={actionSubmitting}
                                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                                >
                                  Withdraw Offer
                                </button>
                              )}

                              {isAccepted && (
                                <button
                                  onClick={() => setActiveTab('orders')}
                                  className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-1"
                                >
                                  <span>Go to Order & Pay Escrow</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCE ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <Package className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No active produce orders yet</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      When a farmer accepts your offer or you agree on a counter-offer, your purchase order will appear here with secure escrow payment.
                    </p>
                    <button
                      onClick={() => setActiveTab('offers')}
                      className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Check My Sent Offers
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => {
                      const isPendingPayment = order.fulfillmentStatus === 'PENDING_PAYMENT'
                      const isPaid = order.paymentStatus === 'PAID'
                      const isDelivered = order.fulfillmentStatus === 'DELIVERED'
                      const isCompleted = order.fulfillmentStatus === 'COMPLETED'
                      const isCancelled = order.fulfillmentStatus === 'CANCELLED'
                      const isDisputed = order.fulfillmentStatus === 'DISPUTED'

                      return (
                        <div
                          key={order.id}
                          className={`rounded-3xl border bg-white p-5 shadow-xs transition dark:bg-slate-900 ${
                            isPendingPayment
                              ? 'border-amber-300 dark:border-amber-900/80 ring-1 ring-amber-400/30'
                              : isCompleted
                              ? 'border-emerald-300 dark:border-emerald-900'
                              : isDisputed
                              ? 'border-rose-300 dark:border-rose-900'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {/* Header */}
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
                              {isPaid ? (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Escrow Secured: ₹{order.totalAmount.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" /> Action Required: Deposit Escrow
                                </span>
                              )}

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

                          {/* Escrow Payment Notice Strip */}
                          {isPendingPayment && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-900/80">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                                  <span>Inventory is Reserved! Deposit ₹{order.totalAmount.toLocaleString('en-IN')} into Escrow</span>
                                </div>
                                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                  Funds remain 100% protected in FarmDirect Escrow until you inspect and verify delivery.
                                </p>
                              </div>

                              <button
                                onClick={() => handlePayOrder(order)}
                                disabled={actionSubmitting}
                                className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-black text-white shadow-sm hover:bg-amber-700 active:scale-95"
                              >
                                {actionSubmitting ? 'Securing...' : `Deposit ₹${order.totalAmount.toLocaleString('en-IN')} (Mock Escrow)`}
                              </button>
                            </div>
                          )}

                          {/* Details */}
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
                                Total Amount: ₹{order.totalAmount.toLocaleString('en-IN')}
                              </div>
                            </div>

                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Farmer Sourcing Contact</span>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{order.farmerName}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <PhoneCall className="h-3 w-3" />
                                <span>+91 {order.farmerPhone}</span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-start gap-1">
                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{order.pickupAddress || 'Farm Gate'}</span>
                              </div>
                            </div>

                            {/* Fulfillment Status & Actions */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Status</span>
                              
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {order.fulfillmentStatus === 'PENDING_PAYMENT' && '1. Awaiting Escrow Deposit'}
                                {order.fulfillmentStatus === 'CONFIRMED' && '2. Payment Secured · Farmer Preparing Lot'}
                                {order.fulfillmentStatus === 'PREPARING' && '3. Farmer Bagging & Quality Grading'}
                                {order.fulfillmentStatus === 'READY_FOR_PICKUP' && '4. Ready for Farm-Gate Pickup / Loading'}
                                {order.fulfillmentStatus === 'IN_TRANSIT' && '4. En Route / Dispatched'}
                                {order.fulfillmentStatus === 'PICKED_UP' && '4. Loaded in Buyer Truck'}
                                {order.fulfillmentStatus === 'DELIVERED' && '5. Arrived at Destination · Please Confirm'}
                                {order.fulfillmentStatus === 'COMPLETED' && '✓ Deal Successfully Completed'}
                                {order.fulfillmentStatus === 'DISPUTED' && '⚠ Under Mediation Review'}
                              </div>

                              {/* Confirm Delivery Button */}
                              {(isDelivered || order.fulfillmentStatus === 'READY_FOR_PICKUP' || order.fulfillmentStatus === 'PICKED_UP') && (
                                <button
                                  onClick={() => handleConfirmDelivery(order)}
                                  disabled={actionSubmitting}
                                  className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-800 active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Confirm Produce Receipt & Finalize Deal</span>
                                </button>
                              )}

                              {isCompleted && (
                                <div className="rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Produce Verified & Escrow Released to Farmer</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer: Dispute & Cancellation */}
                          {!isCompleted && !isCancelled && (
                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[11px] text-slate-400">
                                FarmDirect Buyer Protection Active
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setDisputeModalOrder(order)
                                    setDisputeCategory('Quality below agreed grade')
                                    setDisputeReason('')
                                  }}
                                  disabled={actionSubmitting}
                                  className="text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 flex items-center gap-1"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Report Issue / Raise Dispute</span>
                                </button>
                              </div>
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

      {/* REVISED COUNTER-OFFER MODAL */}
      {counterModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Revise Counter-Offer</h3>
                <p className="text-xs text-slate-500">
                  Negotiating with {counterModalOffer.listing.sellerName} for {counterModalOffer.listing.cropName}
                </p>
              </div>
              <button
                onClick={() => setCounterModalOffer(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBuyerCounter} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your New Bid per {counterModalOffer.listing.unit} (₹): *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity ({counterModalOffer.listing.unit}): *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={counterQty}
                  onChange={(e) => setCounterQty(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message to Farmer:
                </label>
                <textarea
                  rows={2}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="E.g. We can pick up tomorrow 10 AM with our own bags and truck."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">
                Total Deal Amount: <span className="font-black text-emerald-700 dark:text-emerald-400">₹{(counterPrice * counterQty).toLocaleString('en-IN')}</span>
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
                  {actionSubmitting ? 'Submitting...' : 'Send Counter-Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Raise Order Dispute</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{disputeModalOrder.id} · {disputeModalOrder.cropName}
                </p>
              </div>
              <button
                onClick={() => setDisputeModalOrder(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dispute Reason / Category: *
                </label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Quality below agreed grade">Quality below agreed grade (moisture/foreign matter)</option>
                  <option value="Weight discrepancy">Weight discrepancy at weighbridge</option>
                  <option value="Damage during loading/transit">Damage during loading/transit</option>
                  <option value="Severe delivery delay">Severe delivery delay</option>
                  <option value="Lot mismatch">Received different produce lot</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Details & Description: *
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain the inspection findings, measured weighbridge slip or quality test result..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 text-[11px] border border-rose-200 dark:border-rose-900">
                Submitting a dispute freezes the escrow payout of ₹{disputeModalOrder.totalAmount.toLocaleString('en-IN')}. A FarmDirect inspector will intervene to verify.
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOrder(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="rounded-xl bg-rose-700 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-800 transition disabled:opacity-50"
                >
                  {actionSubmitting ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
