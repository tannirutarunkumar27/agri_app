'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Truck, 
  FileCheck, 
  Scale, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Lock
} from 'lucide-react'

export default function AdminHubPage() {
  const [metrics, setMetrics] = useState({
    activeDisputes: 0,
    frozenEscrow: 0,
    pendingVerifications: 0,
    totalVerifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [dispRes, verifRes] = await Promise.all([
          fetch('/api/admin/disputes'),
          fetch('/api/admin/verification?limit=1')
        ])
        
        if (dispRes.ok) {
          const dJson = await dispRes.json()
          if (dJson.success && dJson.metrics) {
            setMetrics(prev => ({
              ...prev,
              activeDisputes: dJson.metrics.activeDisputes || 0,
              frozenEscrow: dJson.metrics.totalFrozenEscrow || 0
            }))
          }
        }

        if (verifRes.ok) {
          const vJson = await verifRes.json()
          if (vJson.success && vJson.stats) {
            const pending = vJson.stats.find((s: any) => s.status === 'PENDING')?.count || 0
            const total = vJson.stats.reduce((acc: number, s: any) => acc + parseInt(s.count || '0', 10), 0)
            setMetrics(prev => ({
              ...prev,
              pendingVerifications: parseInt(pending, 10),
              totalVerifications: total
            }))
          }
        }
      } catch (err) {
        console.error('Admin stats error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-sans">
      {/* Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 text-white shadow sticky top-0 z-30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/20 text-rose-400 px-2.5 py-0.5 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                System Administration
              </span>
              <span className="text-xs text-slate-400">Enterprise Operations Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              FarmDirect Central Control Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 shadow transition"
            >
              Public Platform
            </Link>
            <Link
              href="/farmer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/60 hover:bg-emerald-900/80 px-3.5 py-2 text-xs font-medium text-emerald-300 shadow transition"
            >
              Farmer View
            </Link>
            <Link
              href="/buyer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-800/60 bg-blue-950/60 hover:bg-blue-900/80 px-3.5 py-2 text-xs font-medium text-blue-300 shadow transition"
            >
              Buyer View
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI Overview Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-rose-900/40 bg-slate-900/70 p-5 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Active Disputes</span>
              <Scale className="h-5 w-5 text-rose-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              {loading ? '...' : metrics.activeDisputes}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Escrow arbitrations requiring mediation
            </p>
          </div>

          <div className="rounded-2xl border border-amber-900/40 bg-slate-900/70 p-5 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Frozen Escrow</span>
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-amber-300 font-mono">
              ₹{loading ? '...' : metrics.frozenEscrow.toLocaleString('en-IN')}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Contested payments safeguarded
            </p>
          </div>

          <div className="rounded-2xl border border-blue-900/40 bg-slate-900/70 p-5 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Pending KYC</span>
              <FileCheck className="h-5 w-5 text-blue-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              {loading ? '...' : metrics.pendingVerifications}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Awaiting admin document scrutiny
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-slate-900/70 p-5 shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Trust Network</span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-400">
              {loading ? '...' : metrics.totalVerifications}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Enrolled farmer &amp; trader entities
            </p>
          </div>
        </section>

        {/* Administration Modules Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Core Governance &amp; Administration Consoles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1: Dispute Resolution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between hover:border-rose-500/50 transition duration-200">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Dispute &amp; Risk Mediation</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Arbitrate quality mismatch, weight loss, and in-transit delivery claims. Safeguard escrow, examine photographic evidence, and issue legally compliant binding resolutions.
                  </p>
                </div>
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SLA Enforcement</span>
                    <span className="text-rose-400 font-semibold">48h Binding Turnaround</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Risk Rule Engine</span>
                    <span className="text-slate-200 font-mono">10 Automated Rules</span>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/disputes"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 px-4 text-xs font-bold text-white transition shadow"
              >
                Open Dispute Console <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Module 2: Entity Verification & KYC */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between hover:border-blue-500/50 transition duration-200">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Entity KYC &amp; Verification</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Verify farmer 7/12 land records, FPO registration papers, corporate buyer GSTIN, and APMC commission agent trading licenses to establish Trust Badges.
                  </p>
                </div>
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trust Scores</span>
                    <span className="text-blue-400 font-semibold">0 - 100 Dynamic Algorithmic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tiers</span>
                    <span className="text-slate-200">Basic &rarr; Verified &rarr; Premium</span>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/verification"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-4 text-xs font-bold text-white transition shadow"
              >
                Review Verification Queue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Module 3: Industry 4.0 Traceability */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition duration-200">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Industry 4.0 Lot Traceability</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Inspect immutable lot provenance logs, farm-gate harvest timestamps, telematics checkpoints, and cryptographically signed QR code digital passports.
                  </p>
                </div>
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Provenance Method</span>
                    <span className="text-emerald-400 font-semibold">SHA-256 Checksums</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Public Verifier</span>
                    <span className="text-slate-200 font-mono">/trace/[id]</span>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/industry-4/traceability"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-bold text-white transition shadow"
              >
                Audit Digital Traceability <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Operations Links */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Platform Operational Shortcuts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Link
              href="/market"
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition block text-slate-300 hover:text-white"
            >
              <div className="font-semibold text-emerald-400">APMC Mandi Index</div>
              <div className="text-[11px] text-slate-500 mt-1">Modal prices &amp; price trends</div>
            </Link>
            <Link
              href="/marketplace"
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition block text-slate-300 hover:text-white"
            >
              <div className="font-semibold text-blue-400">Active Listings</div>
              <div className="text-[11px] text-slate-500 mt-1">Farmer produce listings</div>
            </Link>
            <Link
              href="/transporter/dashboard"
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition block text-slate-300 hover:text-white"
            >
              <div className="font-semibold text-purple-400">Logistics Fleet</div>
              <div className="text-[11px] text-slate-500 mt-1">Delivery bids &amp; vehicles</div>
            </Link>
            <Link
              href="/trace/LOT-RICE-20260309"
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition block text-slate-300 hover:text-white"
            >
              <div className="font-semibold text-amber-400">Sample Provenance</div>
              <div className="text-[11px] text-slate-500 mt-1">Public digital lot verifier</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
