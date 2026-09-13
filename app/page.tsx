'use client'

import { useState } from 'react'
import {
  Leaf,
  TrendingUp,
  Droplets,
  BookOpen,
  AlertCircle,
  Sprout,
  ShieldCheck,
  MessageCircle,
  Mic,
  Building,
  ArrowRight,
  Sparkles,
  Store,
  CircleDollarSign,
  MapPin,
  Award,
  Package,
  Coins,
  PhoneCall,
  User,
  CheckCircle2,
  HelpCircle,
  Layers,
  ChevronRight,
  ExternalLink,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import DiseaseDetector from '@/components/disease-detector'
import CropRecommendation from '@/components/crop-recommendation'
import MarketPrices from '@/components/market-prices'
import PlantingCalendar from '@/components/planting-calendar'
import IrrigationSchedule from '@/components/irrigation-schedule'
import EducationHub from '@/components/education-hub'
import FarmCareHub from '@/components/farm-care-hub'
import FarmerAssistant from '@/components/farmer-assistant'
import AskAgroVoice from '@/components/ask-agro-voice'
import SellOrHoldPredictor from '@/components/sell-or-hold-predictor'
import WarehouseReceiptsFinancing from '@/components/warehouse-receipts-financing'
import RetailerPartnerPortal from '@/components/retailer-partner-portal'
import FarmerImpactCalculator from '@/components/farmer-impact-calculator'
import DistrictPlaybook from '@/components/district-playbook'

type CategoryGroup = 'all' | 'ai' | 'market' | 'crops' | 'strategy'

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [activeCategory, setActiveCategory] = useState<CategoryGroup>('all')
  const { user } = useAuth()

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Leaf, category: 'ai' },
    { id: 'ask-agro', label: 'Ask-Agro Voice AI', icon: Mic, category: 'ai' },
    { id: 'sell-or-hold', label: 'Sell or Hold? (Predictor)', icon: TrendingUp, category: 'market' },
    { id: 'warehouse', label: 'Warehouse Financing (e-NWR)', icon: Building, category: 'market' },
    { id: 'impact-calc', label: 'Farmer Season Impact & ROI', icon: CircleDollarSign, category: 'market' },
    { id: 'prices', label: 'Market Prices', icon: TrendingUp, category: 'market' },
    { id: 'retailer-hub', label: 'Retailer Hub (Dealer Portal)', icon: Store, category: 'strategy' },
    { id: 'playbook', label: '1-District Playbook & Moat', icon: MapPin, category: 'strategy' },
    { id: 'disease', label: 'Disease Detection', icon: AlertCircle, category: 'crops' },
    { id: 'crops', label: 'Crop Recommendation', icon: Sprout, category: 'crops' },
    { id: 'calendar', label: 'Planting Calendar', icon: BookOpen, category: 'crops' },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets, category: 'crops' },
    { id: 'care', label: 'Crop Care', icon: ShieldCheck, category: 'crops' },
    { id: 'education', label: 'Learn', icon: BookOpen, category: 'strategy' },
    { id: 'assistant', label: 'Ask Saarthi', icon: MessageCircle, category: 'ai' }
  ]

  const categories = [
    { id: 'all' as CategoryGroup, label: 'All Modules' },
    { id: 'ai' as CategoryGroup, label: '🤖 Core AI & Voice' },
    { id: 'market' as CategoryGroup, label: '📈 Market & Financing' },
    { id: 'crops' as CategoryGroup, label: '🌱 Crop Health & Ops' },
    { id: 'strategy' as CategoryGroup, label: '🤝 Strategy & B2B' }
  ]

  const visibleTabs = tabs.filter((t) => activeCategory === 'all' || t.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Advisory Strip */}
      <div className="bg-emerald-900 px-4 py-1.5 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950 flex items-center justify-center gap-3">
        <span>🌾 <strong>FarmDirect:</strong> India’s 1st End-to-End Direct Farmer-to-Market & Intelligence Platform</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline text-lime-300">📞 Farmer Kisan Helpline: 1800-FARM-DIRECT (Toll-Free 24/7)</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-900/20">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  FarmDirect
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    SMART AGRI
                  </span>
                </h1>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:block">
                  Direct Mandi Bazaar · AI Market Advisor · Sell/Hold Predictor · Certified Inputs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-amber-700 transition"
              >
                <TrendingUp className="h-3.5 w-3.5 text-amber-100" />
                <span>Mandi (Sell Produce)</span>
              </Link>

              <Link
                href="/store"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Fertile Store</span>
              </Link>

              <Link
                href="/store/orders"
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                title="Track orders"
              >
                <Package className="h-3.5 w-3.5 text-emerald-600" />
                <span>My Orders</span>
              </Link>

              {user && (
                <Link
                  href={
                    user.role?.toLowerCase() === 'admin'
                      ? '/admin'
                      : user.role?.toLowerCase() === 'buyer'
                      ? '/buyer'
                      : user.role?.toLowerCase() === 'transporter'
                      ? '/transporter/dashboard'
                      : '/farmer'
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/30 shadow-sm hover:bg-slate-800 transition dark:bg-emerald-950 dark:border-emerald-700"
                >
                  <Layers className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    {user.role?.toLowerCase() === 'admin'
                      ? 'Admin Console'
                      : user.role?.toLowerCase() === 'buyer'
                      ? 'Buyer Desk'
                      : user.role?.toLowerCase() === 'transporter'
                      ? 'Logistics'
                      : 'Farmer Center'}
                  </span>
                </Link>
              )}

              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 transition"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>{user.kisanCoins ?? 250} Coins</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">({user.name.split(' ')[0]})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:border-slate-700 dark:text-emerald-300 dark:hover:bg-slate-800 transition"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter & Navigation Tabs (Priority 4.5) */}
      <nav className="border-b border-emerald-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 sticky top-[61px] z-40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pt-2.5 pb-1 text-xs no-scrollbar border-b border-slate-100 dark:border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Module Tabs */}
          <div className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'ask-agro' && <AskAgroVoice />}
        {activeTab === 'sell-or-hold' && <SellOrHoldPredictor />}
        {activeTab === 'warehouse' && <WarehouseReceiptsFinancing />}
        {activeTab === 'retailer-hub' && <RetailerPartnerPortal />}
        {activeTab === 'impact-calc' && <FarmerImpactCalculator />}
        {activeTab === 'playbook' && <DistrictPlaybook />}
        {activeTab === 'disease' && <DiseaseDetector />}
        {activeTab === 'crops' && <CropRecommendation />}
        {activeTab === 'prices' && <MarketPrices />}
        {activeTab === 'calendar' && <PlantingCalendar />}
        {activeTab === 'irrigation' && <IrrigationSchedule />}
        {activeTab === 'education' && <EducationHub />}
        {activeTab === 'care' && <FarmCareHub />}
        {activeTab === 'assistant' && <FarmerAssistant />}
      </main>

      {/* Rich Multi-Column Agricultural Footer (Priority 4.1) */}
      <footer className="border-t border-emerald-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Col 1: About FarmDirect & Toll-Free */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white">FarmDirect</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Transforming Indian agriculture with trustworthy direct trade, AI intelligence, mandi forecasting, and digital traceability so smallholders never suffer distress selling.
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-emerald-600" /> Kisan Toll-Free Advisory
                </p>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                  1800-FARM-DIRECT (Toll-Free 24/7)
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                  Available 24/7 in 7 Indian Languages
                </p>
              </div>
            </div>

            {/* Col 2: Strategic Core Solutions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Strategic Modules
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setActiveTab('ask-agro')} className="hover:text-emerald-600 transition">
                    Ask-Agro AI Voice Bot (Multilingual)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('sell-or-hold')} className="hover:text-emerald-600 transition">
                    Sell or Hold? Price Predictor
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('warehouse')} className="hover:text-emerald-600 transition">
                    Warehouse Receipts (e-NWR Financing)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('retailer-hub')} className="hover:text-emerald-600 transition">
                    Retailer Partner & Dealer Kendra Portal
                  </button>
                </li>
                <li>
                  <Link href="/store" className="hover:text-emerald-600 transition">
                    Fertile Store (FCO Certified Inputs)
                  </Link>
                </li>
                <li>
                  <Link href="/store/orders" className="hover:text-emerald-600 transition">
                    Farm-Gate Delivery Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Agronomic Advisory & Crop Health */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Agronomic Intelligence
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setActiveTab('disease')} className="hover:text-emerald-600 transition">
                    Leaf & Stem Disease AI Detector
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('crops')} className="hover:text-emerald-600 transition">
                    Soil-Based Crop Recommendation
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('prices')} className="hover:text-emerald-600 transition">
                    Live Agmarknet Mandi Rates
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('irrigation')} className="hover:text-emerald-600 transition">
                    Precision Irrigation & Drip Scheduling
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('care')} className="hover:text-emerald-600 transition">
                    Bio-Fertilizer & NPK Dosage Guide
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust, Certifications & Standards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Trust & Standards
              </h3>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Fertilizer Control Order (FCO) Tested</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>WDRA Registered Warehouse Collateral</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>AgriStack & e-NAM API Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Kisan SuperCoins Rewards Ecosystem</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500">Supported Regions:</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Nashik, Pune, Ahmednagar, Solapur, Sangli, Satara & Kolhapur
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800">
            <p>© 2026 FarmDirect Platform · Built for Indian Farmers & Procurement Networks with ACID Data Integrity</p>
            <div className="flex items-center gap-4">
              <Link href="/store" className="hover:text-emerald-600 transition">Fertile Store</Link>
              <Link href="/store/orders" className="hover:text-emerald-600 transition">Order Tracking</Link>
              <Link href="/account" className="hover:text-emerald-600 transition">My Account</Link>
              <Link href="/store/compare" className="hover:text-emerald-600 transition">Compare Products</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-8 dark:border-slate-800 dark:from-slate-800 dark:to-slate-700">
        <h2 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">Welcome to FarmDirect</h2>
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
          Your intelligent farming companion — delivering trustworthy intelligence, price forecasting, collateral
          financing, and direct produce selling so you never suffer distress selling.
        </p>
      </div>

      {/* Farmer Produce Marketplace Spotlight */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-emerald-50 p-6 shadow-sm dark:border-amber-900/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              NEW · Direct Farm-to-Buyer Marketplace
            </span>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              Sell Your Harvest Directly: Chilli, Pulses, Fruits & Vegetables
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Cut out commission agents and dalals. List your dry red chillies, tur/moong pulses, tomatoes, onions, mangoes, and grains. Connect with verified dal mills, retail chains, and exporters with farm-gate pickup & live APMC benchmark pricing.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/marketplace/sell"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-800 transition"
              >
                <PlusCircle className="h-4 w-4 text-lime-300" />
                <span>I Want to Sell My Produce (Guided Wizard)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                Browse Mandi Lots
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/90 w-full max-w-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
              Supported Commodities
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🌶️ Red Chilli (Guntur)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🫘 Red Gram (Tur Dal)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🌱 Green Gram (Moong)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🍅 Hybrid Tomatoes
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🧅 Red Onions
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                🥭 Devgad Mangoes
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                ✓ MSP Protection & Digital Weighbridge Certified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Three Flagship Modules Spotlight (Pitch Deck Solution) */}
      <div className="rounded-3xl border-2 border-emerald-600/70 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-md md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-lime-300">
              THE SOLUTION · 3 Core Flagship Modules
            </span>
            <h3 className="mt-2 text-2xl font-black md:text-3xl">One dilemma solved: sell now, or hold?</h3>
            <p className="mt-1 max-w-2xl text-xs text-emerald-200">
              Smallholders lose 22-38% of season value due to panic harvest sales. FarmDirect replaces hearsay with verifiable
              district data and instant collateral-backed credit.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sell-or-hold')}
            className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-xs font-bold text-emerald-950 shadow-md transition hover:bg-lime-300"
          >
            <span>Launch Sell or Hold Predictor</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Interactive Solution Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Module 1: Ask-Agro */}
          <div
            onClick={() => setActiveTab('ask-agro')}
            className="group cursor-pointer rounded-2xl border border-emerald-800 bg-emerald-900/60 p-5 backdrop-blur-xs transition hover:border-lime-400 hover:bg-emerald-900/90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
              <Mic className="h-6 w-6" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-lime-300">
              Module 1 · Voice First
            </span>
            <h4 className="mt-1 text-base font-bold text-white group-hover:text-lime-300">Ask-Agro Voice Assistant</h4>
            <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
              Speak in Marathi, Hindi, Telugu, or 4 other local dialects. Zero-typing crop advisory, mandi rates, and
              disease diagnostics.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800 pt-3 text-[11px] font-bold text-lime-300">
              <span>Try Voice Assistant</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 2: Sell or Hold */}
          <div
            onClick={() => setActiveTab('sell-or-hold')}
            className="group cursor-pointer rounded-2xl border border-emerald-800 bg-emerald-900/60 p-5 backdrop-blur-xs transition hover:border-lime-400 hover:bg-emerald-900/90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-lime-300">
              Module 2 · Market Intelligence
            </span>
            <h4 className="mt-1 text-base font-bold text-white group-hover:text-lime-300">
              Sell or Hold? Price Predictor
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
              7 to 21-day APMC price forecasting with net holding gain calculations after storage loss, mandi cess, and
              freight.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800 pt-3 text-[11px] font-bold text-lime-300">
              <span>Calculate Net Gain</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Module 3: Warehouse Financing */}
          <div
            onClick={() => setActiveTab('warehouse')}
            className="group cursor-pointer rounded-2xl border border-emerald-800 bg-emerald-900/60 p-5 backdrop-blur-xs transition hover:border-lime-400 hover:bg-emerald-900/90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
              <Building className="h-6 w-6" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-lime-300">
              Module 3 · Liquidity & Credit
            </span>
            <h4 className="mt-1 text-base font-bold text-white group-hover:text-lime-300">
              Warehouse Receipts (e-NWR)
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">
              Deposit produce at accredited WDRA warehouses, get verified e-NWR, and unlock 70% instant bank credit
              without selling cheap.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800 pt-3 text-[11px] font-bold text-lime-300">
              <span>Apply for Financing</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Strategic B2B & Pitch Deck Tools Spotlight */}
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              PITCH DECK DIFFERENTIATORS · GTM & Dealer Moat
            </span>
            <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              Why FarmDirect wins where pure advisory failed
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Advisory alone doesn&apos;t create habit. We monetize credit and supply while locking distribution through local
              retailers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Card 1: Retailer Portal */}
          <div
            onClick={() => setActiveTab('retailer-hub')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Store className="h-5 w-5" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Distribution Engine
            </span>
            <h4 className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
              Retailer Hub (Dealer Portal)
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              How krishi kendras digitize farmer ledger (khata), pre-book seasonal fertilizer demand, and earn ₹150/e-NWR.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] font-bold text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
              <span>Inspect Dealer Interface</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Farmer Impact ROI */}
          <div
            onClick={() => setActiveTab('impact-calc')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Farmer Economics
            </span>
            <h4 className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
              Season Impact & Net Income ROI
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              What changes for the farmer per season across price gains, lower input waste, post-harvest curing, and fast credit.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] font-bold text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
              <span>Calculate Acreage ROI</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: 1-District Playbook */}
          <div
            onClick={() => setActiveTab('playbook')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              GTM: Start Deep, Not Wide
            </span>
            <h4 className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
              1-District Playbook & Moats
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Nashik anchor pilot (342 farmers, 12 dealers, 94.2% accuracy) plus our 4 un-copyable defensible moats.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] font-bold text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
              <span>Explore 6-Phase Roadmap</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Crops Tracked', value: '5 Crops', color: 'emerald' },
          { label: 'Avg Yield Gain', value: '+23%', color: 'green' },
          { label: 'Health Score', value: '8.5 / 10', color: 'teal' },
          { label: 'Next Harvest Target', value: '12 Days', color: 'lime' }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-emerald-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Other Features Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div
          onClick={() => setActiveTab('disease')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Disease Detection & Leaf Diagnostics</h3>
          <p className="mt-2 text-xs text-slate-500">
            Identify crop fungal and insect diseases early and get targeted pesticide recommendations based on your
            farming history.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('crops')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
            <Sprout className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Crop Selection Wizard</h3>
          <p className="mt-2 text-xs text-slate-500">
            Get personalized crop recommendations based on soil type, water availability, season, and maximum
            profitability.
          </p>
        </div>
      </div>
    </div>
  )
}
