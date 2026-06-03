'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-ghost relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral-400 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-xs">
              Ix
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-navy-900">Inmoxil</p>
              <p className="text-xs text-navy-500">admin@inmoxil.com</p>
            </div>
            <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-corporate-lg z-50 py-1">
                <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                <Link href="/dashboard/billing" className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50" onClick={() => setShowUserMenu(false)}>Billing</Link>
                <Link href="/dashboard/brand" className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50" onClick={() => setShowUserMenu(false)}>Brand Kit</Link>
                <div className="divider my-1" />
                <Link href="/login" className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" onClick={() => setShowUserMenu(false)}>Cerrar sesión</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
