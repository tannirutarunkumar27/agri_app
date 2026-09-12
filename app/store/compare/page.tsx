'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Scale,
  Star,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Plus,
  Trash2,
  ShieldCheck,
  Tag
} from 'lucide-react'
import { PRODUCTS, Product } from '@/lib/store-data'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'

function CompareContent() {
  const searchParams = useSearchParams()
  const { addToCart, openCart } = useCart()
  const { success } = useToast()

  const [selectedIds, setSelectedIds] = useState<string[]>(['npk-191919', 'neem-shield'])

  useEffect(() => {
    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const parsed = idsParam.split(',').filter(Boolean)
      if (parsed.length > 0) {
        setSelectedIds(parsed.slice(0, 4))
      }
    }
  }, [searchParams])

  const selectedProducts = selectedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[]

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((pId) => pId !== id))
  }

  const addProductToCompare = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= 4) return
    setSelectedIds((prev) => [...prev, id])
  }

  const handleAddToCart = (p: Product) => {
    addToCart(p.id, 1)
    success(`Added ${p.name} to cart!`)
    openCart()
  }

  const availableProducts = PRODUCTS.filter((p) => !selectedIds.includes(p.id))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" /> Fertilizer & Input Comparison Matrix
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare NPK ratios, acre dosages, chemical compositions & farmer ratings side-by-side
              </p>
            </div>
          </div>
          <Link
            href="/store"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            Back to Catalog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Product selector if less than 4 */}
        {selectedIds.length < 4 && availableProducts.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-600" /> Add to Comparison ({4 - selectedIds.length} slots left):
            </span>
            <div className="flex flex-wrap gap-2">
              {availableProducts.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addProductToCompare(p.id)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Scale className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No Products Selected</h2>
            <p className="text-sm text-slate-500 mt-1">Select products from the catalog to compare their specs.</p>
            <Link
              href="/store"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850">
                  <th className="p-4 font-bold text-slate-900 dark:text-white w-48 min-w-44">Parameters</th>
                  {selectedProducts.map((p) => (
                    <th key={p.id} className="p-4 min-w-64 relative">
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Badge variant="default" className="mb-2 text-[10px]">
                        {p.badge}
                      </Badge>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                        <Link href={`/store/product/${p.id}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{p.brand}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Price */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Price / Pack</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-500 text-[11px]"> / {p.unit}</span>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        Save ₹{(p.originalPrice - p.price).toLocaleString('en-IN')}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Farmer Rating */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Farmer Rating</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      <div className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        <span>{p.rating}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-slate-400 ml-1 text-[11px]">({p.reviewCount} reviews)</span>
                    </td>
                  ))}
                </tr>

                {/* Composition */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Active Composition</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {p.composition}
                    </td>
                  ))}
                </tr>

                {/* NPK Ratio */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">NPK Ratio</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.npkRatio ? (
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                          {p.npkRatio}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Organic / Botanical (Non-chemical)</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Dosage per acre */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Dosage per Acre</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.dosagePerAcre}
                    </td>
                  ))}
                </tr>

                {/* Application Method */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Application Method</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.applicationMethod}
                    </td>
                  ))}
                </tr>

                {/* Suitable Crops */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Suitable Crops</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {p.suitableCrops.map((c) => (
                          <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Key Benefits */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Key Benefits</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      <ul className="space-y-1">
                        {p.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="bg-slate-50/70 dark:bg-slate-850">
                  <td className="p-4 font-bold text-slate-600 dark:text-slate-400">Purchase</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                        </button>
                        <Link
                          href={`/store/product/${p.id}`}
                          className="text-center text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading comparison matrix...</div>}>
      <CompareContent />
    </Suspense>
  )
}
