'use client'

import { useState, useEffect } from 'react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700' },
  resuelto: { label: 'Resuelto', color: 'badge-green' },
  cerrado: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'badge-navy' },
  media: { label: 'Media', color: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', color: 'bg-amber-100 text-amber-700' },
  urgente: { label: 'Urgente', color: 'badge-red' },
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OwnerMaintenancePage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetch('/api/owner/maintenance')
      .then(r => r.json())
      .then(data => {
        setTickets(data.tickets || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const grouped = tickets.reduce<Record<string, any[]>>((acc, ticket) => {
    const status = ticket.status || 'pendiente'
    if (!acc[status]) acc[status] = []
    acc[status].push(ticket)
    return acc
  }, {})

  const statusOrder = ['pendiente', 'en_proceso', 'resuelto', 'cerrado']

  const filteredTickets = filterStatus
    ? tickets.filter(t => t.status === filterStatus)
    : tickets

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Mantenimiento</h1>
        <p className="text-sm text-navy-500 mt-1 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{tickets.length} tickets registrados</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!filterStatus ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-navy-600 hover:bg-gray-50'} dark:text-navy-400 dark:text-navy-300 dark:text-navy-100`}
        >
          Todos ({tickets.length})
        </button>
        {statusOrder.map(s => {
          const count = grouped[s]?.length || 0
          if (count === 0) return null
          const info = STATUS_LABELS[s] || { label: s, color: 'bg-gray-100 text-gray-700' }
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-navy-600 hover:bg-gray-50'} dark:text-navy-400 dark:text-navy-300 dark:text-navy-100`}
            >
              {info.label} ({count})
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645 5.645a2.25 2.25 0 01-3.18-3.18l5.645-5.645m2.25 2.25l5.645-5.645a2.25 2.25 0 013.18 3.18l-5.645 5.645m-2.25-2.25l5.645-5.645M11.42 15.17l2.25-2.25m0 0l5.645-5.645M11.42 15.17l-2.25 2.25m0 0l-5.645 5.645" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 dark:text-white">Sin tickets</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">No hay tickets de mantenimiento para tus propiedades.</p>
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <div className="space-y-3">
          {filteredTickets.map(ticket => {
            const statusInfo = STATUS_LABELS[ticket.status] || { label: ticket.status || 'Pendiente', color: 'bg-gray-100 text-gray-700' }
            const priorityInfo = PRIORITY_LABELS[ticket.priority] || { label: ticket.priority || 'Media', color: 'badge-navy' }
            const isExpanded = expanded === ticket.id

            return (
              <div key={ticket.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.color}`}>{statusInfo.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityInfo.color}`}>{priorityInfo.label}</span>
                      </div>
                      <h3 className="font-semibold text-navy-900 mb-1 dark:text-white">
                        {ticket.title || ticket.description?.substring(0, 80) || 'Ticket de mantenimiento'}
                      </h3>
                      <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
                        {ticket.property_title || 'Propiedad'} {ticket.property_address ? `- ${ticket.property_address}` : ''}
                      </p>
                      <p className="text-xs text-navy-400 mt-1 dark:text-navy-300 dark:text-navy-100">{formatDate(ticket.created_at)}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {ticket.tenant_name && (
                        <span className="text-xs text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{ticket.tenant_name}</span>
                      )}
                      <svg className={`w-5 h-5 text-navy-400 transition-transform ${isExpanded ? 'rotate-180' : ''} dark:text-navy-300 dark:text-navy-100`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Descripción</p>
                        <p className="font-medium text-navy-700 whitespace-pre-wrap dark:text-navy-300 dark:text-navy-100">{ticket.description || 'Sin descripción'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Propiedad</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{ticket.property_title || '-'}</p>
                        {ticket.property_address && <p className="text-xs text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{ticket.property_address}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Estado</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Prioridad</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityInfo.color}`}>{priorityInfo.label}</span>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Creado</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{formatDate(ticket.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Actualizado</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{formatDate(ticket.updated_at)}</p>
                      </div>
                      {ticket.tenant_name && (
                        <div>
                          <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Inquilino</p>
                          <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{ticket.tenant_name}</p>
                        </div>
                      )}
                      {ticket.assigned_to && (
                        <div>
                          <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Asignado a</p>
                          <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{ticket.assigned_to}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && filterStatus && filteredTickets.length === 0 && tickets.length > 0 && (
        <div className="card p-8 text-center">
          <p className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">No hay tickets con ese estado.</p>
        </div>
      )}
    </div>
  )
}
