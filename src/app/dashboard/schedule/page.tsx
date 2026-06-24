'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const PORTALS = [
  { id: 'zonaprop', label: 'ZonaProp', color: 'bg-blue-500' },
  { id: 'argenprop', label: 'Argenprop', color: 'bg-emerald-500' },
  { id: 'mercadolibre', label: 'MercadoLibre', color: 'bg-amber-500' },
]

const FREQUENCIES = [
  { value: 1, label: 'Cada 1 hora' },
  { value: 6, label: 'Cada 6 horas' },
  { value: 12, label: 'Cada 12 horas' },
  { value: 24, label: 'Cada 24 horas' },
  { value: 48, label: 'Cada 2 días' },
  { value: 72, label: 'Cada 3 días' },
  { value: 168, label: 'Cada 7 días' },
]

export default function SchedulingPage() {
  const { workspace } = useWorkspace()
  const [schedules, setSchedules] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [editingPortal, setEditingPortal] = useState<string | null>(null)
  const [form, setForm] = useState({ active: true, frequencyHours: 24, maxItems: 50, urls: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'schedules' | 'logs'>('schedules')

  useEffect(() => {
    if (!workspace?.id) return
    loadData()
  }, [workspace?.id])

  const loadData = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const [schedRes, logsRes] = await Promise.all([
      fetch(`/api/schedule?workspaceId=${workspace.id}`).then(r => r.json()),
      fetch(`/api/schedule?workspaceId=${workspace.id}&logs=true`).then(r => r.json()),
    ])
    setSchedules(schedRes.schedules || [])
    setLogs(logsRes.logs || [])
    setLoading(false)
  }

  const editPortal = (portalId: string) => {
    const existing = schedules.find(s => s.portal === portalId)
    setEditingPortal(portalId)
    setForm({
      active: existing?.active ?? true,
      frequencyHours: existing?.frequencyHours ?? 24,
      maxItems: existing?.maxItems ?? 50,
      urls: (existing?.urls || []).join('\n'),
    })
  }

  const save = async () => {
    if (!workspace?.id || !editingPortal) return
    setSaving(true)
    await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId: workspace.id,
        portal: editingPortal,
        active: form.active,
        frequencyHours: form.frequencyHours,
        maxItems: form.maxItems,
        urls: form.urls.split('\n').map((u: string) => u.trim()).filter(Boolean),
      }),
    })
    setSaving(false)
    setEditingPortal(null)
    loadData()
  }

  const deleteSchedule = async (id: string) => {
    if (!workspace?.id) return
    await fetch(`/api/schedule?workspaceId=${workspace.id}&id=${id}`, { method: 'DELETE' })
    loadData()
  }

  return (
    <>
      <Header title="Importación Automática" subtitle="Programá importación recurrente de portales" />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('schedules')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'schedules' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>Configuración</button>
        <button onClick={() => setTab('logs')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'logs' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>Historial</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400">Cargando...</div>
      ) : tab === 'schedules' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {PORTALS.map(p => {
              const sched = schedules.find(s => s.portal === p.id)
              return (
                <div key={p.id} className={`card p-5 ${editingPortal === p.id ? 'ring-2 ring-indigo-400' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">{p.label}</p>
                      {sched ? (
                        <p className="text-xs text-navy-500">{sched.frequencyHours}h • {sched.active ? 'Activo' : 'Pausado'}</p>
                      ) : (
                        <p className="text-xs text-navy-400">No configurado</p>
                      )}
                    </div>
                  </div>

                  {editingPortal === p.id ? (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-navy-700">Activo</span>
                      </label>

                      <div>
                        <label className="text-xs text-navy-500 font-medium mb-1 block">Frecuencia</label>
                        <select value={form.frequencyHours} onChange={e => setForm(f => ({ ...f, frequencyHours: parseInt(e.target.value) }))} className="input w-full text-sm">
                          {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-navy-500 font-medium mb-1 block">Máx. propiedades</label>
                        <input type="number" value={form.maxItems} onChange={e => setForm(f => ({ ...f, maxItems: parseInt(e.target.value) || 50 }))} className="input w-full text-sm" min={1} max={200} />
                      </div>

                      <div>
                        <label className="text-xs text-navy-500 font-medium mb-1 block">URLs a scrapear (una por línea)</label>
                        <textarea value={form.urls} onChange={e => setForm(f => ({ ...f, urls: e.target.value }))} className="input w-full text-sm" rows={3} placeholder="https://www.zonaprop.com.ar/propiedades/..." />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={save} disabled={saving} className="btn-primary text-sm py-2">{saving ? 'Guardando...' : 'Guardar'}</button>
                        <button onClick={() => setEditingPortal(null)} className="btn-outline text-sm py-2">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sched ? (
                        <>
                          <div className="text-xs text-navy-500">
                            <p>URLs: {sched.urls?.length || 0}</p>
                            <p>Último: {sched.lastRunAt ? new Date(sched.lastRunAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit' }) : 'Nunca'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => editPortal(p.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Editar</button>
                            <button onClick={() => deleteSchedule(sched.id!)} className="text-xs text-red-500 hover:text-red-600 font-medium">Eliminar</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => editPortal(p.id)} className="btn-outline text-sm py-2">Configurar</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="card p-6 mt-4">
            <h3 className="text-sm font-bold text-navy-900 mb-2">¿Cómo funciona?</h3>
            <p className="text-xs text-navy-500 leading-relaxed">
              Configurá URLs de búsqueda de ZonaProp o Argenprop, elegí la frecuencia, y el sistema scrapea automáticamente
              en segundo plano. Las propiedades nuevas se importan solas. Recibís notificaciones cuando se complete cada ciclo.
              El cron se ejecuta aproximadamente cada hora en Vercel.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {logs.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-navy-500">Sin historial de scraping automático</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map(l => (
                <div key={l.id} className="card p-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    l.status === 'success' ? 'bg-emerald-100' : l.status === 'error' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      l.status === 'success' ? 'text-emerald-600' : l.status === 'error' ? 'text-red-600' : 'text-amber-600'
                    }`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {l.status === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> :
                       l.status === 'error' ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> :
                       <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 capitalize">{l.portal}</p>
                    <p className="text-xs text-navy-500">
                      {l.itemsScraped} scrapeadas • {l.itemsImported} importadas
                      {l.error && ` • Error: ${l.error.slice(0, 100)}`}
                    </p>
                  </div>
                  <span className="text-xs text-navy-400">{l.startedAt ? new Date(l.startedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}