import { NextRequest, NextResponse } from 'next/server'
import { scrapePortal, scrapeSingleUrl } from '@/lib/apify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de urls' },
        { status: 400 }
      )
    }

    const { portal, properties } = await scrapePortal(
      body.urls,
      body.maxItems || 50
    )

    return NextResponse.json({
      success: true,
      portal,
      count: properties.length,
      data: properties,
    })
  } catch (error) {
    console.error('[Inmoxil] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al scrapear',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/scrape con { urls: string[], maxItems?: number }',
    portalsSoportados: [
      'zillow.com',
      'realtor.com',
      'vivareal.com.br',
      'zapimoveis.com.br',
      'zonaprop.com.ar',
      'argenprop.com',
      'mercadolibre.com',
      'olx.com',
      'cualquier otro portal (fallback genérico)',
    ],
    ejemplo: {
      urls: ['https://www.zillow.com/homedetails/123-main-st/12345678_zpid/'],
      maxItems: 50,
    },
  })
}
