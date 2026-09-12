'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Coins,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  id: number
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderRecord {
  id: string
  user_name: string
  user_phone: string
  address: any
  delivery_speed: string
  payment_method: string
  subtotal: number
  delivery_fee: number
  discount: number
  gst: number
  coins_used: number
  coins_earned: number
  final_total: number
  status: string
  created_at: string
  items: OrderItem[]
  statusHistory?: Array<{ status: string; notes: string; updated_at: string }>
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const targetId = searchParams.get('id')
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { success } = useToast()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const phoneParam = user?.phone ? `?phone=${user.phone}` : ''
      const res = await fetch(`/api/store/orders${phoneParam}`)
      const data = await res.json()
      if (data.success && data.orders) {
        setOrders(data.orders)
        // If a specific ID was passed, auto-expand it
        if (targetId) {
          setExpandedOrders((prev) => ({ ...prev, [targetId]: true }))
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user?.phone, targetId])

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleReorder = (item: OrderItem) => {
    addToCart(item.product_id, item.quantity)
    success(`Added ${item.product_name} (${item.quantity}x) to your cart!`)
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      o.id.toLowerCase().includes(q) ||
      o.user_name.toLowerCase().includes(q) ||
      o.user_phone.includes(q) ||
      o.items.some((i) => i.product_name.toLowerCase().includes(q))
    )
  })

  const getStatusStepIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 1
      case 'PACKED':
        return 2
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return 3
      case 'OUT_FOR_DELIVERY':
        return 4
      case 'DELIVERED':
        return 5
      default:
        return 1
    }
  }

  const steps = [
    { label: 'Order Confirmed', desc: 'ACID Booked' },
    { label: 'Quality Checked', desc: 'FCO Certified' },
    { label: 'Dispatched', desc: 'From Hub' },
    { label: 'Out for Delivery', desc: 'Local Agri-Van' },
    { label: 'Delivered', desc: 'At Farm Gate' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" /> My Orders & Delivery Tracking
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track live dispatch, farm-gate deliveries & past invoices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              href="/store"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. FARM-123456), product name, or mobile..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="h-6 w-1/4 bg-slate-200 rounded dark:bg-slate-800 mb-4" />
                <div className="h-4 w-1/2 bg-slate-200 rounded dark:bg-slate-800 mb-2" />
                <div className="h-20 w-full bg-slate-100 rounded dark:bg-slate-800/50" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Package className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Orders Found</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try a different keyword.`
                : 'You have not placed any fertilizer or input orders yet.'}
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-900/20 transition"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Certified Fertilizers
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id]
              const currentStep = getStatusStepIndex(order.status)
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <div
                  key={order.id}
                  id={order.id}
                  className={`rounded-2xl border transition-all ${
                    order.id === targetId
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800'
                  } bg-white dark:bg-slate-900 overflow-hidden shadow-sm`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/50">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Order Placed</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{orderDate}</p>
                      </div>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Paid</span>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{order.final_total.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ship To</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                          {order.user_name} ({order.user_phone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Order #</span>
                        <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{order.id}</p>
                      </div>
                      <Badge variant="default" className="text-xs uppercase">
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Pipeline Stepper */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="relative">
                      <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
                        {steps.map((step, idx) => {
                          const stepNum = idx + 1
                          const isDone = stepNum <= currentStep
                          const isCurrent = stepNum === currentStep

                          return (
                            <div key={step.label} className="flex flex-col sm:items-center text-left sm:text-center">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                              </div>
                              <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
                                {step.label}
                              </p>
                              <span className="text-[11px] text-slate-500">{step.desc}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Delivery van banner */}
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Dispatch Speed:</strong>{' '}
                        {order.delivery_speed === 'priority'
                          ? 'Express 24-48 Hour Agri-Van Priority Delivery'
                          : 'Standard Farm-Gate Delivery (2-3 Days)'}{' '}
                        • Payment Method: <strong>{order.payment_method.toUpperCase()}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="p-6">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold text-lg dark:bg-emerald-950/60 dark:text-emerald-300">
                              {item.product_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.product_name}
                              </h4>
                              <p className="text-xs text-slate-500">
                                Qty: <strong>{item.quantity}</strong> × ₹{item.unit_price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              ₹{item.total_price.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => handleReorder(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              <RefreshCw className="h-3 w-3" /> Buy Again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Order Details Toggle */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {isExpanded ? (
                          <>
                            Hide Invoice & Address Details <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            View Full Invoice, Coins & Delivery Address <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>

                      {order.coins_earned > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Coins className="h-3.5 w-3.5" /> +{order.coins_earned} Kisan Coins Earned
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Delivery Address */}
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Delivery Address
                          </h5>
                          <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                            <p className="font-bold">{order.address?.fullName || order.user_name}</p>
                            <p>{order.address?.street}</p>
                            <p>{order.address?.village}, {order.address?.district}, {order.address?.state} - {order.address?.pincode}</p>
                            <p className="text-slate-500">Phone: {order.address?.phone || order.user_phone}</p>
                            {order.address?.instructions && (
                              <p className="text-amber-700 dark:text-amber-400 italic">
                                Note: {order.address.instructions}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Invoice Summary */}
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Invoice Breakdown
                          </h5>
                          <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Items Subtotal:</span>
                              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Fee:</span>
                              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                                <span>Discount / Coins Applied:</span>
                                <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Fertilizer GST (5%):</span>
                              <span>₹{order.gst.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold text-sm text-slate-900 dark:text-white">
                              <span>Total Amount Paid:</span>
                              <span className="text-emerald-700 dark:text-emerald-400">
                                ₹{order.final_total.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading order tracking...</div>}>
      <OrdersContent />
    </Suspense>
  )
}
