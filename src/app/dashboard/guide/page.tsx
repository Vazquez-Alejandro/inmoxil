'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { guideSections } from '@/data/guide'

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string>(guideSections[0].id)

  const current = guideSections.find(s => s.id === activeSection)

  return (
    <>
      <Header
        title="Guía de usuario"
        subtitle="Todo lo que necesitás saber para usar Inmoxil"
      />

      <div className="flex gap-6">
        <nav className="w-56 shrink-0 space-y-0.5">
          {guideSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-gold-500 text-white'
                  : 'text-navy-600 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {current && (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-100 dark:bg-gold-500/20 flex items-center justify-center">
                  <span className="text-gold-600 font-bold text-sm">
                    {current.title.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white">{current.title}</h2>
                  <p className="text-sm text-navy-500 dark:text-navy-300">{current.description}</p>
                </div>
              </div>

              <ul className="space-y-3 mt-6">
                {current.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold-100 dark:bg-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm text-navy-600 dark:text-navy-200 leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
