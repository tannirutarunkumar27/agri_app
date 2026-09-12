'use client'

import React, { useState } from 'react'
import { Plus, Check, ShoppingCart, Sparkles, Tag } from 'lucide-react'
import { Product, PRODUCTS } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'

export default function FrequentlyBoughtTogether({ currentProduct }: { currentProduct: Product }) {
  const { addToCart, openCart } = useCart()

  // Select 2 complementary products
  const complementaryProducts = PRODUCTS.filter((p) => p.id !== currentProduct.id).slice(0, 2)
  const bundleList = [currentProduct, ...complementaryProducts]

  const [selectedIds, setSelectedIds] = useState<string[]>(bundleList.map((p) => p.id))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const selectedItems = bundleList.filter((p) => selectedIds.includes(p.id))
  const rawSubtotal = selectedItems.reduce((sum, p) => sum + p.price, 0)
  // Amazon/Flipkart style 15% bundle discount
  const bundleDiscount = selectedItems.length >= 2 ? Math.round(rawSubtotal * 0.15) : 0
  const bundleTotal = rawSubtotal - bundleDiscount

  const handleAddBundleToCart = () => {
    for (const item of selectedItems) {
      addToCart(item.id, 1)
    }
    openCart()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Frequently Bought Together (Farmer Crop Combo)
          </h3>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          <Tag className="h-3 w-3" /> Bundle & Save 15%
        </span>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-12 md:items-center">
        {/* Products Visual Chain (8 cols) */}
        <div className="flex flex-wrap items-center gap-3 md:col-span-8">
          {bundleList.map((p, idx) => {
            const isSelected = selectedIds.includes(p.id)
            return (
              <React.Fragment key={p.id}>
                {idx > 0 && <Plus className="h-5 w-5 text-slate-400" />}
                <div
                  onClick={() => toggleSelect(p.id)}
                  className={`group relative flex w-36 cursor-pointer flex-col rounded-xl border p-3 text-center transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/20'
                      : 'border-slate-200 opacity-60 hover:opacity-100 dark:border-slate-800'
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-slate-800">
                    <span className="text-xl">🌿</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p.id)}
                    className="absolute right-2 top-2 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <p className="mt-2 text-xs font-bold text-slate-900 line-clamp-2 dark:text-white">{p.name}</p>
                  <p className="mt-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">Pack: {p.unit}</p>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Combo Price Box (4 cols) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850 md:col-span-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Total price for {selectedItems.length} selected:
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{bundleTotal.toLocaleString('en-IN')}
            </span>
            {bundleDiscount > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{rawSubtotal.toLocaleString('en-IN')}</span>
            )}
          </div>

          {bundleDiscount > 0 && (
            <p className="mt-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Bundle Savings: ₹{bundleDiscount.toLocaleString('en-IN')} (15% OFF)
            </p>
          )}

          <button
            onClick={handleAddBundleToCart}
            disabled={selectedItems.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-amber-400 active:scale-95 disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add All {selectedItems.length} to Cart</span>
          </button>
        </div>
      </div>
    </div>
  )
}
