'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWorkspace } from '@/lib/workspace-context'
import Link from 'next/link'
import type { ContractData, AdjustmentRecord } from '@/lib/contracts/types'

const STATUS_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
  borrador: { label: 'Borrador', color: 'bg-gray-100', textColor: 'text-gray-700' },
  activo: { label: 'Activo', color: 'bg-emerald-50', textColor: 'text-emerald-700' },
  vigente: { label: 'Vigente', color: 'bg-blue-50', textColor: 'text-blue-700' },
  vencido: { label: 'Vencido', color: 'bg-red-50', textColor: 'text-red-700' },
  rescindido: { label: 'Rescindido', color: 'bg-amber-50', textColor: 'text-amber-700' },
}

const TYPE_LABELS: Record<string, string> = {
  alquiler: 'Contrato de Alquiler',
  garantia_propietaria: 'Garantía Propietaria',
  seguro_caucion: 'Seguro de Caución',
  renuncia_derechos: 'Renuncia de Derechos',
  comodato_precario: 'Comodato Precario',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { workspace } = useWorkspace()
  const [contract, setContract] = useState<ContractData | null>(null)
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [signatures, setSignatures] = useState<any[]>([])
  const [showSignForm, setShowSignForm] = useState(false)
  const [signName, setSignName] = useState('')
  const [signEmail, setSignEmail] = useState('')
  const [signType, setSignType] = useState('lessee')
  const [signSaving, setSignSaving] = useState(false)
  const [signUrl, setSignUrl] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    if (!params.id || !workspace?.id) return
    setLoading(true)
    fetch(`/api/contracts/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.contract) {
          setContract(data.contract)
          return fetch(`/api/adjustments?contractId=${params.id}`).then(r => r.json())
        }
        setError(data.error || 'Contrato no encontrado')
        return null
      })
      .then(adjData => {
        if (adjData?.adjustments) setAdjustments(adjData.adjustments)
        return fetch(`/api/signature?contractId=${params.id}&workspaceId=${workspace.id}`).then(r => r.json())
      })
      .then(sigData => {
        if (sigData?.requests) setSignatures(sigData.requests)
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [params.id, workspace?.id])

  const handleAdjustment = async () => {
    if (!confirm('¿Calcular ajuste? Se usará el índice oficial más reciente.')) return
    setAdjusting(true)
    try {
      const res = await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: params.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setContract(prev => prev ? { ...prev, financial: { ...prev.financial, amount: data.adjustment.newAmount }, lastAdjustmentDate: data.adjustment.adjustmentDate, lastAdjustmentValue: data.adjustment.currentIndex } : prev)
        setAdjustments(prev => [data.adjustment, ...prev])
      } else {
        alert(data.error || 'Error al calcular ajuste')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setAdjusting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este contrato permanentemente? Esta acción no se puede deshacer.')) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/contracts/${params.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/dashboard/contracts')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/contracts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setContract(prev => prev ? { ...prev, status: status as any } : prev)
    } finally {
      setStatusLoading(false)
    }
  }

  const requestSignature = async () => {
    if (!signName || !signEmail) return
    setSignSaving(true)
    try {
      const res = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace?.id, contractId: params.id, signerName: signName, signerEmail: signEmail, signerType: signType }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSignUrl(data.signUrl || '')
      setSignatures(prev => [...prev, data.request])
      setShowSignForm(false)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSignSaving(false)
    }
  }

  if (loading) return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-navy-100 rounded w-64" />
        <div className="h-4 bg-navy-100 rounded w-96" />
        <div className="h-40 bg-navy-50 rounded-xl" />
      </div>
    </div>
  )

  if (error || !contract) return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error || 'Contrato no encontrado'}</p>
        <Link href="/dashboard/contracts" className="text-indigo-600 hover:underline">Volver a contratos</Link>
      </div>
    </div>
  )

  const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.borrador

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/contracts" className="text-navy-400 hover:text-navy-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">{contract.title}</h1>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color} ${statusCfg.textColor}`}>{statusCfg.label}</span>
            <span className="text-xs font-mono text-navy-400 bg-navy-50 px-2 py-0.5 rounded">{contract.number}</span>
          </div>
          <p className="text-sm text-navy-500 mt-1">{TYPE_LABELS[contract.type]} · {contract.property.address}, {contract.property.city}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <Link href={`/api/contracts/${contract.id}/pdf?workspaceId=${workspace?.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Descargar PDF
        </Link>
        <Link href={`/api/contracts/${contract.id}/pdf?preview=true&workspaceId=${workspace?.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy-600 border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Vista previa
        </Link>
        {contract.financial.adjustmentIndex !== 'NONE' && (
          <button onClick={handleAdjustment} disabled={adjusting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <svg className={`w-4 h-4 ${adjusting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
            {adjusting ? 'Calculando...' : 'Calcular ajuste'}
          </button>
        )}
        <select value={contract.status} onChange={e => handleStatusChange(e.target.value)} disabled={statusLoading} className="px-3 py-1.5 text-sm border border-navy-200 rounded-lg bg-white disabled:opacity-50">
          <option value="borrador">→ Borrador</option>
          <option value="activo">→ Activo</option>
          <option value="vigente">→ Vigente</option>
          <option value="vencido">→ Vencido</option>
          <option value="rescindido">→ Rescindido</option>
        </select>
        <button onClick={() => setShowSignForm(!showSignForm)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          Firmar digital
        </button>
        <button onClick={handleDelete} disabled={deleteLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          {deleteLoading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>

      {/* Signature section */}
      {showSignForm && (
        <div className="card p-6 mb-6 border border-purple-200">
          <h3 className="font-bold text-navy-900 mb-4">Solicitar firma digital</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nombre del firmante *</label>
              <input className="input" value={signName} onChange={e => setSignName(e.target.value)} placeholder={contract.lessee.fullName} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={signEmail} onChange={e => setSignEmail(e.target.value)} placeholder={contract.lessee.email} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={signType} onChange={e => setSignType(e.target.value)}>
                <option value="lessee">Locatario (inquilino)</option>
                <option value="lessor">Locador (propietario)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={requestSignature} disabled={signSaving || !signName || !signEmail} className="btn-gold disabled:opacity-50">
              {signSaving ? 'Generando...' : 'Enviar solicitud'}
            </button>
            <button onClick={() => setShowSignForm(false)} className="btn-outline">Cancelar</button>
          </div>
          {signUrl && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-800">Link de firma generado:</p>
              <a href={signUrl} target="_blank" rel="noopener" className="text-sm text-indigo-600 underline break-all">{signUrl}</a>
            </div>
          )}
        </div>
      )}

      {signatures.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-3">Firmas digitales</h3>
          <div className="space-y-2">
            {signatures.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy-900">{s.signer_name}</p>
                  <p className="text-xs text-navy-400">{s.signer_email} · {s.signer_type === 'lessor' ? 'Locador' : 'Locatario'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    s.status === 'signed' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    s.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {s.status === 'pending' ? 'Pendiente' : s.status === 'sent' ? 'Enviado' : s.status === 'signed' ? 'Firmado' : s.status === 'declined' ? 'Rechazado' : s.status}
                  </span>
                  {s.signed_at && <span className="text-xs text-navy-400">{new Date(s.signed_at).toLocaleDateString('es-AR')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Partes</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Locador</h3>
                <p className="font-medium text-navy-900">{contract.lessor.fullName}</p>
                <p className="text-sm text-navy-500">{contract.lessor.documentType}: {contract.lessor.documentNumber}</p>
                {contract.lessor.address && <p className="text-sm text-navy-500">Domicilio: {contract.lessor.address}</p>}
                {contract.lessor.phone && <p className="text-sm text-navy-500">Tel: {contract.lessor.phone}</p>}
                {contract.lessor.email && <p className="text-sm text-navy-500">Email: {contract.lessor.email}</p>}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Locatario</h3>
                <p className="font-medium text-navy-900">{contract.lessee.fullName}</p>
                <p className="text-sm text-navy-500">{contract.lessee.documentType}: {contract.lessee.documentNumber}</p>
                {contract.lessee.address && <p className="text-sm text-navy-500">Domicilio: {contract.lessee.address}</p>}
                {contract.lessee.phone && <p className="text-sm text-navy-500">Tel: {contract.lessee.phone}</p>}
                {contract.lessee.email && <p className="text-sm text-navy-500">Email: {contract.lessee.email}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Inmueble</h2>
            <p className="font-medium text-navy-900">{contract.property.address}</p>
            <p className="text-sm text-navy-500">{contract.property.city}, {contract.property.province}{contract.property.cpa ? ` - CPA: ${contract.property.cpa}` : ''}</p>
            {contract.property.description && <p className="text-sm text-navy-500 mt-1">{contract.property.description}</p>}
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Términos</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-navy-500">Inicio:</span>
                <span className="ml-2 font-medium text-navy-900">{formatDate(contract.startDate)}</span>
              </div>
              <div>
                <span className="text-navy-500">Fin:</span>
                <span className="ml-2 font-medium text-navy-900">{formatDate(contract.endDate)}</span>
              </div>
              <div>
                <span className="text-navy-500">Duración:</span>
                <span className="ml-2 font-medium text-navy-900">{contract.durationMonths} meses</span>
              </div>
              <div>
                <span className="text-navy-500">Creado:</span>
                <span className="ml-2 font-medium text-navy-900">{contract.createdAt ? formatDate(contract.createdAt) : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Económico</h2>
            <div className="text-center mb-4">
              <p className="text-xs text-navy-400 uppercase tracking-wider mb-1">Canon mensual</p>
              <p className="text-3xl font-bold text-navy-900">{formatCurrency(contract.financial.amount, contract.financial.currency)}</p>
            </div>
            <div className="space-y-3 text-sm border-t border-navy-100 pt-4">
              <div className="flex justify-between">
                <span className="text-navy-500">Ajuste</span>
                <span className="font-medium text-navy-900">{contract.financial.adjustmentIndex === 'NONE' ? 'Sin ajuste' : contract.financial.adjustmentIndex}</span>
              </div>
              {contract.financial.adjustmentIndex !== 'NONE' && (
                <div className="flex justify-between">
                  <span className="text-navy-500">Frecuencia</span>
                  <span className="font-medium text-navy-900">C/{contract.financial.adjustmentFrequencyMonths} meses</span>
                </div>
              )}
              {contract.financial.depositAmount && contract.financial.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-navy-500">Depósito</span>
                  <span className="font-medium text-navy-900">{formatCurrency(contract.financial.depositAmount, contract.financial.currency)}</span>
                </div>
              )}
              {contract.financial.commissionPercentage && contract.financial.commissionPercentage > 0 && (
                <div className="flex justify-between">
                  <span className="text-navy-500">Comisión</span>
                  <span className="font-medium text-navy-900">{contract.financial.commissionPercentage}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-navy-500">Expensas</span>
                <span className={`font-medium ${contract.financial.expensesIncluded ? 'text-emerald-600' : 'text-amber-600'}`}>{contract.financial.expensesIncluded ? 'Incluidas' : 'No incluidas'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Próximo ajuste</h2>
            {contract.nextAdjustmentDate ? (
              <div>
                <p className="text-sm text-navy-500 mb-1">Fecha estimada</p>
                <p className="text-xl font-bold text-navy-900">{formatDateShort(contract.nextAdjustmentDate)}</p>
                {new Date(contract.nextAdjustmentDate) <= new Date() && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">⚠ Ajuste pendiente — hacé clic en &ldquo;Calcular ajuste&rdquo;</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-navy-400">Sin ajuste configurado</p>
            )}
          </div>
        </div>
      </div>

      {adjustments.length > 0 && (
        <div className="bg-white border border-navy-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Historial de ajustes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100">
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Índice anterior</th>
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Índice actual</th>
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Variación</th>
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Monto anterior</th>
                  <th className="text-left py-3 px-4 text-navy-500 font-medium">Nuevo monto</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj, i) => (
                  <tr key={adj.id || i} className="border-b border-navy-50 hover:bg-navy-50/50">
                    <td className="py-3 px-4 text-navy-700">{formatDateShort(adj.adjustmentDate)}</td>
                    <td className="py-3 px-4 text-navy-700">{adj.previousIndex}</td>
                    <td className="py-3 px-4 text-navy-700">{adj.currentIndex}</td>
                    <td className={`py-3 px-4 font-medium ${adj.variation >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{adj.variation >= 0 ? '+' : ''}{adj.variation}%</td>
                    <td className="py-3 px-4 text-navy-700">{formatCurrency(adj.previousAmount, contract.financial.currency)}</td>
                    <td className="py-3 px-4 font-semibold text-navy-900">{formatCurrency(adj.newAmount, contract.financial.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contract.notes && (
        <div className="bg-white border border-navy-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-2">Notas</h2>
          <p className="text-sm text-navy-600 whitespace-pre-wrap">{contract.notes}</p>
        </div>
      )}
    </div>
  )
}