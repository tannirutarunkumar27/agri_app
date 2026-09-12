'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Percent,
  Droplets,
  Building,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
  CircleDollarSign,
  Layers,
  Leaf,
  CheckCircle2,
  Share2,
  IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FarmerImpactCalculator() {
  const [acreage, setAcreage] = useState<number>(4)
  const [crop, setCrop] = useState<string>('onion')
  const [holdingDays, setHoldingDays] = useState<number>(25)

  // Baseline economic data per crop per acre
  const cropData: Record<
    string,
    {
      name: string
      yieldPerAcre: number // in quintals
      harvestPrice: number // ₹ per quintal (distress sale)
      peakPrice: number // ₹ per quintal (with market timing)
      inputCostPerAcre: number // ₹ on seeds, fertilizers, sprays
      waterPerSeasonM3: number
    }
  > = {
    onion: {
      name: 'Onion (Nashik Red)',
      yieldPerAcre: 25,
      harvestPrice: 2150,
      peakPrice: 2680,
      inputCostPerAcre: 18000,
      waterPerSeasonM3: 4500
    },
    tomato: {
      name: 'Tomato (Abhinav F1)',
      yieldPerAcre: 40,
      harvestPrice: 1200,
      peakPrice: 1550,
      inputCostPerAcre: 24000,
      waterPerSeasonM3: 5200
    },
    cotton: {
      name: 'Cotton (Bollgard II)',
      yieldPerAcre: 14,
      harvestPrice: 6200,
      peakPrice: 7100,
      inputCostPerAcre: 22000,
      waterPerSeasonM3: 6500
    },
    wheat: {
      name: 'Wheat (Sharbati)',
      yieldPerAcre: 18,
      harvestPrice: 2400,
      peakPrice: 2750,
      inputCostPerAcre: 12000,
      waterPerSeasonM3: 3800
    },
    soybean: {
      name: 'Soybean (JS-335)',
      yieldPerAcre: 12,
      harvestPrice: 4300,
      peakPrice: 4850,
      inputCostPerAcre: 11000,
      waterPerSeasonM3: 3200
    }
  }

  const selected = cropData[crop]
  const totalYield = acreage * selected.yieldPerAcre // quintals

  // 1. +8-15% Higher Selling Price (Timing the market instead of distress sale)
  const priceGainsPerQtl = selected.peakPrice - selected.harvestPrice
  const higherSellingPriceGain = Math.round(totalYield * priceGainsPerQtl * 0.85) // conservative 85% capture

  // 2. -10% Lower Input Waste (Precision AI dosage vs over-application)
  const totalInputCost = acreage * selected.inputCostPerAcre
  const inputSavings = Math.round(totalInputCost * 0.10)

  // 3. 15% -> 10% Less Post-Harvest Loss (Drying, curing, and warehouse storage saves 5% of total harvest)
  const savedProduceQuintals = Math.round(totalYield * 0.05)
  const postHarvestLossSavings = Math.round(savedProduceQuintals * selected.peakPrice)

  // 4. 48-72 hrs Faster Credit Access (Pledge loan at 7% vs village moneylender at 36% p.a.)
  const produceValuation = totalYield * selected.harvestPrice
  const pledgeLoanAmount = Math.round(produceValuation * 0.75) // 75% LTV
  const moneylenderInterestMonthly = (pledgeLoanAmount * 0.36) / 12 * 3 // 3 months
  const bankInterestMonthly = (pledgeLoanAmount * 0.07) / 12 * 3 // 3 months
  const creditSavings = Math.round(moneylenderInterestMonthly - bankInterestMonthly)

  // 5. +10-15% Better Crop Economics
  const cropEconomicsBonus = Math.round((higherSellingPriceGain + inputSavings) * 0.12)

  // Total Seasonal Net Extra Income
  const totalSeasonalGain =
    higherSellingPriceGain + inputSavings + postHarvestLossSavings + creditSavings

  // Ripple Effect Calculations
  const waterSavedLiters = Math.round(acreage * 35000) // Liters saved through scheduled irrigation
  const chemicalRunoffReducedKg = Math.round(acreage * 4.5) // kg of chemical active ingredients avoided
  const localCashRetained = totalSeasonalGain

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-lime-300">
              IMPACT · WHAT CHANGES FOR THE FARMER, PER SEASON
            </span>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Seasonal Transformation & ROI Calculator</h2>
            <p className="mt-1 max-w-2xl text-xs text-emerald-200">
              See the exact financial, agronomic, and ecological transformation for your land — replacing distress sales and guesswork with precision intelligence.
            </p>
          </div>

          <div className="rounded-2xl border border-lime-400/40 bg-emerald-950/70 p-4 text-center">
            <p className="text-xs font-semibold text-lime-300">Projected Extra Net Income / Season</p>
            <p className="mt-1 text-3xl font-black text-lime-400 md:text-4xl">
              +₹{totalSeasonalGain.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-200">₹{Math.round(totalSeasonalGain / acreage).toLocaleString('en-IN')} extra cash / acre</p>
          </div>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-700/60 bg-emerald-950/50 p-5 md:grid-cols-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-emerald-200">
              <span>Farm Size</span>
              <span className="text-lime-300">{acreage} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={acreage}
              onChange={(e) => setAcreage(Number(e.target.value))}
              className="mt-2 w-full accent-lime-400"
            />
            <div className="flex justify-between text-[10px] text-emerald-300">
              <span>1 Acre (Smallholder)</span>
              <span>10 Acres</span>
              <span>25 Acres (Commercial)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-emerald-200">Target Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="mt-2 w-full rounded-xl border border-emerald-700 bg-emerald-900 px-3 py-2 text-sm font-semibold text-white focus:outline-hidden"
            >
              <option value="onion">Onion (Nashik Red - 25 Qtl/Acre)</option>
              <option value="tomato">Tomato (Abhinav F1 - 40 Qtl/Acre)</option>
              <option value="cotton">Cotton (Bollgard II - 14 Qtl/Acre)</option>
              <option value="wheat">Wheat (Sharbati - 18 Qtl/Acre)</option>
              <option value="soybean">Soybean (JS-335 - 12 Qtl/Acre)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-emerald-200">
              <span>Warehouse Hold Window</span>
              <span className="text-lime-300">{holdingDays} Days</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={holdingDays}
              onChange={(e) => setHoldingDays(Number(e.target.value))}
              className="mt-2 w-full accent-lime-400"
            />
            <div className="flex justify-between text-[10px] text-emerald-300">
              <span>10 Days (Short spike)</span>
              <span>90 Days (Off-season)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Pitch Deck Transformation Pillars */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          The 5 Pillars of Farmer Value (Slide 2 Metrics)
        </h3>
        <p className="text-xs text-slate-500">
          Quantified metrics showing what changes across each step of the crop cycle.
        </p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Pillar 1: Higher Selling Price */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">+8–15%</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Higher Selling Price</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Timing the market instead of distress-selling at peak harvest influx.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Your Gain</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                +₹{higherSellingPriceGain.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400">{totalYield} Qtl @ +₹{priceGainsPerQtl}/Qtl</p>
            </div>
          </div>

          {/* Pillar 2: Lower Input Waste */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800 dark:bg-slate-800 dark:text-lime-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-lime-700 dark:text-lime-400">-10%</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Lower Input Waste</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                AI dosage guidance replaces over-application pushed by commission-hungry dealers.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Chemical Savings</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                +₹{inputSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400">Exact acreage bag dosage</p>
            </div>
          </div>

          {/* Pillar 3: Less Post-Harvest Loss */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-slate-800 dark:text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">15% → 10%</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Less Spoilage Loss</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Curing, drying, and cooling guidance plus WDRA accredited warehouse access.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Produce Saved</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                +₹{postHarvestLossSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400">{savedProduceQuintals} Quintals protected</p>
            </div>
          </div>

          {/* Pillar 4: Faster Credit Access */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">48–72 hrs</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Faster Credit Access</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Loan against stored produce at 7% p.a., avoiding 36% moneylender debt traps.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Interest Saved</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                +₹{creditSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400">7% Bank vs 36% Moneylender</p>
            </div>
          </div>

          {/* Pillar 5: Better Crop Economics */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800 dark:bg-slate-800 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">+10–15%</span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Better Crop Economics</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Hyper-local crop choice based on real soil data, water table, and forward demand.
              </p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs text-slate-400">Synergy Multiplier</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                +₹{cropEconomicsBonus.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400">Optimized rotation value</p>
            </div>
          </div>
        </div>
      </div>

      {/* THE RIPPLE EFFECT (Slide 2) */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 md:p-8">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          SYSTEMIC TRANSFORMATION
        </span>
        <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">The Ripple Effect</h3>
        <p className="text-xs text-slate-500">
          How solving distress sales and pesticide misuse transforms the entire rural ecosystem.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {/* Ripple 1: Retailer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <Building className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 dark:text-white">Input Retailer</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Extra income from commissions on digital inputs and loans — transforms from a shopkeeper into a trusted digital financial-services agent.
            </p>
          </div>

          {/* Ripple 2: Village Economy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800 dark:bg-slate-800 dark:text-lime-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 dark:text-white">Village Economy</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              More cash stays local as farmers sell better and spend locally on schooling, equipment, and livestock instead of servicing moneylender interest.
            </p>
          </div>

          {/* Ripple 3: Environment */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-slate-800 dark:text-teal-400">
              <Leaf className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 dark:text-white">Environment & Soil</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="font-bold text-emerald-700">{waterSavedLiters.toLocaleString()} Liters</span> of groundwater saved through scheduled irrigation and{' '}
              <span className="font-bold text-emerald-700">{chemicalRunoffReducedKg} kg</span> lower chemical runoff.
            </p>
          </div>

          {/* Ripple 4: Banking System */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-bold text-slate-900 dark:text-white">Banking System</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Warehouse receipts (e-NWR) create real, liquid collateral for previously unbankable smallholders, slashing non-performing agri-loans.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
