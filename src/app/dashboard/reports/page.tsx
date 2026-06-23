'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

function formatPrice(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

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

  return (
    <>
      <Header title="Reportes" subtitle="Estadísticas generales del portfolio" />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Propiedades', value: s.totalProperties, icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Leads activos', value: s.activeLeads, icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Contratos activos', value: s.activeContracts, icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cobrado total', value: formatPrice(s.totalCollected), icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((card, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-navy-400">{card.label}</p>
                <p className="text-xl font-bold text-navy-900">{card.value || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by type */}
        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4">Propiedades por tipo</h3>
          {data?.propertiesByType?.length > 0 ? (
            <div className="space-y-2">
              {data.propertiesByType.map((item: any) => (
                <div key={item.property_type} className="flex items-center gap-3">
                  <span className="text-sm text-navy-700 capitalize w-24">{item.property_type || 'Sin tipo'}</span>
                  <div className="flex-1 h-4 bg-navy-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${(item.count / s.totalProperties) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-navy-900 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">Sin datos</p>
          )}
        </div>

        {/* Leads by source */}
        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4">Leads por origen</h3>
          {data?.leadsBySource?.length > 0 ? (
            <div className="space-y-2">
              {data.leadsBySource.map((item: any) => (
                <div key={item.source} className="flex items-center gap-3">
                  <span className="text-sm text-navy-700 capitalize w-24">{item.source || 'Otro'}</span>
                  <div className="flex-1 h-4 bg-navy-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.count / Math.max(1, s.activeLeads)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-navy-900 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">Sin datos</p>
          )}
        </div>

        {/* Monthly leads chart */}
        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4">Leads mensuales (12 meses)</h3>
          {data?.monthlyLeads?.length > 0 ? (
            <div className="space-y-1">
              {data.monthlyLeads.map((item: any) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-xs text-navy-500 w-16">{item.month}</span>
                  <div className="flex-1 h-5 bg-navy-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (item.count / Math.max(...data.monthlyLeads.map((m: any) => m.count))) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-navy-700 w-6 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">Sin datos</p>
          )}
        </div>

        {/* Recent payments */}
        <div className="card p-6">
          <h3 className="font-bold text-navy-900 mb-4">Últimos cobros</h3>
          {data?.recentPayments?.length > 0 ? (
            <div className="space-y-2">
              {data.recentPayments.slice(0, 10).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-navy-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{p.contract_title || 'Pago'}</p>
                    <p className="text-xs text-navy-400">{p.concept} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-AR') : '-'}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{formatPrice(p.amount, p.currency)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">Sin cobros registrados</p>
          )}
        </div>
      </div>

      {/* Export button */}
      <div className="mt-6 flex gap-3">
        <button onClick={() => window.print()} className="btn-outline">
          <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Imprimir / PDF
        </button>
      </div>
    </>
  )
}
