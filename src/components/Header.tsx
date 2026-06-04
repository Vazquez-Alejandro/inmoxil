'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-xs">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-navy-900">{user?.user_metadata?.full_name || 'Usuario'}</p>
              <p className="text-xs text-navy-500">{user?.email}</p>
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
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
