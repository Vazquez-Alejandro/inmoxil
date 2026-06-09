import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrls } from '@/lib/scrapingbee'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json()
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de urls' }, { status: 400 })
    }

    const { portal, properties, warning } = await scrapeUrls(body.urls, Math.min(body.maxItems || 50, 100), body.portalOverride)

    return NextResponse.json({ success: true, portal, count: properties.length, data: properties, warning })
  } catch (error: any) {
    console.error('[Scrape] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Error al scrapear' }, { status: 500 })
  }
}
