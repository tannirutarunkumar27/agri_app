'use client'

import React, { useEffect, useState } from 'react'
import { Star, CheckCircle, Plus, Sparkles, MessageSquare } from 'lucide-react'

type Review = {
  id: string
  product_id: string
  farmer_name: string
  location: string
  rating: number
  comment: string
  crop_grown: string
  verified: number
  created_at: string
}

export default function FarmerReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number>(4.8)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [distribution, setDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [ratingFilter, setRatingFilter] = useState<number>(0) // 0 = all

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [cropGrown, setCropGrown] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchReviews = async () => {
    try {
      const url = ratingFilter > 0
        ? `/api/store/reviews?productId=${productId}&rating=${ratingFilter}`
        : `/api/store/reviews?productId=${productId}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setTotalReviews(data.totalReviews)
        setDistribution(data.distribution || {})
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, ratingFilter])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/store/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          farmerName: name.trim(),
          location: location.trim() || 'India',
          rating,
          comment: comment.trim(),
          cropGrown: cropGrown.trim() || 'Vegetables'
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedback('Thank you! Your verified farmer review has been saved to the database.')
        setName('')
        setLocation('')
        setComment('')
        setShowReviewForm(false)
        fetchReviews()
      }
    } catch {
      setFeedback('Failed to submit review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Farmer Ratings & Reviews ({totalReviews.toLocaleString('en-IN')})
          </h3>
          <p className="text-xs text-slate-500">Authentic feedback from verified agricultural growers</p>
        </div>

        <button
          onClick={() => setShowReviewForm((v) => !v)}
          className="rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {showReviewForm ? 'Cancel' : 'Write a Product Review'}
        </button>
      </div>

      {/* Review Submission Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-slate-850">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Submit Verified Crop Review:</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name (e.g. Ramesh Patil)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Village / District (e.g. Baramati, Pune)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="text"
              required
              value={cropGrown}
              onChange={(e) => setCropGrown(e.target.value)}
              placeholder="Crop Grown (e.g. Tomato, Cotton, Sugarcane)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110"
                  >
                    <Star className={`h-5 w-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe crop results, leaf color change, pest control, or yield improvement..."
            className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Verified Review'}
          </button>
        </form>
      )}

      {feedback && (
        <div className="mt-3 rounded-lg bg-emerald-100 p-2 text-xs font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {feedback}
        </div>
      )}

      {/* Amazon-style Rating Breakdown Summary */}
      <div className="mt-6 grid gap-6 md:grid-cols-12 md:items-center">
        {/* Score Column */}
        <div className="text-center md:col-span-4 md:border-r md:border-slate-100 md:pr-6 dark:md:border-slate-800">
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{averageRating}</span>
            <span className="text-sm font-semibold text-slate-400">/ 5</span>
          </div>
          <div className="mt-1 flex justify-center text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= Math.round(averageRating) ? 'fill-amber-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">Based on {totalReviews.toLocaleString('en-IN')} farmer reviews</p>
        </div>

        {/* Star Bars Column (Amazon style) */}
        <div className="space-y-1.5 md:col-span-8">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
            const isFilterActive = ratingFilter === star

            return (
              <button
                key={star}
                onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                className={`flex w-full items-center gap-3 text-xs transition hover:opacity-80 ${
                  isFilterActive ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="w-8 text-left">{star} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] text-slate-400">{pct}%</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter Tag */}
      {ratingFilter > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <span>Showing only {ratingFilter}-Star reviews</span>
          <button onClick={() => setRatingFilter(0)} className="font-bold underline">
            Clear filter
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No reviews found for this rating filter.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{r.farmer_name}</span>
                  {r.verified === 1 && (
                    <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle className="h-2.5 w-2.5" /> Verified Farmer
                    </span>
                  )}
                </div>
                <div className="flex text-amber-400">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                Location: {r.location} · Crop Grown: <strong className="text-slate-600 dark:text-slate-300">{r.crop_grown}</strong>
              </p>

              <p className="mt-2 text-xs text-slate-700 leading-relaxed dark:text-slate-300">"{r.comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
