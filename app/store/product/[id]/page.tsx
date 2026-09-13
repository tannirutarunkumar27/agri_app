'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Leaf,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Lock,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Heart,
  CreditCard,
  Tag,
  Coins,
  BookOpen,
  Clock,
  Droplets,
  Bug,
  FlaskConical,
  Sprout
} from 'lucide-react'
import { PRODUCTS, Product, CROP_PRODUCT_MAP } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'
import CartDrawer from '@/components/cart-drawer'
import AcreageCalculator from '@/components/acreage-calculator'
import FrequentlyBoughtTogether from '@/components/frequently-bought-together'
import ProductQASection from '@/components/product-qa-section'
import FarmerReviewsSection from '@/components/farmer-reviews-section'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const productId = unwrappedParams.id
  const router = useRouter()
  const { cart, totalItems, addToCart, openCart, wishlist, toggleWishlist, farmerCoins } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState<'specs' | 'dosage' | 'howto'>('specs')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#how-to-use') {
      setSelectedTab('howto')
      const el = document.getElementById('how-to-use')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
  const isWishlisted = wishlist.includes(product.id)

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
    openCart()
  }

  const handleBuyNow = () => {
    addToCart(product.id, quantity)
    router.push('/store/checkout')
  }

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  )

  const coinsEarned = Math.floor(product.price / 20)
  const monthlyEmi = Math.round(product.price / 3)

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      <CartDrawer />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Fertile Store
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>{farmerCoins} Kisan Coins Balance</span>
            </div>

            <button
              onClick={openCart}
              className="flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
            >
              <ShoppingCart className="h-4 w-4 text-lime-300" />
              <span>Review Cart</span>
              <span className="rounded-full bg-lime-400 px-1.5 py-0.2 text-[11px] font-black text-emerald-950">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-slate-500 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Link href="/store" className="hover:text-emerald-700">
            Fertile Store
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{product.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900 line-clamp-1 dark:text-white">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Col 1: Product Visuals (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white shadow-md dark:bg-slate-800">
                    <Leaf className="h-20 w-20 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                {/* Badge top-left */}
                <span className="absolute left-4 top-4 rounded-full border border-emerald-300 bg-white/90 px-3 py-1 text-xs font-bold text-emerald-900 shadow-xs dark:bg-slate-800 dark:text-emerald-200">
                  {product.badge}
                </span>

                {/* Wishlist Heart Button (Flipkart / Amazon style) */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 dark:bg-slate-800 ${
                    isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Seasonal Crop Wishlist'}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <span className="absolute bottom-4 right-4 rounded-lg bg-emerald-900 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  Pack: {product.unit}
                </span>
              </div>

              {/* Quality & Gov Certification Badges */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <Award className="h-5 w-5 text-emerald-600" />
                  <span className="mt-1 font-bold text-slate-900 dark:text-white">Govt FCO Tested</span>
                  <span className="text-[10px] text-slate-500">Purity guarantee</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <RotateCcw className="h-5 w-5 text-emerald-600" />
                  <span className="mt-1 font-bold text-slate-900 dark:text-white">10-Day Policy</span>
                  <span className="text-[10px] text-slate-500">Damage replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Center Details (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {product.brand}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Category: <strong>{product.category}</strong> · Suitable for:{' '}
                <strong className="text-slate-700 dark:text-slate-300">{product.crop}</strong>
              </p>

              {/* Ratings */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <span>{product.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs text-slate-500">
                  {product.reviewCount.toLocaleString('en-IN')} verified farmer ratings
                </span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Amazon-style Price Block */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-rose-600">-{discountPercent}%</span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                M.R.P: <span className="line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span> (Save ₹
                {(product.originalPrice - product.price).toLocaleString('en-IN')})
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Inclusive of 5% Fertilizer GST · FCO Registered Batch
              </p>

              {/* Flipkart SuperCoins style reward banner */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <Coins className="h-4 w-4 text-amber-600" />
                <span>
                  <strong>Earn {coinsEarned} Kisan Coins</strong> on this order (Redeemable for ₹{coinsEarned} OFF on next purchase)
                </span>
              </div>

              {/* Kisan Credit Card 0% EMI Breakdown */}
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 text-xs text-slate-700 dark:bg-slate-850 dark:text-slate-300">
                <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>
                  Kisan Credit Card EMI: <strong>₹{monthlyEmi}/month</strong> for 3 months at 0% interest
                </span>
              </div>
            </div>

            {/* Highlights List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Highlights</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabs for Technical Specs / Dosage / How to Use */}
            <div id="how-to-use" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 scroll-mt-24">
              <div className="flex gap-1 border-b border-slate-200 text-xs font-bold dark:border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setSelectedTab('specs')}
                  className={`whitespace-nowrap pb-2.5 pr-4 transition ${
                    selectedTab === 'specs'
                      ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Technical Specifications
                </button>
                <button
                  onClick={() => setSelectedTab('dosage')}
                  className={`whitespace-nowrap pb-2.5 px-4 transition ${
                    selectedTab === 'dosage'
                      ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Application & Safety Guide
                </button>
                {product.usageGuide && (
                  <button
                    onClick={() => setSelectedTab('howto')}
                    className={`whitespace-nowrap pb-2.5 pl-4 transition flex items-center gap-1 ${
                      selectedTab === 'howto'
                        ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-3 w-3" />
                    How to Use
                  </button>
                )}
              </div>

              {selectedTab === 'specs' && (
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-500">Active Composition</span>
                    <span className="font-bold text-slate-900 text-right dark:text-white">{product.composition}</span>
                  </div>
                  {product.npkRatio && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-500">NPK Grade</span>
                      <span className="font-bold text-slate-900 dark:text-white">{product.npkRatio}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-500">Recommended Crops</span>
                    <span className="font-bold text-slate-900 text-right dark:text-white">
                      {product.suitableCrops.join(', ')}
                    </span>
                  </div>
                  {product.usageGuide && (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-500">Pre-Harvest Interval</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {product.usageGuide.phiDays === 0 ? 'No restriction' : `${product.usageGuide.phiDays} days`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-500">Re-entry Period</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {product.usageGuide.reentryHours === 0 ? 'Immediate' : `${product.usageGuide.reentryHours} hours`}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-500">Authorized Seller</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{product.seller}</span>
                  </div>
                </div>
              )}

              {selectedTab === 'dosage' && (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <p className="font-bold">Recommended Acre Dosage:</p>
                    <p className="mt-0.5">{product.dosagePerAcre}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    <p className="font-bold">Application Timing & Method:</p>
                    <p className="mt-0.5">{product.applicationMethod}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <p className="flex items-center gap-1 font-bold">
                      <AlertCircle className="h-4 w-4" /> Safety & Tank-Mix Precaution:
                    </p>
                    <p className="mt-0.5">{product.safetyAdvice}</p>
                  </div>
                </div>
              )}

              {selectedTab === 'howto' && product.usageGuide && (
                <div className="mt-4 space-y-4 text-xs">
                  {/* Best Time to Apply */}
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-300">Best Time to Apply</p>
                      <p className="mt-0.5 text-emerald-800 dark:text-emerald-200">{product.usageGuide.bestTime}</p>
                    </div>
                  </div>

                  {/* Pests / Problems Controlled */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Bug className="h-4 w-4 text-red-500" />
                      Pests / Diseases / Deficiencies Controlled:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.usageGuide.pestsTargeted.map((pest, i) => (
                        <span key={i} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60">
                          {pest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-step Guide */}
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <FlaskConical className="h-4 w-4 text-blue-500" />
                      Step-by-Step Usage Guide:
                    </p>
                    <div className="space-y-3">
                      {product.usageGuide.preparationSteps.map((step) => (
                        <div key={step.step} className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                            {step.step}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{step.title}</p>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-400">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Warning */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <p className="flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Important Warning:
                    </p>
                    <p className="mt-1 text-rose-800 dark:text-rose-200">{product.usageGuide.warningNote}</p>
                  </div>

                  {/* PHI and Re-entry */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pre-Harvest Interval (PHI)</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                        {product.usageGuide.phiDays === 0 ? 'None' : `${product.usageGuide.phiDays} Days`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Re-Entry to Field</p>
                      <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                        {product.usageGuide.reentryHours === 0 ? 'Immediate' : `${product.usageGuide.reentryHours} Hours`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Amazon Buy Box (3 cols) */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 rounded-2xl border border-slate-300 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500"> / {product.unit}</span>

              {/* Delivery info */}
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-emerald-600">FREE Delivery</strong> on orders over ₹499.
                </p>
                <p className="mt-1 flex items-center gap-1 text-slate-500">
                  <Truck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Arriving <strong>{product.deliveryDays}</strong>
                  </span>
                </p>
              </div>

              {/* Stock Status */}
              <div className="mt-3">
                {product.inStock ? (
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    In Stock (Only {product.stockCount} left)
                  </span>
                ) : (
                  <span className="text-sm font-bold text-rose-600">Currently Out of Stock</span>
                )}
              </div>

              <div className="mt-1 text-[11px] text-slate-500">
                Ships from: <strong>FarmDirect Regional Hub</strong>
                <br />
                Sold by: <strong>{product.seller}</strong>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800">
                <span className="pl-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="rounded-lg p-1 text-slate-600 hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                    className="rounded-lg p-1 text-slate-600 hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-amber-300 active:scale-95"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                  <Zap className="h-4 w-4 fill-slate-950" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Secure Agri-Transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cash on Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Free Spray Guidance Hotline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BigHaat / AgroStar Feature: Acreage Dosage Calculator */}
        <section className="mt-12">
          <AcreageCalculator product={product} />
        </section>

        {/* Amazon Feature: Frequently Bought Together Combo */}
        <section className="mt-8">
          <FrequentlyBoughtTogether currentProduct={product} />
        </section>

        {/* Amazon Feature: Searchable Customer Agricultural Q&A with real DB */}
        <section className="mt-8">
          <ProductQASection productId={product.id} />
        </section>

        {/* Amazon & Flipkart Feature: Star Rating Filter & Verified Farmer Reviews with real DB */}
        <section className="mt-8">
          <FarmerReviewsSection productId={product.id} />
        </section>
      </main>
    </div>
  )
}
