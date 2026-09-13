'use client'

import React, { useEffect, useState } from 'react'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Filter,
  Check,
  RefreshCw,
  Clock,
  Shield,
  Truck,
  TrendingUp,
  Radio
} from 'lucide-react'

interface AlertItem {
  id: string
  alertType: 'CRITICAL' | 'WARNING' | 'INFO'
  category: 'MARKET' | 'OPERATIONS' | 'QUALITY' | 'LOGISTICS' | 'SECURITY'
  title: string
  message: string
  entityType?: string
  entityId?: string
  metadata: Record<string, any>
  isRead: boolean
  isResolved: boolean
  resolvedAt?: string
  createdAt: string
}

export default function AdminAlertCenterPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const fetchAlerts = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/industry4/alerts?includeResolved=true')
      const json = await res.json()
      if (json.success) {
        setAlerts(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/industry4/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, resolvedBy: 'Operations Desk Officer' })
      })
      const json = await res.json()
      if (json.success) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId ? { ...a, isResolved: true, resolvedAt: new Date().toISOString() } : a
          )
        )
      }
    } catch (err) {
      console.error('Error resolving alert:', err)
    }
  }

  // Filter alerts based on activeTab and categoryFilter
  const filteredAlerts = alerts.filter((a) => {
    if (activeTab !== 'ALL' && a.alertType !== activeTab) return false
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false
    return true
  })

  const criticalCount = alerts.filter((a) => a.alertType === 'CRITICAL' && !a.isResolved).length
  const warningCount = alerts.filter((a) => a.alertType === 'WARNING' && !a.isResolved).length
  const infoCount = alerts.filter((a) => a.alertType === 'INFO' && !a.isResolved).length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Industry 4.0 Smart Alert Center"
        subtitle="Tiered Multi-Channel Alerts: System Issues, Supply/Demand Imbalances, Price Surges & Logistics SLAs"
        onRefresh={fetchAlerts}
        isRefreshing={refreshing}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Tier Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical */}
          <div
            onClick={() => setActiveTab('CRITICAL')}
            className={`cursor-pointer rounded-xl border p-4 transition shadow-sm ${
              activeTab === 'CRITICAL'
                ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="h-4 w-4" />
                CRITICAL ({criticalCount})
              </div>
              <span className="text-[10px] uppercase font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                Immediate Action
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              System failures, delivery SLA breaches, and failed agricultural lot moisture/quality tests.
            </p>
          </div>

          {/* Warning */}
          <div
            onClick={() => setActiveTab('WARNING')}
            className={`cursor-pointer rounded-xl border p-4 transition shadow-sm ${
              activeTab === 'WARNING'
                ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                WARNING ({warningCount})
              </div>
              <span className="text-[10px] uppercase font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Potential Problem
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Supply shortages vs buyer demand, unexpected mandi price volatility (&gt;5%), and listing outliers.
            </p>
          </div>

          {/* Information */}
          <div
            onClick={() => setActiveTab('INFO')}
            className={`cursor-pointer rounded-xl border p-4 transition shadow-sm ${
              activeTab === 'INFO'
                ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/50'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Info className="h-4 w-4" />
                INFORMATION ({infoCount})
              </div>
              <span className="text-[10px] uppercase font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                Market Insight
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Positive price movements in nearby mandis, buyer inquiry spikes, and scheduled system syncs.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-500" /> Filter Category:
            </span>
            {['ALL', 'MARKET', 'OPERATIONS', 'QUALITY', 'LOGISTICS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Show All ({alerts.length})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <div className="text-base font-semibold text-white">No alerts match the selected criteria</div>
              <div className="text-xs text-slate-500 mt-1">All monitored systems operating within parameters.</div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition shadow-sm ${
                  alert.isResolved
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                    : alert.alertType === 'CRITICAL'
                    ? 'border-rose-500/40 bg-slate-900/90 hover:border-rose-500/70'
                    : alert.alertType === 'WARNING'
                    ? 'border-amber-500/40 bg-slate-900/90 hover:border-amber-500/70'
                    : 'border-cyan-500/40 bg-slate-900/90 hover:border-cyan-500/70'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.alertType === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        alert.alertType === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {alert.alertType}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {alert.category}
                      </span>
                      {alert.isResolved ? (
                        <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 border border-emerald-500/30">
                          <Check className="h-3 w-3" /> Resolved
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Active
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{alert.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    {/* Metadata attributes box */}
                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                        {alert.metadata.market && (
                          <div><span className="text-slate-500">Market:</span> <span className="text-white">{alert.metadata.market}</span></div>
                        )}
                        {alert.metadata.commodity && (
                          <div><span className="text-slate-500">• Commodity:</span> <span className="text-emerald-300">{alert.metadata.commodity}</span></div>
                        )}
                        {alert.metadata.observation_period && (
                          <div><span className="text-slate-500">• Period:</span> <span className="text-slate-300">{alert.metadata.observation_period}</span></div>
                        )}
                        {alert.metadata.source && (
                          <div><span className="text-slate-500">• Source:</span> <span className="text-blue-300">{alert.metadata.source}</span></div>
                        )}
                      </div>
                    )}
                  </div>

                  {!alert.isResolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition shadow-sm self-start shrink-0"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
