'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const tooltipStyle = { backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '10px', fontSize: '12px' }

interface AnalyticsData {
  stats: { totalProperties: number; totalAds: number; creditsUsed: number; creditsRemaining: number }
  portalStats: Array<{ portal: string; count: number }>
  transactions: Array<{ id: string; type: string; amount: number; description: string; created_at: string }>
  topProperties: Array<{ id: string; portal: string; created_at: string }>
}

export default function AnalyticsPage() {
  const { workspace } = useWorkspace()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace) {
      fetch(`/api/analytics?workspaceId=${workspace.id}`)
        .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
    }
  }, [workspace])

  const totalPlanCredits = workspace?.plan === 'enterprise' ? 1000 : workspace?.plan === 'pro' ? 200 : 50

  const creditData = data ? [
    { name: 'Consumidos', value: data.stats.creditsUsed },
    { name: 'Restantes', value: data.stats.creditsRemaining },
  ] : []

  const portalData = (data?.portalStats || []).map(p => ({ name: p.portal, cantidad: p.count }))

  return (
    <>
      <Header title="Estadísticas" subtitle="Resumen de actividad y métricas de tu cuenta" />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonTable rows={5} cols={2} />
            <SkeletonTable rows={5} cols={2} />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Propiedades', value: data.stats.totalProperties, bg: 'bg-indigo-50', color: 'text-indigo-600' },
              { label: 'Ads Generados', value: data.stats.totalAds, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Créditos Consumidos', value: data.stats.creditsUsed, bg: 'bg-red-50', color: 'text-red-600' },
              { label: 'Créditos Restantes', value: data.stats.creditsRemaining, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <p className="text-xs text-navy-400">{s.label}</p>
                <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Propiedades por Portal</h3>
              {portalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={portalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-navy-400 text-center py-8">Sin datos de portales</p>}
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Uso de Créditos</h3>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={creditData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                      <Cell fill="#ef4444" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend formatter={(v: string) => <span style={{ color: '#64748b', fontSize: '12px' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-sm text-navy-500 -mt-2">{data.stats.creditsRemaining} de {totalPlanCredits} restantes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Actividad Reciente</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.transactions.length === 0 ? (
                  <p className="text-sm text-navy-400 text-center py-4">Sin transacciones</p>
                ) : data.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'consumption' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {tx.type === 'consumption' ? '−' : '+'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{tx.description || (tx.type === 'consumption' ? 'Crédito consumido' : 'Créditos agregados')}</p>
                      <p className="text-xs text-navy-500">{new Date(tx.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'consumption' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.type === 'consumption' ? '-' : '+'}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Propiedades Más Recientes</h3>
              <div className="space-y-2">
                {data.topProperties.length === 0 ? (
                  <p className="text-sm text-navy-400 text-center py-4">Sin propiedades</p>
                ) : data.topProperties.map((prop, idx) => (
                  <div key={prop.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-bold text-navy-400 w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">Propiedad {idx + 1}</p>
                      <p className="text-xs text-navy-500">{prop.portal}</p>
                    </div>
                    <span className="text-xs text-navy-400">{new Date(prop.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
