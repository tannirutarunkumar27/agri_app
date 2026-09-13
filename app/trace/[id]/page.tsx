'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  QrCode, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Scale, 
  Sparkles,
  Lock
} from 'lucide-react'
import { TrustBadge } from '@/components/trust/TrustBadge'
import { ProduceQualityCard } from '@/components/trust/ProduceQualityCard'

interface TracePageProps {
  params: Promise<{ id: string }>
}

export default function PublicTracePage({ params }: TracePageProps) {
  const resolvedParams = use(params)
  const lotId = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrace() {
      try {
        setLoading(true)
        const res = await fetch(`/api/trust/trace/${encodeURIComponent(lotId)}`)
        const json = await res.json()
        if (json.success && json.provenance) {
          setData(json)
        } else {
          setError(json.error || 'Traceability record not found for this Lot ID')
        }
      } catch (err: any) {
        setError('Failed to fetch provenance record: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    loadTrace()
  }, [lotId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Verifying cryptographic digital lot record...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Lot Verification Record</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'This digital Lot ID does not exist or has not yet been registered for public traceability.'}
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Go to FarmDirect
          </Link>
        </div>
      </div>
    )
  }

  const prov = data.provenance

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              FD
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm tracking-tight">FarmDirect</span>
              <span className="text-[10px] text-emerald-700 block -mt-1 font-medium">Digital Trace & Provenance</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100/70 border border-emerald-200 rounded-full text-emerald-900 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Verified Authentic Lot
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Lot Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  LOT #{prov.lotId}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Grade {prov.quality.grade}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {prov.commodityName} {prov.variety ? `• ${prov.variety}` : ''}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {prov.originDistrict}, {prov.originState}
                </span>
                {prov.harvestDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Harvested: {new Date(prov.harvestDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* QR Code Card */}
            {data.qrCodeDataUrl && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center shrink-0 mx-auto sm:mx-0">
                <img src={data.qrCodeDataUrl} alt="Lot QR Code" className="w-28 h-28 mx-auto" />
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Scan for Verified Origin</span>
              </div>
            )}
          </div>

          {/* Producer Trust Standing */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {prov.producer.displayName.slice(0, 1)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{prov.producer.displayName}</div>
                <div className="text-[11px] text-slate-500">Verified Direct Agricultural Producer</div>
              </div>
            </div>

            <TrustBadge
              level={prov.producer.verificationLevel}
              score={prov.producer.trustScore}
              size="sm"
            />
          </div>
        </div>

        {/* Quality & Weighbridge Inspection Card */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verified Quality & Weighbridge Parameters
          </h2>
          <ProduceQualityCard
            commodity={prov.commodityName}
            variety={prov.variety}
            grade={prov.quality.grade}
            inspectionSource={prov.quality.inspectionSource}
            moisturePercentage={prov.quality.moisturePercentage}
            defectPercentage={prov.quality.defectPercentage}
            foreignMatterPercentage={prov.quality.foreignMatterPercentage}
            sizeUniformity={prov.quality.sizeUniformity}
            weighbridgeNetKg={prov.quality.weighbridgeNetKg}
            weighbridgeStationName={prov.quality.weighbridgeStationName}
            weighedAt={prov.quality.weighedAt}
            inspectionImages={prov.quality.inspectionImages}
          />
        </div>

        {/* Provenance Milestones Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Lifecycle & Provenance Chain
          </h2>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
            {prov.milestones.map((ms: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{ms.title}</span>
                    <span className="text-[10px] text-slate-400">{new Date(ms.date).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{ms.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Redaction Invariant Guarantee Notice */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-600 flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700">Privacy & Cryptographic Invariant:</span> Private contact phone numbers, financial payment sums, and sensitive household identities are strictly redacted on public provenance pages to protect farmer privacy under FarmDirect trust policies.
          </div>
        </div>
      </main>
    </div>
  )
}
