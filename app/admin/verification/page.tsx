'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft,
  RefreshCw,
  UserCheck
} from 'lucide-react'
import { TrustBadge } from '@/components/trust/TrustBadge'

interface VerificationItem {
  id: string
  userId: string
  userName?: string
  userPhone?: string
  userRole: string
  verificationType: string
  submittedLevel: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED'
  documentReference?: string
  documentMetadata: Record<string, any>
  rejectionReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminVerificationPage() {
  const [items, setItems] = useState<VerificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
  const [actionModal, setActionModal] = useState<{ open: boolean; action: string; note: string }>({
    open: false,
    action: '',
    note: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/verification')
      const data = await res.json()
      if (data.success && Array.isArray(data.records)) {
        setItems(data.records)
      }
    } catch (err) {
      console.error('Failed to load verifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async () => {
    if (!selectedItem || !actionModal.action) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedItem.id,
          action: actionModal.action,
          notes: actionModal.note,
          rejectionReason: actionModal.action === 'REJECT' ? actionModal.note : undefined
        })
      })
      const result = await res.json()
      if (result.success) {
        setActionModal({ open: false, action: '', note: '' })
        setSelectedItem(null)
        await loadData()
      } else {
        alert(result.error || 'Failed to update verification status')
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredItems = items.filter(item => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchName = item.userName?.toLowerCase().includes(q)
      const matchPhone = item.userPhone?.toLowerCase().includes(q)
      const matchRole = item.userRole?.toLowerCase().includes(q)
      const matchType = item.verificationType?.toLowerCase().includes(q)
      return matchName || matchPhone || matchRole || matchType
    }
    return true
  })

  const pendingCount = items.filter(i => i.status === 'PENDING').length
  const approvedCount = items.filter(i => i.status === 'APPROVED').length
  const rejectedCount = items.filter(i => i.status === 'REJECTED').length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h1 className="text-xl font-bold text-slate-900">Identity & Trust Verification Center</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit credentials, review legal documentation, and calibrate ecosystem trust scores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/disputes"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Dispute Tribunal
            </Link>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Action</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Requires admin document review</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Credentials</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">{approvedCount}</div>
            <p className="text-xs text-emerald-600 mt-1">Active verified market participants</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected / Revoked</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-700 mt-2">{rejectedCount}</div>
            <p className="text-xs text-rose-600 mt-1">Declined or suspended for fraud</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{items.length}</div>
            <p className="text-xs text-slate-500 mt-1">All recorded verification events</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, phone, role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Verification Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Verification Type</th>
                  <th className="py-3 px-4">Submitted Level</th>
                  <th className="py-3 px-4">Document / Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading verification queue...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No verification requests found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{item.userName || 'Unnamed User'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.userPhone || item.userId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.verificationType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <TrustBadge level={item.submittedLevel} showScore={false} interactive={false} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {item.documentReference ? (
                          <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.documentReference}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Direct Attestation</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          item.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setActionModal({ open: true, action: 'APPROVE', note: 'Documentation verified against official database.' })
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setActionModal({ open: true, action: 'REJECT', note: '' })
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                setActionModal({ open: true, action: item.status === 'APPROVED' ? 'SUSPEND' : 'APPROVE', note: '' })
                              }}
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs font-medium underline"
                            >
                              Manage
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Action Modal */}
      {actionModal.open && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Confirm {actionModal.action} Action
              </h3>
              <button
                onClick={() => setActionModal({ open: false, action: '', note: '' })}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div><span className="font-bold text-slate-600">User:</span> {selectedItem.userName} ({selectedItem.userRole})</div>
                <div><span className="font-bold text-slate-600">Type:</span> {selectedItem.verificationType}</div>
                <div><span className="font-bold text-slate-600">Target Level:</span> {selectedItem.submittedLevel}</div>
                {selectedItem.documentReference && (
                  <div><span className="font-bold text-slate-600">Document Ref:</span> {selectedItem.documentReference}</div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionModal.action === 'REJECT' ? 'Rejection Reason (Required)' : 'Review Notes / Audit Log'}
                </label>
                <textarea
                  rows={3}
                  value={actionModal.note}
                  onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                  placeholder="Enter audit explanation..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActionModal({ open: false, action: '', note: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={submitting || (actionModal.action === 'REJECT' && !actionModal.note.trim())}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl ${
                  actionModal.action === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'Updating...' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
