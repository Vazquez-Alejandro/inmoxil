'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
const tooltipStyle = { backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '10px', fontSize: '12px' }

interface ReportData {
  overview: {
    totalProperties: number
    activeProperties: number
    totalLeads: number
    convertedLeads: number
    conversionRate: number
    totalContracts: number
    activeContracts: number
    totalPayments: number
    collectedPayments: number
    totalRevenue: number
    avgTimeToSell: number
    avgResponseTime: number
  }
  leadSources: Array<{ source: string; count: number; converted: number }>
  propertyPerformance: Array<{ id: string; title: string; views: number; inquiries: number; status: string }>
  monthlyTrends: Array<{ month: string; properties: number; leads: number; contracts: number; revenue: number }>
  topNeighborhoods: Array<{ neighborhood: string; properties: number; avgPrice: number; sold: number }>
  agentPerformance: Array<{ name: string; leads: number; conversions: number; revenue: number }>
  conversionFunnel: Array<{ stage: string; count: number; percentage: number }>
}

export default function ReportsPage() {
  const { workspace } = useWorkspace()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    if (workspace) {
      fetch(`/api/reports/performance?workspaceId=${workspace.id}&period=${period}`)
        .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
    }
  }, [workspace, period])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)

  return (
    <>
      <Header title="Reportes de Performance" subtitle="Analytics detallados de tu negocio inmobiliario" />

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {(['month', 'quarter', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === p ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-700'
            }`}
          >
            {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonTable rows={5} cols={4} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tasa de Conversión', value: `${data.overview.conversionRate.toFixed(1)}%`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Propiedades Activas', value: data.overview.activeProperties, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Contratos Activos', value: data.overview.activeContracts, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Ingresos Totales', value: formatCurrency(data.overview.totalRevenue), color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <p className="text-xs text-navy-400">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Leads', value: data.overview.totalLeads },
              { label: 'Leads Convertidos', value: data.overview.convertedLeads },
              { label: 'Tiempo Prom. Venta', value: `${data.overview.avgTimeToSell} días` },
              { label: 'Tiempo Respuesta', value: `${data.overview.avgResponseTime}h` },
            ].map((s, i) => (
              <div key={i} className="card p-5">
                <p className="text-xs text-navy-400">{s.label}</p>
                <p className="text-xl font-bold text-navy-900 dark:text-white mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Conversion Funnel */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Embudo de Conversión</h3>
            <div className="space-y-3">
              {data.conversionFunnel.map((stage, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-navy-600">{stage.stage}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">{stage.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-navy-900">{stage.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Tendencias Mensuales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="leads" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="contracts" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Lead Sources */}
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Fuentes de Leads</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.leadSources}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Neighborhoods */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Barrios con Mayor Actividad</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-navy-500 border-b">
                    <th className="pb-3 font-medium">Barrio</th>
                    <th className="pb-3 font-medium">Propiedades</th>
                    <th className="pb-3 font-medium">Precio Promedio</th>
                    <th className="pb-3 font-medium">Vendidos/Alquilados</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.topNeighborhoods.slice(0, 10).map((n, i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm font-medium text-navy-900">{n.neighborhood}</td>
                      <td className="py-3 text-sm text-navy-600">{n.properties}</td>
                      <td className="py-3 text-sm text-navy-600">{formatCurrency(n.avgPrice)}</td>
                      <td className="py-3 text-sm text-green-600 font-medium">{n.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Rendimiento del Equipo</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-navy-500 border-b">
                    <th className="pb-3 font-medium">Agente</th>
                    <th className="pb-3 font-medium">Leads</th>
                    <th className="pb-3 font-medium">Conversiones</th>
                    <th className="pb-3 font-medium">Tasa</th>
                    <th className="pb-3 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.agentPerformance.map((a, i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm font-medium text-navy-900">{a.name}</td>
                      <td className="py-3 text-sm text-navy-600">{a.leads}</td>
                      <td className="py-3 text-sm text-navy-600">{a.conversions}</td>
                      <td className="py-3 text-sm text-indigo-600 font-medium">
                        {a.leads > 0 ? `${((a.conversions / a.leads) * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td className="py-3 text-sm text-navy-600">{formatCurrency(a.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-navy-400">No hay datos disponibles</p>
        </div>
      )}
    </>
  )
}
