'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export default function CalendarPage() {
  const { workspace } = useWorkspace()
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (workspace?.id) {
      setLoading(true)
      fetch(`/api/pipeline/visits?workspaceId=${workspace.id}`)
        .then(r => r.json())
        .then(data => { setVisits(data.visits || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [workspace?.id])

  const grouped: Record<string, any[]> = {}
  for (const v of visits) {
    const date = v.scheduled_at ? new Date(v.scheduled_at).toISOString().split('T')[0] : 'sin-fecha'
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(v)
  }

  const dates = Object.keys(grouped).sort()

  return (
    <>
      <Header title="Calendario de visitas" subtitle={visits.length > 0 ? `${visits.length} visitas registradas` : ''} />
      <div className="card p-6">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-navy-50 rounded-lg animate-pulse" />)}
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Sin visitas agendadas</h3>
            <p className="text-sm text-navy-500 max-w-md mx-auto">Las visitas aparecen acá cuando registrás una actividad de tipo &ldquo;visita&rdquo; con fecha asignada desde el panel de Clientes.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map(date => {
              const items = grouped[date]
              const isUnscheduled = date === 'sin-fecha'
              return (
                <div key={date}>
                  <h3 className="text-sm font-bold text-navy-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {isUnscheduled ? 'Sin fecha asignada' : formatDate(date)}
                    <span className="text-xs font-normal text-navy-400 bg-navy-50 px-2 py-0.5 rounded">{items.length} visita{items.length !== 1 ? 's' : ''}</span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((v: any) => (
                      <div key={v.id} className="flex items-start gap-4 p-4 bg-navy-50 rounded-lg border border-navy-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-navy-900">{v.full_name}</span>
                            <span className="text-xs text-navy-400">{v.phone}</span>
                            <span className="badge text-[10px] bg-navy-200 text-navy-700">{v.stage_name}</span>
                          </div>
                          {v.description && <p className="text-sm text-navy-600 mb-1">{v.description}</p>}
                          <div className="flex items-center gap-3 text-xs text-navy-400">
                            <span>{v.type}</span>
                            {v.scheduled_at && <span><svg className="w-3.5 h-3.5 inline mr-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {formatTime(v.scheduled_at)}</span>}
                            {v.outcome && <span className="text-navy-500">→ {v.outcome}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
