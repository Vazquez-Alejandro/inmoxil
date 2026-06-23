'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

function formatPrice(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const CONCEPT_LABELS: Record<string, string> = {
  rent: 'Alquiler',
  deposit: 'Depósito',
  commission: 'Comisión',
  other: 'Otro',
}

export default function PagosPage() {
  const { workspace } = useWorkspace()
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [concept, setConcept] = useState('rent')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const loadPayments = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const res = await fetch(`/api/payments?workspaceId=${workspace.id}&status=${filter}`)
    const data = await res.json()
    setPayments(data.payments || [])
    setSummary(data.summary || [])
    setLoading(false)
  }

  useEffect(() => { loadPayments() }, [workspace?.id, filter])

  const handleCreate = async () => {
    if (!amount) return
    setSaving(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace?.id, amount: parseFloat(amount), currency, concept, dueDate: dueDate || null, notes: notes || null }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setShowForm(false)
      setAmount(''); setCurrency('ARS'); setConcept('rent'); setDueDate(''); setNotes('')
      loadPayments()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const markPaid = async (id: string) => {
    try {
      await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace?.id, paymentId: id, status: 'paid', paymentMethod: 'manual' }),
      })
      loadPayments()
    } catch {}
  }

  return (
    <>
      <Header title="Cobranza" subtitle="Gestión de pagos y alquileres"
        action={<button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm">+ Nuevo cobro</button>}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ status: 'pending', label: 'Pendientes' }, { status: 'paid', label: 'Cobrados' },
          { status: 'failed', label: 'Fallidos' }, { status: 'refunded', label: 'Reembolsados' },
        ].map((item) => {
          const s = summary.find((s: any) => s.status === item.status)
          return (
            <button key={item.status} onClick={() => setFilter(filter === item.status ? '' : item.status)}
              className={`card p-4 text-left transition-all ${filter === item.status ? 'ring-2 ring-gold-500' : ''}`}>
              <p className="text-xs text-navy-400">{item.label}</p>
              <p className="text-xl font-bold text-navy-900">{s?.count || 0}</p>
              <p className="text-xs text-navy-500">{formatPrice(s?.total || 0)}</p>
            </button>
          )
        })}
      </div>

      {filter && (
        <div className="mb-4">
          <button onClick={() => setFilter('')} className="text-xs text-gold-600 hover:text-gold-700 font-medium">
            Limpiar filtro
          </button>
        </div>
      )}

      {/* New payment form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-navy-900 mb-4">Registrar cobro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Monto *</label>
              <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50000" />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="label">Concepto</label>
              <select className="input" value={concept} onChange={e => setConcept(e.target.value)}>
                {Object.entries(CONCEPT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fecha de vencimiento</label>
              <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notas</label>
              <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Referencia..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving || !amount} className="btn-gold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Registrar cobro'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancelar</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-navy-50 rounded-lg animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <p className="text-navy-500 font-medium">Sin cobros registrados</p>
          <p className="text-sm text-navy-400 mt-1">Registrá tu primer cobro para empezar a trackear.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-navy-100">
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Concepto</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Monto</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Vencimiento</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Contrato</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-navy-25 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-navy-900 capitalize">{CONCEPT_LABELS[p.concept] || p.concept}</span>
                      {p.notes && <p className="text-xs text-navy-400">{p.notes}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-navy-900">{formatPrice(p.amount, p.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-700'}`}>
                        {p.status === 'paid' ? 'Cobrado' : p.status === 'pending' ? 'Pendiente' : p.status === 'failed' ? 'Fallido' : 'Reembolsado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-500">{p.due_date ? new Date(p.due_date).toLocaleDateString('es-AR') : '-'}</td>
                    <td className="px-4 py-3 text-navy-500 max-w-[160px] truncate">{p.contract_title || '-'}</td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <button onClick={() => markPaid(p.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          Marcar cobrado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
