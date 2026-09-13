'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Database,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Layers,
  MapPin,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react'

interface DataHealth {
  total_commodities: number
  total_mandis: number
  total_observations: number
  total_raw_records: number
  rejected_records: number
  valid_percentage: number
  total_stored_forecasts: number
}

interface CommodityBreakdown {
  commodity_name: string
  observations: number
  earliest_date: string
  latest_date: string
  avg_price: number
  price_range: string
}

interface SyncLog {
  id: string
  source: string
  records_received: number
  records_valid: number
  records_rejected: number
  records_duplicate: number
  execution_time_ms: number
  status: string
  created_at: string
}

export default function AdminMarketManagementPage() {
  const [health, setHealth] = useState<DataHealth | null>(null)
  const [breakdown, setBreakdown] = useState<CommodityBreakdown[]>([])
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [training, setTraining] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/market/status')
      const data = await res.json()
      if (data.success) {
        setHealth(data.data_health)
        setBreakdown(data.commodity_breakdown || [])
        setLogs(data.recent_sync_logs || [])
      }
    } catch (err) {
      console.error('Failed to load admin market status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Trigger sync
  const handleSync = async () => {
    setSyncing(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/market/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage(`Sync complete: ${data.result.recordsValid} valid records ingested.`)
        fetchStatus()
      } else {
        setMessage(`Sync failed: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Sync error: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  // Trigger forecast model training
  const handleTrain = async () => {
    setTraining(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/forecast/train', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage(`Model training complete: ${data.forecasts_generated} forecasts generated across ${data.pairs_evaluated} pairs.`)
        fetchStatus()
      } else {
        setMessage(`Training failed: ${data.error}`)
      }
    } catch (err: any) {
      setMessage(`Training error: ${err.message}`)
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Admin Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/market"
              className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Market & Data Quality Admin Control
                </h1>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                  Agmarknet DMI Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audit logs, daily mandi synchronization, model backtesting & master entity health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/industry-4"
              className="rounded-xl bg-slate-900 dark:bg-slate-800 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 px-3.5 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Industry 4.0 Command</span>
            </Link>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Ingesting...' : 'Sync Mandi Feed'}</span>
            </button>

            <button
              onClick={handleTrain}
              disabled={training}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Cpu className={`h-3.5 w-3.5 ${training ? 'animate-spin' : ''}`} />
              <span>{training ? 'Training Models...' : 'Retrain Forecasts'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Message Banner */}
        {message && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* 1. Health KPI Cards */}
        {health && (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Commodities</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {health.total_commodities}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">All Active</span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Reporting Mandis</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {health.total_mandis}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">APMC Network</span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Normalized Prices</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {health.total_observations.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Daily Observations</span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Raw Feed Records</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {health.total_raw_records.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Audit Trail Logged</span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Validation Quality</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {health.valid_percentage}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">({health.rejected_records} Rejected)</span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Stored Forecasts</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {health.total_stored_forecasts}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Multi-Horizon</span>
            </div>
          </section>
        )}

        {/* 2. Commodity Coverage & Price Spreads */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>Commodity Market Coverage & Observations</span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily observations and historical price intervals per commodity
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Commodity</th>
                  <th className="py-2.5 px-3 text-right">Observation Count</th>
                  <th className="py-2.5 px-3">Date Interval</th>
                  <th className="py-2.5 px-3 text-right">Average Modal Price</th>
                  <th className="py-2.5 px-3 text-right">Reported Price Spread</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {row.commodity_name}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      {row.observations} days
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {row.earliest_date} → {row.latest_date}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{row.avg_price.toLocaleString('en-IN')} / Qtl
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">
                      {row.price_range}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                        Synchronized
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Ingestion & Audit Logs */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Recent Ingestion & Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete batch execution logs, validation rates, and error provenance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Batch ID</th>
                  <th className="py-2.5 px-3">Source Provider</th>
                  <th className="py-2.5 px-3 text-right">Received</th>
                  <th className="py-2.5 px-3 text-right">Valid</th>
                  <th className="py-2.5 px-3 text-right">Rejected</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3 text-center">Execution Status</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {log.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {log.source}
                    </td>
                    <td className="py-3 px-3 text-right">{log.records_received}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">{log.records_valid}</td>
                    <td className="py-3 px-3 text-right text-rose-500 font-bold">{log.records_rejected}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{log.execution_time_ms} ms</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  )
}
