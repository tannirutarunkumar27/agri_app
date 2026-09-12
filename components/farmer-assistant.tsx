'use client'

import { FormEvent, useState } from 'react'
import { Languages, LocateFixed, MessageCircle, Send, ShieldCheck } from 'lucide-react'

const languages = ['English', 'हिन्दी', 'मराठी', 'বাংলা', 'తెలుగు', 'தமிழ்', 'ಕನ್ನಡ', 'ਪੰਜਾਬੀ']
const states = ['All India', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal']

export default function FarmerAssistant() {
  const [language, setLanguage] = useState('English')
  const [location, setLocation] = useState('All India')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask me about crops, pests, weather, mandi selling, schemes, or natural farming.')
  const [loading, setLoading] = useState(false)
  const [gps, setGps] = useState('Use GPS')

  function useLocation() {
    if (!navigator.geolocation) return setGps('GPS unavailable')
    setGps('Finding location…')
    navigator.geolocation.getCurrentPosition(() => setGps('Location detected'), () => setGps('Permission needed'))
  }

  async function ask(event: FormEvent) {
    event.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    try {
      const response = await fetch('/api/farmer-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, language, location }) })
      const data = await response.json()
      setAnswer(data.answer || data.error)
    } catch { setAnswer('Please check your connection and try again.') }
    finally { setLoading(false) }
  }

  return <section className="overflow-hidden rounded-3xl border border-sky-200 bg-slate-950 text-white shadow-xl shadow-sky-900/10">
    <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="bg-gradient-to-br from-sky-800 via-indigo-900 to-slate-950 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><MessageCircle className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">FarmOS Saarthi</p><h2 className="text-2xl font-bold">Your farm, your language</h2></div></div>
        <p className="max-w-md text-sm leading-6 text-sky-100">Get practical guidance grounded in your state, crop, season, and farming goals. Always verify chemical decisions with a local expert and the product label.</p>
        <div className="mt-8 space-y-4"><label className="block text-sm font-semibold text-sky-100"><span className="mb-2 flex items-center gap-2"><Languages className="h-4 w-4" /> Preferred language</span><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white outline-none"><option className="text-slate-900">English</option>{languages.slice(1).map((item) => <option className="text-slate-900" key={item}>{item}</option>)}</select></label><label className="block text-sm font-semibold text-sky-100"><span className="mb-2 block">State or region</span><select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white outline-none">{states.map((item) => <option className="text-slate-900" key={item}>{item}</option>)}</select></label><button onClick={useLocation} className="flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white"><LocateFixed className="h-4 w-4" /> {gps}</button></div>
      </div>
      <div className="bg-white p-6 text-slate-900 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold text-sky-700">Ask anything</p><p className="mt-1 text-xs text-slate-500">AI responses are guidance, not a substitute for local extension advice.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Multilingual AI</span></div><div className="min-h-44 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 whitespace-pre-line">{loading ? 'FarmOS Saarthi is thinking…' : answer}</div><form onSubmit={ask} className="mt-5 flex gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. When should I sell my onion crop?" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-400 focus:ring-2" /><button disabled={loading} className="flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-800 disabled:opacity-50"><Send className="h-4 w-4" /> Ask</button></form><div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> No diagnosis or pesticide decision should be made from AI alone.</div></div>
    </div>
  </section>
}
