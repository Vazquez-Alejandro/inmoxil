'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast-context'
import { SkeletonCard, SkeletonTable } from '@/components/Skeleton'

interface AdminStats {
  totalWorkspaces: number
  totalUsers: number
  totalCreditsUsed: number
  revenueEstimate: number
}

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  credits_used: number
  credits_remaining: number
  created_at: string
  user_count: number
}

interface User {
  id: string
  email: string
  full_name: string
  workspace_id: string
  role: string
  created_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const isOwner = user?.user_metadata?.role === 'owner'

  useEffect(() => {
    if (!loading && !isOwner) {
      toast({ type: 'error', message: 'No tenés acceso a esta página' })
      router.push('/dashboard')
    }
  }, [isOwner, loading, router, toast])

  useEffect(() => {
    if (isOwner) {
      fetch('/api/admin')
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            toast({ type: 'error', message: data.error })
            return
          }
          setStats(data.stats)
          setWorkspaces(data.workspaces || [])
          setUsers(data.users || [])
        })
        .catch(() => {
          toast({ type: 'error', message: 'Error al cargar datos admin' })
        })
        .finally(() => setLoading(false))
    }
  }, [isOwner, toast])

  if (!isOwner && !loading) return null

  const statCards = stats
    ? [
        { label: 'Total usuarios', value: stats.totalUsers, icon: UsersIcon, color: 'bg-navy-50 text-navy-600' },
        { label: 'Total workspaces', value: stats.totalWorkspaces, icon: WorkspacesIcon, color: 'bg-gold-50 text-gold-600' },
        { label: 'Créditos consumidos', value: stats.totalCreditsUsed.toLocaleString(), icon: CreditsIcon, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Ingreso estimado', value: `$${stats.revenueEstimate.toLocaleString()}/mes`, icon: RevenueIcon, color: 'bg-coral-400/10 text-coral-400' },
      ]
    : []

  const maxCredits = Math.max(...workspaces.map(w => w.credits_used), 1)

  const chartBars = workspaces.slice(0, 8).map(w => ({
    name: w.name.length > 12 ? w.name.slice(0, 12) + '…' : w.name,
    value: w.credits_used,
    pct: Math.round((w.credits_used / maxCredits) * 100),
  }))

  const planCounts = workspaces.reduce((acc: Record<string, number>, w) => {
    acc[w.plan || 'starter'] = (acc[w.plan || 'starter'] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const maxPlanCount = Math.max(...Object.values(planCounts), 1)
  const planBars = [
    { plan: 'Starter', count: planCounts.starter || 0 },
    { plan: 'Pro', count: planCounts.pro || 0 },
    { plan: 'Enterprise', count: planCounts.enterprise || 0 },
  ]

  const planColors: Record<string, string> = {
    starter: 'bg-navy-400',
    pro: 'bg-gold-400',
    enterprise: 'bg-coral-400',
  }

  if (loading) {
    return (
      <>
        <Header title="Admin Panel" subtitle="Gestión global de la plataforma" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable rows={5} cols={5} />
      </>
    )
  }

  return (
    <>
      <Header title="Admin Panel" subtitle="Gestión global de la plataforma" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-900 tracking-tight">{stat.value}</p>
              <p className="text-sm text-navy-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Credits by Workspace Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Créditos por workspace</h3>
          <div className="space-y-3">
            {chartBars.map((bar) => (
              <div key={bar.name} className="flex items-center gap-3">
                <span className="text-xs text-navy-500 w-24 text-right truncate">{bar.name}</span>
                <div className="flex-1 bg-navy-50 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-gradient-gold h-5 rounded-full transition-all duration-500"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-navy-700 w-10 text-right">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Distribución de planes</h3>
          <div className="space-y-4">
            {planBars.map((bar) => (
              <div key={bar.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-700">{bar.plan}</span>
                  <span className="text-sm font-semibold text-navy-900">{bar.count} workspaces</span>
                </div>
                <div className="w-full bg-navy-50 rounded-full h-6 overflow-hidden">
                  <div
                    className={`${planColors[bar.plan.toLowerCase()] || 'bg-navy-400'} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max((bar.count / maxPlanCount) * 100, 8)}%` }}
                  >
                    {bar.count > 0 && (
                      <span className="text-[10px] font-bold text-white">{bar.count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="card mb-8">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-900">Workspaces</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Nombre</th>
                <th className="table-header">Plan</th>
                <th className="table-header">Créditos usados</th>
                <th className="table-header">Creado</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-xs">
                        {ws.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">{ws.name}</p>
                        <p className="text-xs text-navy-400">{ws.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      ws.plan === 'enterprise' ? 'badge-gold' :
                      ws.plan === 'pro' ? 'bg-navy-100 text-navy-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ws.plan || 'starter'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold">{ws.credits_used ?? 0}</span>
                  </td>
                  <td className="table-cell">
                    {new Date(ws.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="table-cell">
                    <span className="badge-green">Activo</span>
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-navy-400 text-sm">
                    No hay workspaces registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-900">Usuarios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Nombre</th>
                <th className="table-header">Email</th>
                <th className="table-header">Workspace</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const ws = workspaces.find(w => w.id === u.workspace_id)
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-xs">
                          {u.full_name?.[0] || u.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-navy-900">{u.full_name || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="table-cell text-navy-500">{u.email}</td>
                    <td className="table-cell">{ws?.name || '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        u.role === 'owner' ? 'badge-gold' : 'badge-navy'
                      }`}>
                        {u.role || 'member'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-AR') : '—'}
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-navy-400 text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function WorkspacesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function CreditsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  )
}

function RevenueIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
