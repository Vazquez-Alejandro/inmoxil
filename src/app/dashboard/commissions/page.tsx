'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { useAuth } from '@/lib/auth'

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', maximumFractionDigits: 0 }).format(price)

export default function CommissionsPage() {
  const { workspace } = useWorkspace()
  const { user } = useAuth()
  const [commissions, setCommissions] = useState<any[]>([])
  const [stats, setStats] = useState<any>({ totalPending: 0, totalPaid: 0, pendingAmount: 0, paidAmount: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'paid' | 'all'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', currency: 'ARS', dueDate: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    loadData()
  }, [workspace?.id, tab])

  const loadData = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const [comRes, statsRes] = await Promise.all([
      fetch(`/api/commissions?workspaceId=${workspace.id}&status=${tab === 'all' ? '' : tab}`).then(r => r.json()),
      fetch(`/api/commissions?workspaceId=${workspace.id}&stats=true`).then(r => r.json()),
    ])
    setCommissions(comRes.commissions || [])
    setStats(statsRes.stats || {})
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id || !form.title || !form.amount) return
    setSaving(true)
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId: workspace.id, title: form.title, amount: parseFloat(form.amount),
        currency: form.currency, dueDate: form.dueDate || null, description: form.description || null,
        createdBy: user?.id, status: 'pending',
      }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', amount: '', currency: 'ARS', dueDate: '', description: '' })
    loadData()
  }

  const markPaid = async (id: string) => {
    if (!workspace?.id) return
    await fetch('/api/commissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, id, status: 'paid', paidAt: new Date().toISOString() }),
    })
    loadData()
  }

  const cancel = async (id: string) => {
    if (!workspace?.id) return
    await fetch('/api/commissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, id, status: 'cancelled' }),
    })
    loadData()
  }

  return (
    <>
      <Header title="Comisiones y Cobranzas" subtitle="Gestioná tus ingresos por operaciones" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-navy-500 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{stats.totalPending}</p>
          <p className="text-sm text-amber-600 font-medium">{formatPrice(stats.pendingAmount, 'ARS')}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-navy-500 font-medium">Cobradas</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{stats.totalPaid}</p>
          <p className="text-sm text-emerald-600 font-medium">{formatPrice(stats.paidAmount, 'ARS')}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-navy-500 font-medium">Cobrado este mes</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{formatPrice(stats.thisMonth, 'ARS')}</p>
        </div>
        <div className="card p-4 flex items-center justify-center">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            + Nueva comisión
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5 mb-6 border-2 border-indigo-200">
          <h3 className="font-bold text-navy-900 mb-4">Nueva comisión</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="label">Título / operación</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Ej: Comisión venta Av. Siempre Viva" />
            </div>
            <div>
              <label className="label">Monto</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha límite</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descripción</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {(['pending', 'paid', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>
            {t === 'pending' ? 'Pendientes' : t === 'paid' ? 'Cobradas' : 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400">Cargando...</div>
      ) : commissions.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <p className="text-navy-500 font-medium">Sin comisiones registradas</p>
          <p className="text-navy-400 text-sm mt-1">Agregá una comisión nueva para empezar a trackear tus ingresos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commissions.map(c => (
            <div key={c.id} className="card p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                c.status === 'paid' ? 'bg-emerald-100' : c.status === 'cancelled' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <svg className={`w-4 h-4 ${
                  c.status === 'paid' ? 'text-emerald-600' : c.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  {c.status === 'paid'
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  }
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy-900">{c.title || 'Comisión'}</p>
                <p className="text-xs text-navy-500">
                  {c.description && `${c.description} • `}
                  {c.dueDate && `Vence: ${new Date(c.dueDate).toLocaleDateString('es-AR')} • `}
                  {c.createdAt && new Date(c.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-navy-900">{formatPrice(c.amount, c.currency)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  c.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {c.status === 'paid' ? 'Cobrada' : c.status === 'cancelled' ? 'Anulada' : 'Pendiente'}
                </span>
              </div>
              {c.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => markPaid(c.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">Cobrada</button>
                  <button onClick={() => cancel(c.id)} className="text-xs text-red-500 hover:text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Anular</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}