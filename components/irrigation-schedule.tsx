'use client'

import { useState } from 'react'
import { Droplets, AlertCircle } from 'lucide-react'

interface IrrigationData {
  crop: string
  stage: string
  frequency: string
  volume: string
  waterNeeds: string
  tips: string[]
}

const IRRIGATION_GUIDE: IrrigationData[] = [
  {
    crop: 'Rice',
    stage: 'Nursery',
    frequency: 'Daily or alternate day',
    volume: '25-50mm',
    waterNeeds: '1000-1500mm total',
    tips: ['Keep soil moist but not waterlogged', 'Reduce watering 1 week before transplanting', 'Maintain drainage channels'],
  },
  {
    crop: 'Rice',
    stage: 'Main field (Vegetative)',
    frequency: 'Every 5-7 days',
    volume: '50-75mm',
    waterNeeds: 'Maintain 5cm standing water',
    tips: ['Water when soil becomes slightly dry', 'Avoid complete drying', 'Check for seepage'],
  },
  {
    crop: 'Rice',
    stage: 'Reproductive',
    frequency: 'Every 4-5 days',
    volume: '75-100mm',
    waterNeeds: 'Critical stage',
    tips: ['Never let field dry completely', 'Reduce water 15 days before harvest'],
  },
  {
    crop: 'Wheat',
    stage: 'CRI stage (Critical)',
    frequency: 'Immediately after sowing',
    volume: '50mm',
    waterNeeds: 'Pre-sowing + CRI',
    tips: ['Must irrigate within 24-48 hours', 'Ensures proper germination'],
  },
  {
    crop: 'Wheat',
    stage: 'Tillering',
    frequency: 'Every 20-25 days',
    volume: '50mm per irrigation',
    waterNeeds: '400-500mm total',
    tips: ['Light irrigation to maintain soil moisture', 'Avoid waterlogging'],
  },
  {
    crop: 'Tomato',
    stage: 'Early (0-30 days)',
    frequency: 'Every 2-3 days',
    volume: '25mm',
    waterNeeds: '400-500mm total',
    tips: ['Light, frequent watering', 'Use drip for best results', 'Water at base only'],
  },
  {
    crop: 'Tomato',
    stage: 'Flowering & Fruiting',
    frequency: 'Every 1-2 days',
    volume: '25-30mm',
    waterNeeds: 'Frequent, critical',
    tips: ['Consistent moisture prevents cracking', 'Early morning watering preferred'],
  },
]

const CROPS = ['Rice', 'Wheat', 'Tomato']

export default function IrrigationSchedule() {
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice')

  const filteredSchedules = IRRIGATION_GUIDE.filter((item) => item.crop === selectedCrop)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-cyan-50 p-6 dark:border-slate-800 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Irrigation Scheduling</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Optimize water management with stage-specific irrigation schedules. Proper scheduling saves water and improves yields in water-scarce regions.
        </p>
      </div>

      {/* Crop Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {CROPS.map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-all ${
              selectedCrop === crop
                ? 'border-2 border-cyan-500 bg-cyan-100 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-900 dark:text-cyan-100'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Irrigation Schedules */}
      <div className="space-y-4">
        {filteredSchedules.map((schedule, idx) => (
          <div key={idx} className="rounded-lg border border-emerald-200 p-6 dark:border-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Stage</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{schedule.stage}</h3>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100">
                  {schedule.frequency}
                </span>
              </div>
            </div>

            <div className="mb-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Volume per Irrigation</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{schedule.volume}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Water Needs</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{schedule.waterNeeds}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Frequency</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{schedule.frequency}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Tips</p>
              <ul className="space-y-1">
                {schedule.tips.map((tip, tidx) => (
                  <li key={tidx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-cyan-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Water Saving Tips */}
      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-6 dark:border-cyan-900 dark:bg-cyan-900/20">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">Water-Saving Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-cyan-800 dark:text-cyan-200">
          <li>✓ Use drip irrigation to save 30-40% water vs flood irrigation</li>
          <li>✓ Apply mulch to reduce evaporation</li>
          <li>✓ Irrigate early morning to minimize water loss</li>
          <li>✓ Check soil moisture before watering</li>
          <li>✓ Collect rainwater and integrate with irrigation schedule</li>
        </ul>
      </div>
    </div>
  )
}
