'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface TenantData {
  tenant: {
    name: string
    email: string
  }
  contract: {
    title: string
    propertyAddress: string
    propertyCity: string
    amount: number
    currency: string
    startDate: string
    endDate: string
    status: string
  }
  workspace: {
    name: string
    contactEmail: string
    contactPhone: string
    whatsapp: string
    primaryColor: string
    secondaryColor: string
  }
  payments: {
    id: string
    amount: number
    currency: string
    status: string
    due_date: string
    paid_at: string | null
    concept: string
  }[]
  tickets: {
    id: string
    description: string
    status: string
    priority: string
    created_at: string
    updated_at: string
  }[]
}

export default function TenantPortal() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [data, setData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'contract'>('overview')
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token de acceso no válido')
      setLoading(false)
      return
    }

    fetch(`/api/tenant?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar datos')
        setLoading(false)
      })
  }, [token])

  const handleMaintenanceRequest = async () => {
    if (!maintenanceForm.title.trim() || !token) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/tenant/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...maintenanceForm }),
      })
      if (res.ok) {
        setMaintenanceForm({ title: '', description: '' })
        setShowMaintenanceForm(false)
        // Reload data
        const refreshed = await fetch(`/api/tenant?token=${token}`).then(r => r.json())
        setData(refreshed)
      }
    } catch {}
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso no válido</h1>
          <p className="text-gray-600">{error || 'Token de acceso inválido o expirado'}</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

  const tabs = [
    { key: 'overview', label: 'Resumen' },
    { key: 'payments', label: 'Pagos' },
    { key: 'maintenance', label: 'Mantenimiento' },
    { key: 'contract', label: 'Contrato' },
  ]

  const pendingPayments = data.payments.filter(p => p.status === 'pending')
  const paidPayments = data.payments.filter(p => p.status === 'paid')
  const openTickets = data.tickets.filter(t => t.status === 'pendiente' || t.status === 'en_proceso')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal del Inquilino</h1>
              <p className="text-sm text-gray-500 mt-1">Bienvenido/a, {data.tenant.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{data.contract.title}</p>
              <p className="text-xs text-gray-500">{data.contract.propertyAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.key === 'payments' && pendingPayments.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingPayments.length}
                  </span>
                )}
                {tab.key === 'maintenance' && openTickets.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {openTickets.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-gray-500">Próximo pago</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pendingPayments.length > 0
                    ? formatCurrency(pendingPayments[0].amount, pendingPayments[0].currency)
                    : 'Al día'}
                </p>
                {pendingPayments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Vence: {formatDate(pendingPayments[0].due_date)}</p>
                )}
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-gray-500">Alquiler mensual</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.contract.amount, data.contract.currency)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-gray-500">Contrato hasta</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatDate(data.contract.endDate)}</p>
              </div>
            </div>

            {/* Pending Payments */}
            {pendingPayments.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pagos pendientes</h3>
                <div className="space-y-3">
                  {pendingPayments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                        <p className="text-sm text-gray-500">Vence: {formatDate(payment.due_date)}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        Pendiente
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Maintenance */}
            {data.tickets.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Últimos pedidos de mantenimiento</h3>
                <div className="space-y-3">
                  {data.tickets.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.description.substring(0, 50)}...</p>
                        <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        item.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status === 'pendiente' ? 'Pendiente' : item.status === 'en_proceso' ? 'En proceso' : 'Resuelto'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Historial de pagos</h3>
              {data.payments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Concepto</th>
                        <th className="pb-3 font-medium">Monto</th>
                        <th className="pb-3 font-medium">Estado</th>
                        <th className="pb-3 font-medium">Vencimiento</th>
                        <th className="pb-3 font-medium">Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.payments.map(payment => (
                        <tr key={payment.id}>
                          <td className="py-3 text-sm text-gray-900">{payment.concept}</td>
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">{formatDate(payment.due_date)}</td>
                          <td className="py-3 text-sm text-gray-500">
                            {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Pedidos de mantenimiento</h3>
              <button
                onClick={() => setShowMaintenanceForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Nuevo pedido
              </button>
            </div>

            {showMaintenanceForm && (
              <div className="bg-white rounded-xl shadow p-6">
                <h4 className="font-medium text-gray-900 mb-4">Nuevo pedido de mantenimiento</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                    <input
                      type="text"
                      value={maintenanceForm.title}
                      onChange={e => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: Gotera en el baño"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={maintenanceForm.description}
                      onChange={e => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      placeholder="Describí el problema..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleMaintenanceRequest}
                      disabled={submitting || !maintenanceForm.title.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Enviando...' : 'Enviar'}
                    </button>
                    <button
                      onClick={() => setShowMaintenanceForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {data.tickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <p className="text-gray-500">No hay pedidos de mantenimiento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.tickets.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.description.substring(0, 60)}...</h4>
                        <p className="text-xs text-gray-400 mt-2">Creado: {formatDate(item.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        item.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status === 'pendiente' ? 'Pendiente' : item.status === 'en_proceso' ? 'En proceso' : 'Resuelto'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contract Tab */}
        {activeTab === 'contract' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Detalles del contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Propiedad</label>
                <p className="text-gray-900 font-medium">{data.contract.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                <p className="text-gray-900">{data.contract.propertyAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de inicio</label>
                <p className="text-gray-900">{formatDate(data.contract.startDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de fin</label>
                <p className="text-gray-900">{formatDate(data.contract.endDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Alquiler mensual</label>
                <p className="text-gray-900 font-medium text-lg">
                  {formatCurrency(data.contract.amount, data.contract.currency)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  {data.contract.status === 'activo' ? 'Activo' : data.contract.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
