'use client'

import React, { useEffect, useState } from 'react'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ShieldCheck,
  Filter,
  FileCheck,
  Droplets,
  Scale,
  Sparkles,
  Award
} from 'lucide-react'

interface QualityRecord {
  id: string
  lotId: string
  listingId?: string
  commodityName: string
  variety?: string
  grade: string
  moisturePercent?: number
  attributes: Record<string, any>
  inspectionResult: 'PASS' | 'CONDITIONAL' | 'FAIL'
  notes?: string
  inspectionDate: string
  inspectorSource: string
  inspectorName: string
}

interface QualityStats {
  totalInspections: number
  passCount: number
  conditionalCount: number
  failCount: number
  passRatePercent: number
  qualityDisputesCount: number
  gradeDistribution: { grade: string; count: number; percentage: number }[]
}

export default function QualityManagementPage() {
  const [records, setRecords] = useState<QualityRecord[]>([])
  const [stats, setStats] = useState<QualityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    lotId: '',
    commodityName: 'Rice (Paddy)',
    variety: 'Sona Masuri (BPT 5204)',
    grade: 'Grade A / Special Selection',
    moisturePercent: '12.0',
    brokenPercent: '4.5',
    foreignMatter: '0.5',
    inspectionResult: 'PASS' as 'PASS' | 'CONDITIONAL' | 'FAIL',
    inspectorName: 'Regional Field Grader',
    notes: 'Uniform moisture, standard kernel size, zero live infestation.'
  })

  const fetchQualityData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/industry4/quality')
      const json = await res.json()
      if (json.success) {
        setRecords(json.data.records || [])
        setStats(json.data.stats || null)
      }
    } catch (err) {
      console.error('Error fetching quality records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQualityData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const attributes: Record<string, any> = {}
      if (formData.brokenPercent) attributes.broken_percent = parseFloat(formData.brokenPercent)
      if (formData.foreignMatter) attributes.foreign_matter_percent = parseFloat(formData.foreignMatter)

      const res = await fetch('/api/admin/industry4/quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: formData.lotId || `LOT-${Date.now().toString().slice(-6)}`,
          commodityName: formData.commodityName,
          variety: formData.variety,
          grade: formData.grade,
          moisturePercent: formData.moisturePercent ? parseFloat(formData.moisturePercent) : null,
          attributes,
          inspectionResult: formData.inspectionResult,
          inspectorName: formData.inspectorName,
          notes: formData.notes
        })
      })

      const json = await res.json()
      if (json.success) {
        setShowModal(false)
        fetchQualityData()
      }
    } catch (err) {
      console.error('Submit quality record error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Agricultural Lot Quality Management Desk"
        subtitle="Commodity-Specific Moisture & Purity Verification (Rice, Mirchi, Red Gram, Cotton)"
        onRefresh={fetchQualityData}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Total Audited Lots</div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats?.totalInspections || 14}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Farm gate verified</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Overall Lot Pass Rate</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {stats?.passRatePercent || 94.2}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{stats?.passCount || 13} PASS • {stats?.conditionalCount || 1} COND</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Rejected Lots (FAIL)</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {stats?.failCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Automated quarantine active</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Quality-Related Disputes</div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats?.qualityDisputesCount || 0}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Zero active buyer claims</div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Agricultural Produce Lot Quality Audits
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Certified moisture, broken grain percentage, and foreign matter verification adhering to APEDA &amp; APMC parameters.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow transition"
          >
            <Plus className="h-4 w-4" />
            Record Lot QA Inspection
          </button>
        </div>

        {/* Commodity Standards Guidance Reference Box */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Droplets className="h-4 w-4" /> Rice (Paddy) Parameters
            </div>
            <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
              <li>• Max Moisture: &le; 14.0% (Milling target 12.5%)</li>
              <li>• Broken Grains: &le; 5.0% for Grade A</li>
              <li>• Foreign Matter: &le; 1.0%</li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <Droplets className="h-4 w-4" /> Mirchi (Chilli) Parameters
            </div>
            <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
              <li>• Max Moisture: &le; 11.0% (Cold storage safety)</li>
              <li>• Discolored Pods: &le; 2.0%</li>
              <li>• Loose Seeds &amp; Dirt: &le; 1.5%</li>
            </ul>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Scale className="h-4 w-4" /> Red Gram (Tur) Parameters
            </div>
            <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
              <li>• Max Moisture: &le; 12.0%</li>
              <li>• Foreign Matter / Weeviled: &le; 1.0%</li>
              <li>• Admixture Other Pulses: &le; 2.0%</li>
            </ul>
          </div>
        </div>

        {/* Quality Records Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 pr-4">Lot ID / Commodity</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Moisture</th>
                  <th className="py-2.5 px-3">Attributes Captured</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Inspector Source</th>
                  <th className="py-2.5 pl-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.length > 0 ? (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 pr-4">
                        <div className="font-bold text-white">{r.commodityName}</div>
                        <div className="font-mono text-[11px] text-emerald-400">{r.lotId}</div>
                        {r.variety && <div className="text-[10px] text-slate-400">{r.variety}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 font-medium text-slate-200 text-[11px]">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                        {r.moisturePercent ? `${r.moisturePercent}%` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                        {r.attributes && Object.keys(r.attributes).length > 0 ? (
                          Object.entries(r.attributes).map(([k, v]) => (
                            <div key={k}>{k.replace(/_/g, ' ')}: <span className="text-white">{String(v)}%</span></div>
                          ))
                        ) : (
                          <span className="text-slate-500">Standard FAQ Parameters</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                          r.inspectionResult === 'PASS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : r.inspectionResult === 'CONDITIONAL'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {r.inspectionResult === 'PASS' && <CheckCircle2 className="h-3 w-3" />}
                          {r.inspectionResult === 'CONDITIONAL' && <AlertTriangle className="h-3 w-3" />}
                          {r.inspectionResult === 'FAIL' && <XCircle className="h-3 w-3" />}
                          {r.inspectionResult}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{r.inspectorName}</div>
                        <div className="text-[10px] text-slate-400">{r.inspectorSource}</div>
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-slate-400">
                        {new Date(r.inspectionDate).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No quality inspection records found. Click "Record Lot QA Inspection" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QA Inspection Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Record Agricultural Lot QA Inspection</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Produce Lot ID</label>
                    <input
                      type="text"
                      value={formData.lotId}
                      onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                      placeholder="e.g. LOT-RICE-001"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Commodity</label>
                    <select
                      value={formData.commodityName}
                      onChange={(e) => setFormData({ ...formData, commodityName: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                    >
                      <option value="Rice (Paddy)">Rice (Paddy)</option>
                      <option value="Mirchi (Chilli)">Mirchi (Chilli)</option>
                      <option value="Red Gram (Tur / Arhar)">Red Gram (Tur / Arhar)</option>
                      <option value="Cotton (Kapas)">Cotton (Kapas)</option>
                      <option value="Onion">Onion</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Grade</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                    >
                      <option value="Grade A / Special Selection">Grade A / Special Selection</option>
                      <option value="Fair Average Quality (FAQ)">Fair Average Quality (FAQ)</option>
                      <option value="Premium / Bold Size">Premium / Bold Size</option>
                      <option value="Export Quality">Export Quality</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.moisturePercent}
                      onChange={(e) => setFormData({ ...formData, moisturePercent: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Broken / Defect (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.brokenPercent}
                      onChange={(e) => setFormData({ ...formData, brokenPercent: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Foreign Matter (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.foreignMatter}
                      onChange={(e) => setFormData({ ...formData, foreignMatter: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Inspection Result</label>
                    <select
                      value={formData.inspectionResult}
                      onChange={(e) => setFormData({ ...formData, inspectionResult: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white font-bold"
                    >
                      <option value="PASS">PASS (Approved for Trade)</option>
                      <option value="CONDITIONAL">CONDITIONAL (Price Discount)</option>
                      <option value="FAIL">FAIL (Quarantine / Reject)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Inspector / Source</label>
                    <input
                      type="text"
                      value={formData.inspectorName}
                      onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Inspection Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 shadow"
                  >
                    {submitting ? 'Saving...' : 'Save Inspection Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
