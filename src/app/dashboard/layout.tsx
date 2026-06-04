'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { WorkspaceProvider } from '@/lib/workspace-context'
import { ToastProvider } from '@/lib/toast-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import Sidebar from '@/components/Sidebar'
import { getSupabase } from '@/lib/supabase-browser'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || loading) return

    const checkOnboarding = async () => {
      try {
        const supabase = getSupabase()
        const { data: userData } = await (supabase.from('users') as any)
          .select('workspace_id')
          .eq('id', user.id)
          .single()

        if (userData?.workspace_id) {
          const { data: ws } = await (supabase.from('workspaces') as any)
            .select('name')
            .eq('id', userData.workspace_id)
            .single()

          if (ws && ws.name === 'Mi Inmobiliaria') {
            router.push('/onboarding')
            return
          }
        }
      } catch {}
      setOnboardingChecked(true)
    }

    checkOnboarding()
  }, [user, loading, router])

  if (loading || (!onboardingChecked && user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  if (!user) return null

  return (
    <ToastProvider>
      <WorkspaceProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="lg:ml-64">
              <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-navy-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <div className="logo-mark w-8 h-8 text-sm">Ix</div>
                  <span className="font-bold text-navy-900">Inmoxil</span>
                </div>
              </div>

              <main className="p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </ErrorBoundary>
      </WorkspaceProvider>
    </ToastProvider>
  )
}
