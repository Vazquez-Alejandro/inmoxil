'use client'

import { useState, useRef, useCallback } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

const PORTALS = [
  { slug: 'zonaprop', name: 'ZonaProp', color: 'bg-blue-100 text-blue-700', country: 'AR' },
  { slug: 'argenprop', name: 'Argenprop', color: 'bg-green-100 text-green-700', country: 'AR' },
  { slug: 'mercadolibre', name: 'MercadoLibre', color: 'bg-yellow-100 text-yellow-700', country: 'AR', disabled: true },
  { slug: 'zillow', name: 'Zillow', color: 'bg-purple-100 text-purple-700', country: 'US' },
  { slug: 'realtor', name: 'Realtor', color: 'bg-red-100 text-red-700', country: 'US' },
  { slug: 'vivareal', name: 'VivaReal', color: 'bg-emerald-100 text-emerald-700', country: 'BR' },
]

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : currency === 'BRL' ? 'BRL' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

type Tab = 'urls' | 'import'

export default function ScrapePage() {
  const { workspace } = useWorkspace()
  const [activeTab, setActiveTab] = useState<Tab>('urls')
  const [urls, setUrls] = useState('')
  const [maxItems, setMaxItems] = useState(50)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{ count: number; success: boolean; message: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasCredits = (workspace?.credits_remaining ?? 50) > 0

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

  const handleQuickScrape = async (portal: string) => {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [`https://www.${portal}.com`], maxItems, portalOverride: portal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al scrapear')
      setResults(data)

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

  const parseCSV = useCallback((text: string): any[] => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
    return lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes }
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
        else { current += char }
      }
      values.push(current.trim())

      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = (values[i] || '').replace(/^"|"$/g, '') })
      return obj
    })
  }, [])

  const normalizeImportRow = (row: any): any => {
    const find = (...keys: string[]): string => {
      for (const k of keys) {
        const v = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()]
        if (v && String(v).trim()) return String(v).trim()
      }
      return ''
    }

    const findNum = (...keys: string[]): number | null => {
      const v = find(...keys)
      if (!v) return null
      const n = parseInt(v.replace(/[^0-9]/g, ''))
      return isNaN(n) ? null : n
    }

    return {
      title: find('title', 'titulo', 'título', 'nombre', 'name'),
      price: findNum('price', 'precio', 'valor'),
      currency: find('currency', 'moneda') || 'USD',
      address: find('address', 'direccion', 'dirección', 'ubicacion', 'ubicación', 'location'),
      neighborhood: find('neighborhood', 'barrio', 'neighborhood', 'bairro', 'district'),
      city: find('city', 'ciudad', 'locality', 'cidade'),
      state: find('state', 'provincia', 'estado', 'region'),
      country: find('country', 'pais', 'país'),
      beds: findNum('beds', 'bedrooms', 'habitaciones', 'dormitorios', 'quartos'),
      baths: findNum('baths', 'bathrooms', 'banos', 'baños', 'banheiros'),
      sqm: findNum('sqm', 'area', 'superficie', 'm2', 'm²', 'metros'),
      propertyType: find('propertytype', 'type', 'tipo', 'tipopropiedad'),
      url: find('url', 'link', 'permalink'),
      description: find('description', 'descripcion', 'descripción'),
      photos: find('photos', 'images', 'fotos', 'imagen', 'image').split('|').filter(Boolean),
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text)
          const arr = Array.isArray(data) ? data : [data]
          setImportPreview(arr.slice(0, 5))
        } else {
          const rows = parseCSV(text)
          setImportPreview(rows.slice(0, 5))
        }
      } catch {
        setError('No se pudo leer el archivo. Verificá el formato.')
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!importFile || !workspace?.id) return

    setImportLoading(true)
    setError('')

    try {
      const text = await importFile.text()
      let rawRows: any[]

      if (importFile.name.endsWith('.json')) {
        const data = JSON.parse(text)
        rawRows = Array.isArray(data) ? data : [data]
      } else {
        rawRows = parseCSV(text)
      }

      const properties = rawRows.map(normalizeImportRow).filter(p => p.title || p.address)

      if (properties.length === 0) {
        setError('No se encontraron propiedades válidas. Verificá que el archivo tenga columnas como título, precio, dirección, etc.')
        setImportLoading(false)
        return
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id, properties }),
      })
      const data = await res.json()

      if (data.success) {
        setImportResult({
          count: data.count,
          success: true,
          message: `${data.count} propiedades importadas exitosamente`,
        })
        setImportFile(null)
        setImportPreview([])
        if (fileRef.current) fileRef.current.value = ''
      } else {
        throw new Error(data.error || 'Error al importar')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImportLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!results?.data) return
    const blob = new Blob([JSON.stringify(results.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propiedades-${results.portal || 'import'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSampleCSV = () => {
    const sample = `titulo,precio,moneda,direccion,barrio,ciudad,provincia,pais,habitaciones,banos,m2,tipo,url
"Depto 3 ambientes Palermo",120000,USD,"Av. Santa Fe 1234",Palermo,Capital Federal,CABA,Argentina,3,2,85,departamento,https://ejemplo.com/1
"Loft Puerto Madero",250000,USD,"Av. Alicia Moreau de Justo 500",Puerto Madero,Capital Federal,CABA,Argentina,2,2,120,loft,https://ejemplo.com/2`
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ejemplo-propiedades.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header
        title="Importar propiedades"
        subtitle="Agregá propiedades a tu catálogo"
      />

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveTab('urls')}
          className={`card p-5 text-left transition-all hover:shadow-corporate-md ${activeTab === 'urls' ? 'ring-2 ring-indigo-500 shadow-corporate-md' : ''}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-navy-900">Pegar enlaces</h3>
              <p className="text-sm text-navy-500">Copiá URLs de propiedades desde ZonaProp, Argenprop y más</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`card p-5 text-left transition-all hover:shadow-corporate-md ${activeTab === 'import' ? 'ring-2 ring-indigo-500 shadow-corporate-md' : ''}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-navy-900">Subir archivo</h3>
              <p className="text-sm text-navy-500">Importá desde un CSV o JSON con tus propiedades</p>
            </div>
          </div>
        </button>
      </div>

      {activeTab === 'urls' ? (
        <div className="card p-4 sm:p-6 mb-8">
          <h3 className="text-lg font-bold text-navy-900 mb-1">Pegar enlaces de propiedades</h3>
          <p className="text-sm text-navy-500 mb-5">
            Andá al portal, copiá el enlace de cada propiedad que quieras importar, y pegala abajo.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PORTALS.filter(p => !p.disabled).map(p => (
                  <span key={p.slug} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.color}`}>{p.name}</span>
                ))}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-navy-900 text-white opacity-50">MercadoLibre pronto</span>
              </div>
              <label className="label">URL de cada propiedad (una por línea)</label>
              <textarea
                className="input min-h-[140px] font-mono text-sm"
                placeholder={`https://www.zonaprop.com.ar/propiedades/departamento-palermo-123.html\nhttps://www.argenprop.com/departamento-3-ambientes-belgrano-456\nhttps://www.zillow.com/homedetails/123-Main-St/12345_zpid/`}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
              />
              <div className="flex items-start gap-2 mt-2 text-xs text-navy-400">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p>Algunos portales pueden bloquear la importación. Si falla, usá la opción &quot;Subir archivo&quot;.</p>
              </div>
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
                disabled={loading || !urls.trim() || !hasCredits}
                className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Importar propiedades
                  </span>
                )}
              </button>
              <p className="text-xs text-navy-400 text-center">1 crédito por consulta</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-navy-900">Subir archivo</h3>
            <button onClick={downloadSampleCSV} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Descargar ejemplo CSV →
            </button>
          </div>
          <p className="text-sm text-navy-500 mb-6">
            Si tenés un archivo con tus propiedades (exportado de Excel, otro sistema, etc.), subilo acá. El sistema detecta automáticamente las columnas.
          </p>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors mb-6 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg className="w-12 h-12 text-navy-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {importFile ? (
              <div>
                <p className="text-sm font-medium text-navy-700">{importFile.name}</p>
                <p className="text-xs text-navy-400">{(importFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-navy-600 mb-1">Hacé click para seleccionar un archivo</p>
                <p className="text-xs text-navy-400">CSV o JSON — hasta 1000 propiedades</p>
              </div>
            )}
          </div>

          {importPreview.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-navy-700 mb-2">Vista previa ({importPreview.length} filas)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {Object.keys(importPreview[0]).slice(0, 8).map(k => (
                        <th key={k} className="text-left py-2 px-3 font-medium text-navy-600">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Object.values(row).slice(0, 8).map((v, j) => (
                          <td key={j} className="py-2 px-3 text-navy-700 truncate max-w-[150px]">{String(v || '').substring(0, 50)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleImport}
                disabled={importLoading}
                className="btn-gold mt-4 disabled:opacity-50"
              >
                {importLoading ? 'Importando...' : `Importar propiedades`}
              </button>
            </div>
          )}

          {importResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <p className="text-sm font-medium text-emerald-800">{importResult.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
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
              <div className="flex gap-2">
                <button onClick={() => { setResults(null); setUrls('') }} className="btn-outline text-sm">Limpiar</button>
                {results.data?.length > 0 && (
                  <button onClick={downloadJSON} className="btn-outline text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Exportar JSON
                  </button>
                )}
              </div>
            </div>
          </div>
          {results.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
              {results.data?.map((property: any, idx: number) => (
                <div key={idx} className="card-hover overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={property.photos?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop' }}
                    />
                    <span className="portal-badge bg-navy-900/80 text-white">{property.portal}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-navy-900 truncate mb-1">{property.title}</h4>
                    <p className="text-sm text-navy-500 truncate mb-3">{property.address}</p>
                    <div className="flex items-center gap-4 text-xs text-navy-400 mb-3">
                      {property.beds > 0 && <span>{property.beds} hab</span>}
                      {property.baths > 0 && <span>{property.baths} baños</span>}
                      {property.sqm > 0 && <span>{property.sqm} m²</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="price-tag text-lg">
                        {formatPrice(property.price || 0, property.currency || 'USD')}
                      </p>
                      {property.url && (
                        <a href={property.url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs px-2 py-1">Ver →</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-navy-500 text-sm">{results.warning || 'No se encontraron propiedades'}</p>
            </div>
          )}
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
          <h3 className="text-lg font-bold text-navy-900 mb-2">Empezá a cargar propiedades</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto">
            Elegí &quot;Pegar enlaces&quot; para importar desde portales, o &quot;Subir archivo&quot; si tenés un CSV o JSON.
          </p>
        </div>
      )}
    </>
  )
}
