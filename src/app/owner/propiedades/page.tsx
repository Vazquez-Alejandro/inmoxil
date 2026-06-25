'use client'

import { useState, useEffect } from 'react'

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'badge-green' },
  alquilado: { label: 'Alquilado', color: 'bg-blue-100 text-blue-700' },
  vendido: { label: 'Vendido', color: 'bg-gray-100 text-gray-700' },
  reservado: { label: 'Reservado', color: 'bg-amber-100 text-amber-700' },
}

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/owner/properties')
      .then(r => r.json())
      .then(data => {
        setProperties(data.properties || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Mis Propiedades</h1>
        <p className="text-sm text-navy-500 mt-1 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{properties.length} propiedades en tu portafolio</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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

      {!loading && properties.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400 dark:text-navy-300 dark:text-navy-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2 dark:text-white">Sin propiedades aún</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">No hay propiedades asignadas a tu cuenta. Contactá a tu administrador.</p>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => {
            const statusInfo = STATUS_LABELS[property.status] || { label: property.status || 'Disponible', color: 'badge-navy' }
            return (
              <div key={property.id} className="card-hover overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={property.photos?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.currency && (
                    <span className="absolute top-3 right-3 badge bg-gold-500 text-white">{property.currency}</span>
                  )}
                  {property.property_type && (
                    <span className="absolute bottom-3 left-3 badge bg-white/90 text-navy-800 text-[10px] uppercase tracking-wider dark:text-navy-200">
                      {property.property_type}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-navy-900 truncate flex-1 dark:text-white">{property.title}</h4>
                    <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <p className="text-sm text-navy-500 truncate mb-3 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{property.address || property.neighborhood || 'Sin dirección'}{property.city ? `, ${property.city}` : ''}</p>
                  <div className="flex items-center gap-4 text-xs text-navy-400 mb-3 dark:text-navy-300 dark:text-navy-100">
                    {property.beds > 0 && <span>{property.beds} amb</span>}
                    {property.baths > 0 && <span>{property.baths} baños</span>}
                    {property.sqm > 0 && <span>{property.sqm} m²</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="price-tag text-lg">
                      {formatPrice(property.price || 0, property.currency || 'USD')}
                    </p>
                    {property.description && (
                      <p className="text-xs text-navy-400 truncate max-w-[120px] dark:text-navy-300 dark:text-navy-100">{property.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
