'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme-context'
import NotificationBell from './NotificationBell'
import LocaleSelector from './LocaleSelector'

export default function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between mb-8 gap-4">
      <div className="min-w-0 flex-shrink-0">
        <h1 className="page-title truncate">{title}</h1>
        {subtitle && <p className="page-subtitle truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <LocaleSelector />
        <NotificationBell />
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
        {action}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900 dark:bg-navy-700 flex items-center justify-center text-gold-400 font-bold text-xs">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-navy-900 dark:text-white">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{user?.email}</p>
            </div>
            <svg className="w-4 h-4 text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl border border-gray-200 dark:border-navy-700 shadow-corporate-lg z-50 py-1">
                <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                <Link href="/dashboard/billing" className="block px-4 py-2.5 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" onClick={() => setShowUserMenu(false)}>Billing</Link>
                <Link href="/dashboard/brand" className="block px-4 py-2.5 text-sm text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" onClick={() => setShowUserMenu(false)}>Brand Kit</Link>
                <div className="divider dark:border-navy-700 my-1" />
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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
