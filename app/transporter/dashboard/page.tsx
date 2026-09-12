'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Star,
  RefreshCw,
  PhoneCall,
  ArrowRight,
  Upload,
  AlertCircle,
  ChevronLeft,
  Send,
  Navigation
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function TransporterDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available')
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [activeJobs, setActiveJobs] = useState<any[]>([])
  const [completedJobs, setCompletedJobs] = useState<any[]>([])
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Bid Modal State
  const [bidModalJob, setBidModalJob] = useState<any | null>(null)
  const [proposedCost, setProposedCost] = useState<number>(0)
  const [pickupEta, setPickupEta] = useState('Tomorrow morning 8 AM')
  const [deliveryEta, setDeliveryEta] = useState('Within 24 hours of pickup')
  const [bidMessage, setBidMessage] = useState('')
  const [submittingBid, setSubmittingBid] = useState(false)

  // Pickup / Deliver Action Modal State
  const [actionModal, setActionModal] = useState<{ job: any; type: 'pickup' | 'dispatch' | 'deliver' } | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submittingAction, setSubmittingAction] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch transporter profile
      const profRes = await fetch('/api/marketplace/logistics/transporters/me')
      const profData = await profRes.json()
      if (profData.success) {
        setProfile(profData.transporter)
      }

      // 2. Fetch jobs
      const [availRes, activeRes, compRes] = await Promise.all([
        fetch('/api/marketplace/logistics/jobs?role=transporter&status=available'),
        fetch('/api/marketplace/logistics/jobs?role=transporter&status=my_active'),
        fetch('/api/marketplace/logistics/jobs?role=transporter&status=completed')
      ])

      const availData = await availRes.json()
      const activeData = await activeRes.json()
      const compData = await compRes.json()

      if (availData.success) setAvailableJobs(availData.jobs || [])
      if (activeData.success) setActiveJobs(activeData.jobs || [])
      if (compData.success) setCompletedJobs(compData.jobs || [])
    } catch (err) {
      console.error('Error loading transporter dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleOpenBid = (job: any) => {
    setBidModalJob(job)
    setProposedCost(job.estimatedCost || 2500)
    setPickupEta('Tomorrow 9:00 AM')
    setDeliveryEta('Same-day delivery before 6:00 PM')
    setBidMessage(`Clean tarpaulin-covered truck with weighbridge check ready.`)
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bidModalJob) return

    setSubmittingBid(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch(`/api/marketplace/logistics/jobs/${bidModalJob.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedCost,
          estimatedPickupTime: pickupEta,
          estimatedDeliveryTime: deliveryEta,
          message: bidMessage
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Transport quote of ₹${proposedCost.toLocaleString('en-IN')} submitted to farmer & buyer!` })
        setBidModalJob(null)
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to submit quote' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setSubmittingBid(false)
    }
  }

  const handleJobAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionModal) return

    setSubmittingAction(true)
    setFeedbackMsg(null)
    try {
      const { job, type } = actionModal

      // If deliver and proofFile selected, upload proof first
      let proofUrl = ''
      if (type === 'deliver' && proofFile) {
        const formData = new FormData()
        formData.append('file', proofFile)
        const uploadRes = await fetch(`/api/marketplace/logistics/jobs/${job.id}/proof`, {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          proofUrl = uploadData.proofUrl
        }
      }

      const actionMap = {
        pickup: 'CONFIRM_PICKUP',
        dispatch: 'DISPATCH',
        deliver: 'MARK_DELIVERED'
      }

      const res = await fetch(`/api/marketplace/logistics/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionMap[type],
          notes: actionNotes,
          proofUrl
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Delivery status updated to ${data.deliveryStatus}!` })
        setActionModal(null)
        setActionNotes('')
        setProofFile(null)
        await fetchData()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update job status' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setSubmittingAction(false)
    }
  }

  // Calculate Metrics
  const totalEarnings = completedJobs.reduce((acc, j) => acc + (j.agreedCost || 0), 0)
  const activeTripsCount = activeJobs.length
  const completedTripsCount = completedJobs.length
  const transporterRating = profile?.rating || 5.0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-semibold text-slate-200 dark:bg-slate-950 flex items-center justify-center gap-3">
        <span>🚛 <strong>FarmDirect Transporter Desk:</strong> Regional Agricultural Haulage · Guaranteed Mandi Pay</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline text-lime-400">⚡ 0% Platform Commission</span>
      </div>

      {/* Nav Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-700 dark:text-slate-300">
              <ChevronLeft className="h-4 w-4" />
              <span>Mandi Marketplace</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-black text-blue-900 dark:text-blue-300">Transporter Operations</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transporter/profile"
              className="text-xs font-bold text-slate-700 hover:text-blue-700 dark:text-slate-300 flex items-center gap-1"
            >
              <span>Fleet & Profile</span>
              {profile?.verificationStatus === 'VERIFIED' && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              )}
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Title & Fleet Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {profile?.businessName || 'Transporter Operations Desk'}
              </h1>
              {profile?.verificationStatus === 'VERIFIED' ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Base: {profile?.baseLocation || 'Maharashtra'} · Capacity: {profile?.carryingCapacity || 30} {profile?.capacityUnit || 'Quintal'} · Vehicles: {profile?.vehicles?.length || 1}
            </p>
          </div>

          <Link
            href="/transporter/profile"
            className="rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
          >
            Manage Fleet Vehicles
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

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Available Cargo Jobs</span>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-blue-700 dark:text-blue-400">{availableJobs.length}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Within regional service area</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Deliveries</span>
              <Truck className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{activeTripsCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Assigned / In transit</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Completed Trips</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">{completedTripsCount}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Proof verified & settled</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Fleet Rating</span>
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {transporterRating.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">Earned: ₹{totalEarnings.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'available'
                ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Available Delivery Jobs ({availableJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>My Active Trips ({activeJobs.length})</span>
            {activeJobs.length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                {activeJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
              activeTab === 'completed'
                ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed Trips & Earnings ({completedJobs.length})</span>
          </button>
        </div>

        {/* Content Tabs */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs font-bold text-slate-500">Loading delivery network...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: AVAILABLE JOBS */}
            {activeTab === 'available' && (
              <div className="space-y-4">
                {availableJobs.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <Truck className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No open delivery jobs currently</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      When farmers and buyers close produce deals requiring third-party transport, they will appear here for bidding.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {availableJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-400">Job #{job.id.slice(0, 10)}</span>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {job.bidsCount || 0} Quotes Placed
                          </span>
                        </div>

                        <div className="mt-3 space-y-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cargo</span>
                            <div className="text-base font-black text-slate-900 dark:text-white">
                              {job.cargoCropName} · {job.cargoQuantity} {job.cargoUnit}
                            </div>
                            {job.refrigerationRequired && (
                              <span className="inline-block mt-0.5 rounded-md bg-cyan-100 px-2 py-0.5 text-[10px] font-black text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                                ❄ Cold-Chain Reefer Required
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl dark:bg-slate-800/60">
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold block">Pickup Origin</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{job.pickupLocation}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold block">Destination</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                                <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{job.deliveryLocation?.district || job.deliveryLocation?.city || 'Buyer Mandi'}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500">
                              Estimated Distance: <strong className="text-slate-900 dark:text-white">~{job.distanceKm} km</strong>
                            </span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                              Est. Pay: ₹{job.estimatedCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                          <button
                            onClick={() => handleOpenBid(job)}
                            className="rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Submit Transport Quote</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY ACTIVE DELIVERIES */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <Truck className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No active trips currently assigned</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Browse available delivery jobs and submit quotes. When a farmer or buyer selects your quote, your assignment will appear here.
                    </p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="mt-4 inline-block rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
                    >
                      Browse Available Jobs
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {activeJobs.map((job) => {
                      const isAssigned = job.deliveryStatus === 'ASSIGNED'
                      const isPickedUp = job.deliveryStatus === 'PICKED_UP'
                      const isInTransit = job.deliveryStatus === 'IN_TRANSIT'
                      const isDelivered = job.deliveryStatus === 'DELIVERED'

                      return (
                        <div
                          key={job.id}
                          className="rounded-3xl border border-blue-200 bg-white p-5 shadow-xs dark:border-blue-900/60 dark:bg-slate-900"
                        >
                          {/* Trip Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 dark:text-white">Trip #{job.id}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                Agreed Pay: ₹{job.agreedCost ? job.agreedCost.toLocaleString('en-IN') : job.estimatedCost.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {job.deliveryStatus.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Cargo & Contact Details */}
                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cargo Information</span>
                              <div className="text-sm font-black text-slate-900 dark:text-white">
                                {job.cargoCropName}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">
                                Quantity: <span className="font-bold">{job.cargoQuantity} {job.cargoUnit}</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Distance: ~{job.distanceKm} km
                              </div>
                            </div>

                            <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contacts</span>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                Farmer: {job.farmer.name} (+91 {job.farmer.phone})
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                Buyer: {job.buyer.name} (+91 {job.buyer.phone})
                              </div>
                              <div className="text-xs text-slate-500">
                                Pickup: {job.pickupLocation}
                              </div>
                            </div>

                            {/* State Machine Action Button */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Action</span>

                              {isAssigned && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Drive to farm gate and confirm cargo loading.
                                  </p>
                                  <button
                                    onClick={() => setActionModal({ job, type: 'pickup' })}
                                    className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
                                  >
                                    Confirm Farm-Gate Pickup
                                  </button>
                                </div>
                              )}

                              {isPickedUp && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Cargo loaded. Begin transit to destination.
                                  </p>
                                  <button
                                    onClick={() => setActionModal({ job, type: 'dispatch' })}
                                    className="w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
                                  >
                                    Depart & Mark In Transit
                                  </button>
                                </div>
                              )}

                              {isInTransit && (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                                    Upload proof and confirm delivery at buyer destination.
                                  </p>
                                  <button
                                    onClick={() => setActionModal({ job, type: 'deliver' })}
                                    className="w-full rounded-xl bg-indigo-700 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 flex items-center justify-center gap-1.5"
                                  >
                                    <Upload className="h-3.5 w-3.5" />
                                    <span>Upload Proof & Mark Delivered</span>
                                  </button>
                                </div>
                              )}

                              {isDelivered && (
                                <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
                                  Produce delivered! Buyer has been notified to verify goods and release escrow payment.
                                </div>
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

            {/* TAB 3: COMPLETED TRIPS */}
            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedJobs.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                    <CheckCircle2 className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No completed trips yet</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Delivered jobs confirmed by buyers will appear here with settled earnings.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {completedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">Trip #{job.id}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                              {new Date(job.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Trip Settled & Completed
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cargo</span>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {job.cargoCropName} · {job.cargoQuantity} {job.cargoUnit}
                            </div>
                            <div className="text-xs text-slate-500">
                              Route: {job.pickupLocation} → {job.deliveryLocation?.district || 'Buyer Mandi'}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Settlement</span>
                            <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
                              ₹{(job.agreedCost || job.estimatedCost).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-slate-400">Paid directly via Escrow</div>
                          </div>

                          {job.proofOfDeliveryUrl && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Proof of Delivery</span>
                              <a
                                href={job.proofOfDeliveryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-1 text-xs font-bold text-blue-700 hover:underline dark:text-blue-400"
                              >
                                View Delivery Document / Photo ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* BID / QUOTE MODAL */}
      {bidModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Submit Haulage Quote</h3>
                <p className="text-xs text-slate-500">
                  {bidModalJob.cargoCropName} ({bidModalJob.cargoQuantity} {bidModalJob.cargoUnit}) · ~{bidModalJob.distanceKm} km
                </p>
              </div>
              <button
                onClick={() => setBidModalJob(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proposed Transport Cost (₹): *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={proposedCost}
                  onChange={(e) => setProposedCost(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">
                  Calculated estimate: ₹{bidModalJob.estimatedCost.toLocaleString('en-IN')}.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup ETA: *
                </label>
                <input
                  type="text"
                  required
                  value={pickupEta}
                  onChange={(e) => setPickupEta(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery ETA: *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryEta}
                  onChange={(e) => setDeliveryEta(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quote Note / Vehicle Details:
                </label>
                <textarea
                  rows={2}
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="E.g. Clean covered truck, certified weighbridge driver with electronic e-way bill."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBidModalJob(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="rounded-xl bg-blue-700 px-6 py-2 font-bold text-white shadow-md hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {submittingBid ? 'Submitting...' : 'Send Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL (PICKUP / DISPATCH / DELIVER WITH PROOF) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">
                  {actionModal.type === 'pickup' && 'Confirm Farm-Gate Cargo Pickup'}
                  {actionModal.type === 'dispatch' && 'Confirm Vehicle Departure'}
                  {actionModal.type === 'deliver' && 'Confirm Delivery & Upload Proof'}
                </h3>
                <p className="text-xs text-slate-500">Trip #{actionModal.job.id}</p>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJobAction} className="mt-4 space-y-3.5 text-xs">
              {actionModal.type === 'deliver' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proof of Delivery (Photo / Weighbridge Slip / Signed Receipt):
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span className="text-[11px] text-slate-400">
                    Uploaded securely to Supabase Storage for buyer inspection.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trip Notes / Observations:
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionModal.type === 'pickup'
                      ? 'Counted 20 bags, sealed properly with no moisture.'
                      : actionModal.type === 'deliver'
                      ? 'Unloaded at Bay 4, weighbridge slip verified.'
                      : 'Departing onto national highway.'
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="rounded-xl bg-blue-700 px-6 py-2 font-bold text-white shadow-md hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {submittingAction ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
