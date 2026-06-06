import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrls } from '@/lib/scrapingbee'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de urls' },
        { status: 400 }
      )
    }

    const { portal, properties, warning } = await scrapeUrls(
      body.urls,
      body.maxItems || 50,
      body.portalOverride
    )

    return NextResponse.json({
      success: true,
      portal,
      count: properties.length,
      data: properties,
      warning,
    })
  } catch (error: any) {
    console.error('[Scrape] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al scrapear',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/scrape con { urls: string[], maxItems?: number, portalOverride?: string }',
    portalInfo: {
      zonaprop: { name: 'ZonaProp', country: 'AR' },
      argenprop: { name: 'Argenprop', country: 'AR' },
      mercadolibre: { name: 'MercadoLibre', country: 'AR' },
      zillow: { name: 'Zillow', country: 'US' },
      realtor: { name: 'Realtor', country: 'US' },
      vivareal: { name: 'VivaReal', country: 'BR' },
    },
  })
}
