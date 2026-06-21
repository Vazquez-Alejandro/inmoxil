'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'
import { AVAILABLE_CHANNELS, CHANNEL_COLORS, CHANNEL_ICONS, type ChannelType } from '@/lib/publish/types'

export default function PublishPage() {
  const { workspace } = useWorkspace()
  const [channels, setChannels] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'channels' | 'logs'>('channels')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!workspace?.id) return
    loadData()
  }, [workspace?.id])

  const loadData = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const [chRes, logsRes] = await Promise.all([
      fetch(`/api/publish?workspaceId=${workspace.id}`).then(r => r.json()),
      fetch(`/api/publish/logs?workspaceId=${workspace.id}&limit=30`).then(r => r.json()),
    ])
    setChannels(chRes.channels || [])
    setLogs(logsRes.logs || [])
    setLoading(false)
  }

  const toggleChannel = async (type: ChannelType, active: boolean) => {
    if (!workspace?.id) return
    setSaving(type)
    const channel = AVAILABLE_CHANNELS.find(c => c.type === type)
    if (!channel) return
    await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, type, label: channel.label, active, config: {} }),
    })
    setSaving(null)
    loadData()
  }

  const isReady = (type: ChannelType) => {
    const ch = AVAILABLE_CHANNELS.find(c => c.type === type)
    return ch?.ready ?? false
  }

  return (
    <>
      <Header title="Canales de Publicación" subtitle="Configurá dónde publicar tus propiedades" />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('channels')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'channels' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>Canales</button>
        <button onClick={() => setTab('logs')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'logs' ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'}`}>Historial</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400">Cargando...</div>
      ) : tab === 'channels' ? (
        <div className="space-y-4">
          {AVAILABLE_CHANNELS.map(ch => {
            const existing = channels.find(c => c.type === ch.type)
            const active = existing?.active ?? false
            return (
              <div key={ch.type} className={`card p-5 flex items-center justify-between ${!ch.ready ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${CHANNEL_COLORS[ch.type]} flex items-center justify-center text-white font-bold text-xs`}>
                    {CHANNEL_ICONS[ch.type]}
                  </div>
                  <div>
                    <p className="font-bold text-navy-900">{ch.label}</p>
                    <p className="text-sm text-navy-500">{ch.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ch.ready ? (
                    <>
                      {existing && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {active ? 'Activo' : 'Pausado'}
                        </span>
                      )}
                      <button
                        onClick={() => toggleChannel(ch.type, !active)}
                        disabled={saving === ch.type}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-navy-400 bg-navy-50 px-2.5 py-1 rounded-full">Próximamente</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          {logs.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <p className="text-navy-500 font-medium">Sin publicaciones aún</p>
              <p className="text-navy-400 text-sm mt-1">Las publicaciones aparecerán aquí cuando publiques desde una propiedad</p>
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
                    <p className="text-sm font-medium text-navy-900">{l.propertyTitle || 'Propiedad'}</p>
                    <p className="text-xs text-navy-500">
                      {l.channelType} • {l.status === 'success' ? 'Publicada' : l.status === 'error' ? `Error: ${(l.error || '').slice(0, 80)}` : l.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {l.externalUrl && (
                      <a href={l.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Ver en ML →</a>
                    )}
                    <span className="text-xs text-navy-400">{l.createdAt ? new Date(l.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit' }) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}