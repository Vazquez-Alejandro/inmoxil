'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const tooltipStyle = { backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '10px', fontSize: '12px' }

interface AnalyticsData {
  stats: { totalProperties: number; totalAds: number }
  portalStats: Array<{ portal: string; count: number }>
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
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <p className="text-xs text-navy-400">{s.label}</p>
                <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{s.value}</p>
              </div>
            ))}
          </div>

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
        </div>
      ) : null}
    </>
  )
}
