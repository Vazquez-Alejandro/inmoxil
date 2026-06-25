'use client'

import { useState } from 'react'
import Header from '@/components/Header'

interface Endpoint {
  method: 'GET' | 'POST'
  path: string
  description: string
  requestExample: string
  responseExample: string
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/scrape',
    description: 'Scrapea propiedades desde un portal inmobiliario y las guarda en la base de datos.',
    requestExample: JSON.stringify({
      workspaceId: 'uuid-workspace',
      url: 'https://www.zonaprop.com.ar/propiedades/venta',
      portal: 'zonaprop',
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      count: 15,
      message: '15 propiedades scrapeadas correctamente',
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/properties',
    description: 'Lista todas las propiedades de un workspace.',
    requestExample: 'GET /api/properties?workspaceId=uuid-workspace',
    responseExample: JSON.stringify({
      properties: [
        {
          id: 'uuid-prop',
          title: 'Departamento 3 ambientes',
          price: 120000,
          currency: 'USD',
          address: 'Av. Corrientes 1234',
          neighborhood: 'Recoleta',
          city: 'Buenos Aires',
          portal: 'zonaprop',
          beds: 3,
          baths: 2,
          sqm: 85,
          photos: ['https://...'],
          created_at: '2025-01-15T10:00:00Z',
        },
      ],
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/properties',
    description: 'Crea propiedades nuevas en lote.',
    requestExample: JSON.stringify({
      workspaceId: 'uuid-workspace',
      properties: [
        {
          title: 'Casa 4 ambientes',
          price: 250000,
          currency: 'USD',
          address: 'Av. Libertador 5678',
          neighborhood: 'Palermo',
          city: 'Buenos Aires',
          portal: 'zonaprop',
          propertyType: 'house',
          features: { beds: 4, baths: 3, area: 200 },
          photos: ['https://...'],
        },
      ],
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      count: 1,
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/ads',
    description: 'Genera un ad visual para una propiedad usando un template específico.',
    requestExample: JSON.stringify({
      propertyId: 'uuid-property',
      templateId: 'modern',
      workspaceId: 'uuid-workspace',
      adType: 'feed',
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      ad: {
        id: 'uuid-ad',
        image_url: '/api/ads/image?path=...',
        template_id: 'modern',
        type: 'feed',
        property_id: 'uuid-property',
        created_at: '2025-01-15T10:00:00Z',
      },
      creditsRemaining: 49,
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/credits',
    description: 'Consulta el saldo de créditos y el historial de transacciones.',
    requestExample: 'GET /api/credits?workspaceId=uuid-workspace',
    responseExample: JSON.stringify({
      success: true,
      credits: 49,
      history: [
        {
          id: 'uuid-tx',
          type: 'consumption',
          amount: 1,
          description: 'Ad generado',
          created_at: '2025-01-15T10:00:00Z',
        },
      ],
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/billing',
    description: 'Gestiona la facturación y actualización de planes.',
    requestExample: JSON.stringify({
      workspaceId: 'uuid-workspace',
      action: 'subscribe',
      plan: 'pro',
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      checkout_url: 'https://checkout.stripe.com/...',
    }, null, 2),
  },
]

export default function ApiDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <Header
        title="API Documentation"
        subtitle="Referencia completa para integrar con Inmoxil"
      />

      {/* Version Badge */}
      <div className="mb-8">
        <span className="badge-gold text-sm px-3 py-1.5">v1.0</span>
      </div>

      <div className="space-y-8">
        {/* Authentication */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-3 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            Autenticación
          </h2>
          <p className="text-navy-600 mb-4 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">
            Todas las requests requieren un API Key en el header de autorización.
          </p>
          <div className="bg-navy-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-400 text-xs dark:text-navy-300 dark:text-navy-100">Header</span>
              <button
                onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                className="text-xs text-navy-400 hover:text-white transition-colors dark:text-navy-300 dark:text-navy-100"
              >
                {copiedId === 'auth' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            Authorization: Bearer YOUR_API_KEY
          </div>
          <p className="text-xs text-navy-400 mt-3 dark:text-navy-300 dark:text-navy-100">
            Podés generar tu API Key desde el dashboard de administración.
          </p>
        </div>

        {/* Base URL */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-3 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.02a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 8.689" />
              </svg>
            </div>
            Base URL
          </h2>
          <div className="bg-navy-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            https://tu-app.vercel.app/api
          </div>
          <p className="text-xs text-navy-400 mt-3 dark:text-navy-300 dark:text-navy-100">
            Reemplazá con tu dominio de producción o el de desarrollo local.
          </p>
        </div>

        {/* Endpoints */}
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-4 dark:text-white">Endpoints</h2>
          <div className="space-y-4">
            {ENDPOINTS.map((endpoint, idx) => (
              <div key={idx} className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    endpoint.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gold-100 text-gold-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-navy-900 font-semibold dark:text-white">{endpoint.path}</code>
                </div>
                <p className="text-sm text-navy-600 mb-4 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{endpoint.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Request */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Request</span>
                      <button
                        onClick={() => copyToClipboard(endpoint.requestExample, `req-${idx}`)}
                        className="text-xs text-navy-400 hover:text-navy-700 transition-colors flex items-center gap-1 dark:text-navy-300 dark:text-navy-100"
                      >
                        {copiedId === `req-${idx}` ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Copiado!
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-navy-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{endpoint.requestExample}</pre>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">Response</span>
                      <button
                        onClick={() => copyToClipboard(endpoint.responseExample, `res-${idx}`)}
                        className="text-xs text-navy-400 hover:text-navy-700 transition-colors flex items-center gap-1 dark:text-navy-300 dark:text-navy-100"
                      >
                        {copiedId === `res-${idx}` ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Copiado!
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-navy-900 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{endpoint.responseExample}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-3 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            Rate Limits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900 dark:text-white">100</p>
              <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">requests / minuto</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900 dark:text-white">1000</p>
              <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">requests / hora</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900 dark:text-white">10K</p>
              <p className="text-sm text-navy-500 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">requests / día</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
