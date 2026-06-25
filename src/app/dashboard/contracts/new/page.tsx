'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/lib/workspace-context'
import Link from 'next/link'
import type { ContractType, AdjustmentIndex } from '@/lib/contracts/types'

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'alquiler', label: 'Contrato de Alquiler' },
  { value: 'garantia_propietaria', label: 'Garantía Propietaria' },
  { value: 'seguro_caucion', label: 'Seguro de Caución' },
  { value: 'renuncia_derechos', label: 'Renuncia de Derechos' },
  { value: 'comodato_precario', label: 'Comodato Precario' },
]

const ADJUSTMENT_INDICES: { value: AdjustmentIndex; label: string }[] = [
  { value: 'ICL', label: 'ICL (Índice Contratos Locación)' },
  { value: 'IPC', label: 'IPC (Índice Precios Consumidor)' },
  { value: 'NONE', label: 'Sin ajuste' },
]

function formatDateInput(date: string): string {
  if (!date) return ''
  try { return new Date(date).toISOString().split('T')[0] } catch { return date }
}

export default function NewContractPage() {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: 'alquiler' as ContractType,
    title: '',
    startDate: '',
    durationMonths: 24,
    lessorName: '',
    lessorDocType: 'DNI' as 'DNI' | 'CUIL' | 'CUIT',
    lessorDocNumber: '',
    lessorAddress: '',
    lessorPhone: '',
    lessorEmail: '',
    lesseeName: '',
    lesseeDocType: 'DNI' as 'DNI' | 'CUIL' | 'CUIT',
    lesseeDocNumber: '',
    lesseeAddress: '',
    lesseePhone: '',
    lesseeEmail: '',
    propertyAddress: '',
    propertyCity: '',
    propertyProvince: '',
    propertyDescription: '',
    propertyCpa: '',
    amount: '',
    currency: 'ARS' as 'ARS' | 'USD',
    adjustmentIndex: 'ICL' as AdjustmentIndex,
    adjustmentFrequencyMonths: 6,
    depositAmount: '',
    commissionPercentage: '',
    expensesIncluded: false,
    expensesAmount: '',
    notes: '',
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const steps = [
    { title: 'Tipo y partes', description: 'Tipo de contrato, locador y locatario' },
    { title: 'Inmueble', description: 'Dirección y descripción' },
    { title: 'Económico', description: 'Precio, ajuste y depósito' },
    { title: 'Revisión', description: 'Resumen y creación' },
  ]

  const handleSubmit = async () => {
    if (!workspace?.id) return
    setLoading(true)
    setError('')

    try {
      const startDate = form.startDate
      const start = new Date(startDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + form.durationMonths)
      const endDate = end.toISOString().split('T')[0]

      const payload = {
        workspaceId: workspace.id,
        type: form.type,
        title: form.title || `Contrato de ${CONTRACT_TYPES.find(t => t.value === form.type)?.label || form.type}`,
        startDate,
        endDate,
        durationMonths: form.durationMonths,
        lessor: {
          fullName: form.lessorName,
          documentType: form.lessorDocType,
          documentNumber: form.lessorDocNumber,
          address: form.lessorAddress || undefined,
          phone: form.lessorPhone || undefined,
          email: form.lessorEmail || undefined,
        },
        lessee: {
          fullName: form.lesseeName,
          documentType: form.lesseeDocType,
          documentNumber: form.lesseeDocNumber,
          address: form.lesseeAddress || undefined,
          phone: form.lesseePhone || undefined,
          email: form.lesseeEmail || undefined,
        },
        property: {
          address: form.propertyAddress,
          city: form.propertyCity,
          province: form.propertyProvince,
          description: form.propertyDescription || undefined,
          cpa: form.propertyCpa || undefined,
        },
        financial: {
          amount: Number(form.amount),
          currency: form.currency,
          adjustmentIndex: form.adjustmentIndex,
          adjustmentFrequencyMonths: Number(form.adjustmentFrequencyMonths),
          depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
          commissionPercentage: form.commissionPercentage ? Number(form.commissionPercentage) : undefined,
          expensesIncluded: form.expensesIncluded,
          expensesAmount: form.expensesAmount ? Number(form.expensesAmount) : undefined,
        },
        notes: form.notes || undefined,
        nextAdjustmentDate: form.adjustmentIndex !== 'NONE'
          ? new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + Number(form.adjustmentFrequencyMonths))).toISOString().split('T')[0]
          : undefined,
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al crear contrato')
        return
      }
      router.push(`/dashboard/contracts/${data.contract.id}`)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!workspace) return null

  const inputClass = "w-full px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
  const labelClass = "block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1"
  const selectClass = inputClass

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/contracts" className="text-navy-400 hover:text-navy-600 transition-colors dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Nuevo contrato</h1>
          <p className="text-navy-500 text-sm dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{steps[step].description}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`flex-1 text-left p-3 rounded-lg border transition-all ${i === step ? 'border-indigo-500 bg-indigo-50' : i < step ? 'border-emerald-300 bg-emerald-50' : 'border-navy-200 bg-white'}`}>
            <div className={`text-xs font-medium mb-0.5 ${i === step ? 'text-indigo-600' : i < step ? 'text-emerald-600' : 'text-navy-400'} dark:text-navy-300 dark:text-navy-100`}>Paso {i + 1}</div>
            <div className="text-sm font-medium text-navy-800 dark:text-navy-200">{s.title}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">{error}</div>
      )}

      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Tipo de contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTRACT_TYPES.map(t => (
                <button key={t.value} onClick={() => update('type', t.value)} className={`p-4 rounded-lg border text-left transition-all ${form.type === t.value ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-navy-200 hover:border-navy-300'}`}>
                  <div className="font-medium text-navy-900 dark:text-white">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-navy-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Locador (Propietario)</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Nombre completo *</label>
                  <input className={inputClass} placeholder="Juan Pérez" value={form.lessorName} onChange={e => update('lessorName', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Tipo doc.</label>
                    <select className={selectClass} value={form.lessorDocType} onChange={e => update('lessorDocType', e.target.value)}>
                      <option>DNI</option><option>CUIL</option><option>CUIT</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>N° documento *</label>
                    <input className={inputClass} placeholder="12345678" value={form.lessorDocNumber} onChange={e => update('lessorDocNumber', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Domicilio</label>
                  <input className={inputClass} placeholder="Calle 123" value={form.lessorAddress} onChange={e => update('lessorAddress', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input className={inputClass} placeholder="11 1234 5678" value={form.lessorPhone} onChange={e => update('lessorPhone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={inputClass} type="email" placeholder="juan@email.com" value={form.lessorEmail} onChange={e => update('lessorEmail', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-navy-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Locatario (Inquilino)</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Nombre completo *</label>
                  <input className={inputClass} placeholder="María García" value={form.lesseeName} onChange={e => update('lesseeName', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Tipo doc.</label>
                    <select className={selectClass} value={form.lesseeDocType} onChange={e => update('lesseeDocType', e.target.value)}>
                      <option>DNI</option><option>CUIL</option><option>CUIT</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>N° documento *</label>
                    <input className={inputClass} placeholder="87654321" value={form.lesseeDocNumber} onChange={e => update('lesseeDocNumber', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Domicilio</label>
                  <input className={inputClass} placeholder="Av. Siempre Viva 742" value={form.lesseeAddress} onChange={e => update('lesseeAddress', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input className={inputClass} placeholder="11 8765 4321" value={form.lesseePhone} onChange={e => update('lesseePhone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={inputClass} type="email" placeholder="maria@email.com" value={form.lesseeEmail} onChange={e => update('lesseeEmail', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Duración</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Fecha de inicio *</label>
                <input className={inputClass} type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Duración (meses)</label>
                <input className={inputClass} type="number" min={1} max={120} value={form.durationMonths} onChange={e => update('durationMonths', Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white border border-navy-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Inmueble</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Dirección *</label>
              <input className={inputClass} placeholder="Av. Corrientes 1234, Piso 5, Depto C" value={form.propertyAddress} onChange={e => update('propertyAddress', e.target.value)} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Ciudad *</label>
                <input className={inputClass} placeholder="CABA" value={form.propertyCity} onChange={e => update('propertyCity', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Provincia *</label>
                <input className={inputClass} placeholder="CABA" value={form.propertyProvince} onChange={e => update('propertyProvince', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>CPA</label>
                <input className={inputClass} placeholder="C1425" value={form.propertyCpa} onChange={e => update('propertyCpa', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Descripción / Detalles</label>
              <textarea className={`${inputClass} min-h-[80px]`} placeholder="2 ambientes, 60m², balcón, cochera..." value={form.propertyDescription} onChange={e => update('propertyDescription', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Valor del contrato</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Monto mensual *</label>
                <input className={inputClass} type="number" min={0} placeholder="500000" value={form.amount} onChange={e => update('amount', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select className={selectClass} value={form.currency} onChange={e => update('currency', e.target.value)}>
                  <option value="ARS">ARS ($)</option>
                  <option value="USD">USD (U$S)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Ajuste</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Índice de ajuste</label>
                <select className={selectClass} value={form.adjustmentIndex} onChange={e => update('adjustmentIndex', e.target.value)}>
                  {ADJUSTMENT_INDICES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Frecuencia (meses)</label>
                <input className={inputClass} type="number" min={1} max={24} value={form.adjustmentFrequencyMonths} onChange={e => update('adjustmentFrequencyMonths', Number(e.target.value))} disabled={form.adjustmentIndex === 'NONE'} />
              </div>
            </div>
            {form.adjustmentIndex !== 'NONE' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                El primer ajuste será a los <strong>{form.adjustmentFrequencyMonths} meses</strong> de la fecha de inicio.
                Los ajustes se calculan automáticamente con el {form.adjustmentIndex === 'ICL' ? 'ICL (BCRA)' : 'IPC (INDEC)'} oficial.
              </div>
            )}
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Depósito y expensas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Depósito en garantía</label>
                <input className={inputClass} type="number" min={0} placeholder="500000" value={form.depositAmount} onChange={e => update('depositAmount', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Comisión (%)</label>
                <input className={inputClass} type="number" min={0} max={100} placeholder="4.15" value={form.commissionPercentage} onChange={e => update('commissionPercentage', e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="checkbox" id="expenses" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={form.expensesIncluded} onChange={e => update('expensesIncluded', e.target.checked)} />
              <label htmlFor="expenses" className="text-sm text-navy-700 dark:text-navy-300 dark:text-navy-100">Expensas incluidas en el canon</label>
            </div>
            {form.expensesIncluded && (
              <div className="mt-3">
                <label className={labelClass}>Monto expensas</label>
                <input className={inputClass} type="number" min={0} placeholder="50000" value={form.expensesAmount} onChange={e => update('expensesAmount', e.target.value)} />
              </div>
            )}
          </div>

          <div className="bg-white border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4 dark:text-white">Notas</h2>
            <textarea className={`${inputClass} min-h-[100px]`} placeholder="Observaciones, cláusulas especiales, garantías adicionales..." value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white border border-navy-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-6 dark:text-white">Resumen del contrato</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 dark:text-navy-300 dark:text-navy-100">Tipo</h3>
                <p className="text-sm text-navy-800 dark:text-navy-200">{CONTRACT_TYPES.find(t => t.value === form.type)?.label}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 dark:text-navy-300 dark:text-navy-100">Duración</h3>
                <p className="text-sm text-navy-800 dark:text-navy-200">{form.durationMonths} meses ({form.startDate || '—'} al {form.startDate ? new Date(new Date(form.startDate).setMonth(new Date(form.startDate).getMonth() + form.durationMonths)).toLocaleDateString('es-AR') : '—'})</p>
              </div>
            </div>
            <div className="border-t border-navy-100 pt-4">
              <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 dark:text-navy-300 dark:text-navy-100">Partes</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Locador:</span> <span className="font-medium">{form.lessorName || '—'}</span> <span className="text-navy-400 dark:text-navy-300 dark:text-navy-100">({form.lessorDocNumber})</span></div>
                <div><span className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Locatario:</span> <span className="font-medium">{form.lesseeName || '—'}</span> <span className="text-navy-400 dark:text-navy-300 dark:text-navy-100">({form.lesseeDocNumber})</span></div>
              </div>
            </div>
            <div className="border-t border-navy-100 pt-4">
              <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 dark:text-navy-300 dark:text-navy-100">Inmueble</h3>
              <p className="text-sm text-navy-800 dark:text-navy-200">{form.propertyAddress || '—'}, {form.propertyCity || '—'}, {form.propertyProvince || '—'}</p>
            </div>
            <div className="border-t border-navy-100 pt-4">
              <h3 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2 dark:text-navy-300 dark:text-navy-100">Económico</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Monto:</span> <span className="font-bold text-navy-900 dark:text-white">${Number(form.amount).toLocaleString('es-AR')} {form.currency}/mes</span></div>
                <div><span className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Ajuste:</span> {form.adjustmentIndex !== 'NONE' ? `${form.adjustmentIndex} cada ${form.adjustmentFrequencyMonths} meses` : 'Sin ajuste'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-4 py-2 text-sm font-medium text-navy-600 border border-navy-200 rounded-lg hover:bg-navy-50 transition-colors disabled:opacity-40 dark:text-navy-300">Anterior</button>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Continuar</button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {loading ? 'Creando...' : 'Crear contrato'}
          </button>
        )}
      </div>
    </div>
  )
}