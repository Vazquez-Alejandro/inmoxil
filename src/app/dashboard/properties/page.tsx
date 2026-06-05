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

export default function PropertiesPage() {
  const { workspace } = useWorkspace()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (workspace) {
      setLoading(true)
      fetch(`/api/properties?workspaceId=${workspace.id}`)
        .then(r => r.json())
        .then(data => {
          setProperties(data.properties || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [workspace])

  const filtered = properties.filter(p => {
    const matchesSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.portal?.toLowerCase() === filter
    return matchesSearch && matchesFilter
  })

  const portals = [...new Set(properties.map(p => p.portal))]

  const downloadPDF = async (propertyId: string, title: string) => {
    if (!workspace) return
    try {
      const res = await fetch('/api/properties/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, workspaceId: workspace.id }),
      })
      if (!res.ok) throw new Error('Error generando PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'propiedad'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando PDF:', error)
    }
  }

  const exportCSV = () => {
    const headers = ['Título', 'Portal', 'Precio', 'Moneda', 'Dirección', 'Barrio', 'Ciudad', 'Amb', 'Baños', 'm²', 'URL']
    const rows = filtered.map(p => [
      p.title, p.portal, p.price || '', p.currency, p.address, p.neighborhood, p.city, p.beds || '', p.baths || '', p.sqm || '', p.url || ''
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
      />

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por título, dirección o barrio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input w-auto min-w-[160px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos los portales</option>
            {portals.map(p => (
              <option key={p} value={p?.toLowerCase()}>{p}</option>
            ))}
          </select>
          {filtered.length > 0 && (
            <button onClick={exportCSV} className="btn-outline whitespace-nowrap">
              <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar CSV
            </button>
          )}
        </div>
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
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
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
            Empezá a scrapear propiedades de portales inmobiliarios para que aparezcan acá.
          </p>
          <a href="/dashboard/scrape" className="btn-gold">
            Ir a Scraping →
          </a>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((property) => (
            <div key={property.id} className="card-hover overflow-hidden">
              <div className="relative h-48">
                <img
                  src={property.photos?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <span className="portal-badge bg-navy-900/80 text-white">
                  {property.portal}
                </span>
                {property.currency && (
                  <span className="absolute top-3 right-3 badge bg-gold-400 text-navy-900">
                    {property.currency}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-navy-900 truncate mb-1">{property.title}</h4>
                <p className="text-sm text-navy-500 truncate mb-3">
                  {property.address || property.neighborhood}
                </p>
                <div className="flex items-center gap-4 text-xs text-navy-400 mb-3">
                  {property.beds > 0 && <span>{property.beds} amb</span>}
                  {property.baths > 0 && <span>{property.baths} baños</span>}
                  {property.sqm > 0 && <span>{property.sqm} m²</span>}
                </div>
                <div className="flex items-center justify-between">
                  <p className="price-tag text-lg">
                    {formatPrice(property.price || 0, property.currency || 'USD')}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadPDF(property.id, property.title)}
                      className="btn-ghost text-xs px-2 py-1"
                      title="Descargar PDF"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                    {property.url && (
                      <a
                        href={property.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs px-2 py-1"
                      >
                        Ver →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && properties.length > 0 && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-navy-500">No se encontraron propiedades con esos filtros.</p>
        </div>
      )}
    </>
  )
}
