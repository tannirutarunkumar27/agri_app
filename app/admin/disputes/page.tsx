'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  Scale, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  AlertOctagon,
  ChevronRight,
  ShieldCheck,
  TrendingDown
} from 'lucide-react'

interface DisputeItem {
  id: string
  orderId: string
  raisedBy: string
  raisedByName?: string
  raisedAgainst: string
  raisedAgainstName?: string
  reason: string
  description: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_REQUIRED' | 'RESOLVED' | 'ESCALATED' | 'CANCELLED'
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL'
  disputedAmount: number
  claimedWeightLossKg?: number
  qualityGradeClaimed?: string
  settlementAmountFarmer: number
  settlementAmountBuyer: number
  slaDeadline: string
  createdAt: string
  orderSummary?: {
    orderNumber: string
    cropName: string
    quantity: number
    totalAmount: number
  }
}

interface RiskFlag {
  id: string
  transactionId: string
  riskType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  details: Record<string, any>
  status: string
  flaggedAt: string
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([])
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([])
  const [metrics, setMetrics] = useState({
    totalDisputes: 0,
    activeDisputes: 0,
    resolvedDisputes: 0,
    totalFrozenEscrow: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null)
  const [resolveModal, setResolveModal] = useState({
    open: false,
    resolution: 'PARTIAL_REFUND',
    farmerPayout: 0,
    buyerRefund: 0,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/disputes')
      const data = await res.json()
      if (data.success) {
        setDisputes(data.disputes || [])
        setRiskFlags(data.riskFlags || [])
        if (data.metrics) setMetrics(data.metrics)
      }
    } catch (err) {
      console.error('Failed to load disputes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openResolveDialog = (d: DisputeItem) => {
    setSelectedDispute(d)
    const half = Number((d.disputedAmount / 2).toFixed(2))
    setResolveModal({
      open: true,
      resolution: 'PARTIAL_REFUND',
      farmerPayout: half,
      buyerRefund: Number((d.disputedAmount - half).toFixed(2)),
      notes: 'Settlement calculated based on inspection logs and transit weighbridge reconciliation.'
    })
  }

  const handleResolutionSubmit = async () => {
    if (!selectedDispute) return
    const total = Number(resolveModal.farmerPayout) + Number(resolveModal.buyerRefund)
    if (Math.abs(total - selectedDispute.disputedAmount) > 0.05) {
      alert(`Settlement mismatch: Farmer payout (${resolveModal.farmerPayout}) + Buyer refund (${resolveModal.buyerRefund}) must strictly equal total disputed escrow (₹${selectedDispute.disputedAmount})`)
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          resolution: resolveModal.resolution,
          resolutionNotes: resolveModal.notes,
          settlementAmountFarmer: resolveModal.farmerPayout,
          settlementAmountBuyer: resolveModal.buyerRefund
        })
      })
      const result = await res.json()
      if (result.success) {
        setResolveModal({ ...resolveModal, open: false })
        setSelectedDispute(null)
        await loadData()
      } else {
        alert(result.error || 'Failed to resolve dispute')
      }
    } catch (err: any) {
      alert('Error submitting resolution: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getSlaBadge = (deadlineStr: string, priority: string) => {
    const deadline = new Date(deadlineStr).getTime()
    const now = Date.now()
    const hoursLeft = Math.round((deadline - now) / (1000 * 60 * 60))

    if (hoursLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
          <AlertOctagon className="w-3 h-3" /> Overdue ({Math.abs(hoursLeft)}h)
        </span>
      )
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
        priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
      }`}>
        <Clock className="w-3 h-3" /> {hoursLeft}h SLA remaining
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-900">Trade Dispute & Tribunal Operations</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fair evidence-backed dispute adjudication, escrow freezing, and settlement execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/verification"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verification Queue
            </Link>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              title="Refresh disputes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Disputes</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{metrics.activeDisputes}</div>
            <p className="text-xs text-slate-500 mt-1">Requiring adjudication SLA attention</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frozen Escrow</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-2">
              ₹{metrics.totalFrozenEscrow.toLocaleString()}
            </div>
            <p className="text-xs text-rose-600 mt-1">Capital held in escrow dispute lock</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Cases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">{metrics.resolvedDisputes}</div>
            <p className="text-xs text-emerald-600 mt-1">Settlements disbursed and closed</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Risk Flags</span>
              <AlertOctagon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">{riskFlags.length}</div>
            <p className="text-xs text-slate-500 mt-1">Automated anomaly alerts</p>
          </div>
        </div>

        {/* Automated Risk Flags Alert Banner */}
        {riskFlags.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Automated Risk Detection Alerts ({riskFlags.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Deterministic Rule Triggered</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskFlags.slice(0, 4).map(flag => (
                <div key={flag.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">
                        {flag.severity}
                      </span>
                      <span>{flag.riskType.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-amber-900 mt-1 text-[11px] leading-relaxed">
                      {flag.details.message || JSON.stringify(flag.details)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disputes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Trade Disputes Docket</h2>
            <span className="text-xs text-slate-500 font-medium">{disputes.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Dispute ID & Reason</th>
                  <th className="py-3 px-4">Order Details</th>
                  <th className="py-3 px-4">Parties</th>
                  <th className="py-3 px-4">Disputed Escrow</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading disputes docket...
                    </td>
                  </tr>
                ) : disputes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No active disputes reported. Platform trade fulfillment is running normally.
                    </td>
                  </tr>
                ) : (
                  disputes.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{d.reason.replace(/_/g, ' ')}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{d.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{d.orderSummary?.cropName || 'Produce Lot'}</div>
                        <div className="text-[11px] text-slate-500">
                          {d.orderSummary?.quantity ? `${d.orderSummary.quantity} kg` : ''} • #{d.orderSummary?.orderNumber || d.orderId.slice(0, 8)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div><span className="text-slate-400">By:</span> <span className="font-semibold text-slate-800">{d.raisedByName || d.raisedBy}</span></div>
                        <div><span className="text-slate-400">Against:</span> <span className="text-slate-700">{d.raisedAgainstName || d.raisedAgainst}</span></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-rose-600">₹{d.disputedAmount.toLocaleString()}</div>
                        {d.claimedWeightLossKg && (
                          <div className="text-[10px] text-slate-500">Loss: {d.claimedWeightLossKg} kg</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getSlaBadge(d.slaDeadline, d.priority)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'OPEN' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {d.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => openResolveDialog(d)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                          >
                            Adjudicate
                          </button>
                        ) : (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Settled: F: ₹{d.settlementAmountFarmer} / B: ₹{d.settlementAmountBuyer}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjudication Resolution Modal */}
      {resolveModal.open && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Adjudicate Dispute: {selectedDispute.id}
                </h3>
              </div>
              <button
                onClick={() => setResolveModal({ ...resolveModal, open: false })}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Dispute Reason:</span>
                  <span className="font-bold text-slate-800">{selectedDispute.reason.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Frozen Escrow Balance:</span>
                  <span className="font-bold text-rose-600 text-sm">₹{selectedDispute.disputedAmount.toLocaleString()}</span>
                </div>
                <p className="text-slate-600 pt-1 text-[11px] border-t border-slate-200">
                  <span className="font-bold">Claim details:</span> {selectedDispute.description}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Adjudication Type</label>
                <select
                  value={resolveModal.resolution}
                  onChange={e => {
                    const r = e.target.value
                    const tot = selectedDispute.disputedAmount
                    let fp = 0
                    let br = 0
                    if (r === 'BUYER_REFUND') {
                      br = tot
                    } else if (r === 'FARMER_PAYOUT') {
                      fp = tot
                    } else {
                      fp = Number((tot / 2).toFixed(2))
                      br = Number((tot - fp).toFixed(2))
                    }
                    setResolveModal({
                      ...resolveModal,
                      resolution: r,
                      farmerPayout: fp,
                      buyerRefund: br
                    })
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="PARTIAL_REFUND">PARTIAL REFUND (Pro-rated split based on weight/grade variance)</option>
                  <option value="BUYER_REFUND">FULL BUYER REFUND (Complete rejection / critical non-delivery)</option>
                  <option value="FARMER_PAYOUT">FULL FARMER PAYOUT (Claim dismissed / quality confirmed)</option>
                  <option value="MUTUAL_CANCELLATION">MUTUAL CANCELLATION (Order voided)</option>
                </select>
              </div>

              {/* Exact Settlement Financial Inputs */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Farmer Settlement (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resolveModal.farmerPayout}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0
                      setResolveModal({
                        ...resolveModal,
                        farmerPayout: val,
                        buyerRefund: Number((selectedDispute.disputedAmount - val).toFixed(2))
                      })
                    }}
                    className="w-full p-2 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Buyer Refund (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resolveModal.buyerRefund}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0
                      setResolveModal({
                        ...resolveModal,
                        buyerRefund: val,
                        farmerPayout: Number((selectedDispute.disputedAmount - val).toFixed(2))
                      })
                    }}
                    className="w-full p-2 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjudication Statement (Audit Recorded)</label>
                <textarea
                  rows={3}
                  value={resolveModal.notes}
                  onChange={e => setResolveModal({ ...resolveModal, notes: e.target.value })}
                  placeholder="State evidence basis, weighbridge verification results, and penalty notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setResolveModal({ ...resolveModal, open: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResolutionSubmit}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs"
              >
                {submitting ? 'Executing Settlement...' : 'Execute & Disburse Escrow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
