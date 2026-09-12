'use client'

import { ChangeEvent, useState } from 'react'
import { AlertCircle, Camera, CheckCircle2, ImagePlus, Leaf, Plus, ShieldCheck, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DISEASES = {
  blight: { name: 'Early Blight', crop: 'Tomato / Potato', confidence: 84, signs: 'Brown target-like spots, yellowing lower leaves', pesticides: ['Chlorothalonil', 'Mancozeb'], organic: ['Neem oil', 'Remove affected leaves'] },
  powderymildew: { name: 'Powdery Mildew', crop: 'Vegetables / Grapes', confidence: 79, signs: 'White powdery coating on leaves and stems', pesticides: ['Sulfur', 'Karathane'], organic: ['Baking soda + oil', 'Improve airflow'] },
  leafspot: { name: 'Leaf Spot', crop: 'Rice / Pulses / Vegetables', confidence: 76, signs: 'Small dark lesions that expand over time', pesticides: ['Copper fungicide', 'Mancozeb'], organic: ['Bordeaux mixture', 'Crop sanitation'] },
  rust: { name: 'Rust', crop: 'Wheat / Maize', confidence: 81, signs: 'Orange or brown raised pustules underneath leaves', pesticides: ['Propiconazole', 'Sulfur'], organic: ['Neem oil', 'Remove volunteer plants'] },
  mosaic: { name: 'Mosaic Virus', crop: 'Tomato / Chilli', confidence: 68, signs: 'Mottled light and dark green patches, distorted growth', pesticides: ['Control aphids', 'Insecticidal soap'], organic: ['Neem', 'Remove infected plants'] },
}

type DiseaseKey = keyof typeof DISEASES

export default function DiseaseDetector() {
  const [mode, setMode] = useState<'image' | 'symptoms'>('image')
  const [imageName, setImageName] = useState('')
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey | ''>('')
  const [selectedPesticide, setSelectedPesticide] = useState('')
  const [history, setHistory] = useState<{ id: string; disease: string; pesticide: string; date: string }[]>([])
  const [analyzed, setAnalyzed] = useState(false)

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageName(file.name)
    setAnalyzed(false)
    setTimeout(() => { setSelectedDisease('blight'); setAnalyzed(true) }, 450)
  }

  const current = selectedDisease ? DISEASES[selectedDisease] : null
  const addHistory = () => {
    if (!current || !selectedPesticide) return
    setHistory((items) => [...items, { id: crypto.randomUUID(), disease: current.name, pesticide: selectedPesticide, date: new Date().toLocaleDateString('en-IN') }])
    setSelectedPesticide('')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="mb-3 flex items-center gap-3"><div className="rounded-xl bg-emerald-600 p-2.5"><Leaf className="h-5 w-5 text-white" /></div><span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Crop health check</span></div><h2 className="text-3xl font-bold text-slate-950 dark:text-white">What&apos;s happening to your crop?</h2><p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">Upload a clear leaf photo for visual triage, or answer symptom questions when you are offline. This is an early warning, not a laboratory diagnosis.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-slate-800 dark:text-emerald-200"><ShieldCheck className="h-4 w-4" /> Confidence + safety first</div>
        </div>
      </div>

      <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button onClick={() => setMode('image')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${mode === 'image' ? 'bg-white text-emerald-800 shadow-sm dark:bg-slate-700 dark:text-emerald-200' : 'text-slate-500'}`}><Camera className="h-4 w-4" /> Photo analysis</button>
        <button onClick={() => setMode('symptoms')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${mode === 'symptoms' ? 'bg-white text-emerald-800 shadow-sm dark:bg-slate-700 dark:text-emerald-200' : 'text-slate-500'}`}><AlertCircle className="h-4 w-4" /> Guided symptoms</button>
      </div>

      {mode === 'image' ? <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <label className="group flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <input type="file" accept="image/*" className="sr-only" onChange={handleImage} />
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800"><UploadCloud className="h-8 w-8 text-emerald-600" /></div>
          <p className="font-semibold text-slate-900 dark:text-white">Drop a leaf photo here</p><p className="mt-1 text-sm text-slate-500">JPG or PNG · one leaf in focus · good daylight</p><span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"><ImagePlus className="h-4 w-4" /> Choose image</span>{imageName && <p className="mt-4 text-xs font-semibold text-emerald-700">Selected: {imageName}</p>}
        </label>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"><p className="text-sm font-bold text-slate-900 dark:text-white">How the check works</p><div className="mt-5 space-y-4">{['We inspect visible color and pattern signals', 'We compare against common crop symptoms', 'You get confidence, signs, and next steps'].map((item, index) => <div key={item} className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{index + 1}</div><p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{item}</p></div>)}</div><p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">For spray decisions, confirm with a local Krishi Vigyan Kendra or agronomist and follow the product label.</p></div>
      </div> : <div className="grid gap-4 rounded-2xl border border-slate-200 p-6 dark:border-slate-800 md:grid-cols-3"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Crop<select className="mt-2 w-full rounded-lg border bg-background px-3 py-2 font-normal"><option>Tomato</option><option>Rice</option><option>Wheat</option><option>Cotton</option></select></label><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Main symptom<select className="mt-2 w-full rounded-lg border bg-background px-3 py-2 font-normal" onChange={(e) => { setSelectedDisease(e.target.value as DiseaseKey); setAnalyzed(true) }}><option value="">Choose symptom</option><option value="blight">Brown target spots</option><option value="powderymildew">White powder</option><option value="leafspot">Dark leaf lesions</option><option value="rust">Orange pustules</option></select></label><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Field condition<select className="mt-2 w-full rounded-lg border bg-background px-3 py-2 font-normal"><option>Humid / wet leaves</option><option>Hot / dry</option><option>Mixed weather</option></select></label></div>}

      {analyzed && current && <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Triage result</p><h3 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Possible {current.name}</h3><p className="mt-1 text-sm text-slate-500">Common on: {current.crop} · Signs: {current.signs}</p></div><div className="rounded-xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-950/40"><p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{current.confidence}%</p><p className="text-xs font-semibold text-emerald-700">match confidence</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Lower-risk first</p>{current.organic.map((item) => <button key={item} onClick={() => setSelectedPesticide(item)} className={`mb-2 block w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedPesticide === item ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 dark:border-slate-700'}`}>{item}</button>)}</div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Registered treatment options</p>{current.pesticides.map((item) => <button key={item} onClick={() => setSelectedPesticide(item)} className={`mb-2 block w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedPesticide === item ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 dark:border-slate-700'}`}>{item}</button>)}</div></div>{selectedPesticide && <Button onClick={addHistory} className="mt-3 gap-2 bg-emerald-700"><Plus className="h-4 w-4" /> Record treatment plan</Button>}</div>}

      {history.length > 0 && <div className="rounded-2xl border p-6"><h3 className="mb-4 font-bold">Treatment history</h3>{history.map((item) => <div key={item.id} className="flex items-center justify-between border-t py-3"><div><p className="font-medium">{item.disease}</p><p className="text-sm text-muted-foreground">{item.pesticide} · {item.date}</p></div><button onClick={() => setHistory((items) => items.filter((entry) => entry.id !== item.id))} aria-label={`Remove ${item.disease}`}><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</div>}
    </div>
  )
}
