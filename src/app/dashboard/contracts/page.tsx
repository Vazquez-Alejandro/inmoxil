'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspace } from '@/lib/workspace-context'
import Link from 'next/link'
import type { ContractData } from '@/lib/contracts/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  activo: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  vigente: { label: 'Vigente', color: 'bg-blue-100 text-blue-700' },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-700' },
  rescindido: { label: 'Rescindido', color: 'bg-amber-100 text-amber-700' },
}

const TYPE_LABELS: Record<string, string> = {
  alquiler: 'Alquiler',
  garantia_propietaria: 'Garantía Propietaria',
  seguro_caucion: 'Seguro de Caución',
  renuncia_derechos: 'Renuncia de Derechos',
  comodato_precario: 'Comodato Precario',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ContractsPage() {
  const { workspace } = useWorkspace()
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(0)
  const perPage = 20

  const fetchContracts = useCallback(async () => {
    if (!workspace?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ workspaceId: workspace.id, limit: String(perPage), offset: String(page * perPage) })
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/contracts?${params}`)
      const data = await res.json()
      if (res.ok) {
        setContracts(data.contracts || [])
        setTotal(data.total || 0)
      } else {
        setError(data.error || 'Error al cargar contratos')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [workspace?.id, page, statusFilter, typeFilter, search])

  useEffect(() => { fetchContracts() }, [fetchContracts])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contrato?')) return
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setContracts(prev => prev.filter(c => c.id !== id))
        setTotal(prev => prev - 1)
      }
    } catch {}
  }

  if (!workspace) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Contratos</h1>
          <p className="text-navy-500 text-sm mt-1">{total} contratos registrados</p>
        </div>
        <Link href="/dashboard/contracts/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Nuevo contrato
        </Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="Buscar por título, inquilino, propietario o dirección..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} className="input flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }} className="input w-auto min-w-[140px]">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0) }} className="input w-auto min-w-[180px]">
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-navy-50 rounded-lg animate-pulse" />)}
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-700 mb-2">No hay contratos</h3>
          <p className="text-navy-500 text-sm mb-6">Creá tu primer contrato de alquiler con ajuste IPC/ICL automático.</p>
          <Link href="/dashboard/contracts/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">Crear primer contrato</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {contracts.map(contract => (
              <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`} className="block bg-white border border-navy-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-navy-400 bg-navy-50 px-2 py-0.5 rounded">{contract.number}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_LABELS[contract.status]?.color || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[contract.status]?.label || contract.status}</span>
                      <span className="text-xs text-navy-400">{TYPE_LABELS[contract.type] || contract.type}</span>
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-1 truncate">{contract.title}</h3>
                    <p className="text-sm text-navy-500 truncate">{contract.property.address}, {contract.property.city}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-navy-400">
                      <span>Locador: {contract.lessor.fullName}</span>
                      <span>Locatario: {contract.lessee.fullName}</span>
                      <span>{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-navy-900">{formatCurrency(contract.financial.amount, contract.financial.currency)}</div>
                    <div className="text-xs text-navy-400">/mes</div>
                    {contract.nextAdjustmentDate && new Date(contract.nextAdjustmentDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                      <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Próximo ajuste: {formatDate(contract.nextAdjustmentDate)}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {total > perPage && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-navy-100">
              <p className="text-sm text-navy-500">Mostrando {page * perPage + 1}-{Math.min((page + 1) * perPage, total)} de {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm border border-navy-200 rounded-md disabled:opacity-40 hover:bg-navy-50 transition-colors">Anterior</button>
                <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * perPage >= total} className="px-3 py-1.5 text-sm border border-navy-200 rounded-md disabled:opacity-40 hover:bg-navy-50 transition-colors">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}