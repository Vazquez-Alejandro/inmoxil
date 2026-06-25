'use client'

import { useState, useEffect } from 'react'
import { tourSteps } from '@/data/guide'

export default function TourOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current = tourSteps[step]
  if (!current || !mounted) return null

  const next = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative max-w-lg w-full mx-4 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <div className="h-1.5 bg-gray-100 dark:bg-navy-700">
          <div
            className="h-full bg-gold-500 transition-all duration-300"
            style={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-navy-400 dark:text-navy-300">
              {step + 1} de {tourSteps.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-navy-400 hover:text-navy-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gold-100 dark:bg-gold-500/20 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{current.title}</h3>
          <p className="text-navy-600 dark:text-navy-300 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={prev}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-medium text-navy-600 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex gap-1.5">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-gold-500 w-4' : 'bg-gray-300 dark:bg-navy-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="px-5 py-2 text-sm font-medium bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors"
          >
            {step < tourSteps.length - 1 ? 'Siguiente' : 'Comenzar'}
          </button>
        </div>
      </div>
    </div>
  )
}
