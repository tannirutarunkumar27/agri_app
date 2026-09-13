'use client'

import React, { useState } from 'react'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  ShieldCheck,
  Truck
} from 'lucide-react'

export default function ManagementReportingPage() {
  const [selectedReportType, setSelectedReportType] = useState('DAILY_MARKET')
  const [reportData, setReportData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { type: 'DAILY_MARKET', name: 'Daily Market Report', icon: TrendingUp, desc: 'APMC mandi arrivals, modal price benchmarks & volatility.' },
    { type: 'FARMER_REALIZATION', name: 'Farmer Price Realization Audit', icon: DollarSign, desc: 'FarmDirect agreed sale prices vs Mandi benchmark comparison.' },
    { type: 'WEEKLY_OPERATIONS', name: 'Weekly Operations Performance', icon: Truck, desc: 'Order cycle times, fulfillment velocity, and carrier SLA compliance.' },
    { type: 'QUALITY_COMPLIANCE', name: 'Produce Quality Compliance', icon: ShieldCheck, desc: 'Moisture, broken grain, and impurity audit passes & rejections.' },
    { type: 'INDUSTRY4_MATURITY', name: 'Industry 4.0 Maturity Scorecard', icon: Award, desc: 'Measurable scorecard covering 7 digital transformation pillars.' }
  ]

  const handleGenerateReport = async (type: string) => {
    setSelectedReportType(type)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/industry4/reports?type=${type}`)
      const json = await res.json()
      if (json.success) {
        setReportData(json.data)
      }
    } catch (err) {
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadMarkdown = () => {
    if (!reportData) return
    const blob = new Blob([reportData.markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.reportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Management Reports & Audited Operational Records"
        subtitle="Exportable Intelligence: Daily Mandi Analysis, Farmer Price Realization, Carrier SLAs & Quality Compliance"
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Report Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {reportTypes.map((rt) => {
            const Icon = rt.icon
            const isSelected = selectedReportType === rt.type
            return (
              <button
                key={rt.type}
                onClick={() => handleGenerateReport(rt.type)}
                className={`text-left rounded-xl border p-4 transition shadow-sm ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-900 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </div>
                <div className="font-bold text-white text-xs mt-2.5">{rt.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{rt.desc}</div>
              </button>
            )
          })}
        </div>

        {/* Generate / Action Trigger */}
        {!reportData && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white">Generate Audited Management Report</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select any report above or click below to compile live database records into an exportable, audited operational document.
            </p>
            <button
              onClick={() => handleGenerateReport(selectedReportType)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow transition"
            >
              <FileText className="h-4 w-4" />
              Compile Live Report
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-12 text-center text-slate-400 animate-pulse">
            <div className="text-sm font-semibold text-emerald-400">Compiling database metrics...</div>
            <div className="text-xs text-slate-500 mt-1">Executing ground-truth SQL aggregations without fictional models.</div>
          </div>
        )}

        {/* Report Preview */}
        {reportData && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/30">
                  {reportData.reportType}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{reportData.title}</h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Period: {reportData.period} • Generated: {new Date(reportData.generatedAt).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .md
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 shadow transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
              </div>
            </div>

            {/* Markdown Viewer Box */}
            <div className="rounded-lg bg-slate-950 p-6 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {reportData.markdownContent}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
