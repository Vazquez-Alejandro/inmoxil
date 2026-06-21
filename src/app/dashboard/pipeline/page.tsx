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
          <h1 className="text-xl font-bold text-navy-900">Pipeline</h1>
          <p className="text-sm text-navy-500">{leads.length} leads activos</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Buscar lead por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-1.5 text-sm border border-navy-200 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <button onClick={() => { setNewLeadStageId(stages[0]?.id || ''); setShowNewLead(true) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nuevo lead
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
                      <div className="text-center py-8 text-xs text-navy-400">Sin leads</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showNewLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewLead(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              <h2 className="text-lg font-bold text-navy-900">Nuevo lead</h2>
              <button onClick={() => setShowNewLead(false)} className="text-navy-400 hover:text-navy-600 p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-1">Nombre *</label>
                  <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" placeholder="Juan Pérez" value={leadForm.fullName} onChange={e => setLeadForm(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Teléfono *</label>
                  <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" placeholder="11 1234 5678" value={leadForm.phone} onChange={e => setLeadForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                  <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" type="email" placeholder="juan@email.com" value={leadForm.email} onChange={e => setLeadForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Origen</label>
                  <select className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" value={leadForm.source} onChange={e => setLeadForm(p => ({ ...p, source: e.target.value }))}>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Etapa</label>
                  <select className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" value={newLeadStageId} onChange={e => setNewLeadStageId(e.target.value)}>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Presupuesto min</label>
                  <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" type="number" placeholder="50000" value={leadForm.budgetMin} onChange={e => setLeadForm(p => ({ ...p, budgetMin: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Presupuesto max</label>
                  <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" type="number" placeholder="150000" value={leadForm.budgetMax} onChange={e => setLeadForm(p => ({ ...p, budgetMax: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-1">Requisitos / Comentarios</label>
                  <textarea className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm min-h-[60px]" placeholder="Busca 2 ambientes en Palermo, pet friendly..." value={leadForm.notes} onChange={e => setLeadForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <button onClick={createLead} disabled={saving || !leadForm.fullName || !leadForm.phone} className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Crear lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-navy-900">{selectedLead.fullName}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[selectedLead.source] || 'bg-gray-100 text-gray-700'}`}>{SOURCE_LABELS[selectedLead.source] || selectedLead.source}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-navy-400 hover:text-navy-600 p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-navy-400 text-xs uppercase tracking-wider">Teléfono</span>
                  <p className="font-medium text-navy-900 mt-0.5">{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="text-navy-400 text-xs uppercase tracking-wider">Email</span>
                  <p className="font-medium text-navy-900 mt-0.5">{selectedLead.email || '—'}</p>
                </div>
                {selectedLead.budgetMin && (
                  <div>
                    <span className="text-navy-400 text-xs uppercase tracking-wider">Presupuesto</span>
                    <p className="font-medium text-navy-900 mt-0.5">{selectedLead.budgetMin ? formatCurrency(selectedLead.budgetMin, selectedLead.currency || 'ARS') : ''}{selectedLead.budgetMax ? ` - ${formatCurrency(selectedLead.budgetMax, selectedLead.currency || 'ARS')}` : ''}</p>
                  </div>
                )}
                <div>
                  <span className="text-navy-400 text-xs uppercase tracking-wider">Creado</span>
                  <p className="font-medium text-navy-900 mt-0.5">{selectedLead.createdAt ? formatDate(selectedLead.createdAt) : '—'}</p>
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <span className="text-navy-400 text-xs uppercase tracking-wider block mb-1">Notas</span>
                  <p className="text-sm text-navy-700 bg-navy-50 rounded-lg p-3">{selectedLead.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={moveToWon} className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">Marcar como ganado</button>
                <button onClick={moveToLost} className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Descartar lead</button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-navy-900">Actividades</h3>
                  <button onClick={() => setShowNewActivity(true)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">+ Agregar</button>
                </div>
                {activities.length === 0 ? (
                  <p className="text-sm text-navy-400 text-center py-6">Sin actividades registradas</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act, i) => (
                      <div key={act.id || i} className="flex items-start gap-3 p-3 bg-navy-50 rounded-lg">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${act.type === 'llamada' ? 'bg-blue-100' : act.type === 'visita' ? 'bg-purple-100' : act.type === 'mensaje' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          <svg className={`w-3.5 h-3.5 ${act.type === 'llamada' ? 'text-blue-600' : act.type === 'visita' ? 'text-purple-600' : act.type === 'mensaje' ? 'text-emerald-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-navy-800">{act.description}</p>
                          {act.outcome && <p className="text-xs text-navy-500 mt-0.5">Resultado: {act.outcome}</p>}
                          <p className="text-xs text-navy-400 mt-0.5">{act.createdAt ? formatDateTime(act.createdAt) : ''}</p>
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewActivity(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              <h2 className="text-lg font-bold text-navy-900">Nueva actividad</h2>
              <button onClick={() => setShowNewActivity(false)} className="text-navy-400 hover:text-navy-600 p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Tipo</label>
                <select className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" value={newActivityForm.type} onChange={e => setNewActivityForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="llamada">Llamada</option>
                  <option value="visita">Visita</option>
                  <option value="mensaje">Mensaje</option>
                  <option value="email">Email</option>
                  <option value="reunion">Reunión</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Descripción</label>
                <textarea className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm min-h-[80px]" placeholder="¿Qué pasó?" value={newActivityForm.description} onChange={e => setNewActivityForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Resultado</label>
                <input className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm" placeholder="Cliente pidió más información" value={newActivityForm.outcome} onChange={e => setNewActivityForm(p => ({ ...p, outcome: e.target.value }))} />
              </div>
              <button onClick={addActivity} disabled={saving || !newActivityForm.description} className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Registrar actividad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}