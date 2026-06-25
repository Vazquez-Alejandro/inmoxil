'use client'

import { useState, useEffect } from 'react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'badge-green' },
  vigente: { label: 'Vigente', color: 'bg-blue-100 text-blue-700' },
  vencido: { label: 'Vencido', color: 'badge-red' },
  rescindido: { label: 'Rescindido', color: 'bg-amber-100 text-amber-700' },
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', minimumFractionDigits: 0 }).format(amount)
}

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/owner/contracts')
      .then(r => r.json())
      .then(data => {
        setContracts(data.contracts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Mis Contratos</h1>
        <p className="text-sm text-navy-500 mt-1 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{contracts.length} contratos registrados</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && contracts.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 dark:text-white">Sin contratos</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">No tenés contratos asociados a tus propiedades.</p>
        </div>
      )}

      {!loading && contracts.length > 0 && (
        <div className="space-y-3">
          {contracts.map(contract => {
            const statusInfo = STATUS_LABELS[contract.status] || { label: contract.status || 'Desconocido', color: 'bg-gray-100 text-gray-700' }
            const isExpanded = expanded === contract.id

            return (
              <div key={contract.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : contract.id)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {contract.code && (
                          <span className="text-xs font-mono text-navy-400 bg-navy-50 dark:bg-navy-800 px-2 py-0.5 rounded dark:text-navy-300">{contract.code}</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      <h3 className="font-semibold text-navy-900 mb-1 dark:text-white">
                        {contract.property_title || 'Propiedad'}
                      </h3>
                      <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{contract.property_address || ''}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">
                        <span>Inquilino: {contract.tenant_name || 'No especificado'}</span>
                        <span>{formatDate(contract.start_date)} → {formatDate(contract.end_date)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-navy-900 dark:text-white">
                        {formatCurrency(contract.monthly_price || 0, contract.currency || 'ARS')}
                      </div>
                      <div className="text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">/mes</div>
                      <svg className={`w-5 h-5 mt-2 mx-auto text-navy-400 transition-transform ${isExpanded ? 'rotate-180' : ''} dark:text-navy-300 dark:text-navy-100`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Código</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{contract.code || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Inquilino</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{contract.tenant_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Propiedad</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{contract.property_title || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Precio mensual</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{formatCurrency(contract.monthly_price || 0, contract.currency || 'ARS')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Inicio</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{formatDate(contract.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Fin</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{formatDate(contract.end_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Estado</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{statusInfo.label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 dark:text-navy-300 dark:text-navy-100">Índice de ajuste</p>
                        <p className="font-medium text-navy-700 dark:text-navy-300 dark:text-navy-100">{contract.adjustment_index || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
