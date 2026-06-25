'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

export default function MLPage() {
  const { workspace } = useWorkspace()
  const [connected, setConnected] = useState(false)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    loadStatus()
  }, [workspace?.id])

  const loadStatus = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const res = await fetch(`/api/ml?workspaceId=${workspace.id}&action=status`)
    const data = await res.json()
    setConnected(data.connected)
    setSellerId(data.sellerId)
    if (data.connected) {
      const itemsRes = await fetch(`/api/ml?workspaceId=${workspace.id}&action=items`)
      const itemsData = await itemsRes.json()
      setItems(itemsData.items || [])
    }
    setLoading(false)
  }

  const connectML = async () => {
    if (!workspace?.id) return
    setConnecting(true)
    const res = await fetch(`/api/ml?workspaceId=${workspace.id}&action=authUrl`)
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setConnecting(false)
  }

  const disconnect = async () => {
    if (!workspace?.id) return
    await fetch('/api/ml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace.id, action: 'disconnect' }),
    })
    setConnected(false)
    setItems([])
    setSellerId(null)
  }

  return (
    <>
      <Header title="MercadoLibre" subtitle="Publicación y sincronización de propiedades" />

      {!connected && !loading && (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <h3 className="text-xl font-bold text-navy-900 mb-2 dark:text-white">Conectá MercadoLibre</h3>
          <p className="text-sm text-navy-500 mb-6 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Publicá y sincronizá tus propiedades directamente en MercadoLibre desde Inmoxil.</p>
          <button onClick={connectML} disabled={connecting} className="btn-primary">
            {connecting ? 'Conectando...' : 'Conectar con MercadoLibre'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400 dark:text-navy-300 dark:text-navy-100">Cargando...</div>
      ) : connected && (
        <div>
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-navy-900 dark:text-white">Conectado</p>
                  <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Seller ID: {sellerId}</p>
                </div>
              </div>
              <button onClick={disconnect} className="text-sm text-red-500 hover:text-red-600 font-medium">Desconectar</button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-navy-900 mb-4 dark:text-white">Tus publicaciones en ML ({items.length})</h3>
          {items.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">No tenés publicaciones activas en MercadoLibre.</p>
              <p className="text-sm text-navy-400 mt-1 dark:text-navy-300 dark:text-navy-100">Próximamente: publicar propiedades desde Inmoxil.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map(item => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  {item.pictures?.[0] && (
                    <img src={item.pictures[0].source} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 truncate dark:text-white">{item.title}</p>
                    <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">$ {item.price?.toLocaleString('es-AR')} {item.currency_id}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{item.status}</span>
                  {item.permalink && (
                    <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Ver →</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}