'use client'

import { useState } from 'react'
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  TrendingUp,
  Users,
  QrCode,
  Share2,
  FileCheck,
  AlertTriangle,
  Send,
  Building2,
  Sparkles,
  Award,
  ArrowUpRight,
  Printer,
  ChevronRight,
  IndianRupee,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Prescription {
  id: string
  farmerName: string
  village: string
  phone: string
  crop: string
  issue: string
  aiRecommendation: string
  dosage: string
  pastSprayConflict: string | null
  status: 'pending' | 'certified'
  timestamp: string
  suggestedProduct: string
  productPrice: number
  dealerCommission: number
}

interface CommissionRecord {
  id: string
  type: 'warehouse_loan' | 'input_order' | 'sell_hold_sub'
  title: string
  farmer: string
  amount: number
  commission: number
  rate: string
  date: string
  status: 'paid' | 'pending'
}

export default function RetailerPartnerPortal() {
  const [activeTab, setActiveTab] = useState<'queue' | 'commissions' | 'farmers' | 'tools'>('queue')
  const [withdrawalState, setWithdrawalState] = useState<'idle' | 'processing' | 'success'>('idle')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 'RX-9921',
      farmerName: 'Ramesh Patil',
      village: 'Koregaon Bhima, Baramati',
      phone: '+91 98234 *****',
      crop: 'Tomato (Abhinav F1)',
      issue: 'Early Blight (Alternaria solani) + Leaf Curl',
      aiRecommendation: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
      dosage: '1.0 ml per liter of water (200 ml/acre)',
      pastSprayConflict: 'Safe: Farmer sprayed Copper Oxychloride 12 days ago (>7 day safety window cleared).',
      status: 'pending',
      timestamp: '14 mins ago',
      suggestedProduct: 'Amistar Top Fungicide 200ml',
      productPrice: 1050,
      dealerCommission: 84
    },
    {
      id: 'RX-9922',
      farmerName: 'Sopan Jadhav',
      village: 'Malegaon Budruk',
      phone: '+91 97651 *****',
      crop: 'Cotton (Bollgard II)',
      issue: 'Pink Bollworm Rosette Flower Infestation',
      aiRecommendation: 'Profenofos 40% + Cypermethrin 4% EC',
      dosage: '2.0 ml per liter water (400 ml/acre)',
      pastSprayConflict: 'Caution: Avoid mixing with alkaline micronutrients in same tank.',
      status: 'pending',
      timestamp: '42 mins ago',
      suggestedProduct: 'Profenofos Combo 500ml',
      productPrice: 620,
      dealerCommission: 50
    },
    {
      id: 'RX-9918',
      farmerName: 'Anusaya Shinde',
      village: 'Hol, Baramati',
      phone: '+91 94210 *****',
      crop: 'Pomegranate (Bhagwa)',
      issue: 'Bacterial Blight (Telya) prevention post-pruning',
      aiRecommendation: 'Bactericide Streptocycline 90% + Copper Hydroxide 53.8% DF',
      dosage: '6g Streptocycline + 2g Copper Hydroxide per 10L',
      pastSprayConflict: 'Verified: Post-pruning prophylactic spray confirmed.',
      status: 'certified',
      timestamp: 'Yesterday',
      suggestedProduct: 'Streptocycline 10x6g + Kocide 500g',
      productPrice: 1480,
      dealerCommission: 118
    }
  ])

  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    {
      id: 'COMM-1049',
      type: 'warehouse_loan',
      title: 'e-NWR Warehouse Pledge Loan (75% LTV)',
      farmer: 'Dnyaneshwar Shinde (100 Qtl Onion)',
      amount: 180000,
      commission: 3600,
      rate: '2.0% Dealer Channel Share',
      date: '11 Sep 2026',
      status: 'paid'
    },
    {
      id: 'COMM-1048',
      type: 'input_order',
      title: 'Fertilizer & Nutrition Drip Kit',
      farmer: 'Ramesh Patil (4 Acres)',
      amount: 8400,
      commission: 672,
      rate: '8.0% Supplier-Side Commission',
      date: '10 Sep 2026',
      status: 'paid'
    },
    {
      id: 'COMM-1047',
      type: 'sell_hold_sub',
      title: 'Sell/Hold Mandi Price Alert Subscription',
      farmer: 'Kishor Pawar (Post-Harvest Billing)',
      amount: 499,
      commission: 100,
      rate: 'Fixed Partner Referral',
      date: '08 Sep 2026',
      status: 'paid'
    },
    {
      id: 'COMM-1046',
      type: 'warehouse_loan',
      title: 'e-NWR Warehouse Pledge Loan (75% LTV)',
      farmer: 'Babanrao More (80 Qtl Soybean)',
      amount: 140000,
      commission: 2800,
      rate: '2.0% Dealer Channel Share',
      date: '05 Sep 2026',
      status: 'paid'
    }
  ])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleCertify = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status: 'certified' } : rx))
    )
    triggerToast(`Prescription ${id} certified with B.Sc Agri Digital Seal! Commission credited.`)
  }

  const handleWithdrawal = () => {
    setWithdrawalState('processing')
    setTimeout(() => {
      setWithdrawalState('success')
      triggerToast('₹7,172 transferred to HDFC Bank A/c ending 8842 via Instant IMPS!')
      setTimeout(() => setWithdrawalState('idle'), 4000)
    }, 1200)
  }

  const totalCommissionsEarned = commissions.reduce((sum, c) => sum + c.commission, 0)
  const pendingQueueCount = prescriptions.filter((p) => p.status === 'pending').length

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-xl ring-2 ring-lime-400">
          <CheckCircle2 className="h-5 w-5 text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dealer Store Banner & Accreditation */}
      <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 shadow-md">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-lime-400/20 px-2.5 py-0.5 text-xs font-bold text-lime-300">
                  RETAILER-AS-A-CHANNEL PARTNER
                </span>
                <span className="rounded-full bg-emerald-700/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
                  Baramati District Hub
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black md:text-3xl">Shri Ganesh Krishi Seva Kendra</h2>
              <p className="text-xs text-emerald-200">
                FCO License: <span className="font-mono font-bold text-white">MH/PNE/2021/8842</span> · Verified Agronomist:{' '}
                <span className="font-semibold text-lime-300">R. K. Kulkarni (B.Sc Agri)</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-700/80 bg-emerald-950/60 px-5 py-3 text-right">
              <p className="text-[11px] font-medium text-emerald-300">Active Village Farmers</p>
              <p className="text-2xl font-extrabold text-white">342 Farmers</p>
            </div>
            <div className="rounded-2xl border border-lime-500/40 bg-emerald-950/60 px-5 py-3 text-right">
              <p className="text-[11px] font-medium text-lime-300">Total Season Commission</p>
              <p className="text-2xl font-black text-lime-400">₹{totalCommissionsEarned.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Pitch Deck Philosophy Quote */}
        <div className="mt-6 rounded-2xl border border-emerald-700/50 bg-emerald-950/40 p-4 text-xs leading-relaxed text-emerald-100">
          <span className="font-bold text-lime-400">Why Retailer-as-a-Channel?</span> "We don't bypass the input dealer — we digitally arm them. Dealers validate every AI recommendation and earn a commission on loans, subscriptions, and input orders sold through the app."
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === 'queue'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-400'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>AI Prescription Queue</span>
          {pendingQueueCount > 0 && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-slate-950">
              {pendingQueueCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === 'commissions'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-400'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Live Commission Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === 'farmers'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-400'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Pin-Code Farmer Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === 'tools'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 dark:text-slate-400'
          }`}
        >
          <QrCode className="h-4 w-4" />
          <span>Dealer Enablement Tools</span>
        </button>
      </div>

      {/* TAB 1: PRESCRIPTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Pending Farmer AI Diagnostic Prescriptions
              </h3>
              <p className="text-xs text-slate-500">
                Review and certify AI recommendations submitted by farmers in your service area. Your signature builds trust and enables instant fulfillment.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Auto-syncs with WhatsApp Ask-Agro Voice AI
            </span>
          </div>

          <div className="grid gap-6">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className={`rounded-2xl border p-6 transition shadow-xs ${
                  rx.status === 'certified'
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{rx.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{rx.timestamp}</span>
                      {rx.status === 'certified' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Certified & Signed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5" />
                          Awaiting Dealer Sign-Off
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {rx.farmerName}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        ({rx.village} · {rx.phone})
                      </span>
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Crop: {rx.crop}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Your Dealer Commission</p>
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      +₹{rx.dealerCommission} (8%)
                    </p>
                    <p className="text-[11px] text-slate-500">on ₹{rx.productPrice} product</p>
                  </div>
                </div>

                {/* Prescription Details Grid */}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="text-xs font-bold text-slate-500">Farmer Query & Issue Detected</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{rx.issue}</p>

                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-500">AI Suggested Dosage</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{rx.dosage}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="text-xs font-bold text-slate-500">Recommended Commercial Formulation</p>
                    <p className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      {rx.suggestedProduct}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-500">Chemical History Cross-Check</p>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {rx.pastSprayConflict}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Signing verifies dosage validity under your FCO Dealer License.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rx.status === 'pending' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerToast(`Contacted ${rx.farmerName} via WhatsApp to adjust dosage.`)}
                          className="text-xs"
                        >
                          Tweak Dosage
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCertify(rx.id)}
                          className="bg-emerald-700 font-bold text-white hover:bg-emerald-800"
                        >
                          <Check className="mr-1.5 h-4 w-4" />
                          Approve with B.Sc Agri Seal
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Digital Seal Applied · Prescription Ready for Pickup
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerToast(`Printing prescription slip for ${rx.farmerName}`)}
                          className="text-xs"
                        >
                          <Printer className="mr-1.5 h-3.5 w-3.5" />
                          Print Rx Slip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE COMMISSION LEDGER */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Commission Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-500">Available Balance</span>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-black text-emerald-900 dark:text-white">
                  ₹{totalCommissionsEarned.toLocaleString('en-IN')}
                </p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Instant Payout
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Linked to UPI: 8842...01@okaxis</p>
              <Button
                onClick={handleWithdrawal}
                disabled={withdrawalState === 'processing'}
                className="mt-4 w-full bg-emerald-700 font-bold text-white hover:bg-emerald-800"
              >
                {withdrawalState === 'processing' ? 'Processing IMPS Transfer...' : 'Withdraw to Bank Account'}
              </Button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-500">Warehouse Loan Commission (1.5 - 2%)</span>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">₹6,400</p>
              <p className="mt-1 text-xs text-emerald-600">Earned from 2 e-NWR loans (₹3,20,000 total disbursed)</p>
              <div className="mt-4 text-xs font-semibold text-slate-500">
                Farmers held produce instead of distress sale.
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-500">Input Orders & Subscriptions</span>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">₹772</p>
              <p className="mt-1 text-xs text-emerald-600">8% on Fertilizers + ₹100 Sell/Hold Alert referral</p>
              <div className="mt-4 text-xs font-semibold text-slate-500">
                100% digital orders fulfilled through your shop.
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <h4 className="font-bold text-slate-900 dark:text-white">Season 2026 Commission Ledger</h4>
              <p className="text-xs text-slate-500">
                Transparent "Earn When They Earn" tracking — commissions are disbursed when the farmer gains liquidity.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {commissions.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                      {item.type === 'warehouse_loan' && <Building2 className="h-5 w-5" />}
                      {item.type === 'input_order' && <Store className="h-5 w-5" />}
                      {item.type === 'sell_hold_sub' && <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.farmer} · <span className="font-medium text-emerald-700">{item.rate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                      +₹{item.commission.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FARMER ROSTER */}
      {activeTab === 'farmers' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Baramati Service Area · Registered Farmers (342)
                </h3>
                <p className="text-xs text-slate-500">
                  Farmers who designated your Kendra as their primary certifying dealer.
                </p>
              </div>
              <Button
                onClick={() => triggerToast('Broadcast WhatsApp seasonal advisory sent to 342 farmers!')}
                className="bg-emerald-700 font-bold text-white hover:bg-emerald-800"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Weather/Spray Alert
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { name: 'Dnyaneshwar Shinde', village: 'Koregaon', crop: 'Onion', acres: 6, status: 'Warehouse Pledge Active (₹1.8L)' },
                { name: 'Ramesh Patil', village: 'Malegaon', crop: 'Tomato', acres: 4, status: 'Prescription Verified Today' },
                { name: 'Babanrao More', village: 'Hol', crop: 'Soybean', acres: 8, status: 'Warehouse Pledge Active (₹1.4L)' },
                { name: 'Kishor Pawar', village: 'Bhigwan', crop: 'Wheat', acres: 5, status: 'Sell/Hold Alert Subscribed' },
                { name: 'Anusaya Shinde', village: 'Baramati', crop: 'Pomegranate', acres: 3, status: 'Post-Pruning Spray Completed' },
                { name: 'Vikas Kadam', village: 'Supe', crop: 'Sugarcane', acres: 10, status: 'Drip Nutrient Schedule' }
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{f.name}</p>
                  <p className="text-xs text-slate-500">{f.village} · {f.acres} Acres ({f.crop})</p>
                  <span className="mt-3 inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEALER TOOLS */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tool 1: QR Onboarding Poster */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                In-Store Farmer Onboarding Poster
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Print and hang this QR poster in your shop. When farmers scan with WhatsApp, they are instantly linked to your Kendra for voice diagnostics and loan commissions.
              </p>

              <div className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl bg-white p-2 shadow-md">
                  <div className="h-full w-full rounded-lg bg-slate-900 p-2 text-white flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="h-6 w-6 border-2 border-white rounded-xs"></div>
                      <div className="h-6 w-6 border-2 border-white rounded-xs"></div>
                    </div>
                    <p className="text-[9px] font-mono text-center">FARMDIRECT-KENDRA-8842</p>
                    <div className="flex justify-between">
                      <div className="h-6 w-6 border-2 border-white rounded-xs"></div>
                      <div className="h-6 w-6 bg-lime-400 rounded-xs"></div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Scan on WhatsApp for Free Voice Diagnostic
                </p>
                <p className="text-[11px] text-slate-500">Linked to Shri Ganesh Krishi Seva Kendra</p>
              </div>

              <div className="mt-5 flex gap-3">
                <Button
                  onClick={() => triggerToast('Poster sent to your connected wireless printer!')}
                  className="w-full bg-emerald-700 font-bold text-white hover:bg-emerald-800"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Shop Poster
                </Button>
                <Button
                  variant="outline"
                  onClick={() => triggerToast('Referral link copied to clipboard!')}
                  className="w-full"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy WhatsApp Link
                </Button>
              </div>
            </div>

            {/* Tool 2: Dealer Value Proposition Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-lime-800 dark:bg-slate-800 dark:text-lime-400">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                How FarmDirect Digitally Arms You
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Traditional platforms try to cut you out. FarmDirect makes you a digital financial services & agronomy hub.
              </p>

              <div className="mt-4 space-y-3">
                {[
                  {
                    title: 'New Revenue Streams',
                    desc: 'Earn 1.5-2% on warehouse pledge loans without deploying any of your own capital.'
                  },
                  {
                    title: 'Protection from Bad Credit',
                    desc: 'Farmers get bank loans against warehouse produce instead of asking you for input credit on book.'
                  },
                  {
                    title: 'B.Sc Agri Authority',
                    desc: 'Your professional certification validates AI suggestions, cementing your trusted standing in the village.'
                  },
                  {
                    title: 'Higher Stock Turnover',
                    desc: 'When AI recommends a formulation, the farmer buys from your stock with transparent margins.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
