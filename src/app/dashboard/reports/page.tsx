'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function formatPrice(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

const tooltipStyle = { backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '10px', fontSize: '12px' }

export default function ReportsPage() {
  const { workspace } = useWorkspace()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspace?.id) return
    setLoading(true)
    fetch(`/api/reports?workspaceId=${workspace.id}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [workspace?.id])

  if (loading) return <div className="space-y-4 mt-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-navy-50 rounded-lg animate-pulse" />)}</div>

  const s = data?.stats || {}

  const propertiesByType = (data?.propertiesByType || []).map((item: any) => ({
    name: item.property_type || 'Sin tipo',
    cantidad: item.count,
  }))

  const leadsBySource = (data?.leadsBySource || []).map((item: any) => ({
    name: item.source || 'Otro',
    value: item.count,
  }))

  const monthlyLeads = (data?.monthlyLeads || []).map((item: any) => ({
    mes: item.month,
    leads: item.count,
  }))

  const revenueData = (data?.recentPayments || []).reduce((acc: any[], p: any) => {
    const month = p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }) : 'N/A'
    const existing = acc.find(a => a.mes === month)
    if (existing) existing.monto += p.amount || 0
    else acc.push({ mes: month, monto: p.amount || 0 })
    return acc
  }, []).reverse()

  return (
    <>
      <Header title="Reportes" subtitle="Estadísticas generales del portfolio" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Propiedades', value: s.totalProperties, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Leads activos', value: s.activeLeads, color: 'bg-blue-50 text-blue-600' },
          { label: 'Contratos activos', value: s.activeContracts, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Cobrado total', value: formatPrice(s.totalCollected), color: 'bg-emerald-50 text-emerald-600' },
        ].map((card, i) => (
          <div key={i} className="card p-4">
            <p className="text-xs text-navy-400">{card.label}</p>
            <p className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{card.value || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Propiedades por tipo</h3>
          {propertiesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={propertiesByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cantidad" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-navy-400">Sin datos</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Leads por origen</h3>
          {leadsBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={leadsBySource} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                  {leadsBySource.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v: string) => <span style={{ color: '#64748b', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-navy-400">Sin datos</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Leads mensuales (12 meses)</h3>
          {monthlyLeads.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyLeads}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fill="url(#leadsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-navy-400">Sin datos</p>}
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Ingresos por mes</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatPrice(v), 'Monto']} />
                <Line type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-navy-400">Sin cobros registrados</p>}
        </div>
      </div>

      {data?.recentPayments?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Últimos cobros</h3>
          <div className="space-y-2">
            {data.recentPayments.slice(0, 10).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{p.contract_title || 'Pago'}</p>
                  <p className="text-xs text-navy-400">{p.concept} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-AR') : '-'}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{formatPrice(p.amount, p.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={() => window.print()} className="btn-outline">
          Imprimir / PDF
        </button>
        {workspace?.id && (
          <button onClick={async () => {
            const email = prompt('Email (opcional):')
            const res = await fetch('/api/reports/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workspaceId: workspace.id, email: email || undefined, type: 'monthly' }),
            })
            const result = await res.json()
            if (result.success) alert('Reporte enviado')
            else alert('Error: ' + (result.error || 'desconocido'))
          }} className="btn-primary">
            Enviar reporte mensual
          </button>
        )}
      </div>
    </>
  )
}
