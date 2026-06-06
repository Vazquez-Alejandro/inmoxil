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
    wait: '8000',
  })

  const res = await fetch(`${API_URL}?${params}`, { signal: AbortSignal.timeout(60000) })
  if (!res.ok) {
    const text = await res.text()
    if (text.includes('credit') || text.includes('balance')) {
      throw new Error('Sin créditos ScrapingBee. Registrate gratis en scrapingbee.com (4000 créditos/mes).')
    }
    throw new Error(`ScrapingBee error ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.text()
}

function parsePrice(str: string): { price: number | null; currency: string } {
  if (!str) return { price: null, currency: 'USD' }
  const lower = str.toLowerCase()
  let currency = 'USD'
  if (lower.includes('brl') || lower.includes('r$')) currency = 'BRL'
  else if (lower.includes('ars') || (lower.includes('$') && !lower.includes('usd') && !lower.includes('u$s'))) currency = 'ARS'
  const cleaned = str.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return { price: isNaN(num) || num <= 0 ? null : num, currency }
}

function extractSpecs(text: string): { beds: number | null; baths: number | null; sqm: number | null } {
  const sqm = parseInt(text.match(/(\d+)\s*m/i)?.[1] || '0') || null
  const beds = parseInt(text.match(/(\d+)\s*amb/i)?.[1] || text.match(/(\d+)\s*dorm/i)?.[1] || text.match(/(\d+)\s*bed/i)?.[1] || '0') || null
  const baths = parseInt(text.match(/(\d+)\s*baño/i)?.[1] || text.match(/(\d+)\s*bath/i)?.[1] || '0') || null
  return { beds, baths, sqm }
}

// ── ZonaProp extractor ────────────────────────────────────────────
function extractZonaprop(html: string): any[] {
  const $ = cheerio.load(html)
  const results: any[] = []

  $('div.postingCard-module__posting-container').each((_, el) => {
    const card = $(el)
    const title = card.find('h2').first().text().trim()
    const priceText = card.find('[data-qa="POSTING_CARD_PRICE"]').text().trim() || card.find('h2').first().text().trim()
    const specsText = card.find('h3').first().text().trim()
    const link = card.find('a[href]').first().attr('href') || ''
    const imgs: string[] = []
    card.find('img').each((_, img) => {
      const src = $(img).attr('src')
      if (src && src.includes('zonapropcdn')) imgs.push(src)
    })
    const address = card.find('[data-qa="POSTING_CARD_LOCATION"], [class*="location"], [class*="address"]').first().text().trim()
    const { beds, baths, sqm } = extractSpecs(specsText)

    if (title) {
      results.push({
        title: title.substring(0, 200),
        price: priceText,
        specs: specsText,
        url: link.startsWith('http') ? link : `https://www.zonaprop.com.ar${link}`,
        image: imgs[0] || '',
        address: address.substring(0, 300),
        beds, baths, sqm,
      })
    }
  })

  return results
}

// ── Argenprop extractor ───────────────────────────────────────────
function extractArgenprop(html: string): any[] {
  const $ = cheerio.load(html)
  const results: any[] = []

  // Argenprop uses slide-property cards
  $('div[class*="slide-property"]').each((_, el) => {
    const card = $(el)
    // Skip non-card containers
    if (card.find('img').length === 0) return

    const title = card.find('h2').first().text().trim() ||
                  card.find('[class*="title"]').first().text().trim()
    const priceText = card.find('[class*="price"]').first().text().trim()
    const link = card.find('a[href]').first().attr('href') || ''
    const img = card.find('img').first().attr('src') || ''
    const address = card.find('[class*="address"]').first().text().trim()
    const specsText = card.text()

    if (title && !results.find(r => r.title === title)) {
      const { beds, baths, sqm } = extractSpecs(specsText)
      results.push({
        title: title.substring(0, 200),
        price: priceText,
        url: link.startsWith('http') ? link : `https://www.argenprop.com${link}`,
        image: img,
        address: address.substring(0, 300),
        beds, baths, sqm,
      })
    }
  })

  // Fallback: extract from h2s that contain price info
  if (results.length === 0) {
    $('h2').each((_, el) => {
      const title = $(el).text().trim()
      if (title.length < 10) return
      const parent = $(el).closest('a[href]') || $(el).parent().find('a[href]').first()
      const link = parent.attr('href') || ''
      if (link.includes('/propiedad') || link.includes('/inmueble')) {
        results.push({
          title: title.substring(0, 200),
          price: '',
          url: link.startsWith('http') ? link : `https://www.argenprop.com${link}`,
          image: '',
          address: '',
          beds: null, baths: null, sqm: null,
        })
      }
    })
  }

  return results
}

// ── Generic extractor ─────────────────────────────────────────────
function extractGeneric(html: string, baseUrl: string): any[] {
  const $ = cheerio.load(html)
  const results: any[] = []

  // Try multiple patterns
  const cardSelectors = [
    '[class*="Card"]', '[class*="card"]', 'article', '.posting',
    '.search-result', '.listing', '[class*="listing"]', '[class*="property"]',
    '.ui-search-layout__item',
  ]

  let items = $('')
  for (const sel of cardSelectors) {
    items = $(sel)
    if (items.length >= 3) break
  }

  items.each((_, el) => {
    const card = $(el)
    const title = card.find('h2, h3, [class*="title"]').first().text().trim()
    const price = card.find('[class*="price"], [class*="Price"]').first().text().trim()
    const link = card.find('a[href]').first().attr('href') || ''
    const img = card.find('img').first().attr('src') || ''
    const address = card.find('[class*="address"], [class*="location"]').first().text().trim()

    if (title || link) {
      const specsText = card.text()
      const { beds, baths, sqm } = extractSpecs(specsText)
      results.push({
        title: title.substring(0, 200),
        price,
        url: link.startsWith('http') ? link : new URL(link, baseUrl).href,
        image: img,
        address: address.substring(0, 300),
        beds, baths, sqm,
      })
    }
  })

  return results
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
    beds: raw.beds || null,
    baths: raw.baths || null,
    sqm: raw.sqm || null,
    lotSqm: null,
    propertyType: '',
    status: '',
    url: raw.url || '',
    photos: raw.image ? [raw.image] : [],
    description: '',
    features: raw.specs ? [raw.specs] : [],
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
    throw new Error('SCRAPINGBEE_API_KEY no configurada. Registrate gratis en https://www.scrapingbee.com')
  }

  const portal = portalOverride || detectPortal(urls[0])
  const properties: NormalizedProperty[] = []

  for (const url of urls.slice(0, 5)) {
    const targetUrl = (portalOverride && !url.startsWith('http'))
      ? (PORTAL_INFO[portal]?.searchUrl || url)
      : url

    console.log(`[Scrape] Fetching: ${targetUrl} (portal: ${portal})`)

    const html = await fetchPage(targetUrl)
    let raw: any[]

    switch (portal) {
      case 'zonaprop':
        raw = extractZonaprop(html)
        break
      case 'argenprop':
        raw = extractArgenprop(html)
        break
      default:
        raw = extractGeneric(html, targetUrl)
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
