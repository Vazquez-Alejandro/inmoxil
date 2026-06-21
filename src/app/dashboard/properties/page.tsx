'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

const PROPERTY_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'ph', label: 'PH' },
  { value: 'loft', label: 'Loft' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
]

export default function PropertiesPage() {
  const { workspace } = useWorkspace()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<any[]>([])
  const [publishing, setPublishing] = useState<string | null>(null)
  const [publishDrop, setPublishDrop] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterPortal, setFilterPortal] = useState('all')
  const [filterType, setFilterType] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [filterBeds, setFilterBeds] = useState('')

  // Add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    title: '', price: '', currency: 'USD', address: '', neighborhood: '',
    city: '', state: '', country: 'Argentina', beds: '', baths: '', sqm: '',
    propertyType: 'departamento', url: '', description: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  const fetchProperties = () => {
    if (workspace) {
      setLoading(true)
      fetch(`/api/properties?workspaceId=${workspace.id}`)
        .then(r => r.json())
        .then(data => { setProperties(data.properties || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }

  useEffect(() => { fetchProperties() }, [workspace])

  useEffect(() => {
    if (workspace?.id) {
      fetch(`/api/publish?workspaceId=${workspace.id}`)
        .then(r => r.json()).then(d => setChannels((d.channels || []).filter((c: any) => c.active)))
        .catch(() => {})
    }
  }, [workspace?.id])

  const publishProperty = async (propertyId: string, channelType: string) => {
    if (!workspace?.id) return
    setPublishing(propertyId)
    setPublishDrop(null)
    try {
      const res = await fetch(`/api/publish/${propertyId}?workspaceId=${workspace.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelType }),
      })
      const data = await res.json()
      if (data.success) {
        alert('¡Publicado con éxito!')
      } else {
        alert('Error: ' + (data.error || 'Error al publicar'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setPublishing(null)
    }
  }

  const filtered = properties.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      const match = p.title?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.neighborhood?.toLowerCase().includes(q)
      if (!match) return false
    }
    if (filterPortal !== 'all' && p.portal?.toLowerCase() !== filterPortal) return false
    if (filterType && p.property_type?.toLowerCase() !== filterType) return false
    if (filterBeds && p.beds !== parseInt(filterBeds)) return false
    if (priceMin && (p.price || 0) < parseInt(priceMin)) return false
    if (priceMax && (p.price || 0) > parseInt(priceMax)) return false
    return true
  })

  const portals = [...new Set(properties.map(p => p.portal))]

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id || !addForm.title) return
    setAddLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          properties: [{
            portal: 'manual',
            title: addForm.title,
            price: addForm.price ? parseInt(addForm.price) : null,
            currency: addForm.currency,
            address: addForm.address,
            neighborhood: addForm.neighborhood,
            city: addForm.city,
            state: addForm.state,
            country: addForm.country,
            beds: addForm.beds ? parseInt(addForm.beds) : null,
            baths: addForm.baths ? parseInt(addForm.baths) : null,
            sqm: addForm.sqm ? parseInt(addForm.sqm) : null,
            propertyType: addForm.propertyType,
            url: addForm.url,
            description: addForm.description,
          }]
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setAddSuccess(true)
      setAddForm({ title: '', price: '', currency: 'USD', address: '', neighborhood: '', city: '', state: '', country: 'Argentina', beds: '', baths: '', sqm: '', propertyType: 'departamento', url: '', description: '' })
      fetchProperties()
      setTimeout(() => { setAddSuccess(false); setShowAddForm(false) }, 1500)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setAddLoading(false)
    }
  }

  const deleteProperty = async (id: string) => {
    if (!confirm('¿Eliminar esta propiedad?')) return
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const exportCSV = () => {
    const headers = ['Título', 'Portal', 'Precio', 'Moneda', 'Dirección', 'Barrio', 'Ciudad', 'Amb', 'Baños', 'm²', 'Tipo', 'URL']
    const rows = filtered.map(p => [
      p.title, p.portal, p.price || '', p.currency, p.address, p.neighborhood, p.city, p.beds || '', p.baths || '', p.sqm || '', p.property_type || '', p.url || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propiedades-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        title="Propiedades"
        subtitle={`${properties.length} propiedades en tu portafolio`}
        action={<button onClick={() => setShowAddForm(!showAddForm)} className="btn-gold text-sm">+ Agregar propiedad</button>}
      />

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Agregar propiedad manualmente</h3>
          {addSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-emerald-700 font-medium">Propiedad agregada correctamente</p>
            </div>
          ) : (
            <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="label">Título *</label>
                <input className="input" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} placeholder="Ej: Departamento 3 ambientes Palermo" required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="label">Precio</label>
                  <input className="input" type="number" value={addForm.price} onChange={e => setAddForm({ ...addForm, price: e.target.value })} placeholder="120000" />
                </div>
                <div className="w-24">
                  <label className="label">Moneda</label>
                  <select className="input" value={addForm.currency} onChange={e => setAddForm({ ...addForm, currency: e.target.value })}>
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="BRL">BRL</option>
                  </select>
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="label">Dirección</label>
                <input className="input" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} placeholder="Av. Santa Fe 1234" />
              </div>
              <div>
                <label className="label">Barrio</label>
                <input className="input" value={addForm.neighborhood} onChange={e => setAddForm({ ...addForm, neighborhood: e.target.value })} placeholder="Palermo" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="label">Ambientes</label>
                  <input className="input" type="number" min="0" value={addForm.beds} onChange={e => setAddForm({ ...addForm, beds: e.target.value })} placeholder="3" />
                </div>
                <div className="flex-1">
                  <label className="label">Baños</label>
                  <input className="input" type="number" min="0" value={addForm.baths} onChange={e => setAddForm({ ...addForm, baths: e.target.value })} placeholder="2" />
                </div>
                <div className="flex-1">
                  <label className="label">m²</label>
                  <input className="input" type="number" min="0" value={addForm.sqm} onChange={e => setAddForm({ ...addForm, sqm: e.target.value })} placeholder="85" />
                </div>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={addForm.propertyType} onChange={e => setAddForm({ ...addForm, propertyType: e.target.value })}>
                  {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="label">URL (opcional)</label>
                <input className="input" value={addForm.url} onChange={e => setAddForm({ ...addForm, url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" value={addForm.city} onChange={e => setAddForm({ ...addForm, city: e.target.value })} placeholder="Capital Federal" />
              </div>
              <div className="lg:col-span-3">
                <label className="label">Descripción</label>
                <textarea className="input min-h-[80px]" value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} placeholder="Descripción de la propiedad..." />
              </div>
              <div className="lg:col-span-3 flex gap-2">
                <button type="submit" disabled={addLoading} className="btn-gold disabled:opacity-50">
                  {addLoading ? 'Guardando...' : 'Guardar propiedad'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" className="input pl-10" placeholder="Buscar título, dirección, barrio..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <select className="input" value={filterPortal} onChange={(e) => setFilterPortal(e.target.value)}>
            <option value="all">Todos los portales</option>
            {portals.map(p => <option key={p} value={p?.toLowerCase()}>{p}</option>)}
          </select>
          <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="input" value={filterBeds} onChange={(e) => setFilterBeds(e.target.value)}>
            <option value="">Ambientes: Todos</option>
            <option value="1">1 amb</option>
            <option value="2">2 amb</option>
            <option value="3">3 amb</option>
            <option value="4">4 amb</option>
            <option value="5">5+ amb</option>
          </select>
          <div className="flex gap-2">
            <input className="input flex-1" type="number" placeholder="Precio mín" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
            <input className="input flex-1" type="number" placeholder="Precio máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
          </div>
        </div>
        {(search || filterPortal !== 'all' || filterType || filterBeds || priceMin || priceMax) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-navy-400">{filtered.length} resultados con estos filtros</span>
            <button onClick={() => { setSearch(''); setFilterPortal('all'); setFilterType(''); setFilterBeds(''); setPriceMin(''); setPriceMax('') }} className="text-xs text-gold-600 hover:text-gold-700 font-medium">Limpiar filtros</button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">Sin propiedades aún</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-6">
            Agregá propiedades manualmente, importá un CSV o scrapeá portales inmobiliarios.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowAddForm(true)} className="btn-gold">+ Agregar propiedad</button>
            <a href="/dashboard/scrape" className="btn-outline">Ir a Scraping</a>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-navy-500">{filtered.length} propiedades</p>
            {filtered.length > 0 && (
              <button onClick={exportCSV} className="btn-outline text-sm">
                <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Exportar CSV
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((property) => (
              <div key={property.id} className="card-hover overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={property.photos?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="portal-badge bg-navy-900/80 text-white">{property.portal}</span>
                  {property.currency && (
                    <span className="absolute top-3 right-3 badge bg-gold-500 text-white">{property.currency}</span>
                  )}
                  <button
                    onClick={() => deleteProperty(property.id)}
                    className="absolute top-3 left-3 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-navy-900 truncate mb-1">{property.title}</h4>
                  <p className="text-sm text-navy-500 truncate mb-3">{property.address || property.neighborhood || 'Sin dirección'}</p>
                  <div className="flex items-center gap-4 text-xs text-navy-400 mb-3">
                    {property.beds > 0 && <span>{property.beds} amb</span>}
                    {property.baths > 0 && <span>{property.baths} baños</span>}
                    {property.sqm > 0 && <span>{property.sqm} m²</span>}
                    {property.property_type && <span className="badge bg-navy-50 text-navy-600">{property.property_type}</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="price-tag text-lg whitespace-nowrap">
                        {formatPrice(property.price || 0, property.currency || 'USD')}
                      </p>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent('📍 ' + (property.title || 'Propiedad') + '\n💰 ' + formatPrice(property.price || 0, property.currency || 'USD') + '\n📮 ' + (property.address || property.neighborhood || '') + '\n\n🔗 https://inmoxil.vercel.app/p/' + property.id)}`}
                        target="_blank"
                        rel="noopener"
                        className="btn-ghost text-xs px-2 py-1 text-emerald-600 hover:text-emerald-700"
                        title="Compartir por WhatsApp"
                      >
                        <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      </a>
                      {property.url && (
                        <a href={property.url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs px-2 py-1 whitespace-nowrap">Ver →</a>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setPublishDrop(publishDrop === property.id ? null : property.id)}
                        disabled={publishing === property.id || channels.length === 0}
                        className="btn-outline text-xs py-1.5 whitespace-nowrap disabled:opacity-40"
                      >
                        {publishing === property.id ? 'Publicando...' : 'Publicar'}
                      </button>
                      {publishDrop === property.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setPublishDrop(null)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-navy-200 rounded-lg shadow-lg z-50 py-1">
                            {channels.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-navy-400">Sin canales activos</p>
                            ) : (
                              channels.map((ch: any) => (
                                <button
                                  key={ch.id}
                                  onClick={() => publishProperty(property.id, ch.type)}
                                  className="w-full text-left px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2"
                                >
                                  <span className={`w-5 h-5 rounded ${ch.type === 'mercadolibre' ? 'bg-amber-500' : 'bg-navy-400'} flex items-center justify-center text-white text-[8px] font-bold`}>
                                    {ch.type === 'mercadolibre' ? 'ML' : ch.type.slice(0, 2).toUpperCase()}
                                  </span>
                                  {ch.label}
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* No results */}
      {!loading && properties.length > 0 && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-navy-500">No se encontraron propiedades con esos filtros.</p>
          <button onClick={() => { setSearch(''); setFilterPortal('all'); setFilterType(''); setFilterBeds(''); setPriceMin(''); setPriceMax('') }} className="btn-outline text-sm mt-3">Limpiar filtros</button>
        </div>
      )}
    </>
  )
}
