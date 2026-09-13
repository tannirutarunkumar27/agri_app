'use client'

import React from 'react'
import Link from 'next/navigation'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Warehouse,
  Award,
  Database,
  FileText,
  Radio,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Scale
} from 'lucide-react'

interface HeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function Industry4Header({
  title = 'Industry 4.0 Operations & Intelligence Command Center',
  subtitle = 'Autonomous Monitoring, Digital Lot Traceability, Real-Time Mandi KPIs & Decision Support',
  onRefresh,
  isRefreshing = false
}: HeaderProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/admin/industry-4', label: 'Command Center', icon: Activity },
    { href: '/admin/verification', label: 'Verifications', icon: ShieldCheck },
    { href: '/admin/disputes', label: 'Dispute Tribunal', icon: Scale },
    { href: '/admin/alerts', label: 'Alert Center', icon: AlertTriangle },
    { href: '/admin/industry-4/traceability', label: 'Traceability', icon: Layers },
    { href: '/admin/industry-4/quality', label: 'Quality Control', icon: CheckCircle2 },
    { href: '/admin/industry-4/storage', label: 'Smart Storage', icon: Warehouse },
    { href: '/admin/industry-4/maturity', label: 'Maturity Scorecard', icon: Award },
    { href: '/admin/industry-4/data-quality', label: 'Data Governance', icon: Database },
    { href: '/admin/industry-4/reports', label: 'Reports', icon: FileText },
    { href: '/admin/industry-4/sensors', label: 'IoT Devices', icon: Radio },
  ]

  return (
    <header className="border-b border-emerald-900/40 bg-slate-950 text-white shadow-xl">
      {/* Top Banner */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <NextLink
                href="/admin/market"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Market Admin
              </NextLink>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Industry 4.0 Active
              </span>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-300 border border-blue-500/30">
                Maturity Level 3
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                {isRefreshing ? 'Syncing...' : 'Sync Telemetry'}
              </button>
            )}
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-right text-xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">System Time (IST)</div>
              <div className="font-mono font-medium text-emerald-400">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/90 overflow-x-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 text-xs font-medium min-w-max">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </NextLink>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
