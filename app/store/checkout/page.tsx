'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Coins
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'
import { SAMPLE_FARM_ADDRESSES } from '@/lib/store-data'
import { normalizeAndValidatePhone, validatePinCode } from '@/lib/validation'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
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
    farmerCoins,
    redeemCoins,
    coinsDiscount,
    toggleRedeemCoins,
    clearCart
  } = useCart()

  // Steps state
  const [selectedAddressId, setSelectedAddressId] = useState(SAMPLE_FARM_ADDRESSES[0].id)
  const [addresses, setAddresses] = useState(SAMPLE_FARM_ADDRESSES)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    village: '',
    district: user?.district || '',
    state: user?.state || 'Maharashtra',
    pincode: '',
    addressType: 'Farm Gate / Land',
    instructions: ''
  })

  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'priority'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'kcc' | 'card' | 'netbanking'>('cod')
  const [upiId, setUpiId] = useState('')
  const [kccNumber, setKccNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0]

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.village) {
      showError('Please fill out all required address fields.')
      return
    }

    const phoneVal = normalizeAndValidatePhone(newAddress.phone)
    if (!phoneVal.valid) {
      showError(phoneVal.error || 'Invalid phone number.')
      return
    }

    const pinVal = validatePinCode(newAddress.pincode)
    if (!pinVal.valid) {
      showError(pinVal.error || 'Invalid 6-digit PIN code.')
      return
    }

    const created = {
      id: `addr-${Date.now()}`,
      isDefault: false,
      fullName: newAddress.fullName.trim(),
      phone: phoneVal.normalized,
      addressType: newAddress.addressType,
      street: newAddress.street.trim(),
      village: newAddress.village.trim(),
      district: newAddress.district.trim() || 'Pune',
      state: newAddress.state,
      pincode: pinVal.normalized,
      instructions: newAddress.instructions.trim()
    }

    setAddresses((prev) => [created, ...prev])
    setSelectedAddressId(created.id)
    setShowNewAddressForm(false)
    success('New farm gate delivery address saved!')
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showError('Please select or add a delivery address.')
      return
    }

    const phoneVal = normalizeAndValidatePhone(selectedAddress.phone)
    if (!phoneVal.valid) {
      showError(phoneVal.error || 'Invalid recipient phone number.')
      return
    }

    if (selectedAddress.pincode) {
      const pinVal = validatePinCode(selectedAddress.pincode)
      if (!pinVal.valid) {
        showError(pinVal.error || 'Invalid delivery PIN code.')
        return
      }
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Execute ACID order placement via API
      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: selectedAddress.fullName,
          userPhone: phoneVal.normalized,
          address: selectedAddress,
          deliverySpeed,
          paymentMethod,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          couponCode: appliedCoupon,
          couponDiscount,
          coinsUsed: redeemCoins ? (user?.kisanCoins || farmerCoins) : 0
        })
      })

      const data = await res.json()

      if (data.success && data.order) {
        clearCart()
        success(`Order #${data.order.orderId} booked successfully!`)
        router.push(
          `/store/order-success?orderId=${data.order.orderId}&method=${paymentMethod}&coinsEarned=${data.order.coinsEarned}`
        )
      } else {
        setErrorMessage(data.error || 'Failed to place order. Please check inventory.')
        showError(data.error || 'Order placement failed')
        setIsSubmitting(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while placing order.')
      showError('Network error while placing order.')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-slate-800">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h1>
          <p className="mt-2 text-sm text-slate-500">Add fertilizer, bio-care or soil inputs before proceeding to checkout.</p>
          <Link
            href="/store"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Fertile Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 dark:bg-slate-950">
      {/* Amazon-style Secure Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/store" className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">FarmDirect Store</span>
          </Link>

          <div className="flex items-center gap-2 text-slate-800 dark:text-white">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span className="text-base font-bold tracking-tight">Secure Agri-Checkout</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Checkout Steps (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Step 1: Delivery Address */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select Farm Delivery Address</h2>
                </div>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Farm Address
                  </button>
                )}
              </div>

              {/* Address options */}
              {!showNewAddressForm ? (
                <div className="mt-4 space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id
                    return (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{addr.fullName}</span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            {addr.street}, {addr.village}, {addr.district}, {addr.state} -{' '}
                            <strong>{addr.pincode}</strong>
                          </p>
                          <p className="mt-0.5 text-slate-500">Phone: {addr.phone}</p>
                          {addr.instructions && (
                            <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-400">
                              Note for driver: {addr.instructions}
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              ) : (
                /* Add New Address Form */
                <form onSubmit={handleAddNewAddress} className="mt-4 space-y-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/30 p-4 dark:border-emerald-800 dark:bg-slate-850">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Village / Farm Address</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Farmer / Receiver Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Patil"
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">10-Digit Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="e.g. 9822012345"
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="6 digits PIN"
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Address Type</label>
                      <select
                        value={newAddress.addressType}
                        onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="Farm Gate / Land">Farm Gate / Land</option>
                        <option value="Village Home / Kendra">Village Home / Kendra</option>
                        <option value="Agri Warehouse / Godown">Agri Warehouse / Godown</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Plot No. / Gat No. / Street Details *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="e.g. Gat No. 204, Near Canal Siphon"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Village / Town *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.village}
                        onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
                        placeholder="e.g. Baramati Rural"
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">District *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        placeholder="e.g. Pune"
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Delivery Instructions (Tractor access, landmark, etc.)</label>
                    <input
                      type="text"
                      value={newAddress.instructions}
                      onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
                      placeholder="e.g. Tar road ends at temple, take left mud track"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      Save & Deliver to This Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Step 2: Delivery Speed & Shipping Slot */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                  2
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose Delivery Speed</h2>
              </div>

              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    deliverySpeed === 'standard'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliverySpeed === 'standard'}
                    onChange={() => setDeliverySpeed('standard')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Standard Kisan Express (2 - 3 Days)
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">FREE</span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Dispatched directly from regional agricultural hub with verified cold/dry transport.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    deliverySpeed === 'priority'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliverySpeed === 'priority'}
                    onChange={() => setDeliverySpeed('priority')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Priority Next-Day Agri-Drop (Tomorrow by 2 PM)
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">₹99</span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Dedicated vehicle drop for emergency pest or disease outbreaks requiring urgent spray.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select Payment Method</h2>
                  <p className="text-xs text-slate-500">Tailored for farmers and agri-producers across India</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Cash on Delivery (Pay upon arrival at farm)
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Most Popular
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Inspect products, check batch numbers and expiry dates at your farm gate, then pay cash or UPI to the delivery driver.
                    </p>
                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        UPI (PhonePe / Google Pay / Paytm / BHIM)
                      </span>
                      <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        Instant 0% Fee
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Scan QR or enter UPI ID for instantaneous order confirmation.
                    </p>
                    {paymentMethod === 'upi' && (
                      <div className="mt-3 flex max-w-sm gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. farmer@okhdfcbank or 9822012345@ybl"
                          className="flex-1 rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => alert('UPI ID verified!')}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                {/* Kisan Credit Card */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    paymentMethod === 'kcc'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'kcc'}
                    onChange={() => setPaymentMethod('kcc')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Kisan Credit Card (KCC) / RuPay Agri Card
                      </span>
                      <span className="rounded bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-900 dark:bg-lime-950 dark:text-lime-300">
                        Govt Subsidized 4% Int.
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      Charge directly to your agricultural credit line linked with SBI, Bank of Baroda, PNB, or DCCB bank.
                    </p>
                    {paymentMethod === 'kcc' && (
                      <div className="mt-3 max-w-sm space-y-2">
                        <input
                          type="text"
                          value={kccNumber}
                          onChange={(e) => setKccNumber(e.target.value)}
                          placeholder="16-Digit KCC / RuPay Card Number"
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-1/2 rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="CVV"
                            className="w-1/2 rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Net Banking */}
                <label
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    paymentMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Net Banking (SBI / HDFC / ICICI / PNB / Gramin Banks)
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">Support for all major nationalized and rural regional banks.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Step 4: Review Items */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                    4
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Review Ordered Items ({totalItems})
                  </h2>
                </div>
                <Link
                  href="/store"
                  className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Edit in Cart
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: {quantity} · Pack: {product.unit} · {product.badge}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-slate-400 line-through">
                        ₹{(product.originalPrice * quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Amazon Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {errorMessage && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Big Amazon-style Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-base font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    Confirming Farm Order...
                  </span>
                ) : (
                  <span>Place Your Order and Pay</span>
                )}
              </button>

              <p className="mt-2 text-center text-[11px] text-slate-500">
                By placing your order, you agree to FarmDirect terms of agricultural supply & label usage conditions.
              </p>

              {/* Flipkart SuperCoins style: Kisan Coins Redemption Box */}
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <span>Redeem Kisan Coins</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    Balance: {farmerCoins}
                  </span>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={redeemCoins}
                    onChange={toggleRedeemCoins}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Use {Math.min(farmerCoins, subtotal)} coins for ₹{Math.min(farmerCoins, subtotal)} OFF
                  </span>
                </label>
              </div>

              <hr className="my-4 border-slate-200 dark:border-slate-800" />

              {/* Price Details */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Order Summary</h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items ({totalItems}):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Speed ({deliverySpeed === 'priority' ? 'Priority' : 'Standard'}):</span>
                  <span>{deliverySpeed === 'priority' ? '₹99' : <strong className="text-emerald-600">FREE</strong>}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Savings ({appliedCoupon}):</span>
                    <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {coinsDiscount > 0 && (
                  <div className="flex justify-between font-semibold text-amber-700 dark:text-amber-400">
                    <span>Kisan Coins Discount:</span>
                    <span>- ₹{coinsDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated Fertilizer GST (5% FCO):</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                <div className="flex items-baseline justify-between pt-1 text-base font-bold text-slate-900 dark:text-white">
                  <span>Order Total:</span>
                  <span className="text-xl text-emerald-700 dark:text-emerald-400">
                    ₹{(finalTotal + (deliverySpeed === 'priority' ? 99 : 0)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-1 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  🌾 You will earn {Math.floor(finalTotal / 20)} Kisan Coins on this order!
                </div>

                {savings > 0 && (
                  <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    🎉 Total Farm Savings: ₹{savings.toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              <hr className="my-4 border-slate-200 dark:border-slate-800" />

              {/* Delivery Destination Snapshot */}
              <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Delivering to {selectedAddress.fullName}:</span>
                </div>
                <p className="mt-1 text-slate-500">
                  {selectedAddress.village}, PIN {selectedAddress.pincode}
                </p>
                <p className="mt-1 text-emerald-700 font-medium dark:text-emerald-400">
                  {deliverySpeed === 'priority' ? '⚡ Tomorrow by 2 PM' : '🚚 In 2 - 3 Days (Standard Express)'}
                </p>
              </div>

              {/* Guarantees */}
              <div className="mt-4 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% Genuine Certified Batch Tested Inputs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Govt Subsidy Compliant Tax Invoice provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-600" />
                  <span>Free Agri-Doctor Consultation on application</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
