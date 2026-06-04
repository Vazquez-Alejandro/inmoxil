'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const PORTALS = [
  { slug: 'zonaprop', name: 'ZonaProp', color: 'bg-blue-100 text-blue-700' },
  { slug: 'argenprop', name: 'Argenprop', color: 'bg-green-100 text-green-700' },
  { slug: 'mercadolibre', name: 'MercadoLibre', color: 'bg-yellow-100 text-yellow-700' },
  { slug: 'zillow', name: 'Zillow', color: 'bg-purple-100 text-purple-700' },
  { slug: 'realtor', name: 'Realtor', color: 'bg-red-100 text-red-700' },
  { slug: 'vivareal', name: 'VivaReal', color: 'bg-emerald-100 text-emerald-700' },
]

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function ScrapePage() {
  const { workspace } = useWorkspace()
  const [urls, setUrls] = useState('')
  const [maxItems, setMaxItems] = useState(50)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const handleScrape = async () => {
    const urlList = urls.split('\n').map(u => u.trim()).filter(u => u)
    if (urlList.length === 0) {
      setError('Ingresá al menos una URL')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList, maxItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al scrapear')
      setResults(data)

      // Save to DB if workspace exists
      if (workspace?.id && data.data?.length > 0) {
        fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: workspace.id, properties: data.data }),
        }).catch(() => {})
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!results?.data) return
    const blob = new Blob([JSON.stringify(results.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propiedades-${results.portal || 'mixed'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        title="Scraping Multi-Portal"
        subtitle="Scrapeá propiedades de múltiples portales inmobiliarios"
      />

      {/* Portal Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {PORTALS.map((portal) => (
          <div key={portal.slug} className="card p-3 sm:p-4 text-center hover:shadow-corporate-md transition-all">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${portal.color} flex items-center justify-center mx-auto mb-2`}>
              <span className="text-base sm:text-lg font-bold">{portal.name[0]}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-navy-700">{portal.name}</p>
            <p className="text-[10px] sm:text-xs text-navy-400 mt-1">Activo</p>
          </div>
        ))}
      </div>

      {/* Scrape Form */}
      <div className="card p-4 sm:p-6 mb-8">
        <h3 className="text-lg font-bold text-navy-900 mb-4">Nueva consulta</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="label">URLs de propiedades (una por línea)</label>
            <textarea
              className="input min-h-[120px] sm:min-h-[160px] font-mono text-sm"
              placeholder={`https://www.zonaprop.com.ar/propiedades/venta-departamento-palermo-12345.html\nhttps://www.zillow.com/homedetails/123-Main-St/12345_zpid/\nhttps://www.realtor.com/realestateandhomes-detail/123-Main-St`}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
            <p className="text-xs text-navy-400 mt-2">
              Soportamos ZonaProp, Argenprop, MercadoLibre, Zillow, Realtor, VivaReal y más
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Máximo de resultados</label>
              <input
                type="number"
                className="input"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value) || 50)}
                min={1}
                max={200}
              />
            </div>
            <div className="flex-1" />
            <button
              onClick={handleScrape}
              disabled={loading || !urls.trim()}
              className="btn-gold w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scrapeando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Scrapear
                </span>
              )}
            </button>
            <p className="text-xs text-navy-400 text-center">
              1 crédito por consulta
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-navy-200 rounded animate-pulse" />
            <div className="h-4 bg-navy-200 rounded w-48 animate-pulse" />
          </div>
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
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="card">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  {results.count} propiedades encontradas
                </h3>
                <p className="text-sm text-navy-500">
                  Portal: {results.portal} • Crédito utilizado
                </p>
              </div>
              <button onClick={downloadJSON} className="btn-outline text-sm self-start">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Exportar JSON
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {results.data?.map((property: any, idx: number) => (
              <div key={idx} className="card-hover overflow-hidden">
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
                    {property.address || property.location?.address}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-navy-400 mb-3">
                    {property.features?.beds > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        {property.features?.beds}
                      </span>
                    )}
                    {property.features?.baths > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {property.features?.baths}
                      </span>
                    )}
                    {property.features?.area > 0 && (
                      <span>{property.features?.area} m²</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="price-tag text-lg">
                      {formatPrice(property.price || 0, property.currency || 'USD')}
                    </p>
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
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!results && !loading && !error && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9 9 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">Empezá a scrapear</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto">
            Ingresá URLs de propiedades de cualquier portal y nosotros las normalizamos y deduplicamos automáticamente.
          </p>
        </div>
      )}
    </>
  )
}
