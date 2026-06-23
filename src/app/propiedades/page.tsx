'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type Property = {
  id: string
  title: string
  price: number
  currency: string
  address: string
  neighborhood: string
  city: string
  beds: number
  baths: number
  sqm: number
  property_type: string
  photos: string[] | string | null
  description: string
  lat: number | null
  lng: number | null
}

type Workspace = {
  id: string
  name: string
}

const PROPERTY_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'ph', label: 'PH' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'cochera', label: 'Cochera' },
]

const BEDS_OPTIONS = [
  { value: '', label: 'Cualquier' },
  { value: '1', label: '1 dorm.' },
  { value: '2', label: '2 dorm.' },
  { value: '3', label: '3 dorm.' },
  { value: '4', label: '4+ dorm.' },
]

function getFirstPhoto(photos: string[] | string | null): string | null {
  if (!photos) return null
  if (Array.isArray(photos)) return photos[0] || null
  try {
    const parsed = JSON.parse(photos)
    return Array.isArray(parsed) ? parsed[0] || null : null
  } catch {
    return typeof photos === 'string' ? photos : null
  }
}

function formatPrice(price: number, currency: string): string {
  const fmt = new Intl.NumberFormat('es-AR')
  const symbol = currency === 'USD' ? 'USD' : '$'
  return `${symbol} ${fmt.format(price)}`
}

function PropertyCard({ property }: { property: Property }) {
  const photo = getFirstPhoto(property.photos)
  const typeLabel = PROPERTY_TYPES.find(t => t.value === property.property_type)?.label || property.property_type

  return (
    <Link href={`/p/${property.id}`} className="card-hover group block overflow-hidden">
      <div className="relative h-52 bg-navy-100 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}
        {typeLabel && (
          <span className="absolute top-3 left-3 badge bg-navy-900/80 text-white text-[10px] uppercase tracking-wider backdrop-blur-sm">
            {typeLabel}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-20" />
        <p className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow-sm">
          {formatPrice(property.price, property.currency)}
        </p>
      </div>
      <div className="p-4">
        <h3 className="text-navy-900 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-gold-600 transition-colors">
          {property.title}
        </h3>
        <p className="text-navy-500 text-xs mt-1 truncate">
          {[property.address, property.neighborhood, property.city].filter(Boolean).join(', ')}
        </p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-navy-600 text-xs">
          {property.beds > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              {property.beds}
            </span>
          )}
          {property.baths > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {property.baths}
            </span>
          )}
          {property.sqm > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              {property.sqm} m²
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            const event = new CustomEvent('open-visit-modal', { detail: { propertyId: property.id, propertyTitle: property.title } })
            window.dispatchEvent(event)
          }}
          className="btn-gold w-full mt-3 text-xs py-2.5"
        >
          Consultar
        </button>
      </div>
    </Link>
  )
}

function VisitModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  workspaceSlug,
}: {
  isOpen: boolean
  onClose: () => void
  propertyId: string | null
  propertyTitle: string
  workspaceSlug: string
}) {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', message: '', preferredDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/public/visit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceSlug,
          propertyId,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          message: form.message || (propertyTitle ? `Quiero visitar: ${propertyTitle}` : ''),
          preferredDate: form.preferredDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar solicitud')
      setSuccess(true)
      setForm({ fullName: '', phone: '', email: '', message: '', preferredDate: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-corporate-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-900">Solicitar visita</h2>
          <button onClick={onClose} className="p-1 rounded text-navy-400 hover:text-navy-900 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">¡Solicitud enviada!</h3>
            <p className="text-navy-500 text-sm mb-6">Nos pondremos en contacto a la brevedad para coordinar la visita.</p>
            <button onClick={onClose} className="btn-gold px-8">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            {propertyTitle && (
              <p className="text-navy-600 text-sm mb-2">
                Propiedad: <span className="font-semibold text-navy-900">{propertyTitle}</span>
              </p>
            )}
            <div>
              <label className="label">Nombre completo *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Tu nombre"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Teléfono *</label>
              <input
                type="tel"
                required
                className="input"
                placeholder="+54 11 1234-5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Mensaje</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Contanos qué te interesa..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Fecha preferida</label>
              <input
                type="date"
                className="input"
                value={form.preferredDate}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function MapEmbed({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  return (
    <iframe
      title={`Mapa - ${title}`}
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=hot&marker=${lat}%2C${lng}`}
      className="w-full h-64 rounded-xl border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}

function PropertyDetailView({ property, workspaceSlug }: { property: Property; workspaceSlug: string }) {
  const photo = getFirstPhoto(property.photos)
  const typeLabel = PROPERTY_TYPES.find(t => t.value === property.property_type)?.label || property.property_type

  return (
    <div id={`detail-${property.id}`} className="max-w-4xl mx-auto space-y-6">
      <Link href={`/propiedades?slug=${workspaceSlug}`} className="inline-flex items-center gap-2 text-navy-500 hover:text-gold-600 text-sm font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a propiedades
      </Link>

      <div className="card overflow-hidden">
        {photo ? (
          <img src={photo} alt={property.title} className="w-full h-72 object-cover" />
        ) : (
          <div className="w-full h-72 bg-navy-100 flex items-center justify-center text-navy-300">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">{property.title}</h2>
              <p className="text-navy-500 mt-1">{property.address}</p>
            </div>
            <div className="text-right">
              <p className="price-tag">{formatPrice(property.price, property.currency)}</p>
              {typeLabel && <span className="badge-navy mt-1 inline-block">{typeLabel}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100 text-navy-700 text-sm">
            {property.beds > 0 && <span>{property.beds} dorm.</span>}
            {property.baths > 0 && <span>{property.baths} baños</span>}
            {property.sqm > 0 && <span>{property.sqm} m²</span>}
            {property.neighborhood && <span className="text-navy-400">{property.neighborhood}</span>}
            {property.city && <span className="text-navy-400">{property.city}</span>}
          </div>

          {property.description && (
            <p className="text-navy-600 mt-4 leading-relaxed whitespace-pre-line">{property.description}</p>
          )}

          <div className="mt-6">
            <button
              onClick={() => {
                const event = new CustomEvent('open-visit-modal', { detail: { propertyId: property.id, propertyTitle: property.title } })
                window.dispatchEvent(event)
              }}
              className="btn-gold"
            >
              Solicitar visita
            </button>
          </div>

          {property.lat && property.lng && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-navy-700 mb-3">Ubicación</h3>
              <MapEmbed lat={property.lat} lng={property.lng} title={property.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PublicCatalogPage() {
  const [searchParams, setSearchParams] = useState<{ slug: string; search: string; type: string; priceMin: string; priceMax: string; beds: string }>({
    slug: 'inmoxil',
    search: '',
    type: '',
    priceMin: '',
    priceMax: '',
    beds: '',
  })
  const [properties, setProperties] = useState<Property[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPropertyId, setModalPropertyId] = useState<string | null>(null)
  const [modalPropertyTitle, setModalPropertyTitle] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('slug') || 'inmoxil'
    setSearchParams(prev => ({ ...prev, slug, search: params.get('search') || '', type: params.get('type') || '', priceMin: params.get('priceMin') || '', priceMax: params.get('priceMax') || '', beds: params.get('beds') || '' }))
  }, [])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ slug: searchParams.slug })
      if (searchParams.search) params.set('search', searchParams.search)
      if (searchParams.type) params.set('type', searchParams.type)
      if (searchParams.priceMin) params.set('priceMin', searchParams.priceMin)
      if (searchParams.priceMax) params.set('priceMax', searchParams.priceMax)
      if (searchParams.beds) params.set('beds', searchParams.beds)
      const res = await fetch(`/api/public/properties?${params.toString()}`)
      const data = await res.json()
      setProperties(data.properties || [])
      setWorkspace(data.workspace)
      setTotal(data.total || 0)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.propertyId) {
        setModalPropertyId(detail.propertyId)
        setModalPropertyTitle(detail.propertyTitle || '')
        setModalOpen(true)
      }
    }
    window.addEventListener('open-visit-modal', handler)
    return () => window.removeEventListener('open-visit-modal', handler)
  }, [])

  useEffect(() => {
    if (!modalOpen) {
      setModalPropertyId(null)
      setModalPropertyTitle('')
    }
  }, [modalOpen])

  const updateFilter = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setSearchParams({ slug: searchParams.slug, search: '', type: '', priceMin: '', priceMax: '', beds: '' })
  }

  const hasFilters = searchParams.search || searchParams.type || searchParams.priceMin || searchParams.priceMax || searchParams.beds

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Propiedades</h1>
            {workspace && (
              <p className="mt-3 text-navy-400 text-lg">{workspace.name}</p>
            )}
            <p className="mt-2 text-navy-400 text-sm">
              {total > 0 ? `${total} propiedad${total !== 1 ? 'es' : ''} disponible${total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters */}
        <div className="card p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <input
                type="text"
                className="input"
                placeholder="Buscar por título, dirección, barrio..."
                value={searchParams.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            <div>
              <select
                className="input"
                value={searchParams.type}
                onChange={(e) => updateFilter('type', e.target.value)}
              >
                {PROPERTY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={searchParams.beds}
                onChange={(e) => updateFilter('beds', e.target.value)}
              >
                {BEDS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                className="input"
                placeholder="Precio min."
                value={searchParams.priceMin}
                onChange={(e) => updateFilter('priceMin', e.target.value)}
              />
            </div>
            <div>
              <input
                type="number"
                className="input"
                placeholder="Precio max."
                value={searchParams.priceMax}
                onChange={(e) => updateFilter('priceMax', e.target.value)}
              />
            </div>
          </div>
          {hasFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-navy-500">{total} resultado{total !== 1 ? 's' : ''}</p>
              <button onClick={clearFilters} className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-52 bg-navy-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-navy-200 rounded w-3/4" />
                    <div className="h-3 bg-navy-200 rounded w-1/2" />
                    <div className="h-3 bg-navy-200 rounded w-full" />
                    <div className="h-9 bg-navy-200 rounded w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedProperty ? (
            <PropertyDetailView property={selectedProperty} workspaceSlug={searchParams.slug} />
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-navy-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <h3 className="text-lg font-semibold text-navy-700 mb-1">No se encontraron propiedades</h3>
              <p className="text-navy-500 text-sm mb-4">Intenta ajustar los filtros de búsqueda.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-outline text-sm">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <VisitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        propertyId={modalPropertyId}
        propertyTitle={modalPropertyTitle}
        workspaceSlug={searchParams.slug}
      />
    </div>
  )
}
