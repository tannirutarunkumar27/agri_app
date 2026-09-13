'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Leaf,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
  Search,
  CheckCircle2,
  PhoneCall,
  Zap,
  Tag,
  Sparkles,
  Heart,
  Coins,
  Package,
  Scale,
  Bell,
  User,
  AlertTriangle,
  Clock,
  BookOpen,
  FlaskConical
} from 'lucide-react'
import { PRODUCTS, Product, CROP_PRODUCT_MAP } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'
import CartDrawer from '@/components/cart-drawer'
import { Badge } from '@/components/ui/badge'

const RECENT_VIEWED_KEY = 'farmos_recently_viewed_v1'

export default function StorePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, info } = useToast()
  const {
    cart,
    totalItems,
    finalTotal,
    updateQuantity,
    addToCart,
    openCart,
    farmerCoins,
    wishlist,
    toggleWishlist
  } = useCart()

  const [dbProducts, setDbProducts] = useState<Product[]>(PRODUCTS)
  const [filter, setFilter] = useState('All')
  const [selectedCrop, setSelectedCrop] = useState('All Crops')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured')
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  // Load recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_VIEWED_KEY)
      if (stored) {
        const ids: string[] = JSON.parse(stored)
        const prods = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as Product[]
        setRecentlyViewed(prods.slice(0, 4))
      }
    } catch {
      // ignore
    }
  }, [])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        if (data.success && data.notifications) {
          setNotifications(data.notifications)
          setUnreadNotifs(data.unreadCount || 0)
        }
      } catch {
        // ignore
      }
    }
    fetchNotifs()
  }, [user?.userId])

  // Live fetch from ACID SQLite Database with indexed search & filter
  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (filter !== 'All') queryParams.set('category', filter)
        if (searchQuery.trim()) queryParams.set('q', searchQuery.trim())
        if (sortBy !== 'featured') queryParams.set('sort', sortBy)

        const res = await fetch(`/api/store/products?${queryParams.toString()}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setDbProducts(data.products)
        }
      } catch {
        // fallback to in-memory PRODUCTS
      }
    }
    fetchDbProducts()
  }, [filter, searchQuery, sortBy])

  const categories = [
    'All',
    'Fertilizer',
    'Insecticide',
    'Fungicide',
    'Natural protection',
    'Bio-pesticide',
    'Soil amendment',
    'Biological soil care',
    'Micronutrient',
    'Monitoring tool'
  ]

  const cropList = [
    'All Crops',
    'Chilli',
    'Red Gram',
    'Green Gram',
    'Tomato',
    'Cotton',
    'Paddy',
    'Wheat',
    'Sugarcane',
    'Potato',
    'Onion'
  ]

  const filteredProducts = useMemo(() => {
    let list = dbProducts.filter((product) => {
      const matchesCategory =
        filter === 'All' ||
        product.category === filter ||
        product.type.toLowerCase().includes(filter.toLowerCase())

      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.suitableCrops && product.suitableCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCrop =
        selectedCrop === 'All Crops' ||
        product.crop.toLowerCase().includes(selectedCrop.toLowerCase()) ||
        (product.suitableCrops && product.suitableCrops.some((c) => c.toLowerCase().includes(selectedCrop.toLowerCase()))) ||
        (CROP_PRODUCT_MAP[selectedCrop] && CROP_PRODUCT_MAP[selectedCrop].includes(product.id))

      return matchesCategory && matchesSearch && matchesCrop
    })

    if (sortBy === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    }

    return list
  }, [dbProducts, filter, selectedCrop, searchQuery, sortBy])

  const handleAddToCartWithToast = (product: Product) => {
    addToCart(product.id, 1)
    success(`Added ${product.name} to your cart!`)

    // Add to recently viewed
    try {
      const stored = localStorage.getItem(RECENT_VIEWED_KEY)
      const ids: string[] = stored ? JSON.parse(stored) : []
      const updated = [product.id, ...ids.filter((i) => i !== product.id)].slice(0, 6)
      localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated))
    } catch {}
  }

  const handleWishlistWithToast = (product: Product) => {
    const willAdd = !wishlist.includes(product.id)
    toggleWishlist(product.id)
    if (willAdd) {
      success(`Saved ${product.name} to your Wishlist!`)
    } else {
      info(`Removed ${product.name} from Wishlist`)
    }
  }

  const handleBuyNow = (productId: string) => {
    if (!cart[productId] || cart[productId] === 0) {
      addToCart(productId, 1)
    }
    router.push('/store/checkout')
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 4) {
        info('You can compare maximum 4 products at a time.')
        return prev
      }
      return [...prev, id]
    })
  }

  return (
    <main className="min-h-screen bg-emerald-50/40 pb-16 dark:bg-slate-950">
      {/* Interactive Cart Drawer */}
      <CartDrawer />

      {/* Top Banner & Header */}
      <div className="bg-emerald-900 px-4 py-2 text-center text-xs font-semibold text-emerald-100 dark:bg-emerald-950">
        🌾 <strong>Kisan Special Season:</strong> Up to 25% OFF on NPK & Bio-stimulants · Use code{' '}
        <span className="rounded bg-emerald-700 px-1.5 py-0.5 font-mono text-lime-300">KISAN10</span> for extra 10%
        discount · Free Delivery on orders above ₹499
      </div>

      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to FarmDirect</span>
            </Link>
            <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xs">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="hidden font-bold text-slate-900 sm:inline dark:text-white">
                Fertile Store <span className="text-xs text-emerald-600 font-medium">by FarmDirect</span>
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fertilizers, bio-stimulants, NPK, compost, neem..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* My Orders link */}
            <Link
              href="/store/orders"
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              title="Track past farm-gate orders"
            >
              <Package className="h-4 w-4 text-emerald-600" />
              <span>My Orders</span>
            </Link>

            {/* Compare Link if products selected */}
            {compareIds.length > 0 && (
              <Link
                href={`/store/compare?ids=${compareIds.join(',')}`}
                className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"
              >
                <Scale className="h-3.5 w-3.5 text-emerald-600" />
                <span>Compare ({compareIds.length})</span>
              </Link>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Farm Alerts & Updates</span>
                    <span className="text-[10px] text-slate-500">{notifications.length} alerts</span>
                  </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="pt-2 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4 text-xs text-slate-500">No new alerts</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Farmer Profile / Coins Pill */}
            {user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 transition"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span>{user.kisanCoins ?? farmerCoins} Coins</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">({user.name.split(' ')[0]})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Trigger button */}
            <button
              onClick={openCart}
              id="review-cart-header-button"
              className="group relative flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95"
              aria-label="Open Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4 text-lime-300" />
              <span>Review Cart</span>
              <span className="rounded-full bg-lime-400 px-2 py-0.5 text-[11px] font-black text-emerald-950">
                {totalItems}
              </span>
              <span className="hidden sm:inline">· ₹{finalTotal.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Marketplace Banner */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-lg md:p-8">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold text-lime-300">
                <ShieldCheck className="h-4 w-4" /> 100% Certified FCO Agricultural Inputs
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Fertilizers & Soil Care Direct to Your Farm
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                Order genuine water-soluble fertilizers, bio-fungicides, natural neem extracts, and enriched organic
                compost. Tested for crop safety, delivered directly to village farm gates.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-lime-400" /> Free Delivery above ₹499
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-lime-400" /> Cash on Delivery Available
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-lime-400" /> Free Expert Application Guidance
                </span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-emerald-700/50 bg-emerald-900/40 p-6 text-center backdrop-blur-xs">
              <Sprout className="h-14 w-14 text-lime-400 animate-pulse" />
              <p className="mt-2 text-xs font-bold text-lime-300">Govt Authorized Vendor</p>
              <p className="text-[11px] text-emerald-200">Verified Krishi Kendra</p>
            </div>
          </div>
        </section>

        {/* Amazon-like quick features bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Kisan Express</p>
              <p className="text-[11px] text-slate-500">Fast farm-gate drop</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery</p>
              <p className="text-[11px] text-slate-500">Pay after arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">100% Genuine</p>
              <p className="text-[11px] text-slate-500">FCO lab certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Subsidized Rates</p>
              <p className="text-[11px] text-slate-500">Direct mandi pricing</p>
            </div>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filter === category
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-emerald-100 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end text-xs text-slate-600 dark:text-slate-400">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="featured">Featured / Bestselling</option>
              <option value="rating">Farmer Rating: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Shop by Crop Filter */}
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200/50 dark:border-emerald-900/40">
            <div className="flex items-center gap-2">
              <span className="text-base">🌾</span>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Shop Crop-Specific Solutions (Fertilizers, Pesticides & Care):
              </span>
            </div>
            {selectedCrop !== 'All Crops' && (
              <button
                onClick={() => setSelectedCrop('All Crops')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline dark:text-emerald-400"
              >
                Reset crop filter (showing {filteredProducts.length} for {selectedCrop})
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
            {cropList.map((crop) => {
              const isSelected = selectedCrop === crop
              return (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs font-bold ring-2 ring-emerald-600/30'
                      : 'bg-white text-slate-700 hover:bg-emerald-100 border border-emerald-200/70 shadow-2xs dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  }`}
                >
                  {crop === 'All Crops' ? '🌱 All Crops' : crop}
                </button>
              )
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const qty = cart[product.id] || 0
            const discountPercent = Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) * 100
            )
            const isLowStock = product.stockCount > 0 && product.stockCount < 10
            const isOutOfStock = product.stockCount === 0 || !product.inStock
            const isCompared = compareIds.includes(product.id)

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-white shadow-xs transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Product Header & Visual */}
                <div className="relative flex h-52 flex-col items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xs transition duration-300 group-hover:scale-105 dark:bg-slate-800">
                      <Leaf className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                  {/* Badge top-left */}
                  <span
                    className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${product.tone}`}
                  >
                    {product.badge}
                  </span>

                  {/* Discount tag top-right */}
                  {discountPercent > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleWishlistWithToast(product)
                    }}
                    className={`absolute left-3 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-xs transition hover:scale-110 dark:bg-slate-800 ${
                      wishlist.includes(product.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                    title="Save to Seasonal Wishlist"
                  >
                    <Heart className={`h-3.5 w-3.5 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Compare toggle */}
                  <button
                    onClick={() => toggleCompare(product.id)}
                    className={`absolute left-12 bottom-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs transition ${
                      isCompared
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/90 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Scale className="h-3 w-3" />
                    <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  {/* Pack size indicator */}
                  <span className="absolute bottom-2 right-3 rounded bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-xs dark:bg-slate-800 dark:text-slate-300">
                    Pack: {product.unit}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      <span>{product.rating}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-[11px] text-slate-500">({product.reviewCount.toLocaleString('en-IN')} farmer reviews)</span>
                  </div>

                  {/* Product Title */}
                  <h2 className="mt-2 text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400">
                    <Link href={`/store/product/${product.id}`}>{product.name}</Link>
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                    {product.type} · For: <span className="font-medium text-slate-700 dark:text-slate-300">{product.crop}</span>
                  </p>

                  {/* Dosage & How to Use Guide Quick Link */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <FlaskConical className="h-3 w-3 text-emerald-600" />
                      <span className="line-clamp-1">{product.dosagePerAcre.split(';')[0]}</span>
                    </span>
                    <Link
                      href={`/store/product/${product.id}#how-to-use`}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 transition"
                    >
                      <BookOpen className="h-3 w-3 text-emerald-600" />
                      <span>How to Use Guide →</span>
                    </Link>
                  </div>

                  {/* Low stock warning (Priority 3.3) */}
                  {isLowStock && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Only {product.stockCount} left in stock - order soon!</span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="mt-2 text-[11px] font-bold text-rose-600">
                      Currently Out of Stock
                    </div>
                  )}

                  {/* Delivery Promise */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Truck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      Get it <strong>{product.deliveryDays}</strong>
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      M.R.P: ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-5">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Add to Cart / Quantity Stepper */}
                      {qty > 0 ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-600 bg-emerald-50 p-1 dark:bg-emerald-950">
                          <button
                            aria-label={`Remove one ${product.name}`}
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="rounded-lg p-1.5 text-emerald-900 transition hover:bg-white dark:text-emerald-200 dark:hover:bg-slate-800"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                            {qty} in cart
                          </span>
                          <button
                            aria-label={`Add one ${product.name}`}
                            onClick={() => updateQuantity(product.id, qty + 1)}
                            className="rounded-lg p-1.5 text-emerald-900 transition hover:bg-white dark:text-emerald-200 dark:hover:bg-slate-800"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCartWithToast(product)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 active:scale-95 disabled:opacity-40 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}

                      {/* Buy Now button */}
                      <button
                        disabled={isOutOfStock}
                        onClick={() => handleBuyNow(product.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-amber-400 active:scale-95 disabled:opacity-40"
                      >
                        <Zap className="h-3.5 w-3.5 fill-slate-950" />
                        <span>Buy Now</span>
                      </button>
                    </div>

                    {/* View specifications link */}
                    <div className="mt-3 text-center">
                      <Link
                        href={`/store/product/${product.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
                      >
                        <span>Full technical specs & farmer reviews</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Recently Viewed Products (Priority 2.3) */}
        {recentlyViewed.length > 0 && (
          <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Recently Viewed by You
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Quickly jump back into items you checked earlier</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/product/${item.id}`}
                  className="flex flex-col rounded-xl border border-slate-100 p-3 hover:border-emerald-300 hover:shadow-xs transition dark:border-slate-800"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{item.brand}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Review Cart CTA Bar */}
        <section className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                Responsible Fertilizer & Chemical Purchase Checklist
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Confirm your crop stage, soil pH, required dose per acre, and local label approval before application.
                Our agri-advisory team is available 24/7 at 1800-FARM-OS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              id="review-cart-bottom-button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4 text-lime-300" />
              <span>Review Cart ({totalItems} items)</span>
            </button>

            <Link
              href="/store/checkout"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-95"
            >
              <span>Instant Checkout</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
