'use client'

import { useState } from 'react'
import { BookOpen, Play, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Lesson {
  id: string
  title: string
  category: string
  duration: string
  level: string
  description: string
}

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Soil Preparation: Complete Guide',
    category: 'Basics',
    duration: '12 min',
    level: 'Beginner',
    description: 'Learn how to prepare your soil for planting. Covers testing, amendment, and best practices.',
  },
  {
    id: '2',
    title: 'Seed Selection & Germination',
    category: 'Basics',
    duration: '8 min',
    level: 'Beginner',
    description: 'How to choose quality seeds and ensure proper germination for your crops.',
  },
  {
    id: '3',
    title: 'Pest Management Without Chemicals',
    category: 'Advanced',
    duration: '15 min',
    level: 'Intermediate',
    description: 'Organic pest control methods including companion planting and natural sprays.',
  },
  {
    id: '4',
    title: 'Crop Rotation Strategy',
    category: 'Advanced',
    duration: '10 min',
    level: 'Intermediate',
    description: 'Maximize soil health and prevent disease using strategic crop rotation.',
  },
  {
    id: '5',
    title: 'Post-Harvest Handling',
    category: 'Harvesting',
    duration: '14 min',
    level: 'Intermediate',
    description: 'Proper harvest, drying, and storage techniques to prevent crop loss.',
  },
  {
    id: '6',
    title: 'Marketing Your Produce',
    category: 'Business',
    duration: '11 min',
    level: 'All Levels',
    description: 'Strategies for selling directly to buyers and getting better prices.',
  },
  {
    id: '7',
    title: 'Climate-Resilient Farming',
    category: 'Sustainability',
    duration: '16 min',
    level: 'Advanced',
    description: 'Adapt your farming to climate challenges with resilient techniques.',
  },
  {
    id: '8',
    title: 'Fertilizer Application Guide',
    category: 'Basics',
    duration: '9 min',
    level: 'Beginner',
    description: 'When and how to apply fertilizers for maximum crop benefit.',
  },
]

export default function EducationHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [watchedLessons, setWatchedLessons] = useState<string[]>([])

  const categories = ['All', ...new Set(LESSONS.map((l) => l.category))]
  const filteredLessons = selectedCategory === 'All' ? LESSONS : LESSONS.filter((l) => l.category === selectedCategory)

  const toggleWatched = (id: string) => {
    setWatchedLessons((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const getLevelColor = (level: string) => {
    if (level === 'Beginner') return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
    if (level === 'Intermediate') return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
    if (level === 'Advanced') return 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
    return 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-indigo-50 p-6 dark:border-slate-800 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Hub</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Step-by-step video tutorials and guides for both beginners learning to farm and experienced farmers looking for advanced techniques.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Lessons</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{LESSONS.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Watched</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{watchedLessons.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completion</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {LESSONS.length > 0 ? Math.round((watchedLessons.length / LESSONS.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium transition-all ${
              selectedCategory === cat
                ? 'border-2 border-indigo-500 bg-indigo-100 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-900 dark:text-indigo-100'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className={`rounded-lg border border-emerald-200 p-6 dark:border-slate-800 ${watchedLessons.includes(lesson.id) ? 'opacity-75' : ''}`}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{lesson.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{lesson.description}</p>
              </div>
              {watchedLessons.includes(lesson.id) && <span className="text-2xl">✓</span>}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">{lesson.duration}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getLevelColor(lesson.level)}`}>{lesson.level}</span>
            </div>

            <Button onClick={() => toggleWatched(lesson.id)} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600">
              <Play className="h-4 w-4" />
              {watchedLessons.includes(lesson.id) ? 'Watched' : 'Watch Now'}
            </Button>
          </div>
        ))}
      </div>

      {/* Resources Section */}
      <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:border-slate-800 dark:from-slate-800 dark:to-slate-700">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Downloadable Resources</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: 'Crop Calendar PDF', crops: 'All crops' },
            { title: 'Soil Testing Guide', crops: 'Beginner' },
            { title: 'Pest Identification Chart', crops: 'Reference' },
            { title: 'Fertilizer Calculator', crops: 'All crops' },
          ].map((resource, idx) => (
            <button
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-700 dark:hover:border-indigo-500"
            >
              <div className="text-left">
                <p className="font-medium text-slate-900 dark:text-white">{resource.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{resource.crops}</p>
              </div>
              <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
