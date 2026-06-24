'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWorkspace } from '@/lib/workspace-context'
import type { PipelineStage, PipelineLead, Activity, ActivityType } from '@/lib/pipeline/types'

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', portal: 'Portal', referido: 'Referido',
  llamada: 'Llamada', email: 'Email', web: 'Web', manual: 'Manual',
}

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: 'bg-emerald-100 text-emerald-700',
  portal: 'bg-blue-100 text-blue-700',
  referido: 'bg-purple-100 text-purple-700',
  llamada: 'bg-amber-100 text-amber-700',
  email: 'bg-sky-100 text-sky-700',
  web: 'bg-indigo-100 text-indigo-700',
  manual: 'bg-gray-100 text-gray-700',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export default function PipelinePage() {
  const { workspace } = useWorkspace()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<PipelineLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [showNewLead, setShowNewLead] = useState(false)
  const [newLeadStageId, setNewLeadStageId] = useState('')
  const [showEditLead, setShowEditLead] = useState(false)
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [newActivityForm, setNewActivityForm] = useState({ type: 'llamada', description: '', outcome: '', scheduledAt: '' })
  const [leadForm, setLeadForm] = useState({
    fullName: '', phone: '', email: '', source: 'manual' as string,
    budgetMin: '', budgetMax: '', currency: 'ARS', notes: '', requirements: '',
  })
  const [leadFormEdit, setLeadFormEdit] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const wsId = workspace?.id

  const fetchData = useCallback(async () => {
    if (!wsId) return
    setLoading(true)
    try {
      const [stagesRes, leadsRes] = await Promise.all([
        fetch(`/api/pipeline?workspaceId=${wsId}`),
        fetch(`/api/pipeline/leads?workspaceId=${wsId}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
      ])
      const stagesData = await stagesRes.json()
      const leadsData = await leadsRes.json()
      if (stagesRes.ok) setStages(stagesData.stages || [])
      if (leadsRes.ok) setLeads(leadsData.leads || [])
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [wsId, search])

  useEffect(() => { fetchData() }, [fetchData])

  const leadsByStage: Record<string, PipelineLead[]> = {}
  for (const lead of leads) {
    if (!leadsByStage[lead.stageId]) leadsByStage[lead.stageId] = []
    leadsByStage[lead.stageId].push(lead)
  }

  const fetchActivities = async (leadId: string) => {
    try {
      const res = await fetch(`/api/pipeline/activities?leadId=${leadId}`)
      const data = await res.json()
      if (res.ok) setActivities(data.activities || [])
    } catch {}
  }

  const openLead = async (lead: PipelineLead) => {
    setSelectedLead(lead)
    setActivities([])
    fetchActivities(lead.id!)
  }

  const handleDragStart = (leadId: string) => setDraggedLead(leadId)

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => setDragOverStage(null)

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(null)
    const leadId = draggedLead
    if (!leadId) return

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.stageId === stageId) return

    const targetStage = stages.find(s => s.id === stageId)
    if (!targetStage) return

    try {
      const res = await fetch(`/api/pipeline/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, stageId, stageOrder: targetStage.order }),
      })
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stageId, stageOrder: targetStage.order } : l))
      }
    } catch {}
    setDraggedLead(null)
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
    setDragOverStage(null)
  }

  const createLead = async () => {
    if (!wsId || !leadForm.fullName || !leadForm.phone) return
    setSaving(true)
    try {
      const res = await fetch('/api/pipeline/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: wsId,
          stageId: newLeadStageId || stages[0]?.id,
          ...leadForm,
          budgetMin: leadForm.budgetMin ? Number(leadForm.budgetMin) : undefined,
          budgetMax: leadForm.budgetMax ? Number(leadForm.budgetMax) : undefined,
        }),
      })
      if (res.ok) {
        setShowNewLead(false)
        setLeadForm({ fullName: '', phone: '', email: '', source: 'manual', budgetMin: '', budgetMax: '', currency: 'ARS', notes: '', requirements: '' })
        fetchData()
      }
    } catch {}
    setSaving(false)
  }

  const updateLead = async () => {
    if (!selectedLead?.id) return
    setSaving(true)
    try {
      await fetch(`/api/pipeline/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadFormEdit),
      })
      setShowEditLead(false)
      fetchData()
    } catch {}
    setSaving(false)
  }

  const addActivity = async () => {
    if (!selectedLead?.id || !newActivityForm.description) return
    setSaving(true)
    try {
      await fetch('/api/pipeline/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead.id, ...newActivityForm }),
      })
      setShowNewActivity(false)
      setNewActivityForm({ type: 'llamada', description: '', outcome: '', scheduledAt: '' })
      fetchActivities(selectedLead.id!)
    } catch {}
    setSaving(false)
  }

  const moveToLost = async () => {
    if (!selectedLead?.id) return
    const lostStage = stages.find(s => s.name === 'Perdido')
    if (!lostStage) return
    try {
      const res = await fetch(`/api/pipeline/leads/${selectedLead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead.id, stageId: lostStage.id, stageOrder: lostStage.order }),
      })
      if (res.ok) {
        setSelectedLead(null)
        fetchData()
      }
    } catch {}
  }

  const moveToWon = async () => {
    if (!selectedLead?.id) return
    const wonStage = stages.find(s => s.name === 'Ganado')
    if (!wonStage) return
    try {
      const res = await fetch(`/api/pipeline/leads/${selectedLead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead.id, stageId: wonStage.id, stageOrder: wonStage.order }),
      })
      if (res.ok) {
        setSelectedLead(null)
        fetchData()
      }
    } catch {}
  }

  if (!wsId) return null

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-navy-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Clientes</h1>
          <p className="text-sm text-navy-500">{leads.length} clientes activos</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Buscar cliente por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 text-sm border border-navy-200 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <button onClick={() => { setNewLeadStageId(stages[0]?.id || ''); setShowNewLead(true) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nuevo cliente
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        {loading ? (
          <div className="flex gap-4 h-full">
            {[1,2,3,4,5].map(i => <div key={i} className="w-72 shrink-0 bg-navy-50 rounded-xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        ) : (
          <div className="flex gap-4 h-full min-h-[500px]">
            {stages.map(stage => {
              const stageLeads = leadsByStage[stage.id!] || []
              const isOver = dragOverStage === stage.id
              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => handleDragOver(e, stage.id!)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id!)}
                  className={`w-72 shrink-0 flex flex-col rounded-xl border transition-all ${isOver ? 'border-indigo-400 bg-indigo-50/30' : 'border-navy-200 bg-navy-50/30'}`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-semibold text-sm text-navy-800">{stage.name}</span>
                      <span className="text-xs text-navy-400 font-medium bg-navy-100 px-1.5 py-0.5 rounded">{stageLeads.length}</span>
                    </div>
                    <button onClick={() => { setNewLeadStageId(stage.id!); setShowNewLead(true) }} className="text-navy-400 hover:text-navy-600 transition-colors p-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead.id!)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openLead(lead)}
                        className={`bg-white rounded-lg p-3 border cursor-pointer transition-all hover:border-indigo-300 hover:shadow-sm active:opacity-60 ${draggedLead === lead.id ? 'opacity-40 border-indigo-400' : 'border-navy-100'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-sm text-navy-900 truncate">{lead.fullName}</h3>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${SOURCE_COLORS[lead.source] || 'bg-gray-100 text-gray-700'}`}>{SOURCE_LABELS[lead.source] || lead.source}</span>
                        </div>
                        <p className="text-xs text-navy-500 mb-2">{lead.phone}</p>
                        {(lead.budgetMin || lead.budgetMax) && (
                          <p className="text-xs text-navy-600 font-medium mb-1.5">
                            {lead.budgetMin ? `$${(lead.budgetMin / 1000).toFixed(0)}k` : ''}{lead.budgetMin && lead.budgetMax ? ' - ' : ''}{lead.budgetMax ? `$${(lead.budgetMax / 1000).toFixed(0)}k` : ''} {lead.currency}
                          </p>
                        )}
                        {lead.propertyTitle && (
                          <p className="text-xs text-navy-400 truncate">🏠 {lead.propertyTitle}</p>
                        )}
                        {lead.notes && (
                          <p className="text-xs text-navy-400 mt-1 line-clamp-2">{lead.notes}</p>
                        )}
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-xs text-navy-400">Sin clientes</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showNewLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewLead(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-navy-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-900">Nuevo cliente</h2>
                  <p className="text-xs text-navy-500">Completá los datos del cliente</p>
                </div>
              </div>
              <button onClick={() => setShowNewLead(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Nombre completo <span className="text-red-400">*</span></label>
                  <input className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="Juan Pérez" value={leadForm.fullName} onChange={e => setLeadForm(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Teléfono <span className="text-red-400">*</span></label>
                  <input className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="11 1234 5678" value={leadForm.phone} onChange={e => setLeadForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Email</label>
                  <input className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" type="email" placeholder="juan@email.com" value={leadForm.email} onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Origen</label>
                  <select className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={leadForm.source} onChange={e => setLeadForm(p => ({ ...p, source: e.target.value }))}>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Etapa</label>
                  <select className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={newLeadStageId} onChange={e => setNewLeadStageId(e.target.value)}>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Presupuesto mínimo</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-500 text-sm font-semibold">$</span>
                    <input className="w-full pl-8 pr-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" type="number" placeholder="50000" value={leadForm.budgetMin} onChange={e => setLeadForm(p => ({ ...p, budgetMin: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Presupuesto máximo</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-500 text-sm font-semibold">$</span>
                    <input className="w-full pl-8 pr-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" type="number" placeholder="150000" value={leadForm.budgetMax} onChange={e => setLeadForm(p => ({ ...p, budgetMax: e.target.value }))} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Requisitos / Comentarios</label>
                  <textarea className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[80px] resize-none" placeholder="Busca 2 ambientes en Palermo, pet friendly..." value={leadForm.notes} onChange={e => setLeadForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNewLead(false)} className="flex-1 py-2.5 text-sm font-semibold text-navy-800 bg-navy-100 border-2 border-navy-200 rounded-xl hover:bg-navy-200 transition-colors">Cancelar</button>
                <button onClick={createLead} disabled={saving || !leadForm.fullName || !leadForm.phone} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  {saving ? 'Guardando...' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-navy-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {selectedLead.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-900">{selectedLead.fullName}</h2>
                  <p className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[selectedLead.source] || 'bg-gray-100 text-gray-700'}`}>{SOURCE_LABELS[selectedLead.source] || selectedLead.source}</span>
                    <span className="text-xs text-navy-400">Creado {selectedLead.createdAt ? formatDate(selectedLead.createdAt) : ''}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEditLead(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-50 transition-colors" title="Editar">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
                <button onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-50 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-5">
                <div className="bg-navy-50 rounded-xl p-4">
                  <span className="text-navy-400 text-[10px] uppercase tracking-wider font-medium">Teléfono</span>
                  <p className="font-semibold text-navy-900 mt-1">{selectedLead.phone}</p>
                </div>
                <div className="bg-navy-50 rounded-xl p-4">
                  <span className="text-navy-400 text-[10px] uppercase tracking-wider font-medium">Email</span>
                  <p className="font-semibold text-navy-900 mt-1">{selectedLead.email || <span className="text-navy-400 font-normal">—</span>}</p>
                </div>
                {selectedLead.budgetMin ? (
                  <div className="bg-navy-50 rounded-xl p-4">
                    <span className="text-navy-400 text-[10px] uppercase tracking-wider font-medium">Presupuesto</span>
                    <p className="font-semibold text-navy-900 mt-1">{formatCurrency(selectedLead.budgetMin, selectedLead.currency || 'ARS')}{selectedLead.budgetMax ? ` - ${formatCurrency(selectedLead.budgetMax, selectedLead.currency || 'ARS')}` : ''}</p>
                  </div>
                ) : (
                  <div className="bg-navy-50 rounded-xl p-4">
                    <span className="text-navy-400 text-[10px] uppercase tracking-wider font-medium">Presupuesto</span>
                    <p className="font-semibold text-navy-400 mt-1">Sin definir</p>
                  </div>
                )}
              </div>

              {selectedLead.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>
                    <div>
                      <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Notas</span>
                      <p className="text-sm text-amber-900 mt-1">{selectedLead.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={moveToWon} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ganado
                </button>
                <button onClick={moveToLost} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Descartar
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                    <h3 className="text-sm font-semibold text-navy-900">Actividades</h3>
                  </div>
                  <button onClick={() => setShowNewActivity(true)} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Agregar
                  </button>
                </div>
                {activities.length === 0 ? (
                  <div className="text-center py-8 bg-navy-50 rounded-xl">
                    <svg className="w-8 h-8 text-navy-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-navy-400">Sin actividades registradas</p>
                    <button onClick={() => setShowNewActivity(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">Registrar primera actividad</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act, i) => (
                      <div key={act.id || i} className="flex items-start gap-3 p-3 bg-navy-50 rounded-xl hover:bg-navy-100/50 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.type === 'llamada' ? 'bg-blue-100 text-blue-600' : act.type === 'visita' ? 'bg-purple-100 text-purple-600' : act.type === 'mensaje' ? 'bg-emerald-100 text-emerald-600' : act.type === 'email' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-600'}`}>
                          {act.type === 'llamada' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> :
                           act.type === 'visita' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> :
                           act.type === 'email' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> :
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium text-navy-500 capitalize">{act.type}</span>
                            <span className="text-navy-300">·</span>
                            <span className="text-xs text-navy-400">{act.createdAt ? formatDateTime(act.createdAt) : ''}</span>
                          </div>
                          <p className="text-sm text-navy-800">{act.description}</p>
                          {act.outcome && <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>{act.outcome}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewActivity && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewActivity(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-navy-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-900">Nueva actividad</h2>
                  <p className="text-xs text-navy-500">Registrá una interacción con {selectedLead.fullName}</p>
                </div>
              </div>
              <button onClick={() => setShowNewActivity(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-1.5">Tipo de actividad</label>
                <select className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={newActivityForm.type} onChange={e => setNewActivityForm(p => ({ ...p, type: e.target.value, scheduledAt: e.target.value !== 'visita' ? '' : p.scheduledAt }))}>
                  <option value="llamada">📞 Llamada</option>
                  <option value="visita">🏠 Visita</option>
                  <option value="mensaje">💬 Mensaje</option>
                  <option value="email">✉️ Email</option>
                  <option value="reunion">🤝 Reunión</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-1.5">Descripción</label>
                <textarea className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[90px] resize-none" placeholder="¿Qué pasó en la interacción?" value={newActivityForm.description} onChange={e => setNewActivityForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              {newActivityForm.type === 'visita' && (
                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1.5">Fecha y hora de la visita</label>
                  <input className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" type="datetime-local" value={newActivityForm.scheduledAt} onChange={e => setNewActivityForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-navy-800 mb-1.5">Resultado (opcional)</label>
                <input className="w-full px-3.5 py-2.5 bg-white border-2 border-navy-300 rounded-xl text-sm text-navy-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="Cliente pidió más información" value={newActivityForm.outcome} onChange={e => setNewActivityForm(p => ({ ...p, outcome: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNewActivity(false)} className="flex-1 py-2.5 text-sm font-semibold text-navy-800 bg-navy-100 border-2 border-navy-200 rounded-xl hover:bg-navy-200 transition-colors">Cancelar</button>
                <button onClick={addActivity} disabled={saving || !newActivityForm.description} className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  {saving ? 'Guardando...' : 'Registrar actividad'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}