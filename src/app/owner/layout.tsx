'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: DashboardIcon },
  { name: 'Mis Propiedades', href: '/owner/propiedades', icon: PropertiesIcon },
  { name: 'Contratos', href: '/owner/contratos', icon: ContractIcon },
  { name: 'Mantenimiento', href: '/owner/mantenimiento', icon: MaintenanceIcon },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [owner, setOwner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/owner/me')
      .then(r => r.json())
      .then(data => {
        if (!data.owner) {
          router.replace('/owner/login')
        } else {
          setOwner(data.owner)
        }
      })
      .catch(() => router.replace('/owner/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/owner/logout', { method: 'POST' })
    router.replace('/owner/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="logo-mark w-12 h-12">Ix</div>
          <div className="flex items-center gap-2 text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!owner) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <aside className="w-64 h-full bg-gradient-dark flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="logo-mark">Ix</div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">Inmoxil</h1>
                <p className="text-navy-400 text-[10px] uppercase tracking-widest font-medium dark:text-navy-300 dark:text-navy-100">Propietario</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded text-navy-400 hover:text-white dark:text-navy-300 dark:text-navy-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm">
                {owner.name?.[0] || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{owner.name}</p>
                <p className="text-navy-400 text-xs truncate dark:text-navy-300 dark:text-navy-100">{owner.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-white/10 shrink-0 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-navy-400 hover:text-white hover:bg-white/10 transition-all duration-150 w-full dark:text-navy-300 dark:text-navy-100"
            >
              <LogoutIcon className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </aside>
      </div>

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-navy-700 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="logo-mark w-8 h-8 text-sm">Ix</div>
            <span className="font-bold text-navy-900 dark:text-white">Inmoxil</span>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

        <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center justify-center gap-4 text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">
            <Link href="/terminos" target="_blank" className="hover:text-navy-600 transition-colors dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Términos y Condiciones</Link>
            <span>·</span>
            <Link href="/privacidad" target="_blank" className="hover:text-navy-600 transition-colors dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Política de Privacidad</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function PropertiesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function MaintenanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645 5.645a2.25 2.25 0 01-3.18-3.18l5.645-5.645m2.25 2.25l5.645-5.645a2.25 2.25 0 013.18 3.18l-5.645 5.645m-2.25-2.25l5.645-5.645M11.42 15.17l2.25-2.25m0 0l5.645-5.645M11.42 15.17l-2.25 2.25m0 0l-5.645 5.645" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}
