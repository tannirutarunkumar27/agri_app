'use client'

import React, { useState } from 'react'
import { ShieldCheck, ShieldAlert, CheckCircle2, PhoneCall, Info, Award, AlertTriangle, ExternalLink } from 'lucide-react'

interface TrustFactor {
  category: string
  points: number
  maxPoints: number
  description: string
  status: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
}

interface TrustBadgeProps {
  level?: string
  score?: number
  breakdown?: {
    totalScore: number
    explanation: TrustFactor[]
  }
  showScore?: boolean
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TrustBadge({
  level = 'UNVERIFIED',
  score = 50,
  breakdown,
  showScore = true,
  interactive = true,
  size = 'md'
}: TrustBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const normalizedLevel = (level || 'UNVERIFIED').toUpperCase()

  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300'
  let label = 'Unverified'
  let Icon = ShieldAlert

  if (normalizedLevel === 'FULLY_VERIFIED') {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300'
    label = 'Fully Verified'
    Icon = ShieldCheck
  } else if (normalizedLevel.includes('BUSINESS') || normalizedLevel.includes('BASIC') || normalizedLevel.includes('VEHICLE')) {
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-300'
    label = normalizedLevel.replace('_', ' ')
    Icon = CheckCircle2
  } else if (normalizedLevel.includes('DOCUMENT')) {
    badgeColor = 'bg-cyan-50 text-cyan-800 border-cyan-300'
    label = 'Docs Verified'
    Icon = CheckCircle2
  } else if (normalizedLevel.includes('PHONE')) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300'
    label = 'Phone Verified'
    Icon = PhoneCall
  }

  // Score color ring
  let scoreBadge = 'bg-slate-100 text-slate-800'
  if (score >= 80) scoreBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300'
  else if (score >= 60) scoreBadge = 'bg-blue-100 text-blue-900 border-blue-300'
  else if (score >= 40) scoreBadge = 'bg-amber-100 text-amber-900 border-amber-300'
  else scoreBadge = 'bg-rose-100 text-rose-900 border-rose-300'

  const sizeClass = size === 'sm' ? 'text-xs py-0.5 px-2' : size === 'lg' ? 'text-sm py-1.5 px-3' : 'text-xs py-1 px-2.5'

  return (
    <div className="relative inline-flex items-center gap-1.5 font-medium">
      {/* Verification Level Pill */}
      <span
        onClick={() => interactive && setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-all ${badgeColor} ${sizeClass} ${interactive ? 'cursor-pointer hover:shadow-md' : ''}`}
        title="Click to inspect trust verification credentials"
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{label}</span>
        {interactive && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </span>

      {/* Trust Score Pill */}
      {showScore && (
        <span
          onClick={() => interactive && setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1 rounded-full border font-semibold ${scoreBadge} ${sizeClass} ${interactive ? 'cursor-pointer hover:scale-105' : ''}`}
          title="Verified FarmDirect Trust Score (0-100)"
        >
          <Award className="w-3 h-3" />
          <span>{score}/100</span>
        </span>
      )}

      {/* Detailed Transparent "Why?" Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Trust & Verification Standing</h3>
                  <p className="text-xs text-slate-500">Transparent & explainable commercial rating</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Level Status</span>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">{label}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Composite Score</span>
                  <div className="text-lg font-black text-emerald-700">{score}<span className="text-xs text-slate-400 font-normal"> / 100</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score Factors ("Why?")</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {breakdown?.explanation && breakdown.explanation.length > 0 ? (
                    breakdown.explanation.map((factor, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-800">{factor.category}</div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{factor.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          factor.status === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' :
                          factor.status === 'NEGATIVE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {factor.points > 0 ? `+${factor.points}` : factor.points}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-3 text-center">
                      Verified based on identity credentials, order completion, and zero unresolved disputes.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
