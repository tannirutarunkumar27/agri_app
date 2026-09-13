'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Leaf, LockKeyhole, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { success, error: showError } = useToast()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setLoading(true)

    const res = await login(identifier, password)
    setLoading(false)

    if (res.success) {
      success(res.message || 'Logged in successfully!')
      const role = res.user?.role?.toLowerCase()
      if (role === 'farmer') {
        router.push('/farmer')
      } else if (role === 'buyer') {
        router.push('/buyer')
      } else if (role === 'transporter') {
        router.push('/transporter/dashboard')
      } else if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/farmer')
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials')
      showError(res.error || 'Login failed')
    }
  }

  // Quick fill for demo farmer
  function fillDemo() {
    setIdentifier('9822012345')
    setPassword('kisan123')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/10 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
          <section className="hidden bg-emerald-900 p-10 text-emerald-50 md:flex md:flex-col md:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-900/40">
                  <Leaf className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-2xl font-bold">FarmDirect</span>
              </Link>
              <div className="mt-16 max-w-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Your field, clearer</p>
                <h1 className="mt-4 text-4xl font-bold leading-tight">Make every growing decision with confidence.</h1>
                <p className="mt-5 leading-7 text-emerald-100/80">
                  Track crop health, buy genuine certified fertilizers with Kisan Coins, get instant delivery to your farm gate, and trade at optimal mandi rates.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-700/60 bg-emerald-800/40 p-4">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Quick Demo Login</p>
              <p className="text-sm text-emerald-100 mt-1">Mobile: 9822012345 / Pass: kisan123</p>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition"
              >
                Auto-fill Demo Credentials
              </button>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 md:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-emerald-900 dark:text-emerald-100">
                <Leaf className="h-6 w-6 text-emerald-600" aria-hidden="true" /> FarmDirect
              </Link>
            </div>
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Welcome back</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Sign in to your farm</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Access your crop plans, farm-gate orders, and Kisan Coins rewards.
              </p>

              {errorMessage && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number or Email</span>
                  <span className="relative block">
                    <Phone className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                    <input
                      required
                      type="text"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="e.g. 9822012345 or you@example.com"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                    <input
                      required
                      minLength={6}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </span>
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /> Remember me
                  </label>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Use demo account?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Sign in to FarmDirect <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  New to FarmDirect?{' '}
                  <Link href="/create-account" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                    Create account & get 250 coins
                  </Link>
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                🔒 Secure End-to-End Cryptographic Sessions (Node.js Scrypt + HMAC-SHA256)
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
