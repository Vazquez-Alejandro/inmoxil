import { NextRequest, NextResponse } from 'next/server'
import { scrapeProperties, ScrapeInput } from '@/lib/apify'

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeInput = await request.json()

    if (!body.urls || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una URL' },
        { status: 400 }
      )
    }

    const properties = await scrapeProperties(body)

    return NextResponse.json({ success: true, data: properties })
  } catch (error) {
    console.error('Error scraping properties:', error)
    return NextResponse.json(
      { error: 'Error al scrapear propiedades' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Usa POST con urls para scrapear propiedades',
    example: {
      urls: ['https://www.zillow.com/homedetails/123-main-st/12345678_zpid/'],
      maxItems: 50,
    },
  })
}
