'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth'
import { useWorkspace } from '@/lib/workspace-context'

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency === 'USD' ? 'USD' : 'ARS', maximumFractionDigits: 0 }).format(price)

export default function DashboardPage() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const [stats, setStats] = useState<any>({ properties: 0, leads: 0, contracts: 0, pendingAdjustments: 0, unread: 0 })

  useEffect(() => {
    if (!workspace?.id) return
    fetch(`/api/credits?workspaceId=${workspace.id}`).catch(() => {})
    Promise.all([
      fetch(`/api/properties?workspaceId=${workspace.id}&limit=1`).then(r => r.json()).then(d => d.total || 0).catch(() => 0),
      fetch(`/api/pipeline/stats?workspaceId=${workspace.id}`).then(r => r.json()).then(d => d.activeLeads || 0).catch(() => 0),
      fetch(`/api/contracts?workspaceId=${workspace.id}&limit=1`).then(r => r.json()).then(d => d.total || 0).catch(() => 0),
      fetch(`/api/adjustments?workspaceId=${workspace.id}&pending=true`).then(r => r.json()).then(d => d.pending || 0).catch(() => 0),
      fetch(`/api/notifications?workspaceId=${workspace.id}&count=true`).then(r => r.json()).then(d => d.count || 0).catch(() => 0),
    ]).then(([properties, leads, contracts, pendingAdjustments, unread]) => {
      setStats({ properties, leads, contracts, pendingAdjustments, unread })
    })
  }, [workspace?.id])

  const statCards = [
    { label: 'Propiedades', value: stats.properties, href: '/dashboard/properties', color: 'bg-indigo-500', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
    { label: 'Clientes activos', value: stats.leads, href: '/dashboard/pipeline', color: 'bg-emerald-500', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { label: 'Contratos activos', value: stats.contracts, href: '/dashboard/contracts', color: 'bg-amber-500', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Próximos ajustes', value: stats.pendingAdjustments, href: '/dashboard/contracts', color: 'bg-rose-500', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
    { label: 'Notificaciones', value: stats.unread, href: '/dashboard/notifications', color: 'bg-purple-500', icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
    { label: 'Créditos', value: workspace?.credits_remaining ?? 0, href: '/dashboard/billing', color: 'bg-cyan-500', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125' },
  ]

  return (
    <>
      <Header title="Panel" subtitle={`Bienvenido/a, ${user?.name || user?.email?.split('@')[0] || 'Usuario'}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="card p-4 hover:shadow-md transition-shadow group">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-navy-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Acciones rápidas</h3>
          <div className="space-y-3">
            <Link href="/dashboard/scrape" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Nuevo scraping</p><p className="text-xs text-navy-500">Importar propiedades de ZP o Argenprop</p></div>
            </Link>
            <Link href="/dashboard/pipeline" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Nuevo lead</p><p className="text-xs text-navy-500">Agregar cliente al pipeline</p></div>
            </Link>
            <Link href="/dashboard/contracts/new" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Nuevo contrato</p><p className="text-xs text-navy-500">Crear contrato con ajuste IPC/ICL</p></div>
            </Link>
            <Link href="/dashboard/properties" className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 hover:bg-navy-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-navy-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Ver propiedades</p><p className="text-xs text-navy-500">Gestionar el inventario</p></div>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Información del workspace</h3>
          {workspace ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black" style={{ backgroundColor: workspace.primary_color, color: workspace.secondary_color }}>
                  {workspace.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-lg">{workspace.name}</h4>
                  <p className="text-sm text-navy-500">
                    Plan <span className="font-semibold capitalize">{workspace.plan}</span> • <code className="text-xs bg-navy-50 px-1.5 py-0.5 rounded">{workspace.slug}</code>
                  </p>
                </div>
              </div>
              <div className="bg-navy-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-navy-600 font-medium">Créditos</span>
                  <span className="text-navy-900 font-bold">{workspace.credits_remaining} disponibles</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-gold-500 h-2 rounded-full transition-all" style={{ width: `${(workspace.credits_remaining / 200) * 100}%` }} />
                </div>
                <p className="text-xs text-navy-400 mt-1.5">{workspace.credits_used} usados este período</p>
              </div>
            </div>
          ) : (
            <p className="text-navy-400 text-sm">Cargando...</p>
          )}
        </div>
      </div>
    </>
  )
}