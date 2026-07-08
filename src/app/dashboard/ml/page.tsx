'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const ML_CATEGORIES = [
  { id: 'MLA1472', name: 'Casas' },
  { id: 'MLA1473', name: 'Departamentos' },
  { id: 'MLA1474', name: 'Terrenos' },
  { id: 'MLA1475', name: 'Locales' },
  { id: 'MLA1469', name: 'Oficinas' },
]

const LISTING_TYPES = [
  { id: 'gold_special', name: 'Gold Especial' },
  { id: 'gold_premium', name: 'Gold Premium' },
  { id: 'gold', name: 'Gold' },
  { id: 'silver', name: 'Silver' },
  { id: 'free', name: 'Gratuito' },
]

export default function MLPage() {
  const { workspace } = useWorkspace()
  const [connected, setConnected] = useState(false)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const [showPublish, setShowPublish] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; itemId?: string } | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency_id: 'ARS',
    category_id: 'MLA1473',
    listing_type_id: 'gold_special',
    condition: 'new',
    bedrooms: '',
    bathrooms: '',
    area: '',
    address: '',
    city: '',
    state: '',
    pictures: '',
  })

  useEffect(() => {
    if (!workspace?.id) return
    loadStatus()
  }, [workspace?.id])

  const loadStatus = async () => {
    if (!workspace?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/ml?workspaceId=${workspace.id}&action=status`)
      const data = await res.json()
      setConnected(data.connected)
      setSellerId(data.sellerId)
      if (data.connected) {
        try {
          const itemsRes = await fetch(`/api/ml?workspaceId=${workspace.id}&action=items`)
          const itemsData = await itemsRes.json()
          setItems(itemsData.items || [])
        } catch { setItems([]) }
      }
    } catch { setConnected(false) }
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

  const publishProperty = async () => {
    if (!workspace?.id) return
    if (!form.title || !form.price) {
      setPublishResult({ success: false, message: 'Título y precio son obligatorios' })
      return
    }

    setPublishing(true)
    setPublishResult(null)

    const pictures = form.pictures
      .split('\n')
      .filter((url) => url.trim())
      .map((url) => ({ source: url.trim() }))

    const item: any = {
      title: form.title,
      price: parseInt(form.price),
      currency_id: form.currency_id,
      category_id: form.category_id,
      listing_type_id: form.listing_type_id,
      condition: form.condition,
    }
    if (pictures.length > 0) item.pictures = pictures
    if (form.description) item.description = form.description

    try {
      const res = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id, action: 'publish', item }),
      })
      const data = await res.json()
      if (data.error) {
        setPublishResult({ success: false, message: data.error })
      } else {
        setPublishResult({ success: true, message: 'Propiedad publicada exitosamente', itemId: data.item?.id })
        setItems([data.item, ...items])
        setForm({ title: '', description: '', price: '', currency_id: 'ARS', category_id: 'MLA1473', listing_type_id: 'gold_special', condition: 'new', bedrooms: '', bathrooms: '', area: '', address: '', city: '', state: '', pictures: '' })
        setShowPublish(false)
      }
    } catch (err: any) {
      setPublishResult({ success: false, message: err.message || 'Error al publicar' })
    }
    setPublishing(false)
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
          <p className="text-sm text-navy-500 mb-6 dark:text-navy-300">Publicá y sincronizá tus propiedades directamente en MercadoLibre desde Inmoxil.</p>
          <button onClick={connectML} disabled={connecting} className="btn-primary">
            {connecting ? 'Conectando...' : 'Conectar con MercadoLibre'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-navy-400 dark:text-navy-300">Cargando...</div>
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
                  <p className="text-sm text-navy-500 dark:text-navy-300">Seller ID: {sellerId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPublish(!showPublish)} className="btn-primary text-sm">
                  {showPublish ? 'Cancelar' : '+ Publicar propiedad'}
                </button>
                <button onClick={disconnect} className="text-sm text-red-500 hover:text-red-600 font-medium">Desconectar</button>
              </div>
            </div>
          </div>

          {publishResult && (
            <div className={`card p-4 mb-6 ${publishResult.success ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
              <p className={`text-sm font-medium ${publishResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {publishResult.message}
                {publishResult.itemId && (
                  <span className="ml-2">ID: {publishResult.itemId}</span>
                )}
              </p>
            </div>
          )}

          {showPublish && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4 dark:text-white">Publicar propiedad en MercadoLibre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Título *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="Departamento 3 ambientes en Palermo" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="Descripción detallada de la propiedad..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Precio *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="150000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Moneda</label>
                  <select value={form.currency_id} onChange={(e) => setForm({ ...form, currency_id: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white">
                    <option value="ARS">Pesos (ARS)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Categoría</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white">
                    {ML_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Tipo de aviso</label>
                  <select value={form.listing_type_id} onChange={(e) => setForm({ ...form, listing_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white">
                    {LISTING_TYPES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Dormitorios</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Baños</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Superficie (m²)</label>
                  <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="85" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">Condición</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white">
                    <option value="new">Nuevo</option>
                    <option value="used">Usado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 mb-1 dark:text-navy-300">URLs de fotos (una por línea)</label>
                  <textarea value={form.pictures} onChange={(e) => setForm({ ...form, pictures: e.target.value })} rows={3}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm dark:bg-navy-800 dark:border-navy-600 dark:text-white"
                    placeholder="https://ejemplo.com/foto1.jpg&#10;https://ejemplo.com/foto2.jpg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowPublish(false)} className="px-4 py-2 text-sm text-navy-600 hover:text-navy-800 font-medium">Cancelar</button>
                <button onClick={publishProperty} disabled={publishing} className="btn-primary">
                  {publishing ? 'Publicando...' : 'Publicar en MercadoLibre'}
                </button>
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-navy-900 mb-4 dark:text-white">Tus publicaciones en ML ({items.length})</h3>
          {items.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-navy-500 dark:text-navy-300">No tenés publicaciones activas en MercadoLibre.</p>
              <p className="text-sm text-navy-400 mt-1 dark:text-navy-400">Usá el botón de arriba para publicar tu primera propiedad.</p>
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
                    <p className="text-sm text-navy-500 dark:text-navy-300">$ {item.price?.toLocaleString('es-AR')} {item.currency_id}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{item.status}</span>
                  {item.permalink && (
                    <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Ver</a>
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
