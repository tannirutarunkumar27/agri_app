'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle,
  Truck,
  Package,
  Calendar,
  PhoneCall,
  Download,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Coins
} from 'lucide-react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'FARM-849204'
  const paymentMethod = searchParams.get('method') || 'cod'
  const coinsEarned = searchParams.get('coinsEarned') || '45'

  const paymentLabels: Record<string, string> = {
    cod: 'Cash on Delivery (Pay on arrival at farm gate)',
    upi: 'UPI (Paid Online)',
    kcc: 'Kisan Credit Card (Agri Credit Line)',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking'
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Success Card */}
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 p-8 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-lime-300 backdrop-blur-xs">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Order Placed Successfully!</h1>
            <p className="mt-2 text-sm text-emerald-100">
              Thank you for ordering with FarmOS Fertile Store. Your agricultural inputs are being prepared.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/60 px-4 py-1.5 font-mono text-xs font-bold text-lime-300">
                <span>Order ID: {orderId}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold text-slate-950 shadow-xs">
                <Coins className="h-4 w-4" />
                <span>+ {coinsEarned} Kisan Coins Added!</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Amazon-style Live Tracking Progress */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-850">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Estimated Farm Delivery: Thursday by 2:00 PM</span>
              </h2>

              <div className="mt-6 relative">
                {/* Progress bar line */}
                <div className="absolute left-6 top-3 h-0.5 w-[calc(100%-48px)] bg-slate-200 dark:bg-slate-700" />
                <div className="absolute left-6 top-3 h-0.5 w-1/3 bg-emerald-600" />

                <div className="relative flex justify-between text-center text-xs">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="mt-2 font-bold text-slate-900 dark:text-white">Ordered</span>
                    <span className="text-[10px] text-slate-500">Today</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-600 shadow-xs dark:bg-slate-800">
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <span className="mt-2 font-bold text-slate-900 dark:text-white">Packed & Tested</span>
                    <span className="text-[10px] text-slate-500">In Progress</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      <Truck className="h-3.5 w-3.5" />
                    </div>
                    <span className="mt-2 font-medium text-slate-600 dark:text-slate-400">Dispatched</span>
                    <span className="text-[10px] text-slate-400">Tomorrow</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span className="mt-2 font-medium text-slate-600 dark:text-slate-400">Farm Gate</span>
                    <span className="text-[10px] text-slate-400">Thursday</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details & Delivery Info */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Address</p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Ramesh Patil</p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  Plot No. 14, Gat 204, Near Canal Siphon, Baramati Rural, Pune, Maharashtra - 413115
                </p>
                <p className="mt-1 text-xs text-slate-500">Mobile: +91 98220 12345</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Information</p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {paymentLabels[paymentMethod] || 'Cash on Delivery'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {paymentMethod === 'cod'
                    ? 'Please keep cash or UPI ready when delivery vehicle arrives.'
                    : 'Transaction confirmed via encrypted payment gateway.'}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ShieldCheck className="h-4 w-4" /> 100% Genuine Agri Guarantee
                </div>
              </div>
            </div>

            {/* Free Agri-Doctor Advisory Banner */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lime-300">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Free Agronomist Spray Consultation Included</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Need exact dosage calculation per spray pump or drip timing? Our specialists are ready.
                  </p>
                </div>
              </div>
              <a
                href="tel:1800123456"
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900"
              >
                Call Toll-Free
              </a>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" /> Download GST Tax Invoice
              </button>

              <div className="flex gap-2">
                <Link
                  href="/store"
                  className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-center text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                >
                  Back to Fertile Store
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-3 text-center text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <span>FarmOS Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-600">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
