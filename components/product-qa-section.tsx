'use client'

import React, { useEffect, useState } from 'react'
import { HelpCircle, Search, MessageSquare, CheckCircle, Send, User } from 'lucide-react'

type QA = {
  id: string
  product_id: string
  question: string
  asked_by: string
  answer: string | null
  answered_by: string | null
  created_at: string
}

export default function ProductQASection({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<QA[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [farmerName, setFarmerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/store/questions?productId=${productId}&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [productId, searchQuery])

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || !farmerName.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/store/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          question: newQuestion.trim(),
          askedBy: `${farmerName.trim()} (Farmer)`
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedback('Your question has been answered by the Agri Consultant and published!')
        setNewQuestion('')
        setShowAskForm(false)
        fetchQuestions()
      }
    } catch {
      setFeedback('Failed to post question. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Customer Questions & Answers (Amazon Agri Hub)
            </h3>
            <p className="text-xs text-slate-500">Search field application and compatibility questions</p>
          </div>
        </div>

        <button
          onClick={() => setShowAskForm((v) => !v)}
          className="rounded-xl border border-emerald-700 bg-white px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300"
        >
          {showAskForm ? 'Cancel' : 'Ask a Farming Question'}
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <form onSubmit={handleAskQuestion} className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-slate-850">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ask other farmers & agronomists:</h4>
          <div className="mt-3 space-y-3">
            <input
              type="text"
              required
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="Your Name (e.g. Ramesh Patil, Nashik)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <textarea
              required
              rows={3}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here (e.g. Can this be sprayed on onion crop during bulb growth?)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Submitting to Agri-Doctor...' : 'Post Question'}</span>
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <div className="mt-3 rounded-lg bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {feedback}
        </div>
      )}

      {/* Search Input */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Have a question? Search answers (e.g. drip, dose, fungicide, cotton)..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Questions List */}
      <div className="mt-5 space-y-4">
        {questions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            No questions found matching your search. Be the first to ask!
          </p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Q
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{q.question}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Asked by {q.asked_by}</p>
                </div>
              </div>

              {q.answer && (
                <div className="mt-3 flex items-start gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    A
                  </span>
                  <div>
                    <p className="text-xs text-slate-700 leading-relaxed dark:text-slate-300">{q.answer}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      <span>Answered by {q.answered_by}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
