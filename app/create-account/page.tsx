'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Leaf, LockKeyhole, Mail, Phone, UserRound, MapPin, Loader2, AlertCircle, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'

export default function CreateAccountPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { success } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [district, setDistrict] = useState('Pune')
  const [primaryCrop, setPrimaryCrop] = useState('Sugarcane')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const res = await register({
      name,
      phone,
      email: email || undefined,
      password,
      district,
      state: 'Maharashtra',
      primaryCrop
    })
    setLoading(false)

    if (res.success) {
      setSubmitted(true)
      success(res.message || 'Account created! 250 Kisan Coins added.')
      window.setTimeout(() => router.push('/store'), 1200)
    } else {
      setErrorMessage(res.error || 'Failed to create account')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/10 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
          <section className="hidden bg-emerald-900 p-10 text-emerald-50 md:flex md:flex-col md:justify-between">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-900/40">
                <Leaf className="h-6 w-6" />
              </span>
              <span className="text-2xl font-bold">FarmDirect</span>
            </Link>
            <div className="max-w-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
                <Coins className="h-4 w-4 text-amber-400" /> 250 Kisan Coins Bonus on Signup
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Start growing smarter</p>
              <h1 className="mt-2 text-4xl font-bold leading-tight">A better season starts with a better plan.</h1>
              <p className="mt-4 leading-7 text-emerald-100/80">
                Direct access to FCO certified fertilizers, personalized spray schedules, real-time APMC mandi intelligence, and guaranteed farm-gate delivery.
              </p>
            </div>
            <p className="text-sm text-emerald-200/70">Built for Indian farmers and agri-retailers.</p>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-6 md:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-emerald-900 dark:text-emerald-100">
                <Leaf className="h-6 w-6 text-emerald-600" /> FarmDirect
              </Link>
            </div>

            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Join FarmDirect</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Create your farm account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Sign up and immediately unlock 250 Kisan Coins (worth ₹250) for your next order.
              </p>

              {errorMessage && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
                  <Check className="mx-auto h-12 w-12 text-emerald-600" />
                  <p className="mt-4 text-xl font-bold text-emerald-950 dark:text-emerald-100">Account Created!</p>
                  <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                    250 Kisan Coins added to your wallet. Directing to Fertile Store…
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</span>
                    <span className="relative block">
                      <UserRound className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. Ramesh Patil"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">10-Digit Mobile Number (Login ID)</span>
                    <span className="relative block">
                      <Phone className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. 98220 12345"
                      />
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">District</span>
                      <span className="relative block">
                        <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="e.g. Pune, Nashik"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Primary Crop</span>
                      <input
                        value={primaryCrop}
                        onChange={(e) => setPrimaryCrop(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="e.g. Sugarcane, Onion"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Email Address (Optional)</span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="farmer@example.com"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Password (min. 6 chars)</span>
                    <span className="relative block">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        required
                        minLength={6}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Create a strong password"
                      />
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Setting up farm account...
                      </>
                    ) : (
                      <>
                        Create Account & Get 250 Coins <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                  Sign in here
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
