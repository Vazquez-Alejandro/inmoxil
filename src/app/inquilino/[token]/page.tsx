'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

function formatPrice(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

const CONCEPT_LABELS: Record<string, string> = { rent: 'Alquiler', deposit: 'Depósito', commission: 'Comisión', other: 'Otro' }
const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado' }

export default function TenantPortalPage() {
  const params = useParams()
  const token = params?.token as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'contrato' | 'pagos' | 'tickets'>('contrato')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`/api/tenant?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.contract) setData(d)
        else setError(d.error || 'Error al cargar')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white">
      <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <div className="card p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-navy-900 mb-2">Acceso no válido</h2>
        <p className="text-sm text-navy-500">{error}</p>
      </div>
    </div>
  )

  const { tenant, contract, workspace, payments, tickets } = data || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="logo-mark inline-flex mx-auto mb-3">Ix</div>
          <h1 className="text-2xl font-bold text-navy-900">Hola, {tenant?.name}</h1>
          <p className="text-sm text-navy-500">{workspace?.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-navy-100 rounded-lg p-0.5 mb-6 w-fit mx-auto">
          {(['contrato', 'pagos', 'tickets'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === t ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500 hover:text-navy-700'
              }`}>
              {t === 'contrato' ? 'Mi contrato' : t === 'pagos' ? 'Pagos' : 'Mantenimiento'}
            </button>
          ))}
        </div>

        {/* Contract Tab */}
        {tab === 'contrato' && contract && (
          <div className="card p-6 space-y-4">
            <div className="text-center pb-4 border-b border-navy-100">
              <h2 className="text-xl font-bold text-navy-900">{contract.title}</h2>
              <p className="text-sm text-navy-400">N° {contract.number}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Propiedad</p>
                <p className="font-medium text-navy-900">{contract.propertyAddress}</p>
                <p className="text-navy-500">{contract.propertyCity}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Locador</p>
                <p className="font-medium text-navy-900">{contract.lessorName}</p>
                <p className="text-navy-500">{contract.lessorEmail}</p>
                {contract.lessorPhone && <p className="text-navy-500">Tel: {contract.lessorPhone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-400">Inicio</p>
                <p className="font-semibold text-navy-900">{contract.startDate ? new Date(contract.startDate).toLocaleDateString('es-AR') : '-'}</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-400">Fin</p>
                <p className="font-semibold text-navy-900">{contract.endDate ? new Date(contract.endDate).toLocaleDateString('es-AR') : '-'}</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-400">Estado</p>
                <p className={`font-semibold ${contract.status === 'vigente' || contract.status === 'activo' ? 'text-emerald-600' : 'text-amber-600'}`}>{contract.status}</p>
              </div>
              <div className="p-3 bg-navy-50 rounded-lg">
                <p className="text-xs text-navy-400">Alquiler</p>
                <p className="font-bold text-navy-900">{formatPrice(contract.amount, contract.currency)}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a href={`https://wa.me/${workspace?.whatsapp || ''}?text=${encodeURIComponent('Hola, soy ' + tenant?.name + ', inquilino del contrato ' + contract.number)}`} target="_blank" rel="noopener" className="flex-1 text-center px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                Contactar por WhatsApp
              </a>
              <a href={`mailto:${workspace?.contactEmail || ''}`} className="flex-1 text-center px-4 py-2.5 border border-navy-200 text-navy-700 font-semibold rounded-lg hover:bg-navy-50 transition-colors text-sm">
                Enviar email
              </a>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {tab === 'pagos' && (
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Historial de pagos</h3>
            {(!payments || payments.length === 0) ? (
              <p className="text-sm text-navy-400 text-center py-8">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{CONCEPT_LABELS[p.concept] || p.concept}</p>
                      <p className="text-xs text-navy-400">{p.due_date ? new Date(p.due_date).toLocaleDateString('es-AR') : '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-navy-900">{formatPrice(p.amount, p.currency)}</p>
                      <span className={`text-xs font-medium ${
                        p.status === 'paid' ? 'text-emerald-600' : p.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                      }`}>{STATUS_LABELS[p.status] || p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">Próximamente podrás pagar online desde aquí.</p>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {tab === 'tickets' && (
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4">Reportes de mantenimiento</h3>
            {(!tickets || tickets.length === 0) ? (
              <p className="text-sm text-navy-400 text-center py-8">Sin reportes de mantenimiento</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t: any) => (
                  <div key={t.id} className="p-3 bg-navy-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-navy-900">{t.description?.slice(0, 60)}</p>
                      <span className={`badge text-xs ${
                        t.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        t.status === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-navy-400">{t.created_at ? new Date(t.created_at).toLocaleDateString('es-AR') : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-navy-400 mt-6">Powered by Inmoxil</p>
      </div>
    </div>
  )
}
