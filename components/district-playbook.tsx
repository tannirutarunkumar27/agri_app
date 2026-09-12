'use client'

import { useState } from 'react'
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  Store,
  Building2,
  Mic,
  Database,
  ArrowRight,
  Target,
  BarChart3,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DistrictPlaybook() {
  const [selectedPhase, setSelectedPhase] = useState<number>(3) // Phase 3 (M4-5) is active

  const phases = [
    {
      id: 1,
      phaseName: 'M1–2',
      title: 'Pre-Launch',
      status: 'completed',
      date: 'Jan – Feb 2026',
      desc: 'District & retailer selection, warehouse and NBFC MOUs, ground agronomist team hired.',
      deliverables: [
        'Nashik District selected as anchor geography (Largest onion cluster)',
        'Signed MOUs with Central Warehousing Corp (CWC) & 2 private cold storages',
        'NBFC credit line partnership secured at 7% subsidized AIF rate',
        'Ground team of 3 field agronomists deployed in Niphad & Kalwan blocks'
      ]
    },
    {
      id: 2,
      phaseName: 'M3',
      title: 'Soft Launch',
      status: 'completed',
      date: 'Mar 2026',
      desc: '300 farmers onboarded through 10 retailers; free Voice AI + price trials.',
      deliverables: [
        '342 farmers onboarded (Target: 300) via 12 partner input dealers',
        'Ask-Agro Voice AI WhatsApp bots activated in Marathi & Hindi',
        'Free Mandi price trend trials delivered to all onboarded farmers',
        'Initial soil & crop health baseline logged for all 342 farms'
      ]
    },
    {
      id: 3,
      phaseName: 'M4–5',
      title: 'First Harvest',
      status: 'active',
      date: 'Apr – May 2026 (CURRENT)',
      desc: 'Post-harvest guidance delivered; prediction accuracy tracked against real Mandi prices.',
      deliverables: [
        'Real-time prediction accuracy tracked against Lasalgaon & Pimpalgaon Mandis (94.2% accuracy)',
        'Drying & curing advisory prevented early rotting across 1,200 metric tonnes',
        'Farmers given quantified "Hold 20 Days for +₹420/Qtl" alerts',
        'Zero farmers suffered distress selling during first week market glut'
      ]
    },
    {
      id: 4,
      phaseName: 'M6',
      title: 'First Paid Conversion',
      status: 'upcoming',
      date: 'Jun 2026',
      desc: 'Premium subscriptions and first warehouse-backed loans go live.',
      deliverables: [
        'e-NWR 75% pledge loan disbursals initiated with Bank of India partner desk',
        '₹499/season premium subscriptions billed post-harvest upon realized profits',
        'Input retailers receive first digital commission payouts',
        '100% of loans collateralized with WDRA accredited receipts'
      ]
    },
    {
      id: 5,
      phaseName: 'M7–12',
      title: 'Scale in District',
      status: 'upcoming',
      date: 'Jul – Dec 2026',
      desc: 'Retailers expand to 30; farmer base grows to ~2,500; word-of-mouth lowers CAC.',
      deliverables: [
        'Expand retailer network from 12 to 30 key Kendras across all 5 talukas',
        'Farmer base grows to 2,500 active growers through neighbor referrals',
        'CAC drops from ₹350 to ₹210 due to high organic word-of-mouth',
        'Cumulative warehouse loans exceed ₹2.5 Crore'
      ]
    },
    {
      id: 6,
      phaseName: 'Year 2',
      title: 'District Replication',
      status: 'upcoming',
      date: '2027',
      desc: 'Same playbook, new crop, in 4–5 districts — timeline shortens each time.',
      deliverables: [
        'Replicate playbook in Pune (Tomato), Jalgaon (Banana), and Akola (Cotton)',
        'Playbook deployment timeline compresses from 6 months to 60 days',
        'Cross-district trade logistics & mill procurement connections'
      ]
    }
  ]

  const moats = [
    {
      title: 'Proprietary Hyper-Local Data',
      icon: Database,
      badge: 'Data Moat',
      desc: 'We collect soil, yield, micro-climate, and spray history directly from ground pilot farms. This dataset is completely un-scrapeable and cannot be replicated by generic LLMs.'
    },
    {
      title: 'Trusted Retailer Network',
      icon: Store,
      badge: 'Channel Moat',
      desc: 'Instead of fighting the local dealer, we turn them into a digital financial agent. Dealers protect our distribution, sign off on prescriptions, and drive viral farmer adoption.'
    },
    {
      title: 'Warehouse & NBFC Integrations',
      icon: Building2,
      badge: 'Fintech Moat',
      desc: 'Direct electronic integration with WDRA partner warehouses and institutional credit lines at 7% subsidized rates creates a frictionless collateral liquidity bridge.'
    },
    {
      title: 'Voice-First Design for All Users',
      icon: Mic,
      badge: 'UX Moat',
      desc: 'Dialect-aware WhatsApp voice notes in Marathi, Hindi, and regional tongues break the literacy barrier, ensuring 100% usability without complex app learning curves.'
    }
  ]

  const activePhaseData = phases[selectedPhase - 1]

  return (
    <div className="space-y-8">
      {/* Playbook Header */}
      <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-slate-950">
                GO-TO-MARKET · THE 1-DISTRICT PLAYBOOK
              </span>
              <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-200">
                Anchor Pilot: Nashik District, MH
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Start Deep, Not Wide</h2>
            <p className="mt-1 max-w-2xl text-xs text-emerald-200">
              "We win one district, one crop, one retailer network at a time — then replicate the playbook." We build the data moat where others burn capital.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-700 bg-emerald-950/70 p-4 text-right">
            <p className="text-xs text-emerald-300">Pilot Crop & Geometry</p>
            <p className="text-lg font-black text-white">Onion & Tomato</p>
            <p className="text-xs text-lime-400">Lasalgaon & Pimpalgaon Mandi Clustered</p>
          </div>
        </div>

        {/* Live Pilot Metrics Tracker */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-700/80 bg-emerald-900/50 p-4">
            <span className="text-[11px] font-bold uppercase text-emerald-300">Onboarded Farmers</span>
            <p className="mt-1 text-2xl font-black text-white">342 / 300</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-lime-400">114% of Soft Launch Target</span>
          </div>

          <div className="rounded-2xl border border-emerald-700/80 bg-emerald-900/50 p-4">
            <span className="text-[11px] font-bold uppercase text-emerald-300">Armed Input Retailers</span>
            <p className="mt-1 text-2xl font-black text-white">12 Dealers</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-lime-400">100% Prescription Validation</span>
          </div>

          <div className="rounded-2xl border border-emerald-700/80 bg-emerald-900/50 p-4">
            <span className="text-[11px] font-bold uppercase text-emerald-300">Price Prediction Accuracy</span>
            <p className="mt-1 text-2xl font-black text-lime-400">94.2%</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-200">Tracked vs Lasalgaon Mandi</span>
          </div>

          <div className="rounded-2xl border border-emerald-700/80 bg-emerald-900/50 p-4">
            <span className="text-[11px] font-bold uppercase text-emerald-300">Pledge Loans Disbursed</span>
            <p className="mt-1 text-2xl font-black text-white">₹18,50,000</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-200">Zero distress sales logged</span>
          </div>
        </div>
      </div>

      {/* 6-Phase Roadmap Timeline (Slide 4) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          The 6-Phase Execution Roadmap (Slide 4)
        </h3>
        <p className="text-xs text-slate-500">
          Click any phase below to inspect operational milestones and deliverables.
        </p>

        {/* Phase Stepper Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {phases.map((p) => {
            const isSelected = selectedPhase === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPhase(p.id)}
                className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40'
                    : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
                      p.status === 'completed'
                        ? 'bg-emerald-700 text-white'
                        : p.status === 'active'
                        ? 'bg-lime-400 text-slate-950 ring-4 ring-lime-100'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {p.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : p.phaseName}
                  </div>
                </div>

                <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{p.title}</p>
                <span
                  className={`mt-1 inline-block text-[10px] font-extrabold uppercase ${
                    p.status === 'completed'
                      ? 'text-emerald-700'
                      : p.status === 'active'
                      ? 'text-lime-700 dark:text-lime-400'
                      : 'text-slate-400'
                  }`}
                >
                  {p.status === 'active' ? 'Active Now' : p.status}
                </span>
              </div>
            )
          })}
        </div>

        {/* Selected Phase Detail Card */}
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-4 dark:border-slate-700">
            <div>
              <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                PHASE {activePhaseData.phaseName} · {activePhaseData.date}
              </span>
              <h4 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {activePhaseData.title}: {activePhaseData.desc}
              </h4>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                activePhaseData.status === 'completed'
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                  : activePhaseData.status === 'active'
                  ? 'bg-lime-300 text-slate-950'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {activePhaseData.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-slate-500">Key Execution Milestones</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {activePhaseData.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-2xs dark:bg-slate-900"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Defensible Moat Radar (Slide 4) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Our Defensible Moat: Why Competitors Cannot Replicate This
        </h3>
        <p className="text-xs text-slate-500">
          Four interconnected structural advantages built into the 1-district playbook.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {moats.map((m, idx) => {
            const Icon = m.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {m.badge}
                  </span>
                </div>
                <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{m.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{m.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unit Economics Banner (Slide 3) */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-900 p-6 text-white md:p-8">
        <span className="text-xs font-bold uppercase tracking-wider text-lime-300">
          BUSINESS MODEL · UNIT ECONOMICS (SLIDE 3)
        </span>
        <h3 className="mt-1 text-xl font-black md:text-2xl">We Earn Only When the Farmer Earns</h3>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-center">
            <p className="text-xs text-emerald-300">Extra Income / Farmer / Season</p>
            <p className="mt-1 text-2xl font-black text-lime-400 md:text-3xl">₹8K–15K</p>
            <p className="text-[10px] text-emerald-200">From market timing + savings</p>
          </div>

          <div className="rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-center">
            <p className="text-xs text-emerald-300">Our Revenue / Farmer / Season</p>
            <p className="mt-1 text-2xl font-black text-white md:text-3xl">₹400–800</p>
            <p className="text-[10px] text-emerald-200">Billed post-harvest or at loan</p>
          </div>

          <div className="rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-center">
            <p className="text-xs text-emerald-300">Customer Acquisition Cost</p>
            <p className="mt-1 text-2xl font-black text-white md:text-3xl">₹250–350</p>
            <p className="text-[10px] text-emerald-200">Via retailer-as-a-channel</p>
          </div>

          <div className="rounded-2xl border border-emerald-700 bg-emerald-950/60 p-4 text-center">
            <p className="text-xs text-emerald-300">LTV : CAC Ratio</p>
            <p className="mt-1 text-2xl font-black text-lime-400 md:text-3xl">5:1 – 9:1</p>
            <p className="text-[10px] text-emerald-200">Best-in-class venture returns</p>
          </div>
        </div>
      </div>
    </div>
  )
}
