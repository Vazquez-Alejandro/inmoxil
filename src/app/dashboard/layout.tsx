'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { WorkspaceProvider } from '@/lib/workspace-context'
import { ToastProvider } from '@/lib/toast-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import Sidebar from '@/components/Sidebar'

function TermsModal({ onAccept }: { onAccept: () => void }) {
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      await fetch('/api/terms', { method: 'POST' })
      onAccept()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-navy-950 z-[100] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full max-h-[90vh] flex flex-col bg-white dark:bg-navy-900 rounded-2xl border border-gray-200 dark:border-navy-700 shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="logo-mark w-10 h-10 text-base">Ix</div>
            <h2 className="text-xl font-bold text-navy-900">Bienvenido a Inmoxil</h2>
          </div>
          <p className="text-sm text-navy-500">Antes de continuar, necesitás aceptar nuestros Términos y Condiciones.</p>
        </div>

        <div
          className="flex-1 overflow-y-auto p-6 text-sm text-navy-700 space-y-4"
          onScroll={(e) => {
            const el = e.currentTarget
            setScrolled(el.scrollTop + el.clientHeight >= el.scrollHeight - 50)
          }}
        >
          <div>
            <h3 className="font-bold text-navy-900 mb-2">Uso del Scraping</h3>
            <p className="leading-relaxed">
              La plataforma permite recopilar información de propiedades inmobiliarias de portales públicos.
              El scraping debe realizarse con fines lícitos (monitoreo de mercado o gestión de propias propiedades).
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Queda <strong>prohibido</strong> copiar o publicar como propias las publicaciones de otras inmobiliarias.</li>
              <li>El usuario es el <strong>único responsable</strong> del uso que le dé a la información obtenida.</li>
              <li>Debe respetar los términos de servicio de cada portal inmobiliario.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-navy-900 mb-2">Responsabilidad</h3>
            <p className="leading-relaxed">
              Inmoxil no se responsabiliza por reclamos, sanciones o consecuencias legales derivadas del uso
              indebido del scraping. Los datos pueden cambiar sin previo aviso.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-navy-900 mb-2">Privacidad</h3>
            <p className="leading-relaxed">
              Al aceptar, aceptás nuestra{' '}
              <Link href="/privacidad" target="_blank" className="text-gold-600 hover:text-gold-700 underline font-medium">Política de Privacidad</Link>
              {' '}y{' '}
              <Link href="/terminos" target="_blank" className="text-gold-600 hover:text-gold-700 underline font-medium">Términos de Servicio</Link>.
              Tus datos son protegidos conforme a la Ley 25.326 de Argentina.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
              onChange={(e) => {
                const btn = document.getElementById('accept-terms-btn') as HTMLButtonElement
                if (btn) btn.disabled = !e.target.checked
              }}
            />
            <span className="text-sm text-navy-700">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="text-gold-600 hover:text-gold-700 underline">Términos de Servicio</Link>
              {' '}y la{' '}
              <Link href="/privacidad" target="_blank" className="text-gold-600 hover:text-gold-700 underline">Política de Privacidad</Link>.
            </span>
          </label>
          <button
            id="accept-terms-btn"
            onClick={handleAccept}
            disabled={loading}
            className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Aceptar y continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else {
        fetch('/api/terms')
          .then(r => r.json())
          .then(data => setTermsAccepted(data.accepted))
          .catch(() => setTermsAccepted(false))
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    if (termsAccepted === true) setReady(true)
  }, [termsAccepted])

  if (loading || !ready && termsAccepted === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="logo-mark w-12 h-12">Ix</div>
          <div className="flex items-center gap-2 text-navy-500">
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

  if (termsAccepted === false) {
    return <TermsModal onAccept={() => setTermsAccepted(true)} />
  }

  return (
    <ToastProvider>
      <WorkspaceProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="lg:ml-64 flex flex-col min-h-screen">
              <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-navy-900 border-b border-gray-200 dark:border-navy-700 sticky top-0 z-30">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800">
                  <svg className="w-5 h-5 text-navy-700 dark:text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

              <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 dark:border-navy-700 mt-auto">
                <div className="flex items-center justify-center gap-4 text-xs text-navy-400 dark:text-navy-500">
                  <Link href="/terminos" target="_blank" className="hover:text-navy-600 dark:hover:text-navy-300 transition-colors">Términos y Condiciones</Link>
                  <span>·</span>
                  <Link href="/privacidad" target="_blank" className="hover:text-navy-600 dark:hover:text-navy-300 transition-colors">Política de Privacidad</Link>
                </div>
              </footer>
            </div>
          </div>
        </ErrorBoundary>
      </WorkspaceProvider>
    </ToastProvider>
  )
}
