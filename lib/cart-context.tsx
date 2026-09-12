'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PRODUCTS, Product, DISCOUNT_COUPONS } from './store-data'

type CartContextType = {
  cart: Record<string, number>
  items: { product: Product; quantity: number }[]
  totalItems: number
  subtotal: number
  originalSubtotal: number
  couponDiscount: number
  appliedCoupon: string | null
  deliveryFee: number
  gst: number
  finalTotal: number
  savings: number
  isCartOpen: boolean
  farmerCoins: number
  redeemCoins: boolean
  coinsDiscount: number
  wishlist: string[]
  toggleRedeemCoins: () => void
  toggleWishlist: (productId: string) => void
  openCart: () => void
  closeCart: () => void
  addToCart: (productId: string, quantity?: number) => void
  addItem: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => { success: boolean; message: string }
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'farmos_store_cart_v1'
const COUPON_STORAGE_KEY = 'farmos_store_coupon_v1'
const COINS_STORAGE_KEY = 'farmos_farmer_coins_v1'
const WISHLIST_STORAGE_KEY = 'farmos_wishlist_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('KISAN10')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [farmerCoins, setFarmerCoins] = useState(150) // 150 Kisan Coins = ₹150 (Flipkart SuperCoins style)
  const [redeemCoins, setRedeemCoins] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>(['neem-shield'])

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY)
      const storedCoins = localStorage.getItem(COINS_STORAGE_KEY)
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      } else {
        setCart({ 'npk-191919': 2, 'neem-shield': 1 })
      }
      if (storedCoupon !== null) {
        setAppliedCoupon(storedCoupon || null)
      }
      if (storedCoins) {
        setFarmerCoins(Number(storedCoins))
      }
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist))
      }
    } catch {
      setCart({ 'npk-191919': 2, 'neem-shield': 1 })
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon)
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(COINS_STORAGE_KEY, String(farmerCoins))
    } catch {
      // ignore
    }
  }, [farmerCoins, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch {
      // ignore
    }
  }, [wishlist, isLoaded])

  const toggleRedeemCoins = () => {
    setRedeemCoins((prev) => !prev)
  }

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId)
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    })
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const addToCart = (productId: string, quantity = 1) => {
    setCart((prev) => {
      const current = prev[productId] || 0
      return { ...prev, [productId]: current + quantity }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return { ...prev, [productId]: quantity }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const clearCart = () => {
    setCart({})
    setAppliedCoupon(null)
    setRedeemCoins(false)
  }

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    if (DISCOUNT_COUPONS[cleanCode]) {
      setAppliedCoupon(cleanCode)
      return { success: true, message: `Coupon ${cleanCode} applied successfully! (${DISCOUNT_COUPONS[cleanCode].description})` }
    }
    return { success: false, message: 'Invalid coupon code. Try KISAN10 or FERTILE20.' }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const items = Object.entries(cart)
    .map(([id, quantity]) => {
      const product = PRODUCTS.find((p) => p.id === id)
      if (!product || quantity <= 0) return null
      return { product, quantity }
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const originalSubtotal = items.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0)

  let couponDiscount = 0
  if (appliedCoupon && DISCOUNT_COUPONS[appliedCoupon] && subtotal > 0) {
    const couponInfo = DISCOUNT_COUPONS[appliedCoupon]
    couponDiscount = Math.min(
      Math.round((subtotal * couponInfo.discountPercent) / 100),
      couponInfo.maxDiscount
    )
  }

  // Kisan Coins discount: 1 coin = ₹1 (Flipkart SuperCoins pattern)
  const coinsDiscount = redeemCoins && subtotal > 0 ? Math.min(farmerCoins, subtotal - couponDiscount) : 0

  // Delivery is FREE for orders above ₹499
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 49
  // 5% standard GST on agricultural fertilizer/inputs
  const gst = Math.round(subtotal * 0.05)
  const finalTotal = Math.max(0, subtotal - couponDiscount - coinsDiscount + deliveryFee + gst)
  const savings = Math.max(0, originalSubtotal - subtotal + couponDiscount + coinsDiscount)

  return (
    <CartContext.Provider
      value={{
        cart,
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
        farmerCoins,
        redeemCoins,
        coinsDiscount,
        wishlist,
        toggleRedeemCoins,
        toggleWishlist,
        openCart,
        closeCart,
        addToCart,
        addItem: addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
