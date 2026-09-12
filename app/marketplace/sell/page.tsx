'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Leaf,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Truck,
  ShieldCheck,
  Camera,
  Coins,
  DollarSign,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react'
import { CROPS_CATALOG, CROP_CATEGORIES, CropDefinition, getCropById } from '@/lib/crops-data'
import { useAuth } from '@/lib/auth-context'

export default function SellProduceWizard() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('spices')
  const [selectedCropId, setSelectedCropId] = useState<string>('red-chilli')
  const [customCropName, setCustomCropName] = useState<string>('')
  const [variety, setVariety] = useState<string>('Guntur Teja (S-17) Stemless')

  const [quantity, setQuantity] = useState<number>(30)
  const [unit, setUnit] = useState<string>('Quintal (100 kg)')
  const [minOrderQty, setMinOrderQty] = useState<number>(5)
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isOrganic, setIsOrganic] = useState<boolean>(false)
  const [packagingType, setPackagingType] = useState<string>('Jute Gunny Bags (50 kg)')

  const [qualityGrade, setQualityGrade] = useState<string>('Grade A (Stemless Deep Red)')
  const [moisturePercent, setMoisturePercent] = useState<string>('10.5')
  const [qualitySpecs, setQualitySpecs] = useState<string>('Clean sun-dried lot, zero insect damage, high pungency')

  const [askingPrice, setAskingPrice] = useState<number>(18500)
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true)

  const [village, setVillage] = useState<string>('Baramati Rural')
  const [district, setDistrict] = useState<string>(user?.district || 'Pune')
  const [state, setState] = useState<string>(user?.state || 'Maharashtra')
  const [farmGateAddress, setFarmGateAddress] = useState<string>('Gat No. 104, Near Canal Road, Tractor Accessible')
  const [logisticsMode, setLogisticsMode] = useState<string>('Farm Gate Pickup (Tractor/Truck Road Accessible)')

  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80'
  )
  const [farmerNotes, setFarmerNotes] = useState<string>(
    'Freshly harvested, naturally dried on clean plastic sheet. Lab tested moisture, immediate delivery ready.'
  )

  const currentCrop = getCropById(selectedCropId)

  // Update variety and price defaults when crop changes
  const handleCropSelect = (crop: CropDefinition) => {
    setSelectedCropId(crop.id)
    setSelectedCategory(crop.category)
    setVariety(crop.varieties[0] || 'Standard Quality')
    setUnit(crop.commonUnit)
    setAskingPrice(crop.avgMandiPricePerUnit)
    setSelectedImage(crop.imageUrl)
    if (crop.qualityGrades.length > 0) {
      setQualityGrade(crop.qualityGrades[0].grade)
      setQualitySpecs(crop.qualityGrades[0].specs)
    }
  }

  // Calculate estimated revenue
  const totalRevenue = (quantity || 0) * (askingPrice || 0)

  // Submit Listing to API
  const handleSubmitListing = async () => {
    setErrorMsg('')
    setSubmitting(true)

    try {
      const cropName = currentCrop ? currentCrop.name : (customCropName || 'Farm Produce')
      const payload = {
        sellerId: user?.userId || user?.id || 'farmer-demo',
        sellerName: user?.name || 'Ramesh Patil',
        sellerPhone: user?.phone || '+91 98220 12345',
        sellerVillage: village,
        sellerDistrict: district,
        sellerState: state,
        category: selectedCategory,
        cropId: selectedCropId,
        cropName,
        variety,
        quantity,
        unit,
        minOrderQuantity: minOrderQty,
        pricePerUnit: askingPrice,
        mandiBenchmarkPrice: currentCrop?.avgMandiPricePerUnit || null,
        mspPrice: currentCrop?.mspPricePerUnit || null,
        isNegotiable,
        qualityGrade,
        moisturePercent: moisturePercent ? parseFloat(moisturePercent) : null,
        harvestDate,
        isOrganic,
        packagingType,
        logisticsMode,
        farmGateAddress,
        description: farmerNotes,
        images: [selectedImage]
      }

      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setCreatedListingId(data.listingId)
        setStep(7) // Success screen
      } else {
        setErrorMsg(data.error || 'Failed to submit listing')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while saving listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-16">
      {/* Top Advisory Strip */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>Farmer Direct Selling Portal:</strong> List in 3 Minutes · Connect with Mills & Traders · 0% Commission</span>
      </div>

      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Mandi</span>
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Post Produce for Sale</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Step {step <= 6 ? step : 6} of 6</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {/* Progress Stepper Bar */}
        {step <= 6 && (
          <div className="mb-8">
            <div className="grid grid-cols-6 gap-2">
              {[
                { s: 1, label: 'Crop' },
                { s: 2, label: 'Harvest' },
                { s: 3, label: 'Grade' },
                { s: 4, label: 'Price' },
                { s: 5, label: 'Location' },
                { s: 6, label: 'Review' }
              ].map((item) => (
                <div key={item.s} className="text-center">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step >= item.s ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <span
                    className={`mt-1.5 block text-[11px] font-bold ${
                      step === item.s
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : step > item.s
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8 dark:border-slate-800 dark:bg-slate-900">
          {errorMsg && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CROP & CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 1 of 6 · Commodity Selection
                </span>
                <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  What Produce Would You Like to Sell Today?
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Select from our verified crop catalog to automatically fetch official Mandi benchmarks & MSP protection.
                </p>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Commodity Category:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CROP_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition ${
                        selectedCategory === cat.id
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500 shadow-xs'
                          : 'border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Grid for selected category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Specific Crop / Harvest:
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CROPS_CATALOG.filter((c) => c.category === selectedCategory).map((crop) => (
                    <div
                      key={crop.id}
                      onClick={() => handleCropSelect(crop)}
                      className={`cursor-pointer flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                        selectedCropId === crop.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      <img
                        src={crop.imageUrl}
                        alt={crop.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {crop.name}
                          </p>
                          <span className="text-base ml-1">{crop.iconEmoji}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{crop.hindiName}</p>
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                          Avg Mandi: ₹{crop.avgMandiPricePerUnit.toLocaleString('en-IN')} {crop.unitLabel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variety Selection */}
              {currentCrop && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Crop Variety (or enter custom variety):
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentCrop.varieties.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setVariety(v)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                          variety === v
                            ? 'bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="E.g. Guntur Teja (S-17) / Desi Special"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition active:scale-95"
                >
                  <span>Continue to Quantity & Harvest</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HARVEST & LOT QUANTITY */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 2 of 6 · Harvest & Lot Size
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  How Much {currentCrop?.name.split('/')[0] || 'Produce'} Do You Have for Sale?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  State the total quantity ready at your farm and the packaging method used.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Lot Quantity Available: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Standard Trading Unit: *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Quintal (100 kg)">Quintal (100 kg)</option>
                    <option value="Crates (20-25 kg)">Crates (20-25 kg)</option>
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Metric Ton (1000 kg)">Metric Ton (1000 kg)</option>
                    <option value="Bags (50 kg)">Bags (50 kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Min Order Qty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Minimum Order Quantity (MOQ):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={quantity}
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Buyers cannot bid below this quantity.</p>
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Harvest / Picking Date: *
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Packaging Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Packaging / Bagging Type:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    'Jute Gunny Bags (50 kg)',
                    'HDPE Plastic Bags with Liner',
                    'Plastic Crates (20-25 kg)',
                    '5-Ply Corrugated Cartons',
                    'Hermetic GrainPro Bags',
                    'Loose / Bulk Trolley'
                  ].map((pkg) => (
                    <button
                      type="button"
                      key={pkg}
                      onClick={() => setPackagingType(pkg)}
                      className={`rounded-xl p-2.5 text-xs text-left border transition ${
                        packagingType === pkg
                          ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organic Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900">
                <div>
                  <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    🌱 Is This Certified Jaivik Organic / Chemical-Free?
                  </p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Organic produce fetches 15-25% higher market premium from city organic stores & exporters.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isOrganic}
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
                >
                  <span>Continue to Quality Grading</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: QUALITY GRADING & MOISTURE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 3 of 6 · Quality Assurance
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  Define Produce Quality & Moisture Content
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Buyers pay top dollar for graded produce with stated moisture percentages and cleanliness specs.
                </p>
              </div>

              {/* Quality Grade Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Quality Grade:
                </label>
                <div className="space-y-2.5">
                  {currentCrop?.qualityGrades.map((qg) => (
                    <div
                      key={qg.grade}
                      onClick={() => {
                        setQualityGrade(qg.grade)
                        setQualitySpecs(qg.specs)
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        qualityGrade === qg.grade
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                          {qg.grade}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          {qg.specs}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{qg.description}</p>
                    </div>
                  )) || (
                    <div className="space-y-2">
                      {['Grade A (Premium / Export)', 'Grade B (Standard Commercial Mandi)', 'Grade C (Processing / Mill)'].map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setQualityGrade(g)}
                          className={`w-full text-left rounded-xl p-3 text-xs border ${
                            qualityGrade === g ? 'border-emerald-600 bg-emerald-50 font-bold' : 'border-slate-200'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Moisture Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Moisture Percentage (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="30"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(e.target.value)}
                    className="w-40 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="text-xs text-slate-500">
                    {currentCrop?.storageAdvice || 'Safe storage moisture keeps produce fresh and insect free.'}
                  </span>
                </div>
              </div>

              {/* Quality Highlights & Specs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quality Specs & Special Highlights:
                </label>
                <input
                  type="text"
                  value={qualitySpecs}
                  onChange={(e) => setQualitySpecs(e.target.value)}
                  placeholder="E.g. Clean sun dried, zero weevils, ASTA color 95+, 100% stemless"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
                >
                  <span>Continue to Fair Pricing</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FAIR PRICING & MANDI BENCHMARK */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 4 of 6 · Transparent Pricing
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  Set Your Asking Price (With APMC Mandi Protection)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  We compare your price with current APMC mandi rates and Government MSP to protect you from distress selling.
                </p>
              </div>

              {/* Mandi Benchmark Info Strip */}
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold">Official Market Rates for {currentCrop?.name || 'Selected Crop'}:</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Live Today</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-amber-700 dark:text-amber-400">Current APMC Mandi Modal:</span>{' '}
                    <strong>₹{currentCrop?.avgMandiPricePerUnit.toLocaleString('en-IN') || 1000} /{unit.split(' ')[0]}</strong>
                  </div>
                  {currentCrop?.mspPricePerUnit && (
                    <div>
                      <span className="text-amber-700 dark:text-amber-400">Govt MSP Price:</span>{' '}
                      <strong className="text-emerald-700 dark:text-emerald-300">₹{currentCrop.mspPricePerUnit.toLocaleString('en-IN')} /{unit.split(' ')[0]}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Asking Price per {unit.split(' ')[0]} (in ₹): *
                </label>
                <div className="relative max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-8 pr-4 text-2xl font-black text-slate-900 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Revenue Estimate Card */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-green-900 p-5 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-200">Estimated Gross Lot Value:</span>
                  <span className="rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                    0% Commission Cut
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-emerald-200">
                    ({quantity} {unit} × ₹{askingPrice.toLocaleString('en-IN')})
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  Full 100% amount goes directly to your bank account with zero middlemen deductions.
                </p>
              </div>

              {/* Negotiable Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Open to Reasonable Price Negotiation by Serious Buyers?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Traders lifting 100% of your lot in one truck often negotiate 2-4%.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
                >
                  <span>Continue to Farm Location</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FARM GATE LOCATION & LOGISTICS */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 5 of 6 · Farm Location & Logistics
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  Where Can the Buyer Collect Your Produce?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Provide your village and farm-gate access so buyers can plan transport vehicles accordingly.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Village */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Village / Town: *
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="E.g. Baramati Rural"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District: *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="E.g. Pune / Guntur / Latur"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State: *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>
              </div>

              {/* Logistics Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Preferred Pickup & Transport Mode:
                </label>
                <div className="space-y-2">
                  {[
                    'Farm Gate Pickup (Tractor/Truck Road Accessible)',
                    'Farmer Can Transport to Local APMC Mandi Hub',
                    'Buyer Arranges Transport (Trolley / 10-Wheeler Vehicle)'
                  ].map((mode) => (
                    <div
                      key={mode}
                      onClick={() => setLogisticsMode(mode)}
                      className={`cursor-pointer flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                        logisticsMode === mode
                          ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs">{mode}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exact Farm Address / Directions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Farm Landmark & Loading Instructions:
                </label>
                <textarea
                  rows={2}
                  value={farmGateAddress}
                  onChange={(e) => setFarmGateAddress(e.target.value)}
                  placeholder="Gat / Survey Number, nearest canal/school, road condition..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition"
                >
                  <span>Review & Finalize Listing</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PHOTOS, FARMER NOTE & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 6 of 6 · Review & Publish
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  Confirm Your Produce Listing Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review everything before publishing live on FarmOS Mandi Direct.
                </p>
              </div>

              {/* Photo Preview & Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Produce Photo Preview (Buyers verify lot color and luster):
                </label>
                <div className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={selectedImage}
                    alt={currentCrop?.name || 'Produce'}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-sm">{currentCrop?.name || customCropName} ({variety})</p>
                    <p className="text-[11px] text-emerald-200">
                      Lot: {quantity} {unit} · Grade: {qualityGrade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Farmer Note / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message / Special Notes for Buyers:
                </label>
                <textarea
                  rows={3}
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="Mention quality details, storage condition, testing certificate availability..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Final Summary Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                <h3 className="font-bold text-emerald-950 dark:text-emerald-300 mb-2">Listing Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 sm:grid-cols-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Quantity:</span>
                    <strong>{quantity} {unit}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Asking Rate:</span>
                    <strong>₹{askingPrice.toLocaleString('en-IN')}/{unit.split(' ')[0]}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location:</span>
                    <strong>{village}, {district}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated Revenue:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-3 text-xs font-bold text-white shadow-lg hover:from-emerald-700 hover:to-green-800 transition active:scale-95 disabled:opacity-50"
                >
                  <PlusCircle className="h-4 w-4 text-lime-300" />
                  <span>{submitting ? 'Publishing to Mandi...' : 'Publish Produce Listing Live'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: SUCCESS CONFIRMATION */}
          {step === 7 && (
            <div className="py-8 text-center space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <span className="rounded-full bg-lime-400/20 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-lime-300">
                  Listing Live on Mandi Direct
                </span>
                <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  Congratulations! Your Harvest is Live for Sale
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                  Your lot of <strong>{quantity} {unit}</strong> of <strong>{currentCrop?.name || 'Produce'}</strong> has
                  been published to verified mills, APMC traders, and retail buyers across the region.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {createdListingId && (
                  <Link
                    href={`/marketplace/listing/${createdListingId}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800"
                  >
                    <span>View Published Listing</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/marketplace/my-listings"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Go to My Farmer Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Browse Other Mandi Lots
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
