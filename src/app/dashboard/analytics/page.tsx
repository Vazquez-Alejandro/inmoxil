'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'

interface AnalyticsData {
  stats: {
    totalProperties: number
    totalAds: number
    creditsUsed: number
    creditsRemaining: number
  }
  portalStats: Array<{ portal: string; count: number }>
  transactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    created_at: string
  }>
  topProperties: Array<{
    id: string
    portal: string
    created_at: string
  }>
}

export default function AnalyticsPage() {
  const { workspace } = useWorkspace()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (workspace) {
      fetch(`/api/analytics?workspaceId=${workspace.id}`)
        .then(r => {
          if (!r.ok) throw new Error('Error fetching analytics')
          return r.json()
        })
        .then(setData)
        .catch(() => setError('Error al cargar analytics'))
        .finally(() => setLoading(false))
    }
  }, [workspace])

  const maxPortalCount = data?.portalStats.reduce((max, p) => Math.max(max, p.count), 0) || 1

  const totalPlanCredits = (() => {
    switch (workspace?.plan) {
      case 'enterprise': return 1000
      case 'pro': return 200
      default: return 50
    }
  })()

  return (
    <>
      <Header
        title="Estadísticas"
        subtitle="Resumen de actividad y métricas de tu cuenta"
      />

      {error && (
        <div className="card p-4 mb-6 border-l-4 border-red-400 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonTable rows={5} cols={2} />
            <SkeletonTable rows={5} cols={2} />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<PropertyIcon className="w-5 h-5" />}
              label="Total Propiedades"
              value={data.stats.totalProperties}
              color="bg-navy-50 text-navy-600"
            />
            <StatCard
              icon={<AdIcon className="w-5 h-5" />}
              label="Total Ads Generados"
              value={data.stats.totalAds}
              color="bg-gold-50 text-gold-600"
            />
            <StatCard
              icon={<CreditIcon className="w-5 h-5" />}
              label="Créditos Consumidos"
              value={data.stats.creditsUsed}
              color="bg-red-50 text-red-600"
            />
            <StatCard
              icon={<CreditIcon className="w-5 h-5" />}
              label="Créditos Restantes"
              value={data.stats.creditsRemaining}
              color="bg-emerald-50 text-emerald-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Properties by Portal */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Propiedades por Portal</h3>
              {data.portalStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-navy-500">Sin datos de portales disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.portalStats.map(item => (
                    <div key={item.portal} className="flex items-center gap-4">
                      <span className="text-sm text-navy-700 font-medium w-28 truncate text-right">
                        {item.portal}
                      </span>
                      <div className="flex-1">
                        <div className="h-8 bg-navy-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-navy-600 to-navy-400 rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                            style={{ width: `${(item.count / maxPortalCount) * 100}%` }}
                          >
                            <span className="text-xs font-bold text-white">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Donut Chart - Credits Usage */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-6">Uso de Créditos</h3>
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={`${(data.stats.creditsUsed / totalPlanCredits) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-navy-900">{data.stats.creditsRemaining}</span>
                    <span className="text-xs text-navy-500">restantes</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-coral-400" />
                    <span className="text-sm text-navy-600">Consumidos ({data.stats.creditsUsed})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <span className="text-sm text-navy-600">Restantes ({data.stats.creditsRemaining})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed & Top Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Actividad Reciente</h3>
              {data.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-navy-500">Sin transacciones registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'consumption' ? 'bg-red-100 text-red-600' :
                        tx.type === 'topup' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-navy-100 text-navy-600'
                      }`}>
                        {tx.type === 'consumption' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {tx.description || (tx.type === 'consumption' ? 'Crédito consumido' : 'Créditos agregados')}
                        </p>
                        <p className="text-xs text-navy-500">
                          {new Date(tx.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${
                        tx.type === 'consumption' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {tx.type === 'consumption' ? '-' : '+'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Properties */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">Propiedades Más Recientes</h3>
              {data.topProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-navy-500">Sin propiedades registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topProperties.map((prop, idx) => (
                    <div key={prop.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-bold text-navy-400 w-6">{idx + 1}</span>
                      <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                        <PropertyIcon className="w-5 h-5 text-navy-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">Propiedad {idx + 1}</p>
                        <p className="text-xs text-navy-500">{prop.portal}</p>
                      </div>
                      <span className="text-xs text-navy-400">
                        {new Date(prop.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-navy-900 tracking-tight">{value}</p>
        <p className="text-sm text-navy-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

function PropertyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function AdIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
    </svg>
  )
}

function CreditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  )
}
