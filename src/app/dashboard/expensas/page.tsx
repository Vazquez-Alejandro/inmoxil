'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { SkeletonCard } from '@/components/Skeleton'

interface Expensa {
  id: string
  propertyId: string
  propertyName: string
  period: string
  maintenanceFee: number
  waterFee: number
  gasFee: number
  electricityFee: number
  insuranceFee: number
  adminFee: number
  otherFees: number
  totalExpensa: number
  currency: string
  status: 'pending' | 'paid' | 'overdue'
  dueDate: string
  paidDate?: string
}

interface ExpensaTemplate {
  id: string
  name: string
  maintenanceFee: number
  waterFee: number
  gasFee: number
  electricityFee: number
  insuranceFee: number
  adminFee: number
  otherFees: number
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  overdue: 'Vencida',
}

function formatCurrency(amount: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function getCurrentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function ExpensasPage() {
  const { workspace } = useWorkspace()
  const [expensas, setExpensas] = useState<Expensa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [filter, setFilter] = useState('')

  // Form
  const [propertyName, setPropertyName] = useState('')
  const [period, setPeriod] = useState(getCurrentPeriod())
  const [maintenanceFee, setMaintenanceFee] = useState('')
  const [waterFee, setWaterFee] = useState('')
  const [gasFee, setGasFee] = useState('')
  const [electricityFee, setElectricityFee] = useState('')
  const [insuranceFee, setInsuranceFee] = useState('')
  const [adminFee, setAdminFee] = useState('')
  const [otherFees, setOtherFees] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [saving, setSaving] = useState(false)

  const [templates, setTemplates] = useState<ExpensaTemplate[]>([])
  const [templateName, setTemplateName] = useState('')
  const [templateMaintenance, setTemplateMaintenance] = useState('')
  const [templateWater, setTemplateWater] = useState('')
  const [templateGas, setTemplateGas] = useState('')
  const [templateElectricity, setTemplateElectricity] = useState('')
  const [templateInsurance, setTemplateInsurance] = useState('')
  const [templateAdmin, setTemplateAdmin] = useState('')
  const [templateOther, setTemplateOther] = useState('')

  useEffect(() => {
    fetchExpensas()
    fetchTemplates()
  }, [workspace?.id])

  const fetchExpensas = async () => {
    if (!workspace?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expensas?workspaceId=${workspace.id}`)
      const data = await res.json()
      setExpensas(data.expensas || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    if (!workspace?.id) return
    try {
      const res = await fetch(`/api/expensas/templates?workspaceId=${workspace.id}`)
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch {}
  }

  const applyTemplate = (template: ExpensaTemplate) => {
    setMaintenanceFee(String(template.maintenanceFee))
    setWaterFee(String(template.waterFee))
    setGasFee(String(template.gasFee))
    setElectricityFee(String(template.electricityFee))
    setInsuranceFee(String(template.insuranceFee))
    setAdminFee(String(template.adminFee))
    setOtherFees(String(template.otherFees))
  }

  const handleCreate = async () => {
    if (!propertyName || !period) return
    setSaving(true)
    try {
      const res = await fetch('/api/expensas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace?.id,
          propertyName,
          period,
          maintenanceFee: parseFloat(maintenanceFee) || 0,
          waterFee: parseFloat(waterFee) || 0,
          gasFee: parseFloat(gasFee) || 0,
          electricityFee: parseFloat(electricityFee) || 0,
          insuranceFee: parseFloat(insuranceFee) || 0,
          adminFee: parseFloat(adminFee) || 0,
          otherFees: parseFloat(otherFees) || 0,
          currency,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowForm(false)
      resetForm()
      fetchExpensas()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName) return
    try {
      await fetch('/api/expensas/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace?.id,
          name: templateName,
          maintenanceFee: parseFloat(templateMaintenance) || 0,
          waterFee: parseFloat(templateWater) || 0,
          gasFee: parseFloat(templateGas) || 0,
          electricityFee: parseFloat(templateElectricity) || 0,
          insuranceFee: parseFloat(templateInsurance) || 0,
          adminFee: parseFloat(templateAdmin) || 0,
          otherFees: parseFloat(templateOther) || 0,
        }),
      })
      setShowTemplateForm(false)
      fetchTemplates()
    } catch {}
  }

  const markPaid = async (id: string) => {
    try {
      await fetch('/api/expensas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace?.id, expensaId: id, status: 'paid' }),
      })
      fetchExpensas()
    } catch {}
  }

  const deleteExpensa = async (id: string) => {
    if (!confirm('¿Eliminar esta expensa?')) return
    try {
      await fetch(`/api/expensas?id=${id}&workspaceId=${workspace?.id}`, { method: 'DELETE' })
      fetchExpensas()
    } catch {}
  }

  const resetForm = () => {
    setPropertyName('')
    setPeriod(getCurrentPeriod())
    setMaintenanceFee('')
    setWaterFee('')
    setGasFee('')
    setElectricityFee('')
    setInsuranceFee('')
    setAdminFee('')
    setOtherFees('')
  }

  const filteredExpensas = filter ? expensas.filter(e => e.status === filter) : expensas
  const totalPending = expensas.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.totalExpensa, 0)
  const totalPaid = expensas.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.totalExpensa, 0)
  const totalOverdue = expensas.filter(e => e.status === 'overdue').reduce((sum, e) => sum + e.totalExpensa, 0)

  const currentTotal = parseFloat(maintenanceFee) || 0 + (parseFloat(waterFee) || 0) + (parseFloat(gasFee) || 0) + (parseFloat(electricityFee) || 0) + (parseFloat(insuranceFee) || 0) + (parseFloat(adminFee) || 0) + (parseFloat(otherFees) || 0)

  return (
    <>
      <Header
        title="Expensas"
        subtitle="Cálculo y gestión de expensas mensuales"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowTemplateForm(!showTemplateForm)} className="btn-outline text-sm">
              Plantillas
            </button>
            <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm">
              + Nueva expensa
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-navy-400">Pendientes</p>
          <p className="text-xl font-bold text-navy-900">{expensas.filter(e => e.status === 'pending').length}</p>
          <p className="text-xs text-navy-500">{formatCurrency(totalPending)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-navy-400">Pagadas</p>
          <p className="text-xl font-bold text-emerald-600">{expensas.filter(e => e.status === 'paid').length}</p>
          <p className="text-xs text-navy-500">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-navy-400">Vencidas</p>
          <p className="text-xl font-bold text-red-600">{expensas.filter(e => e.status === 'overdue').length}</p>
          <p className="text-xs text-navy-500">{formatCurrency(totalOverdue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-navy-400">Total</p>
          <p className="text-xl font-bold text-navy-900">{expensas.length}</p>
          <p className="text-xs text-navy-500">{formatCurrency(totalPending + totalPaid + totalOverdue)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'pending', 'paid', 'overdue'].map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === status ? 'bg-indigo-100 text-indigo-700' : 'text-navy-500 hover:bg-navy-50'}`}>
            {status === '' ? 'Todas' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Template Form */}
      {showTemplateForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4">Crear plantilla de expensas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nombre de plantilla</label>
              <input className="input" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Ej: Departamento 2 ambientes" />
            </div>
            <div>
              <label className="label">Mantenimiento</label>
              <input className="input" type="number" value={templateMaintenance} onChange={e => setTemplateMaintenance(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Agua</label>
              <input className="input" type="number" value={templateWater} onChange={e => setTemplateWater(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Gas</label>
              <input className="input" type="number" value={templateGas} onChange={e => setTemplateGas(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Luz</label>
              <input className="input" type="number" value={templateElectricity} onChange={e => setTemplateElectricity(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Seguro</label>
              <input className="input" type="number" value={templateInsurance} onChange={e => setTemplateInsurance(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Administración</label>
              <input className="input" type="number" value={templateAdmin} onChange={e => setTemplateAdmin(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Otros</label>
              <input className="input" type="number" value={templateOther} onChange={e => setTemplateOther(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreateTemplate} className="btn-gold">Crear plantilla</button>
            <button onClick={() => setShowTemplateForm(false)} className="btn-outline">Cancelar</button>
          </div>

          {/* Existing templates */}
          {templates.length > 0 && (
            <div className="mt-6 pt-4 border-t border-navy-100">
              <p className="text-sm font-medium text-navy-700 mb-3">Plantillas existentes</p>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 rounded-lg text-sm text-navy-700 transition-colors">
                    {t.name} - {formatCurrency(t.maintenanceFee + t.waterFee + t.gasFee + t.electricityFee + t.insuranceFee + t.adminFee + t.otherFees)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Expensa Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4">Registrar expensa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Propiedad *</label>
              <input className="input" value={propertyName} onChange={e => setPropertyName(e.target.value)} placeholder="Departamento 101" />
            </div>
            <div>
              <label className="label">Período *</label>
              <input className="input" type="month" value={period} onChange={e => setPeriod(e.target.value)} />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="label">Mantenimiento</label>
              <input className="input" type="number" value={maintenanceFee} onChange={e => setMaintenanceFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Agua</label>
              <input className="input" type="number" value={waterFee} onChange={e => setWaterFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Gas</label>
              <input className="input" type="number" value={gasFee} onChange={e => setGasFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Luz</label>
              <input className="input" type="number" value={electricityFee} onChange={e => setElectricityFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Seguro</label>
              <input className="input" type="number" value={insuranceFee} onChange={e => setInsuranceFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Administración</label>
              <input className="input" type="number" value={adminFee} onChange={e => setAdminFee(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Otros</label>
              <input className="input" type="number" value={otherFees} onChange={e => setOtherFees(e.target.value)} placeholder="0" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <div className="card bg-indigo-50 p-4 w-full">
                <p className="text-xs text-indigo-600">Total expensa</p>
                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(currentTotal, currency)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving || !propertyName || !period} className="btn-gold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Registrar expensa'}
            </button>
            <button onClick={() => { setShowForm(false); resetForm() }} className="btn-outline">Cancelar</button>
          </div>
        </div>
      )}

      {/* Expensas List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filteredExpensas.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-navy-500 font-medium">Sin expensas registradas</p>
          <p className="text-sm text-navy-400 mt-1">Registrá la primera expensa para empezar a trackear.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Propiedad</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Período</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Mantenimiento</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Servicios</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Otros</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Total</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {filteredExpensas.map(e => {
                  const servicesTotal = e.waterFee + e.gasFee + e.electricityFee
                  const otherTotal = e.insuranceFee + e.adminFee + e.otherFees
                  return (
                    <tr key={e.id} className="hover:bg-navy-25 transition-colors">
                      <td className="px-4 py-3 font-medium text-navy-900">{e.propertyName}</td>
                      <td className="px-4 py-3 text-navy-500">{e.period}</td>
                      <td className="px-4 py-3 text-navy-700">{formatCurrency(e.maintenanceFee, e.currency)}</td>
                      <td className="px-4 py-3 text-navy-700">{formatCurrency(servicesTotal, e.currency)}</td>
                      <td className="px-4 py-3 text-navy-700">{formatCurrency(otherTotal, e.currency)}</td>
                      <td className="px-4 py-3 font-bold text-navy-900">{formatCurrency(e.totalExpensa, e.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_STYLES[e.status]}`}>{STATUS_LABELS[e.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {e.status === 'pending' && (
                            <button onClick={() => markPaid(e.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                              Cobrar
                            </button>
                          )}
                          <button onClick={() => deleteExpensa(e.id)} className="text-xs text-red-500 hover:text-red-600">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
