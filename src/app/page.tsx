'use client'

import { useState } from 'react'
import { NormalizedProperty } from '@/types/property'

export default function Home() {
  const [urls, setUrls] = useState('')
  const [maxItems, setMaxItems] = useState(50)
  const [properties, setProperties] = useState<NormalizedProperty[]>([])
  const [portal, setPortal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScrape = async () => {
    if (!urls.trim()) {
      setError('Ingresa al menos una URL')
      return
    }

    setLoading(true)
    setError('')
    setProperties([])
    setPortal('')

    try {
      const urlList = urls.split('\n').filter((u) => u.trim())

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList, maxItems }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al scrapear')
      }

      setPortal(data.portal)
      setProperties(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'Consultar'
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : currency === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Inmoxil</h1>
        <p className="text-gray-600 mb-8">
          Scraping inteligente de propiedades multi-portal
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scrapear propiedades</h2>
          <p className="text-sm text-gray-500 mb-4">
            Portales soportados: Zillow, Realtor, VivaReal, ZAP Imóveis,
            Zonaprop, Argenprop, MercadoLibre, OLX y más
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URLs (una por línea)
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`https://www.zillow.com/homedetails/123-main-st/12345678_zpid/\nhttps://www.vivareal.com.br/venda/sp/sao-paulo/\nhttps://www.zonaprop.com.ar/venta/...`}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. resultados
              </label>
              <input
                type="number"
                className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value) || 50)}
                min={1}
                max={500}
              />
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-5"
              onClick={handleScrape}
              disabled={loading}
            >
              {loading ? 'Scrapeando...' : 'Scrapear'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {portal && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              Portal detectado: <strong>{portal}</strong> |{' '}
              {properties.length} propiedades encontradas
            </div>
          )}
        </div>

        {properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Resultados ({properties.length} propiedades)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {property.photos[0] && (
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {property.portal}
                      </span>
                      <span className="text-xs text-gray-500">
                        {property.country}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {property.title || property.address}
                    </h3>
                    <p className="text-blue-600 font-bold text-xl mb-2">
                      {formatPrice(property.price, property.currency)}
                    </p>
                    {property.monthlyExpenses && (
                      <p className="text-sm text-gray-500 mb-2">
                        Expensas:{' '}
                        {formatPrice(property.monthlyExpenses, property.currency)}
                      </p>
                    )}
                    <div className="text-sm text-gray-600 space-y-1">
                      {(property.beds || property.baths || property.sqm) && (
                        <p>
                          {property.beds && `${property.beds} amb `}
                          {property.baths && `${property.baths} baños `}
                          {property.sqm && `${property.sqm} m²`}
                        </p>
                      )}
                      {property.neighborhood && (
                        <p>{property.neighborhood}</p>
                      )}
                      {property.city && <p>{property.city}</p>}
                      {property.publisher && (
                        <p className="text-xs text-gray-400">
                          {property.publisher}
                        </p>
                      )}
                      {property.url && (
                        <a
                          href={property.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-xs"
                        >
                          Ver original
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
