'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

type AdType = 'feed' | 'story' | 'reel' | 'meta_ad'
type TemplateId = 'modern' | 'minimal' | 'luxury' | 'bold' | 'elegant' | 'tropical'

interface Property {
  id: string
  title: string
  price: number | null
  currency: string
  address: string
  beds: number | null
  baths: number | null
  sqm: number | null
  property_type: string
  photos: string[]
  neighborhood?: string
}

interface GeneratedAd {
  id: string
  image_url: string
  template_id: string
  type: string
  property_id: string
  credits_used: number
  created_at: string
}

const AD_TYPES: Array<{ id: AdType; name: string; dims: string }> = [
  { id: 'feed', name: 'Feed', dims: '1080×1080' },
  { id: 'story', name: 'Story', dims: '1080×1920' },
  { id: 'reel', name: 'Reel', dims: '1080×1920' },
  { id: 'meta_ad', name: 'Meta Ad', dims: '1200×628' },
]

const TEMPLATES: Array<{ id: TemplateId; name: string; description: string; color: string }> = [
  { id: 'modern', name: 'Moderno', description: 'Limpio y profesional', color: 'from-blue-500 to-indigo-600' },
  { id: 'minimal', name: 'Minimalista', description: 'Espacio en blanco', color: 'from-gray-400 to-gray-600' },
  { id: 'luxury', name: 'Lujo', description: 'Dorado y elegante', color: 'from-amber-500 to-yellow-600' },
  { id: 'bold', name: 'Audaz', description: 'Alto impacto', color: 'from-red-500 to-pink-600' },
  { id: 'elegant', name: 'Elegante', description: 'Sofisticado y suave', color: 'from-rose-300 to-rose-500' },
  { id: 'tropical', name: 'Tropical', description: 'Fresco y vibrante', color: 'from-emerald-400 to-teal-600' },
]

const formatPrice = (price: number | null, currency: string) => {
  if (!price) return 'Consultar'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function AdsPage() {
  const { workspace } = useWorkspace()
  const [properties, setProperties] = useState<Property[]>([])
  const [ads, setAds] = useState<GeneratedAd[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern')
  const [selectedType, setSelectedType] = useState<AdType>('feed')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (workspace) {
      Promise.all([
        fetch(`/api/properties?workspaceId=${workspace.id}`).then(r => r.json()),
        fetch(`/api/ads?workspaceId=${workspace.id}`).then(r => r.json()),
      ])
        .then(([propData, adData]) => {
          setProperties(propData.properties || [])
          setAds(adData.ads || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [workspace])

  const handleGenerate = async () => {
    if (!selectedProperty || !workspace) return

    setGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty,
          templateId: selectedTemplate,
          workspaceId: workspace.id,
          adType: selectedType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al generar el ad')
        return
      }

      setAds(prev => [data.ad, ...prev])
      setSuccess('Ad generado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Error de conexión al generar el ad')
    } finally {
      setGenerating(false)
    }
  }

  const selectedProp = properties.find(p => p.id === selectedProperty)

  return (
    <>
      <Header
        title="Generador de Ads"
        subtitle={`${ads.length} ads generados · ${workspace?.credits_remaining ?? 0} créditos disponibles`}
      />

      {error && (
        <div className="card p-4 mb-6 border-l-4 border-red-400 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="card p-4 mb-6 border-l-4 border-emerald-400 bg-emerald-50">
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left: Property Selection */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">1. Seleccioná una propiedad</h3>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-navy-500 mb-3">No tenés propiedades cargadas</p>
                <a href="/dashboard/scrape" className="btn-gold text-sm">
                  Ir a Scraping
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2">
                {properties.map(property => (
                  <button
                    key={property.id}
                    onClick={() => setSelectedProperty(property.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      selectedProperty === property.id
                        ? 'border-gold-400 bg-gold-50 shadow-sm'
                        : 'border-gray-200 hover:border-navy-200 bg-white'
                    }`}
                  >
                    <img
                      src={property.photos?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop'}
                      alt={property.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy-900 truncate">{property.title}</p>
                      <p className="text-xs text-navy-500 truncate">
                        {property.address || property.neighborhood}
                      </p>
                      <p className="text-xs font-bold text-navy-700 mt-0.5">
                        {formatPrice(property.price, property.currency)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ad Type Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">2. Tipo de ad</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AD_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedType === type.id
                      ? 'border-gold-400 bg-gold-50'
                      : 'border-gray-200 hover:border-navy-200'
                  }`}
                >
                  <p className="font-semibold text-navy-900 text-sm">{type.name}</p>
                  <p className="text-xs text-navy-400 mt-1">{type.dims}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">3. Template</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-gold-400 shadow-sm'
                      : 'border-gray-200 hover:border-navy-200'
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${template.color} mb-3`} />
                  <p className="font-semibold text-navy-900 text-sm">{template.name}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{template.description}</p>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center">
                      <svg className="w-3 h-3 text-navy-900" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview & Generate */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Vista previa</h3>
            {selectedProp ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {selectedProp.photos?.[0] ? (
                    <img
                      src={selectedProp.photos[0]}
                      alt={selectedProp.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
                      <span className="text-navy-400 text-sm">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-bold text-sm">{selectedProp.title}</p>
                    <p className="text-white/80 text-xs">{formatPrice(selectedProp.price, selectedProp.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-navy">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                  <span className="badge-gold">{AD_TYPES.find(t => t.id === selectedType)?.name}</span>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-navy-400">Elegí una propiedad para ver la preview</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selectedProperty || generating}
              className="w-full mt-4 btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generando ad...
                </span>
              ) : (
                'Generar Ad'
              )}
            </button>
            <p className="text-xs text-navy-400 text-center mt-2">1 crédito por ad generado</p>
          </div>

          {/* Stats */}
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Créditos restantes</span>
                <span className="font-semibold text-navy-900">{workspace?.credits_remaining ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Ads generados hoy</span>
                <span className="font-semibold text-navy-900">{ads.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Costo</span>
                <span className="font-semibold text-navy-900">1 crédito / ad</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Ads Gallery */}
      {ads.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-navy-900">Ads generados</h3>
            <span className="badge-navy">{ads.length} total</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map(ad => (
              <div key={ad.id} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={ad.image_url}
                    alt={`Ad ${ad.template_id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/60 transition-all duration-200 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <span className="badge-gold text-[10px]">{ad.type}</span>
                    <span className="badge-navy text-[10px]">{ad.template_id}</span>
                  </div>
                  <a
                    href={ad.image_url}
                    download
                    className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                </div>
                <p className="text-xs text-navy-400 mt-2 truncate">
                  {new Date(ad.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">Necesitás propiedades</h3>
          <p className="text-sm text-navy-500 max-w-md mx-auto mb-6">
            Empezá a scrapear propiedades para poder generar ads increíbles.
          </p>
          <a href="/dashboard/scrape" className="btn-gold">
            Ir a Scraping →
          </a>
        </div>
      )}
    </>
  )
}
