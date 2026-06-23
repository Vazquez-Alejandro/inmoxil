import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrls as scrapeWithBee } from '@/lib/scrapingbee'
import { scrapeUrls as scrapeWithApify } from '@/lib/apify'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de urls' }, { status: 400 })
    }

    const urls = body.urls
    const maxItems = Math.min(body.maxItems || 50, 100)
    const portalOverride = body.portalOverride

    // Try ScrapingBee first
    if (process.env.SCRAPINGBEE_API_KEY) {
      try {
        const result = await scrapeWithBee(urls, maxItems, portalOverride)
        return NextResponse.json({ success: true, portal: result.portal, count: result.properties.length, data: result.properties, warning: result.warning, engine: 'scrapingbee' })
      } catch (beeError: any) {
        console.log('[Scrape] ScrapingBee falló, intentando Apify:', beeError.message?.slice(0, 100))
      }
    }

    // Fallback to Apify
    if (!process.env.APIFY_TOKEN) {
      throw new Error(
        'Sin créditos o error en ScrapingBee y APIFY_TOKEN no configurado. ' +
        'Configurá una API key en Vercel o registrate en scrapingbee.com (4000 créditos/mes gratis).'
      )
    }

    const result = await scrapeWithApify(urls, maxItems, portalOverride)
    return NextResponse.json({ success: true, portal: result.portal, count: result.properties.length, data: result.properties, warning: result.warning, engine: 'apify' })
  } catch (error: any) {
    console.error('[Scrape] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Error al scrapear' }, { status: 500 })
  }
}
