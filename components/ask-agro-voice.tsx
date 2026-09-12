'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Globe,
  Building2,
  Send,
  PhoneCall
} from 'lucide-react'

type Diagnosis = {
  diseaseName: string
  confidence: number
  symptoms: string
  biologicalRemedy: string
  chemicalRemedy: string
  dosagePerPump: string
  precautionAgainstPrevious: string
  retailerValidation: {
    shopName: string
    dealerName: string
    licenseNumber: string
    verifiedAt: string
    signatureNote: string
    stampColor: string
  }
  audioTranscript: string
}

const SAMPLE_DIAGNOSES: Record<string, Diagnosis> = {
  tomato: {
    diseaseName: 'Early Blight (Alternaria solani) & Zinc Deficiency',
    confidence: 96,
    symptoms: 'Concentric dark brown rings on lower leaves with yellow halo and flower abortion.',
    biologicalRemedy: 'Spray Trichoderma viride @ 5g/L water during early morning, enhance soil organic matter.',
    chemicalRemedy: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml per Litre clean water.',
    dosagePerPump: '15 ml per 15-Litre knapsack pump. Spray with hollow cone nozzle.',
    precautionAgainstPrevious:
      'Since you previously applied Copper Oxychloride 7 days ago, wait at least 3 more days before spraying Azoxystrobin to avoid leaf phytotoxicity.',
    retailerValidation: {
      shopName: 'Shri Ganesh Krishi Seva Kendra',
      dealerName: 'R. K. Kulkarni (B.Sc. Agriculture, Certified Dealer)',
      licenseNumber: 'FCO-LIC-MH-PUN-2024-4891',
      verifiedAt: 'Verified 4 mins ago by Local Retailer',
      signatureNote:
        'Approved for Baramati block red-loamy soils. Azoxystrobin stock available in store at MRP ₹480/100ml.',
      stampColor: 'border-emerald-600 bg-emerald-50 text-emerald-900'
    },
    audioTranscript:
      'नमस्ते किसान भाई! आपके टमाटर के पत्तों पर अर्ली ब्लाइट की बीमारी है। क्योंकि आपने 7 दिन पहले कॉपर का छिड़काव किया था, इसलिए 3 दिन रुककर ही एजोक्सीस्ट्रोबिन 15 मिली प्रति पंप छिड़कें। यह पर्ची आपके नजदीकी गणेश कृषि केंद्र द्वारा सत्यापित है।'
  },
  cotton: {
    diseaseName: 'Whitefly Infestation & Leaf Curl Virus Threat',
    confidence: 94,
    symptoms: 'Upward curling of young cotton leaves, sticky honeydew secretion, presence of small white flying pests.',
    biologicalRemedy: 'Install 15-20 Yellow Sticky Traps per acre and spray Neem Seed Kernel Extract (NSKE 5%) or 10,000 PPM Neem Oil.',
    chemicalRemedy: 'Diafenthiuron 50% WP @ 1.25 g/L OR Pyriproxyfen 10% EC @ 2 ml/L.',
    dosagePerPump: '20g Diafenthiuron per 15-Litre knapsack sprayer.',
    precautionAgainstPrevious:
      'You mentioned using synthetic pyrethroids previously. Stop pyrethroid sprays immediately as they cause whitefly resurgence and destroy natural predator ladybird beetles.',
    retailerValidation: {
      shopName: 'Kisan Krishi Seva Kendra (Vidarbha Agro Hub)',
      dealerName: 'Sunil Deshmukh (Agri Inputs Licensee)',
      licenseNumber: 'FCO-LIC-MH-AKL-2023-1129',
      verifiedAt: 'Verified 12 mins ago by Local Retailer',
      signatureNote:
        'Whitefly pressure is rising in Akola/Wardha belt. Recommended Diafenthiuron 50% WP batch tested and approved.',
      stampColor: 'border-emerald-600 bg-emerald-50 text-emerald-900'
    },
    audioTranscript:
      'राम राम शेतकरी मित्रा! तुमच्या कपाशीवर पांढऱ्या माशीचा प्रादुर्भाव आहे. पूर्वीच्या औषधामुळे माशी वाढली आहे. आता १५ पिवळे चिकट सापळे लावा आणि डायफेंथियुरॉन २० ग्रॅम प्रति पंप फवारा. हे मार्गदर्शन स्थानिक कृषी केंद्राने मंजूर केले आहे.'
  }
}

export default function AskAgroVoice() {
  const [language, setLanguage] = useState<'Hindi' | 'Marathi' | 'Telugu' | 'English'>('Hindi')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [queryText, setQueryText] = useState('')
  const [previousPesticide, setPreviousPesticide] = useState('Copper Oxychloride 7 days ago')
  const [cropStage, setCropStage] = useState('Flowering & Early Fruiting')
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis | null>(SAMPLE_DIAGNOSES.tomato)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const languages = [
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'English', label: 'English' }
  ]

  const handleStartVoice = () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
      setRecordingSeconds(0)
      const timer = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 5) {
            clearInterval(timer)
            setIsRecording(false)
            setQueryText(
              'टमाटर के पत्तों पर गोल-गोल भूरे धब्बे हैं और फूल झड़ रहे हैं। पहले कॉपर डाला था।'
            )
            setActiveDiagnosis(SAMPLE_DIAGNOSES.tomato)
            return 0
          }
          return s + 1
        })
      }, 1000)
    }
  }

  const handleQuickSelect = (cropKey: 'tomato' | 'cotton') => {
    if (cropKey === 'tomato') {
      setSelectedCrop('Tomato')
      setQueryText('टमाटर के पत्तों पर काले-भूरे छल्ले हैं, फूल गिर रहे हैं।')
      setPreviousPesticide('Copper Oxychloride 7 days ago')
      setActiveDiagnosis(SAMPLE_DIAGNOSES.tomato)
    } else {
      setSelectedCrop('Cotton')
      setQueryText('कपाशीची पाने वरच्या बाजूला वाकत आहेत, पांढरी माशी खूप आहे.')
      setPreviousPesticide('Cypermethrin synthetic pyrethroid 10 days ago')
      setActiveDiagnosis(SAMPLE_DIAGNOSES.cotton)
    }
  }

  const handlePlayAudio = () => {
    setIsPlayingAudio(true)
    setTimeout(() => {
      setIsPlayingAudio(false)
    }, 4500)
  }

  return (
    <div className="space-y-6">
      {/* Pitch Deck Problem-Solver Header */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-md md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-bold text-lime-300">
              <Sparkles className="h-4 w-4" /> MVP 1 · Voice-First Agri Intelligence
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              Ask-Agro: Voice AI with Local Retailer Validation
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
              Speak or send a voice note in your local language. Ask-Agro analyzes your symptoms, cross-checks against
              previously applied chemicals to prevent toxicity, and generates a remedy that is{' '}
              <strong className="text-lime-300">validated by your local trusted Krishi Kendra dealer</strong> before application.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> Solves Trust Gap
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> WhatsApp & Toll-Free Voice Enabled
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-lime-400" /> Chemical Cross-Reaction Protection
              </span>
            </div>
          </div>

          {/* Toll-Free Call Badge */}
          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-900/50 p-5 text-center backdrop-blur-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-emerald-950">
              <PhoneCall className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-bold text-emerald-200">Farmers Voice Helpline</p>
            <p className="text-lg font-black text-white">1800-FARM-OS</p>
            <p className="text-[10px] text-lime-300">Toll-Free in 7 Languages</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Voice & Diagnosis Card */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Voice Input & Chemical History Form (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Language Selector */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Globe className="h-4 w-4 text-emerald-600" />
                <span>Select Voice Language</span>
              </div>

              <div className="flex gap-1">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                      language === l.code
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Recorder Simulation */}
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
              <button
                onClick={handleStartVoice}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition duration-300 active:scale-95 ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                    : 'bg-gradient-to-br from-emerald-600 to-green-700 text-white hover:from-emerald-500 hover:to-green-600'
                }`}
                aria-label="Tap to speak your crop problem"
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>

              <p className="mt-4 text-xs font-bold text-slate-900 dark:text-white">
                {isRecording
                  ? `Listening to your voice note (${recordingSeconds}s)... Speak now`
                  : 'Tap Microphone to Speak or Send WhatsApp Voice Note'}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Explain leaf symptoms, pest appearance, or soil discoloration in {language}
              </p>

              {/* Sample Voice Quick Buttons */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleQuickSelect('tomato')}
                  className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
                >
                  🗣️ Tomato Leaf Blight & Rot
                </button>
                <button
                  onClick={() => handleQuickSelect('cotton')}
                  className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
                >
                  🗣️ Cotton Whitefly & Leaf Curl
                </button>
              </div>
            </div>

            {/* Chemical History & Previous Spray Questionnaire (Idea Doc Requirement) */}
            <div className="mt-6 space-y-3.5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Crop Context & Previous Spray History</span>
              </h3>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Target Crop & Growth Stage
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Chilli">Chilli (मिर्च)</option>
                    <option value="Paddy">Paddy (धान / भात)</option>
                    <option value="Onion">Onion (कांदा / प्याज)</option>
                  </select>

                  <select
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value)}
                    className="rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Seedling / Nursery">Seedling / Nursery</option>
                    <option value="Active Vegetative">Active Vegetative</option>
                    <option value="Flowering & Early Fruiting">Flowering & Fruiting</option>
                    <option value="Pre-Harvest Maturity">Pre-Harvest Maturity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  What spray or fertilizer was applied in the last 15 days?
                </label>
                <input
                  type="text"
                  value={previousPesticide}
                  onChange={(e) => setPreviousPesticide(e.target.value)}
                  placeholder="e.g. Copper Oxychloride, Neem, Cypermethrin, or None"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  ⚠️ Critical to prevent phytotoxic leaf burning and fungicide incompatibility.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Transcribed Voice Query:
                </label>
                <textarea
                  rows={2}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => {
                  if (selectedCrop === 'Cotton') {
                    setActiveDiagnosis(SAMPLE_DIAGNOSES.cotton)
                  } else {
                    setActiveDiagnosis(SAMPLE_DIAGNOSES.tomato)
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-lime-300" />
                <span>Diagnose & Get Retailer-Validated Remedy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Retailer-Validated Diagnosis & Remedy Card (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {activeDiagnosis && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Diagnosis Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-lime-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
                      {activeDiagnosis.confidence}% Match
                    </span>
                    <span className="text-xs text-emerald-100">
                      Crop: <strong>{selectedCrop}</strong> ({cropStage})
                    </span>
                  </div>

                  {/* Audio Listen Button */}
                  <button
                    onClick={handlePlayAudio}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                      isPlayingAudio
                        ? 'bg-lime-400 text-emerald-950 animate-pulse'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isPlayingAudio ? 'Speaking in Vernacular...' : 'Listen to Advice (आवाज़ में सुनें)'}</span>
                  </button>
                </div>

                <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">{activeDiagnosis.diseaseName}</h2>
                <p className="mt-1 text-xs text-emerald-100/90">{activeDiagnosis.symptoms}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Previous Chemical Cross-Reaction Warning */}
                <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">Chemical Compatibility & Cross-Reaction Check:</p>
                    <p className="mt-1">{activeDiagnosis.precautionAgainstPrevious}</p>
                  </div>
                </div>

                {/* Dual Treatment Protocol */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Natural Biological Remedy */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-slate-800 dark:bg-slate-850">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                      <span className="text-base">🌱</span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider">Natural / Bio Treatment</h4>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeDiagnosis.biologicalRemedy}
                    </p>
                  </div>

                  {/* Chemical Prescription with exact pump dose */}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 dark:border-slate-800 dark:bg-slate-850">
                    <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
                      <span className="text-base">🧪</span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider">Recommended FCO Chemical</h4>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                      {activeDiagnosis.chemicalRemedy}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      Pump Dose: {activeDiagnosis.dosagePerPump}
                    </p>
                  </div>
                </div>

                {/* THE TRUST BRIDGE: Local Retailer Validation Seal (Pitch Deck Core Feature) */}
                <div className="rounded-2xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/60 p-5 shadow-xs dark:border-emerald-700 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/30">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-3 dark:border-emerald-800/80">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                          Local Retailer Validation Seal (विश्वसनीय कृषी केंद्र)
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Solves the Trust Gap: Reviewed by your registered district input dealer
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-black text-white shadow-xs">
                      ✓ FCO COMPLIANT
                    </span>
                  </div>

                  <div className="mt-3 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      {activeDiagnosis.retailerValidation.shopName}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Signed by: <strong>{activeDiagnosis.retailerValidation.dealerName}</strong> (License:{' '}
                      {activeDiagnosis.retailerValidation.licenseNumber})
                    </p>
                    <p className="mt-2 rounded-lg bg-white p-2.5 text-slate-700 border border-emerald-100 italic dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                      "{activeDiagnosis.retailerValidation.signatureNote}"
                    </p>
                    <p className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      📅 {activeDiagnosis.retailerValidation.verifiedAt}
                    </p>
                  </div>
                </div>

                {/* Audio Transcript in Vernacular */}
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs dark:bg-slate-850">
                  <p className="font-bold text-slate-600 dark:text-slate-400">Vernacular Audio Transcript ({language}):</p>
                  <p className="mt-1 text-slate-800 leading-relaxed dark:text-slate-200 italic">
                    "{activeDiagnosis.audioTranscript}"
                  </p>
                </div>

                {/* Direct Order from Store CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500">
                    Need genuine, batch-tested inputs for this remedy?
                  </p>
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4 text-lime-300" />
                    <span>Order Verified Treatment from Store</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
