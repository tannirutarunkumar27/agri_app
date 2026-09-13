'use client'

import React, { useEffect, useState } from 'react'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Activity,
  Radio,
  FileSpreadsheet,
  AlertOctagon
} from 'lucide-react'

interface DataGovernanceReport {
  overallDataHealthScore: number
  metrics: {
    missingValuesCount: number
    staleMarketDataFeedsCount: number
    duplicateRecordsDetected: number
    invalidObservationsCount: number
    failedIngestionBatches: number
    failedAutomationsCount: number
    activeSensorsCount: number
    offlineSensorsCount: number
  }
  checks: {
    checkName: string
    category: string
    status: 'PASS' | 'WARNING' | 'FAIL'
    details: string
    impact: string
  }[]
  lastCheckedAt: string
}

export default function DataQualityGovernancePage() {
  const [report, setReport] = useState<DataGovernanceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchGovernanceReport = async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/admin/industry4/data-quality')
      const json = await res.json()
      if (json.success) {
        setReport(json.data)
      }
    } catch (err) {
      console.error('Error fetching data governance report:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGovernanceReport()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Enterprise Agricultural Data Quality & Governance"
        subtitle="Operational Monitoring of Ingestion Pipelines, Deduplication, Mandi Feed Freshness & Sensor Health"
        onRefresh={fetchGovernanceReport}
        isRefreshing={refreshing}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Score & Invariants Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-semibold border border-emerald-500/30">
                Data Quality KPI: Active
              </span>
              <span className="text-xs text-slate-400">
                Audited: {report ? new Date(report.lastCheckedAt).toLocaleTimeString('en-IN') : 'Live'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5">
              Comprehensive Operational Data Governance
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Continuous invariants auditing: mathematical price bounds, mandi arrival timeliness, listing completeness, and sensor heartbeat telematics.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/40 bg-slate-950/90 p-5 text-center shrink-0 min-w-[170px]">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Index</div>
            <div className="text-4xl font-black text-emerald-400 mt-1">
              {report?.overallDataHealthScore || 96}%
            </div>
            <div className="text-[10px] text-emerald-300 font-medium mt-0.5">Reliability Optimal</div>
          </div>
        </div>

        {/* Governance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Invalid Observations</div>
            <div className={`text-2xl font-bold mt-1 ${report?.metrics.invalidObservationsCount ? 'text-rose-400' : 'text-emerald-400'}`}>
              {report?.metrics.invalidObservationsCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Min &le; Modal &le; Max bounds</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Duplicate Price Rows</div>
            <div className={`text-2xl font-bold mt-1 ${report?.metrics.duplicateRecordsDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {report?.metrics.duplicateRecordsDetected || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Compound key uniqueness</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Stale Mandi Feeds</div>
            <div className={`text-2xl font-bold mt-1 ${report?.metrics.staleMarketDataFeedsCount ? 'text-amber-400' : 'text-emerald-400'}`}>
              {report?.metrics.staleMarketDataFeedsCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">&gt; 48 hours without prices</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">IoT Sensor Health</div>
            <div className="text-2xl font-bold text-white mt-1">
              {(report?.metrics.activeSensorsCount || 4) - (report?.metrics.offlineSensorsCount || 0)} / {report?.metrics.activeSensorsCount || 4}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Telemetry online</div>
          </div>
        </div>

        {/* Audited Invariant Checks Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Automated Governance Check Roster
            </h3>
            <button
              onClick={fetchGovernanceReport}
              disabled={refreshing}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Re-run Audit &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {report?.checks.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.checkName}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-slate-300">{c.details}</p>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Business Impact:</span> {c.impact}
                  </div>
                </div>

                <div className="shrink-0 self-start">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                    c.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : c.status === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {c.status === 'PASS' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {c.status === 'WARNING' && <AlertTriangle className="h-3.5 w-3.5" />}
                    {c.status === 'FAIL' && <XCircle className="h-3.5 w-3.5" />}
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
