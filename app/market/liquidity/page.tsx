'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShoppingBag,
  Users,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  DollarSign,
  AlertCircle,
  BarChart3
} from 'lucide-react'

interface CommodityLiquidity {
  commodityId: string
  commodityName: string
  category: string
  unit: string
  activeSupplyQuantity: number
  activeFarmersCount: number
  avgAskingPrice: number
  activeDemandQuantity: number
  activeBuyersCount: number
  avgTargetPrice: number
  demandSupplyRatio: number
  currentMandiPrice: number
  priceForecast30d: number | null
  opportunityLevel: 'HIGH' | 'MODERATE' | 'LOW'
  interpretation: string
}

export default function MarketLiquidityDashboard() {
  const [liquidityData, setLiquidityData] = useState<CommodityLiquidity[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadLiquidity() {
      setLoading(true)
      try {
        const res = await fetch('/api/market/liquidity')
        const data = await res.json()
        if (data.success) {
          setLiquidityData(data.liquidity || [])
        }
      } catch (err) {
        console.error('Failed to fetch liquidity data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLiquidity()
  }, [])

  const totalDemand = liquidityData.reduce((acc, c) => acc + c.activeDemandQuantity, 0)
  const totalSupply = liquidityData.reduce((acc, c) => acc + c.activeSupplyQuantity, 0)
  const aggregateRatio = totalSupply > 0 ? Number((totalDemand / totalSupply).toFixed(2)) : 1.0

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 pb-20">
      
      {/* Header */}
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
                  Market Liquidity & Demand/Supply Balance
                </h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Two-Sided Market
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live aggregation of active farmer harvest supply vs open buyer procurement requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/farmer/buyer-requests"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
            >
              Farmer Match Discovery
            </Link>
            <Link
              href="/buyer/demand"
              className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
            >
              Buyer Desk
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 1. KPI Overview Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Listed Farmer Supply</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalSupply.toLocaleString('en-IN')} Quintals
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Active harvest volume listed across farms</span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Buyer Demand</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {totalDemand.toLocaleString('en-IN')} Quintals
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Verified agro-processor procurement orders</span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Market Liquidity Ratio (D/S)</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {aggregateRatio}x
            </div>
            <span className="text-xs text-emerald-600 font-bold mt-1 block">
              {aggregateRatio >= 1.0 ? 'Demand Exceeds Supply (Seller Advantage)' : 'Balanced Market Liquidity'}
            </span>
          </div>
        </section>

        {/* 2. Commodity Liquidity Table */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <span>Commodity Market Balance & Opportunity Scoring</span>
            </h2>
            <p className="text-xs text-slate-500">
              Compare actual listed supply with active buyer requests, average price spreads, and economic opportunity ratings
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs text-slate-400">Aggregating two-sided market liquidity...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Commodity</th>
                    <th className="py-3 px-3 text-right">Active Supply</th>
                    <th className="py-3 px-3 text-right">Buyer Demand</th>
                    <th className="py-3 px-3 text-center">D / S Ratio</th>
                    <th className="py-3 px-3 text-right">Target vs Asking</th>
                    <th className="py-3 px-3 text-center">Opportunity</th>
                    <th className="py-3 px-3">Market Interpretation</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {liquidityData.map((c) => (
                    <tr key={c.commodityId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{c.commodityName}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{c.category}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">{c.activeSupplyQuantity} {c.unit}</div>
                        <div className="text-[10px] text-slate-400">{c.activeFarmersCount} farmers</div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">{c.activeDemandQuantity} {c.unit}</div>
                        <div className="text-[10px] text-slate-400">{c.activeBuyersCount} buyers</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                          c.demandSupplyRatio >= 1.25
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.demandSupplyRatio >= 0.8
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {c.demandSupplyRatio}x
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Buyer: ₹{c.avgTargetPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ask: ₹{c.avgAskingPrice.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          c.opportunityLevel === 'HIGH'
                            ? 'bg-emerald-600 text-white'
                            : c.opportunityLevel === 'MODERATE'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          {c.opportunityLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        {c.interpretation}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Link
                          href={`/farmer/buyer-requests?commodity_id=${c.commodityId}`}
                          className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-[11px] font-bold transition inline-block whitespace-nowrap"
                        >
                          Find Buyers
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
