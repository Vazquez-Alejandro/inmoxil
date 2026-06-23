'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OwnerDashboardPage() {
  const [owner, setOwner] = useState<any>(null)
  const [stats, setStats] = useState({ totalProperties: 0, totalContracts: 0, activeContracts: 0, openTickets: 0 })

  useEffect(() => {
    fetch('/api/auth/owner/me')
      .then(r => r.json())
      .then(data => { if (data.owner) setOwner(data.owner) })

    fetch('/api/owner/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.totalProperties !== undefined) setStats(data)
      })
      .catch(() => {})
  }, [])

  const statCards = [
    { label: 'Mis Propiedades', value: stats.totalProperties, href: '/owner/propiedades', color: 'bg-indigo-500', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
    { label: 'Contratos Activos', value: stats.activeContracts, href: '/owner/contratos', color: 'bg-emerald-500', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Total Contratos', value: stats.totalContracts, href: '/owner/contratos', color: 'bg-amber-500', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Tickets Abiertos', value: stats.openTickets, href: '/owner/mantenimiento', color: 'bg-rose-500', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-sm text-navy-500 mt-1">
          Bienvenido, {owner?.name || 'Propietario'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
              </svg>
            </div>
            <p className="text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="text-xs text-navy-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Acceso rápido</h3>
          <div className="space-y-3">
            <Link href="/owner/propiedades" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Ver mis propiedades</p><p className="text-xs text-navy-500">Listado completo de tus inmuebles</p></div>
            </Link>
            <Link href="/owner/contratos" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Mis contratos</p><p className="text-xs text-navy-500">Consultá tus contratos activos</p></div>
            </Link>
            <Link href="/owner/mantenimiento" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645 5.645a2.25 2.25 0 01-3.18-3.18l5.645-5.645m2.25 2.25l5.645-5.645a2.25 2.25 0 013.18 3.18l-5.645 5.645m-2.25-2.25l5.645-5.645M11.42 15.17l2.25-2.25m0 0l5.645-5.645M11.42 15.17l-2.25 2.25m0 0l-5.645 5.645" /></svg>
              </div>
              <div><p className="font-medium text-navy-900">Mantenimiento</p><p className="text-xs text-navy-500">Seguimiento de tickets</p></div>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Resumen</h3>
          {owner ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center text-xl font-black text-white">
                  {owner.name?.[0] || 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-lg">{owner.name}</h4>
                  <p className="text-sm text-navy-500">{owner.email}</p>
                  {owner.phone && <p className="text-sm text-navy-400">{owner.phone}</p>}
                </div>
              </div>
              <div className="bg-navy-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-navy-400">Propiedades</p>
                    <p className="text-xl font-bold text-navy-900">{stats.totalProperties}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Contratos activos</p>
                    <p className="text-xl font-bold text-navy-900">{stats.activeContracts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Total contratos</p>
                    <p className="text-xl font-bold text-navy-900">{stats.totalContracts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Tickets abiertos</p>
                    <p className="text-xl font-bold text-navy-900">{stats.openTickets}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-navy-400 text-sm">Cargando...</p>
          )}
        </div>
      </div>
    </div>
  )
}
