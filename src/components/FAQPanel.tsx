'use client'

import { useState } from 'react'
import { faqData } from '@/data/guide'

export default function FAQPanel({ onClose }: { onClose: () => void }) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[80vh] bg-white dark:bg-navy-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-700 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-100 dark:bg-gold-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-navy-900 dark:text-white text-sm">Asistente Virtual</h3>
              <p className="text-xs text-navy-400 dark:text-navy-300">Respuestas a tus preguntas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-navy-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {faqData.map((cat) => (
            <div key={cat.category} className="rounded-xl border border-gray-100 dark:border-navy-700 overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-semibold text-sm text-navy-900 dark:text-white">{cat.category}</span>
                </div>
                <svg
                  className={`w-4 h-4 text-navy-400 transition-transform ${openCategory === cat.category ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openCategory === cat.category && (
                <div className="border-t border-gray-100 dark:border-navy-700">
                  {cat.items.map((item) => (
                    <div key={item.q}>
                      <button
                        onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors"
                      >
                        <span className="text-sm text-navy-700 dark:text-navy-200 flex-1 pr-2">{item.q}</span>
                        <svg
                          className={`w-3.5 h-3.5 text-navy-400 shrink-0 transition-transform ${openQuestion === item.q ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      {openQuestion === item.q && (
                        <div className="px-4 pb-3">
                          <p className="text-sm text-navy-500 dark:text-navy-300 leading-relaxed">{item.r}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900">
          <p className="text-xs text-center text-navy-400 dark:text-navy-300">
            ¿No encontrás lo que buscás? Escribinos a{' '}
            <a href="mailto:soporte@inmoxil.com.ar" className="text-gold-600 hover:text-gold-700 font-medium">soporte@inmoxil.com.ar</a>
          </p>
        </div>
      </div>
    </div>
  )
}
