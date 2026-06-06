import * as cheerio from 'cheerio'

const API_KEY = process.env.SCRAPINGBEE_API_KEY
const API_URL = 'https://app.scrapingbee.com/api/v1/'

export interface NormalizedProperty {
  id: string
  portal: string
  title: string
  price: number | null
  currency: string
  priceUsd: number | null
  monthlyExpenses: number | null
  address: string
  street: string
  neighborhood: string
  city: string
  state: string
  country: string
  zipCode: string
  lat: number | null
  lng: number | null
  beds: number | null
  baths: number | null
  sqm: number | null
  lotSqm: number | null
  propertyType: string
  status: string
  url: string
  photos: string[]
  description: string
  features: string[]
  yearBuilt: number | null
  garage: number | null
  publisher: string
  publisherPhone: string
  scrapedAt: string
}

type Portal = 'zillow' | 'realtor' | 'vivareal' | 'zonaprop' | 'argenprop' | 'mercadolibre' | 'generic'

function detectPortal(url: string): Portal {
  const u = url.toLowerCase()
  if (u.includes('zillow.com')) return 'zillow'
  if (u.includes('realtor.com')) return 'realtor'
  if (u.includes('vivareal.com.br') || u.includes('zapimoveis.com.br')) return 'vivareal'
  if (u.includes('zonaprop.com.ar')) return 'zonaprop'
  if (u.includes('argenprop.com')) return 'argenprop'
  if (u.includes('mercadolibre.com') || u.includes('inmuebles.mercadolibre')) return 'mercadolibre'
  return 'generic'
}

export const PORTAL_INFO: Record<string, { name: string; country: string; searchUrl: string }> = {
  zonaprop: { name: 'ZonaProp', country: 'AR', searchUrl: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html' },
  argenprop: { name: 'Argenprop', country: 'AR', searchUrl: 'https://www.argenprop.com/venta/departamento-capital-federal' },
  mercadolibre: { name: 'MercadoLibre', country: 'AR', searchUrl: 'https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/' },
  zillow: { name: 'Zillow', country: 'US', searchUrl: 'https://www.zillow.com/for_sale/New-York-NY/' },
  realtor: { name: 'Realtor', country: 'US', searchUrl: 'https://www.realtor.com/realestateandhomes-for-sale' },
  vivareal: { name: 'VivaReal', country: 'BR', searchUrl: 'https://www.vivareal.com.br/venda/sp/sao-paulo/' },
}

async function fetchPage(url: string): Promise<string> {
  if (!API_KEY) throw new Error('SCRAPINGBEE_API_KEY not set')

  const params = new URLSearchParams({
    api_key: API_KEY,
    url,
    render_js: 'true',
    premium_proxy: 'true',
    country_code: 'ar',
  })

  const res = await fetch(`${API_URL}?${params}`)
  if (!res.ok) {
    const text = await res.text()
    if (text.includes('credit') || text.includes('balance')) {
      throw new Error('Sin créditos ScrapingBee. Registrate gratis en scrapingbee.com (1000 créditos/mes).')
    }
    throw new Error(`ScrapingBee error ${res.status}: ${text.slice(0, 200)}`)
  }

  return res.text()
}

function extractFromZonaprop($: cheerio.CheerioAPI): any[] {
  const results: any[] = []
  $('[class*="Card"], .card-container, .posting').each((_, el) => {
    const card = $(el)
    const title = card.find('[class*="title"], h2, h3').first().text().trim()
    const price = card.find('[class*="price"], .price-tag').first().text().trim()
    const link = card.find('a[href]').first().attr('href') || ''
    const img = card.find('img').first().attr('src') || ''
    const attrs: string[] = []
    card.find('[class*="attribute"], [class*="amenit"]').each((_, a) => {
      attrs.push($(a).text().trim())
    })
    const location = card.find('[class*="location"], [class*="address"]').first().text().trim()
    if (title || link) {
      results.push({
        title: title.substring(0, 200),
        price,
        url: link.startsWith('http') ? link : `https://www.zonaprop.com.ar${link}`,
        image: img,
        address: location.substring(0, 300),
        attrs,
      })
    }
  })
  return results
}

function extractGeneric($: cheerio.CheerioAPI, baseUrl: string): any[] {
  const results: any[] = []
  const selectors = [
    '[class*="Card"]', '[class*="card"]', 'article', '.posting', '.aviso',
    '.search-result', '.listing', '[class*="listing"]', '[class*="property"]',
    '.ui-search-layout__item', 'li.result',
  ]

  let items = $('')
  for (const sel of selectors) {
    items = $(sel)
    if (items.length > 0) break
  }

  items.each((_, el) => {
    const card = $(el)
    const title = card.find('h2, h3, [class*="title"], [class*="Title"]').first().text().trim()
    const price = card.find('[class*="price"], [class*="Price"], .andes-money-amount__fraction').first().text().trim()
    const link = card.find('a[href]').first().attr('href') || ''
    const img = card.find('img').first().attr('src') || ''
    const address = card.find('[class*="address"], [class*="location"], [class*="ubicacion"]').first().text().trim()

    if (title || link) {
      results.push({
        title: title.substring(0, 200),
        price,
        url: link.startsWith('http') ? link : new URL(link, baseUrl).href,
        image: img,
        address: address.substring(0, 300),
      })
    }
  })

  if (results.length === 0) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const text = $(el).text().trim()
      if (text.length > 10 && (
        href.includes('/propiedad') || href.includes('/property') ||
        href.includes('/listing') || href.includes('/aviso') ||
        href.includes('/homedetails') || href.includes('/realestateandhomes')
      )) {
        results.push({
          title: text.replace(/\s+/g, ' ').substring(0, 150),
          url: href.startsWith('http') ? href : new URL(href, baseUrl).href,
        })
      }
    })
  }

  return results
}

function parsePrice(priceStr: string): { price: number | null; currency: string } {
  if (!priceStr) return { price: null, currency: 'USD' }
  const lower = priceStr.toLowerCase()
  let currency = 'USD'
  if (lower.includes('usd') || lower.includes('u$s') || lower.includes('dólar')) currency = 'USD'
  else if (lower.includes('brl') || lower.includes('r$')) currency = 'BRL'
  else if (lower.includes('ars') || lower.includes('$')) currency = 'ARS'

  const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return { price: isNaN(num) || num <= 0 ? null : num, currency }
}

function normalize(raw: any, portal: string): NormalizedProperty {
  const { price, currency } = parsePrice(raw.price || '')
  return {
    id: Math.random().toString(36).slice(2, 10),
    portal,
    title: raw.title || '',
    price,
    currency,
    priceUsd: price,
    monthlyExpenses: null,
    address: raw.address || '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    country: PORTAL_INFO[portal]?.country || '',
    zipCode: '',
    lat: null,
    lng: null,
    beds: parseInt(String(raw.attrs?.[0] || '0')) || null,
    baths: parseInt(String(raw.attrs?.[1] || '0')) || null,
    sqm: null,
    lotSqm: null,
    propertyType: '',
    status: '',
    url: raw.url || '',
    photos: raw.image ? [raw.image] : [],
    description: '',
    features: raw.attrs || [],
    yearBuilt: null,
    garage: null,
    publisher: '',
    publisherPhone: '',
    scrapedAt: new Date().toISOString(),
  }
}

export async function scrapeUrls(
  urls: string[],
  maxItems: number = 50,
  portalOverride?: string
): Promise<{ portal: string; properties: NormalizedProperty[]; warning?: string }> {
  if (!API_KEY) {
    throw new Error(
      'SCRAPINGBEE_API_KEY no configurada. Registrate gratis en https://www.scrapingbee.com (1000 créditos/mes).'
    )
  }

  const portal = portalOverride || detectPortal(urls[0])
  const properties: NormalizedProperty[] = []

  for (const url of urls.slice(0, 5)) {
    const targetUrl = (portalOverride && !url.startsWith('http'))
      ? (PORTAL_INFO[portal]?.searchUrl || url)
      : url

    console.log(`[Scrape] Fetching: ${targetUrl}`)
    const html = await fetchPage(targetUrl)
    const $ = cheerio.load(html)

    let raw: any[]
    if (portal === 'zonaprop') {
      raw = extractFromZonaprop($)
    } else {
      raw = extractGeneric($, targetUrl)
    }

    console.log(`[Scrape] Extracted ${raw.length} items from ${portal}`)
    raw.slice(0, maxItems - properties.length).forEach(item => {
      properties.push(normalize(item, portal))
    })

    if (properties.length >= maxItems) break
  }

  const warning = properties.length === 0
    ? `No se encontraron propiedades en la página. El sitio puede haber cambiado su estructura.`
    : undefined

  return { portal, properties: properties.slice(0, maxItems), warning }
}

export async function scrapeSingleUrl(url: string): Promise<NormalizedProperty[]> {
  const { properties } = await scrapeUrls([url], 1)
  return properties
}
