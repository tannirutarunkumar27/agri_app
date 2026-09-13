'use client'

import React from 'react'
import { CheckCircle, AlertTriangle, Scale, Droplet, FileText, Camera, ShieldCheck, Truck } from 'lucide-react'

export interface ProduceQualityCardProps {
  commodity: string
  variety?: string
  grade: string
  inspectionSource: string
  moisturePercentage?: number
  defectPercentage?: number
  foreignMatterPercentage?: number
  sizeUniformity?: string
  declaredQuantityKg?: number
  confirmedQuantityKg?: number
  deliveredQuantityKg?: number
  weighbridgeNetKg?: number
  weighbridgeStationName?: string
  weighbridgeSlipNumber?: string
  weighedAt?: string
  labReportUrl?: string
  inspectionImages?: string[]
  notes?: string
}

export function ProduceQualityCard({
  commodity,
  variety,
  grade,
  inspectionSource,
  moisturePercentage,
  defectPercentage,
  foreignMatterPercentage,
  sizeUniformity,
  declaredQuantityKg,
  confirmedQuantityKg,
  deliveredQuantityKg,
  weighbridgeNetKg,
  weighbridgeStationName,
  weighbridgeSlipNumber,
  weighedAt,
  labReportUrl,
  inspectionImages = [],
  notes
}: ProduceQualityCardProps) {
  // Source badge styling
  let sourceBadge = 'bg-slate-100 text-slate-700 border-slate-200'
  let sourceLabel = 'Self-Declared'
  if (inspectionSource === 'PLATFORM_VERIFIED') {
    sourceBadge = 'bg-emerald-50 text-emerald-800 border-emerald-300'
    sourceLabel = 'Platform Verified'
  } else if (inspectionSource === 'BUYER_VERIFIED') {
    sourceBadge = 'bg-blue-50 text-blue-800 border-blue-300'
    sourceLabel = 'Buyer Verified'
  } else if (inspectionSource === 'THIRD_PARTY_VERIFIED') {
    sourceBadge = 'bg-purple-50 text-purple-800 border-purple-300'
    sourceLabel = '3rd Party Lab Certified'
  }

  // Grade color
  let gradeColor = 'bg-emerald-600 text-white'
  if (grade === 'B') gradeColor = 'bg-blue-600 text-white'
  else if (grade === 'C') gradeColor = 'bg-amber-500 text-white'
  else if (grade === 'REJECT') gradeColor = 'bg-rose-600 text-white'

  // Quantity variance check
  let variancePct = 0
  let isVarianceAlert = false
  if (declaredQuantityKg && deliveredQuantityKg && declaredQuantityKg > 0) {
    variancePct = Number((((deliveredQuantityKg - declaredQuantityKg) / declaredQuantityKg) * 100).toFixed(1))
    if (Math.abs(variancePct) > 5) {
      isVarianceAlert = true
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${gradeColor} font-black text-lg flex items-center justify-center shadow-xs`}>
            {grade}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {commodity} {variety ? `• ${variety}` : ''}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${sourceBadge}`}>
                <ShieldCheck className="w-3 h-3" />
                {sourceLabel}
              </span>
              <span className="text-xs text-slate-500">Grade {grade} Specification</span>
            </div>
          </div>
        </div>

        {labReportUrl && (
          <a
            href={labReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            <FileText className="w-3.5 h-3.5" />
            Lab Certificate
          </a>
        )}
      </div>

      {/* Grid of Key Quality Parameters */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" /> Moisture
            </span>
            <div className="text-base font-bold text-slate-800 mt-1">
              {moisturePercentage !== undefined ? `${moisturePercentage}%` : 'Standard'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Defect / Damage
            </span>
            <div className="text-base font-bold text-slate-800 mt-1">
              {defectPercentage !== undefined ? `${defectPercentage}%` : '≤ 2.0%'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Foreign Matter</span>
            <div className="text-base font-bold text-slate-800 mt-1">
              {foreignMatterPercentage !== undefined ? `${foreignMatterPercentage}%` : '≤ 1.0%'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Uniformity</span>
            <div className="text-base font-bold text-slate-800 mt-1">
              {sizeUniformity || 'Consistent'}
            </div>
          </div>
        </div>

        {/* Quantity Verification & Weighbridge Section */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-700" /> Quantity Reconciliation
            </span>
            {weighbridgeStationName && (
              <span className="text-xs text-emerald-700 font-medium">
                Station: {weighbridgeStationName} (Slip #{weighbridgeSlipNumber || 'N/A'})
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <div className="text-xs text-slate-500">Declared Volume</div>
              <div className="text-sm font-bold text-slate-800">{declaredQuantityKg || '--'} kg</div>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <div className="text-xs text-slate-500">Weighbridge Net</div>
              <div className="text-sm font-bold text-emerald-800">
                {weighbridgeNetKg || confirmedQuantityKg || '--'} kg
              </div>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
              <div className="text-xs text-slate-500">Delivered Volume</div>
              <div className="text-sm font-bold text-slate-800">{deliveredQuantityKg || '--'} kg</div>
            </div>
          </div>

          {isVarianceAlert && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/80 text-amber-900 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Transit Variance Alert: {variancePct > 0 ? `+${variancePct}` : variancePct}% discrepancy recorded between declared and delivered weight.
              </span>
            </div>
          )}
        </div>

        {/* Inspection Images Gallery */}
        {inspectionImages.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Camera className="w-3.5 h-3.5" /> Inspection Records ({inspectionImages.length})
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {inspectionImages.map((img, idx) => (
                <a
                  key={idx}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90"
                >
                  <img src={img} alt="Quality Inspection" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {notes && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">Inspector Remarks:</span> {notes}
          </p>
        )}
      </div>
    </div>
  )
}
