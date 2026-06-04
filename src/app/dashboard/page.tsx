'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth'
import { useWorkspace } from '@/lib/workspace-context'

function PropertyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
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

function AdIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  )
}

function PortalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { workspace } = useWorkspace()
  const [properties, setProperties] = useState<any[]>([])
  const [creditHistory, setCreditHistory] = useState<any[]>([])

  useEffect(() => {
    if (workspace) {
      fetch(`/api/credits?workspaceId=${workspace.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.history) setCreditHistory(data.history)
        })
        .catch(() => {})
    }
  }, [workspace])

  const stats = [
    { label: 'Propiedades', value: properties.length.toString(), change: workspace?.plan || 'Starter', up: true, icon: PropertyIcon },
    { label: 'Créditos disponibles', value: (workspace?.credits_remaining ?? 50).toString(), change: `${workspace?.credits_used ?? 0} usados`, up: true, icon: CreditIcon },
    { label: 'Ads generados', value: creditHistory.filter((t: any) => t.type === 'consumption').length.toString(), change: 'Total', up: true, icon: AdIcon },
    { label: 'Portales activos', value: '8', change: 'Configurar', up: false, icon: PortalIcon },
  ]

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`Bienvenido, ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-navy-600" />
              </div>
              <span className={`text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-navy-500'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-900 tracking-tight">{stat.value}</p>
              <p className="text-sm text-navy-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-bold text-navy-900 mb-4">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/scrape" className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo scraping
          </Link>
          <Link href="/dashboard/properties" className="btn-outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            Ver propiedades
          </Link>
          <Link href="/dashboard/brand" className="btn-outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            Configurar marca
          </Link>
          <Link href="/dashboard/billing" className="btn-outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Ver planes
          </Link>
        </div>
      </div>

      {/* Workspace Info */}
      {workspace && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Tu empresa</h3>
          <div className="flex items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ backgroundColor: workspace.primary_color, color: workspace.secondary_color }}
            >
              {workspace.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-navy-900 text-lg">{workspace.name}</h4>
              <p className="text-sm text-navy-500">
                Plan <span className="font-semibold capitalize">{workspace.plan}</span> • 
                Slug: <code className="text-xs bg-navy-50 px-1.5 py-0.5 rounded">{workspace.slug}</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
