'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Truck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function CartDrawer() {
  const router = useRouter()
  const {
    items,
    totalItems,
    subtotal,
    originalSubtotal,
    couponDiscount,
    appliedCoupon,
    deliveryFee,
    gst,
    finalTotal,
    savings,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [pincode, setPincode] = useState('413115')
  const [isPincodeChecking, setIsPincodeChecking] = useState(false)
  const [pincodeVerified, setPincodeVerified] = useState(true)

  if (!isCartOpen) return null

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput
    if (!code) return
    const res = applyCoupon(code)
    setCouponFeedback(res)
    if (res.success) {
      setCouponInput('')
    }
  }

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault()
    setIsPincodeChecking(true)
    setTimeout(() => {
      setIsPincodeChecking(false)
      setPincodeVerified(true)
    }, 400)
  }

  const handleProceedToCheckout = () => {
    closeCart()
    router.push('/store/checkout')
  }

  const freeDeliveryThreshold = 499
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-slate-900 sm:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-950 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800/80 text-lime-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Review Your Cart</h2>
              <p className="text-xs text-emerald-300">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} · Kisan Agri Mart
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-800 hover:text-white"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free delivery progress alert */}
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          {amountNeededForFreeDelivery === 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>You have unlocked <strong>FREE Kisan Express Delivery</strong>!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Add ₹{amountNeededForFreeDelivery.toLocaleString('en-IN')} more for <strong>FREE Delivery</strong></span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Delivery PIN Code check */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Deliver to: <strong>PIN {pincode}</strong></span>
          </div>
          <button
            onClick={() => {
              const entered = prompt('Enter 6-digit delivery PIN code:', pincode)
              if (entered && entered.trim().length === 6) setPincode(entered.trim())
            }}
            className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Change
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-slate-800">
                <ShoppingBag className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Your Cart is Empty</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Explore our certified fertilizers, bio-stimulants, and crop protection inputs.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-800"
              >
                Browse Fertile Store
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => {
                const itemTotal = product.price * quantity
                const originalItemTotal = product.originalPrice * quantity

                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-800/80"
                  >
                    {/* Visual icon/thumbnail */}
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Sparkles className="h-6 w-6" />
                      <span className="mt-1 text-[10px] font-bold text-emerald-900 dark:text-emerald-200">{product.unit}</span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/store/product/${product.id}`}
                            onClick={closeCart}
                            className="text-sm font-bold text-slate-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400 line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Remove from cart"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {product.type} · <span className="text-emerald-600 font-medium">{product.badge}</span>
                        </p>
                      </div>

                      {/* Pricing & Quantity Stepper */}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                          {originalItemTotal > itemTotal && (
                            <span className="ml-1.5 text-xs text-slate-400 line-through">
                              ₹{originalItemTotal.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Promo Coupon Section */}
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <Tag className="h-4 w-4 text-emerald-600" />
                  <span>Agri Coupon / Farmer Discount</span>
                </div>

                {appliedCoupon ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-800">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ {appliedCoupon} Applied (-₹{couponDiscount.toLocaleString('en-IN')})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. KISAN10 or FERTILE20"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 uppercase dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-900"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponFeedback && (
                  <p
                    className={`mt-1.5 text-[11px] ${
                      couponFeedback.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}

                {/* Quick coupon suggestions */}
                {!appliedCoupon && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Suggested:</span>
                    <button
                      onClick={() => handleApplyCoupon('KISAN10')}
                      className="rounded border border-emerald-400 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
                    >
                      KISAN10 (10% OFF)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon('FERTILE20')}
                      className="rounded border border-emerald-400 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300"
                    >
                      FERTILE20 (20% OFF)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Summary & Proceed Button */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total M.R.P</span>
                <span className="line-through">₹{originalSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Agri Store Price</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Savings ({appliedCoupon})</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated GST (5% FCO Fertilizer)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Delivery to Farm
                </span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {/* Total Row */}
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                <span>Final Order Amount:</span>
                <span className="text-xl text-emerald-700 dark:text-emerald-400">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {savings > 0 && (
                <div className="rounded-md bg-emerald-50 px-2 py-1 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  🎉 Total Savings: ₹{savings.toLocaleString('en-IN')} on this order
                </div>
              )}
            </div>

            {/* Amazon-style Proceed to Buy Button */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-base font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-[0.99]"
              >
                <span>Proceed to Buy ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Genuine Agri-Inputs
                </span>
                <span>·</span>
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
