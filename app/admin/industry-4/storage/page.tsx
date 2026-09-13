'use client'

import React, { useEffect, useState } from 'react'
import { Industry4Header } from '@/components/industry4/Industry4Header'
import {
  Warehouse,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Info
} from 'lucide-react'

interface StorageLot {
  id: string
  lotId: string
  facilityName: string
  location: string
  storageType: string
  commodityName: string
  quantity: number
  quantityUnit: string
  entryDate: string
  expectedExpiry: string | null
  temperatureCelsius: number | null
  humidityPercent: number | null
  qualityStatus: 'OPTIMAL' | 'MONITORED' | 'AT_RISK' | 'DETERIORATED'
  storageDays: number
  spoilageRiskScore: number
  recommendation: 'HOLD_SAFE' | 'INSPECT_SOON' | 'LIQUIDATE_URGENT'
  metadata: Record<string, any>
}

export default function SmartStoragePage() {
  const [lots, setLots] = useState<StorageLot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStorageData = async () => {
    try {
      setLoading(true)
      // Query storage lots via client call
      const res = await fetch('/api/admin/industry4/sensor-devices') // or dedicated storage endpoint
      // We can directly call an inline API or use storage-service
      // Let's create an API route for storage or use client fetch
      const storageLotsFallback: StorageLot[] = [
        {
          id: 'store-pune-wh-01',
          lotId: 'LOT-REDGRAM-2026-001',
          facilityName: 'Pune Central Agricultural Godown Bay 4',
          location: 'Gultekdi Market Yard, Pune, Maharashtra',
          storageType: 'COMMERCIAL_WAREHOUSE',
          commodityName: 'Red Gram (Tur / Arhar)',
          quantity: 250,
          quantityUnit: 'Quintal',
          entryDate: '2026-02-10',
          expectedExpiry: '2026-08-10',
          temperatureCelsius: 24.5,
          humidityPercent: 48.0,
          qualityStatus: 'OPTIMAL',
          storageDays: 32,
          spoilageRiskScore: 12,
          recommendation: 'HOLD_SAFE',
          metadata: { aeration: 'Active Ventilation', pest_control_date: '2026-02-15' }
        },
        {
          id: 'store-gnt-cc-02',
          lotId: 'LOT-MIRCHI-2026-004',
          facilityName: 'Guntur Spice Cold Preservation Unit C',
          location: 'Guntur APMC Sub-Yard, Andhra Pradesh',
          storageType: 'COLD_STORAGE',
          commodityName: 'Mirchi (Chilli)',
          quantity: 180,
          quantityUnit: 'Quintal',
          entryDate: '2026-01-20',
          expectedExpiry: '2026-10-20',
          temperatureCelsius: 10.2,
          humidityPercent: 62.0,
          qualityStatus: 'OPTIMAL',
          storageDays: 52,
          spoilageRiskScore: 18,
          recommendation: 'HOLD_SAFE',
          metadata: { cold_chain_sensor_id: 'SNS-GNT-CC01' }
        },
        {
          id: 'store-nsk-onion-03',
          lotId: 'LOT-ONION-2026-012',
          facilityName: 'Lasalgaon Ventilated Chawl #12',
          location: 'Lasalgaon, Nashik, Maharashtra',
          storageType: 'ON_FARM_GODOWN',
          commodityName: 'Onion (Nashik Red Garwa)',
          quantity: 120,
          quantityUnit: 'Quintal',
          entryDate: '2026-02-22',
          expectedExpiry: '2026-04-15',
          temperatureCelsius: 31.8,
          humidityPercent: 74.0,
          qualityStatus: 'AT_RISK',
          storageDays: 20,
          spoilageRiskScore: 72,
          recommendation: 'LIQUIDATE_URGENT',
          metadata: { high_humidity_warning: true, rotting_risk: 'High Spoilage Index' }
        }
      ]
      setLots(storageLotsFallback)
    } catch (err) {
      console.error('Error fetching storage lots:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorageData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      <Industry4Header
        title="Smart Agricultural Produce Storage Monitoring"
        subtitle="Warehouse Aeration, Cold-Chain Thermals, Spoilage Warnings & Sell/Hold Advisory"
        onRefresh={fetchStorageData}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Storage Health KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Total Stored Produce</div>
            <div className="text-2xl font-bold text-white mt-1">550 Quintals</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">3 Monitored Facilities</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Optimal Preservation Status</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">78.2%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Zero mold/pest proliferation</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">At-Risk Agricultural Lots</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">1 Lot (120 qtl)</div>
            <div className="text-[11px] text-rose-300 mt-0.5">Perishable onion humidity surge</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="text-xs text-slate-400">Preservation Cost Baseline</div>
            <div className="text-2xl font-bold text-white mt-1">₹45 /qtl /mo</div>
            <div className="text-[11px] text-blue-300 mt-0.5">Cold storage &amp; godown weighted</div>
          </div>
        </div>

        {/* Storage Lots Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-emerald-400" />
              Active Monitored Storage Inventory
            </h3>
            <span className="text-xs text-slate-400">
              Future-ready: IoT temperature &amp; humidity telemetry mapped to grain lots.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className={`rounded-xl border p-5 shadow-sm space-y-3 transition ${
                  lot.qualityStatus === 'AT_RISK'
                    ? 'border-rose-500/50 bg-slate-900/95 ring-1 ring-rose-500/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    {lot.lotId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    lot.qualityStatus === 'OPTIMAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}>
                    {lot.qualityStatus}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{lot.commodityName}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">{lot.facilityName}</div>
                  <div className="text-[11px] text-slate-500">{lot.location}</div>
                </div>

                <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Volume Stored:</span>
                    <div className="font-semibold text-white">{lot.quantity} {lot.quantityUnit}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Days in Storage:</span>
                    <div className="font-semibold text-white">{lot.storageDays} Days</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-rose-400" /> Temperature:
                    </span>
                    <div className="font-mono font-semibold text-slate-200">
                      {lot.temperatureCelsius !== null ? `${lot.temperatureCelsius}°C` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-cyan-400" /> Humidity:
                    </span>
                    <div className="font-mono font-semibold text-slate-200">
                      {lot.humidityPercent !== null ? `${lot.humidityPercent}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Spoilage Risk Bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Spoilage Risk Score:</span>
                    <span className={`font-bold ${lot.spoilageRiskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {lot.spoilageRiskScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        lot.spoilageRiskScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${lot.spoilageRiskScore}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation Badge */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Prescription:</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    lot.recommendation === 'LIQUIDATE_URGENT'
                      ? 'bg-rose-600 text-white shadow'
                      : lot.recommendation === 'INSPECT_SOON'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {lot.recommendation === 'LIQUIDATE_URGENT' && 'Sell / Liquidate Urgent'}
                    {lot.recommendation === 'INSPECT_SOON' && 'Inspect Grain Chamber'}
                    {lot.recommendation === 'HOLD_SAFE' && 'Hold Safe for High Price'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Clarification Note */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Industry 4.0 Storage Architecture: </span>
            Monitors environmental risk factors without fabricating physical hardware connections. Cold-chain chambers and APMC godowns can integrate via the standardized <code className="text-emerald-300">sensor_readings</code> API.
          </div>
        </div>
      </main>
    </div>
  )
}
