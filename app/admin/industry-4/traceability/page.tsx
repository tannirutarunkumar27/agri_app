'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Truck,
  FileCheck,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface TraceabilityData {
  lotId: string
  commodityName: string
  variety: string
  grade: string
  quantity: number
  unit: string
  farmerName: string
  farmLocation: string
  harvestDate?: string
  buyerName?: string
  transporterName?: string
  currentLifecycleStage: string
  overallTraceabilityScore: number
  timeline: Array<{
    stepIndex: number
    eventType: string
    title: string
    description: string
    timestamp: string
    actorRole: string
    actorName?: string
    location?: string
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'
    metadata: Record<string, any>
  }>
}

function TraceabilityContent() {
  const searchParams = useSearchParams()
  const initialLotId = searchParams.get('lotId') || ''

  const [lotInput, setLotInput] = useState(initialLotId)
  const [data, setData] = useState<TraceabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTraceability = async (idToFetch: string) => {
    if (!idToFetch.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/industry4/traceability/${encodeURIComponent(idToFetch.trim())}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      } else {
        setError(json.error || 'Produce lot not found')
        setData(null)
      }
    } catch (err) {
      console.error('Traceability fetch error:', err)
      setError('Failed to fetch lot traceability chain')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialLotId) {
      fetchTraceability(initialLotId)
    } else {
      // Auto fetch default demo order or listing
      fetchTraceability('DEMO-ORD-01')
    }
  }, [initialLotId])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Produce Lot Digital Traceability Engine"
        subtitle="End-to-End Immutable Produce Audit: Farm Gate &rarr; QA &rarr; Listing &rarr; Buyer Escrow &rarr; Cold Chain Transit &rarr; Delivery"
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Search Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              fetchTraceability(lotInput)
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={lotInput}
                onChange={(e) => setLotInput(e.target.value)}
                placeholder="Enter Lot ID, Order ID (e.g. DEMO-ORD-01), or Listing ID..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Audit Lot Traceability'}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Quick Samples:</span>
            {['DEMO-ORD-01', 'DEMO-ORD-02', 'comm-redgram', 'comm-mirchi'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setLotInput(s)
                  fetchTraceability(s)
                }}
                className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300">
            {error}. You can try sample identifiers like <code className="text-white">DEMO-ORD-01</code> or list active marketplace IDs.
          </div>
        )}

        {/* Lot Overview Card */}
        {data && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-semibold border border-emerald-500/30">
                      Lot ID: {data.lotId}
                    </span>
                    <span className="rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-xs font-medium border border-blue-500/30">
                      Grade: {data.grade}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5">{data.commodityName}</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Variety: {data.variety} • Total Quantity: {data.quantity} {data.unit}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs text-slate-400">Digital Traceability Index</div>
                    <div className="text-2xl font-black text-emerald-400">
                      {data.overallTraceabilityScore}%
                    </div>
                    <div className="text-[10px] text-slate-500">Immutable Chain Verified</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-400" /> Farmer / Origin
                  </div>
                  <div className="font-semibold text-white mt-1">{data.farmerName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{data.farmLocation}</div>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" /> Harvest Date
                  </div>
                  <div className="font-semibold text-white mt-1">
                    {data.harvestDate ? new Date(data.harvestDate).toLocaleDateString('en-IN') : 'Recent Season'}
                  </div>
                  <div className="text-[11px] text-slate-400">Farm Gate Harvest</div>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Commercial Buyer
                  </div>
                  <div className="font-semibold text-white mt-1">{data.buyerName || 'Marketplace Active'}</div>
                  <div className="text-[11px] text-slate-400">Verified Direct Procurement</div>
                </div>

                <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-400" /> Transporter / Fleet
                  </div>
                  <div className="font-semibold text-white mt-1">{data.transporterName || 'Direct Farm Gate'}</div>
                  <div className="text-[11px] text-slate-400">GPS &amp; Cold-Chain Logged</div>
                </div>
              </div>
            </div>

            {/* Timeline View */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Immutable Lot Lifecycle Event Log
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {data.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle bullet */}
                    <div className={`absolute -left-6 sm:-left-8 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      step.status === 'COMPLETED'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-blue-950 border-blue-500 text-blue-300 animate-pulse'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}>
                      {step.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : step.stepIndex}
                    </div>

                    <div className="rounded-lg border border-slate-800/90 bg-slate-950/80 p-4 shadow-sm space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{step.title}</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                            {step.eventType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(step.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 font-mono">
                        {step.actorName && (
                          <div>
                            <span className="text-slate-500">Actor:</span>{' '}
                            <span className="text-emerald-300 font-medium">{step.actorName} ({step.actorRole})</span>
                          </div>
                        )}
                        {step.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span className="text-slate-300">{step.location}</span>
                          </div>
                        )}
                        {step.metadata && Object.keys(step.metadata).length > 0 && (
                          <div>
                            <span className="text-slate-500">Payload:</span>{' '}
                            <span className="text-slate-400">{JSON.stringify(step.metadata)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function TraceabilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading digital traceability engine...</div>}>
      <TraceabilityContent />
    </Suspense>
  )
}
