'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

const PRIORITY_LABELS: Record<string, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
}

const PRIORITY_STYLES: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  en_proceso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  resuelto: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  cerrado: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' },
]

const PRIORITY_OPTIONS = [
  { value: 'baja', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MantenimientoPage() {
  const { workspace } = useWorkspace()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [detailNotes, setDetailNotes] = useState('')
  const [detailAssigned, setDetailAssigned] = useState('')
  const [detailPriority, setDetailPriority] = useState('')
  const [updating, setUpdating] = useState(false)

  const [showNewForm, setShowNewForm] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [newForm, setNewForm] = useState({
    propertyId: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    description: '',
    priority: 'normal',
  })
  const [creating, setCreating] = useState(false)

  const fetchTickets = () => {
    if (!workspace?.id) return
    setLoading(true)
    const params = new URLSearchParams({ workspaceId: workspace.id })
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    fetch(`/api/maintenance?${params}`)
      .then(r => r.json())
      .then(data => { setTickets(data.tickets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const fetchProperties = () => {
    if (!workspace?.id) return
    fetch(`/api/properties?workspaceId=${workspace.id}`)
      .then(r => r.json())
      .then(data => setProperties(data.properties || []))
      .catch(() => {})
  }

  useEffect(() => { fetchTickets() }, [workspace?.id, statusFilter, priorityFilter])

  const stats = {
    total: tickets.length,
    pendientes: tickets.filter(t => t.status === 'pendiente').length,
    enProceso: tickets.filter(t => t.status === 'en_proceso').length,
    resueltosEsteMes: tickets.filter(t => {
      if (t.status !== 'resuelto') return false
      const d = new Date(t.closed_at || t.updated_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
  }

  const openDetail = (ticket: any) => {
    setSelectedTicket(ticket)
    setDetailNotes(ticket.notes || '')
    setDetailAssigned(ticket.assigned_to || '')
    setDetailPriority(ticket.priority || 'normal')
  }

  const updateTicket = async (fields: Record<string, any>) => {
    if (!selectedTicket) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/maintenance/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedTicket(data.ticket)
        fetchTickets()
      }
    } catch {}
    setUpdating(false)
  }

  const handleSaveDetail = async () => {
    await updateTicket({ notes: detailNotes, assigned_to: detailAssigned, priority: detailPriority })
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id || !newForm.tenantName || !newForm.description) return
    setCreating(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newForm, workspaceId: workspace.id }),
      })
      const data = await res.json()
      if (data.success) {
        setShowNewForm(false)
        setNewForm({ propertyId: '', tenantName: '', tenantPhone: '', tenantEmail: '', description: '', priority: 'normal' })
        fetchTickets()
      }
    } catch {}
    setCreating(false)
  }

  const openNewForm = () => {
    fetchProperties()
    setShowNewForm(true)
  }

  return (
    <>
      <Header
        title="Mantenimiento"
        subtitle="Gestión de tickets de mantenimiento"
        action={<button onClick={openNewForm} className="btn-gold text-sm">+ Nuevo ticket</button>}
      />

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-2xl font-bold text-navy-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-navy-500 mt-0.5 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Total tickets</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</p>
          <p className="text-xs text-navy-500 mt-0.5 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Pendientes</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.enProceso}</p>
          <p className="text-xs text-navy-500 mt-0.5 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">En proceso</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resueltosEsteMes}</p>
          <p className="text-xs text-navy-500 mt-0.5 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Resueltos este mes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-navy-50 rounded-lg p-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  statusFilter === tab.value
                    ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            className="input w-auto min-w-[140px]"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {PRIORITY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="w-24 space-y-2">
                  <div className="h-6 bg-gray-200 rounded-full" />
                  <div className="h-6 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tickets.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-7.5-3.5 7.5-3.5 7.5 3.5-7.5 3.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l0 7.5m7.5-7.5v-7.5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 dark:text-white">Sin tickets de mantenimiento</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-6 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
            {statusFilter ? 'No hay tickets con ese filtro.' : 'No hay tickets registrados aún. Creá el primero.'}
          </p>
          {!statusFilter && (
            <button onClick={openNewForm} className="btn-gold">+ Nuevo ticket</button>
          )}
        </div>
      )}

      {/* Tickets Table */}
      {!loading && tickets.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="table-header">Propiedad</th>
                  <th className="table-header">Inquilino</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header">Prioridad</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Asignado a</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => openDetail(ticket)}
                    className="border-b border-navy-50 hover:bg-navy-50/50 cursor-pointer transition-colors last:border-0"
                  >
                    <td className="table-cell">
                      <span className="font-medium text-navy-900 dark:text-white">{ticket.property_title || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-navy-900 dark:text-white">{ticket.tenant_name}</p>
                        {ticket.tenant_phone && <p className="text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">{ticket.tenant_phone}</p>}
                      </div>
                    </td>
                    <td className="table-cell max-w-[250px]">
                      <p className="truncate text-navy-600 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{ticket.description}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${PRIORITY_STYLES[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_STYLES[ticket.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="table-cell text-navy-500 text-xs dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="table-cell">
                      <span className="text-navy-600 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{ticket.assigned_to || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-navy-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-900 z-10">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Detalle del ticket</h2>
              <button onClick={() => setSelectedTicket(null)} className="text-navy-400 hover:text-navy-600 p-1 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedTicket.status !== 'en_proceso' && (
                  <button
                    onClick={() => updateTicket({ status: 'en_proceso' })}
                    disabled={updating}
                    className="btn-outline text-sm"
                  >
                    Marcar en proceso
                  </button>
                )}
                {selectedTicket.status !== 'resuelto' && (
                  <button
                    onClick={() => updateTicket({ status: 'resuelto' })}
                    disabled={updating}
                    className="btn-gold text-sm"
                  >
                    Marcar resuelto
                  </button>
                )}
                <button
                  onClick={() => updateTicket({ status: 'cerrado' })}
                  disabled={updating}
                  className="btn-outline text-sm border-red-200 text-red-600 hover:border-red-400 hover:text-red-700"
                >
                  Cerrar ticket
                </button>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Propiedad</label>
                  <p className="text-navy-900 font-medium dark:text-white">{selectedTicket.property_title || '—'}</p>
                  {selectedTicket.property_address && (
                    <p className="text-xs text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{selectedTicket.property_address}</p>
                  )}
                </div>
                <div>
                  <label className="label">Estado</label>
                  <span className={`badge ${STATUS_STYLES[selectedTicket.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[selectedTicket.status] || selectedTicket.status}
                  </span>
                </div>
                <div>
                  <label className="label">Inquilino</label>
                  <p className="text-navy-900 font-medium dark:text-white">{selectedTicket.tenant_name}</p>
                  {selectedTicket.tenant_phone && <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{selectedTicket.tenant_phone}</p>}
                  {selectedTicket.tenant_email && <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{selectedTicket.tenant_email}</p>}
                </div>
                <div>
                  <label className="label">Fecha de creación</label>
                  <p className="text-navy-900 dark:text-white">{formatDate(selectedTicket.created_at)}</p>
                  {selectedTicket.closed_at && (
                    <>
                      <label className="label mt-2">Cerrado</label>
                      <p className="text-navy-900 dark:text-white">{formatDate(selectedTicket.closed_at)}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Descripción</label>
                <div className="bg-navy-50 dark:bg-navy-800 rounded-lg p-4 text-sm text-navy-700 whitespace-pre-wrap dark:text-navy-300">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Prioridad</label>
                  <select
                    className="input"
                    value={detailPriority}
                    onChange={e => setDetailPriority(e.target.value)}
                  >
                    {PRIORITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Asignado a</label>
                  <input
                    className="input"
                    value={detailAssigned}
                    onChange={e => setDetailAssigned(e.target.value)}
                    placeholder="Nombre de quien lo resolverá"
                  />
                </div>
              </div>

              <div>
                <label className="label">Notas internas</label>
                <textarea
                  className="input min-h-[100px]"
                  value={detailNotes}
                  onChange={e => setDetailNotes(e.target.value)}
                  placeholder="Agregar notas sobre el progreso..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveDetail} disabled={updating} className="btn-gold disabled:opacity-50">
                  {updating ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button onClick={() => setSelectedTicket(null)} className="btn-outline">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewForm(false)}>
          <div className="bg-white dark:bg-navy-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-900 z-10">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">Nuevo ticket de mantenimiento</h2>
              <button onClick={() => setShowNewForm(false)} className="text-navy-400 hover:text-navy-600 p-1 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="label">Propiedad</label>
                <select
                  className="input"
                  value={newForm.propertyId}
                  onChange={e => setNewForm({ ...newForm, propertyId: e.target.value })}
                >
                  <option value="">Seleccionar propiedad (opcional)</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title || p.address || p.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Nombre del inquilino *</label>
                <input
                  className="input"
                  required
                  value={newForm.tenantName}
                  onChange={e => setNewForm({ ...newForm, tenantName: e.target.value })}
                  placeholder="Nombre y apellido"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    className="input"
                    value={newForm.tenantPhone}
                    onChange={e => setNewForm({ ...newForm, tenantPhone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={newForm.tenantEmail}
                    onChange={e => setNewForm({ ...newForm, tenantEmail: e.target.value })}
                    placeholder="inquilino@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="label">Descripción del problema *</label>
                <textarea
                  className="input min-h-[100px]"
                  required
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="Describí el problema a resolver..."
                />
              </div>
              <div>
                <label className="label">Prioridad</label>
                <select
                  className="input"
                  value={newForm.priority}
                  onChange={e => setNewForm({ ...newForm, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={creating} className="btn-gold disabled:opacity-50">
                  {creating ? 'Creando...' : 'Crear ticket'}
                </button>
                <button type="button" onClick={() => setShowNewForm(false)} className="btn-outline">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
