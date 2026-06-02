'use client'

import { useState } from 'react'
import { Property } from '@/types/property'

export default function Home() {
  const [urls, setUrls] = useState('')
  const [maxItems, setMaxItems] = useState(50)
  const [properties, setProperties] = useState<Property[]>([])
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

      setProperties(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Inmoxil</h1>
        <p className="text-gray-600 mb-8">Scraping de propiedades con Apify</p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scrapear propiedades</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URLs (una por línea)
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.zillow.com/homedetails/123-main-st/12345678_zpid/&#10;https://www.realtor.com/realestateandhomes-detail/123-main-st"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de resultados
            </label>
            <input
              type="number"
              className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={maxItems}
              onChange={(e) => setMaxItems(parseInt(e.target.value) || 50)}
              min={1}
              max={500}
            />
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handleScrape}
            disabled={loading}
          >
            {loading ? 'Scrapeando...' : 'Scrapear'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
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
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {property.title}
                    </h3>
                    <p className="text-blue-600 font-bold text-xl mb-2">
                      ${property.price.toLocaleString()}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {property.beds} hab | {property.baths} baños |{' '}
                        {property.sqft} m²
                      </p>
                      <p className="capitalize">{property.propertyType}</p>
                      {property.url && (
                        <a
                          href={property.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
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
