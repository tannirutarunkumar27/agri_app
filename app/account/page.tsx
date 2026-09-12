'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Package,
  MapPin,
  Heart,
  Coins,
  Sprout,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'

export default function AccountPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { success, error: showError } = useToast()

  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    street: '',
    village: '',
    district: '',
    pincode: '',
    instructions: ''
  })

  useEffect(() => {
    if (user?.phone) {
      fetchAddresses()
    }
  }, [user?.phone])

  const fetchAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      if (data.success && data.addresses) {
        setAddresses(data.addresses)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddr,
          state: 'Maharashtra',
          addressType: 'Farm Gate / Land'
        })
      })
      const data = await res.json()
      if (data.success) {
        success('New farm delivery address added!')
        setShowAddAddress(false)
        fetchAddresses()
        setNewAddr({
          fullName: '',
          phone: '',
          street: '',
          village: '',
          district: '',
          pincode: '',
          instructions: ''
        })
      } else {
        showError(data.error || 'Failed to add address')
      }
    } catch {
      showError('Network error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" /> Farmer Account & Farm Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your land profile, Kisan Coins wallet & delivery addresses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/store/orders"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              <Package className="h-3.5 w-3.5 text-emerald-600" /> My Orders
            </Link>
            {user && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        {/* Profile Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/30 border border-emerald-400/40 text-2xl font-black text-emerald-100">
                {user?.name ? user.name.charAt(0) : 'K'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{user?.name || 'Guest Farmer (Ramesh Patil)'}</h2>
                  <Badge variant="success" className="text-[10px]">
                    Verified Farmer
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-emerald-200/90">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> +91 {user?.phone || '98220 12345'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {user?.district || 'Pune'}, {user?.state || 'Maharashtra'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Sprout className="h-3.5 w-3.5" /> {user?.farmSizeAcres || 4.5} Acres Land
                  </span>
                </div>
              </div>
            </div>

            {/* Kisan Coins Wallet Card */}
            <div className="rounded-2xl border border-amber-400/30 bg-amber-950/50 p-5 backdrop-blur-md text-right min-w-56">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-300">
                <Coins className="h-4 w-4 text-amber-400" /> Kisan Coins Wallet
              </div>
              <div className="mt-1 text-3xl font-black text-amber-300">
                {user?.kisanCoins ?? 250} <span className="text-sm font-normal text-amber-200">Coins</span>
              </div>
              <p className="mt-0.5 text-[11px] text-amber-200/70">1 Coin = ₹1 instant checkout cash discount</p>
              <Link
                href="/store"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:underline"
              >
                Redeem in Fertile Store <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Column Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/store/orders"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Order History</h3>
                <p className="text-xs text-slate-500">Track shipments & invoices</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/store"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-slate-800 dark:text-amber-400">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fertile Store</h3>
                <p className="text-xs text-slate-500">FCO certified fertilizers</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/store/compare"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Input Comparison</h3>
                <p className="text-xs text-slate-500">Compare NPK ratios & dosages</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Address Book Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> Saved Farm-Gate Delivery Addresses
              </h3>
              <p className="text-xs text-slate-500">Delivery tractor/van drops directly at these locations</p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add New Address
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form onSubmit={handleCreateAddress} className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                New Farm Address Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Recipient Full Name"
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  required
                  type="tel"
                  placeholder="10-digit Phone Number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  required
                  placeholder="Gat No. / Plot / Road"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  required
                  placeholder="Village / Post"
                  value={newAddr.village}
                  onChange={(e) => setNewAddr({ ...newAddr, village: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  required
                  placeholder="District (e.g. Pune, Nashik)"
                  value={newAddr.district}
                  onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  required
                  placeholder="6-digit PIN Code"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <input
                placeholder="Driver directions (e.g. Near canal bridge, call 30 mins before)"
                value={newAddr.instructions}
                onChange={(e) => setNewAddr({ ...newAddr, instructions: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-xl border border-slate-200 p-4 text-xs space-y-1 dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{addr.full_name || addr.fullName}</span>
                    <Badge variant={addr.is_default || addr.isDefault ? 'success' : 'neutral'} className="text-[10px]">
                      {addr.address_type || addr.addressType || 'Farm Gate'}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{addr.street}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {addr.village}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <p className="text-slate-500">Phone: {addr.phone}</p>
                  {addr.instructions && (
                    <p className="text-amber-700 dark:text-amber-400 italic pt-1">Note: {addr.instructions}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-slate-500 text-xs">
                Default addresses loaded from farm profile. You can add more above.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
