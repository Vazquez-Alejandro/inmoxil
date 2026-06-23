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
  argenprop: { name: 'Argenprop', country: 'AR', searchUrl: 'https://www.argenprop.com/departamentos/venta/capital-federal' },
  mercadolibre: { name: 'MercadoLibre', country: 'AR', searchUrl: 'https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/' },
  zillow: { name: 'Zillow', country: 'US', searchUrl: 'https://www.zillow.com/for_sale/New-York-NY/' },
  realtor: { name: 'Realtor', country: 'US', searchUrl: 'https://www.realtor.com/realestateandhomes-for-sale' },
  vivareal: { name: 'VivaReal', country: 'BR', searchUrl: 'https://www.vivareal.com.br/venda/sp/sao-paulo/' },
}

async function fetchPage(url: string, portal: Portal = 'generic', opts?: { waitFor?: number }): Promise<string> {
  if (!API_KEY) throw new Error('SCRAPINGBEE_API_KEY not set')

  const country = portal === 'zillow' || portal === 'realtor' ? 'us' : portal === 'vivareal' ? 'br' : 'ar'

  async function tryFetch(premiumProxy: boolean): Promise<string> {
    const params = new URLSearchParams()
    params.set('api_key', API_KEY!)
    params.set('url', url)
    params.set('render_js', 'true')
    params.set('premium_proxy', premiumProxy ? 'true' : 'false')
    params.set('country_code', country)
    params.set('wait', String(opts?.waitFor || 8000))

    const res = await fetch(`${API_URL}?${params}`, { signal: AbortSignal.timeout(90000) })
    const text = await res.text()

    const isCloudflareBlock = text.includes('Cloudflare') || text.includes('Just a moment') || text.includes('challenges.cloudflare')
    const isWafBlock = text.includes('premium_proxy=True') || text.includes('stealth_proxy')
    const isCredits = text.includes('credit') || text.includes('balance') || text.includes('credits')

    if (!res.ok || isCloudflareBlock || isWafBlock) {
      if (isCredits) {
        throw new Error('Sin créditos ScrapingBee. Registrate gratis en scrapingbee.com (4000 créditos/mes).')
      }
      if (!premiumProxy && (isCloudflareBlock || isWafBlock)) {
        console.log(`[Scrape] Blocked without premium proxy, retrying with premium...`)
        return tryFetch(true)
      }
      throw new Error(`ScrapingBee error ${res.status}: ${(isCloudflareBlock || isWafBlock) ? 'Sitio bloqueado incluso con proxy premium' : text.slice(0, 200)}`)
    }
    return text
  }

  return tryFetch(false)
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
  const beds = parseInt(text.match(/(\d+)\s*amb/i)?.[1] || text.match(/(\d+)\s*dorm/i)?.[1] || text.match(/(\d+)\s*bed/i)?.[1] || text.match(/(\d+)\s*cuarto/i)?.[1] || '0') || null
  const baths = parseInt(text.match(/(\d+)\s*baño/i)?.[1] || text.match(/(\d+)\s*bath/i)?.[1] || text.match(/(\d+)\s*toilette/i)?.[1] || '0') || null
  return { beds, baths, sqm }
}

// ── MercadoLibre API extractor (directo, sin scraping) ─────────────
async function extractMercadoLibreAPI(searchUrl: string, maxItems: number): Promise<any[]> {
  // Build ML search API URL from the search page URL
  let offset = 0
  const limit = Math.min(maxItems, 50)
  const results: any[] = []

  // Extract search params from the ML URL
  // ML search URL format: https://inmuebles.mercadolibre.com.ar/{category}/venta/{location}/
  // ML API: https://api.mercadolibre.com/sites/MLA/search?category=...&condition=...
  const apiUrl = searchUrl.includes('mercadolibre')
    ? searchUrl
      .replace('inmuebles.mercadolibre.com.ar', 'api.mercadolibre.com/sites/MLA/search?category=')
      .replace(/\/venta\//, 'MLA1474_')  // departamentos en venta
      .replace(/\/alquiler\//, 'MLA1474_')
      .replace(/\/[^/]+\/?$/, '')
    : searchUrl

  // Simpler: search by category
  const categoryMap: Record<string, string> = {
    departamento: 'MLA1474',
    casa: 'MLA1484',
    terreno: 'MLA1491',
    local: 'MLA1503',
    oficina: 'MLA1511',
    ph: 'MLA1498',
  }

  let category = 'MLA1459' // default: inmuebles
  for (const [key, cat] of Object.entries(categoryMap)) {
    if (searchUrl.includes(key)) { category = cat; break }
  }

  const operation = searchUrl.includes('venta') ? 'venta' : 'alquiler'
  const state = searchUrl.includes('capital-federal') ? 'AR-C' : ''

  try {
    const url = `https://api.mercadolibre.com/sites/MLA/search?category=${category}&condition=used&limit=${limit}&offset=${offset}${state ? `&state=${state}` : ''}`
    console.log(`[ML API] Fetching: ${url}`)
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`ML API error ${res.status}`)
    const data = await res.json()

    for (const item of (data.results || []).slice(0, maxItems)) {
      const pics = (item.pictures || []).map((p: any) => p.url || p.secure_url || '')
      results.push({
        title: item.title?.substring(0, 200) || '',
        price: `${item.currency_id || 'USD'} ${item.price || ''}`,
        specs: `${item.attributes?.find((a: any) => a.id === 'BEDROOMS')?.value_name || ''} ${item.attributes?.find((a: any) => a.id === 'BATHROOMS')?.value_name || ''}`,
        url: item.permalink || '',
        image: pics[0] || item.thumbnail || '',
        address: `${item.address?.state_name || ''}, ${item.address?.city_name || ''}`,
        beds: parseInt(item.attributes?.find((a: any) => a.id === 'BEDROOMS')?.value_name || '0') || null,
        baths: parseInt(item.attributes?.find((a: any) => a.id === 'BATHROOMS')?.value_name || '0') || null,
        sqm: parseInt(item.attributes?.find((a: any) => a.id === 'COVERED_AREA')?.value_name || '0') || null,
      })
    }
  } catch (e: any) {
    console.log(`[ML API] Error: ${e.message}`)
    throw e
  }

  return results
}

// ── ZonaProp extractor ────────────────────────────────────────────
function extractZonaprop(html: string): any[] {
  const $ = cheerio.load(html)
  const results: any[] = []

  // Main card container (CSS module class, verified Jun 2026)
  $('div.postingCard-module__posting-container').each((_, el) => {
    const card = $(el)

    // Title: h2 with posting-description class
    const title = card.find('h2.postingCard-module__posting-description').first().text().trim()
      || card.find('h2').first().text().trim()

    // Price: h2 with price class
    const priceText = card.find('h2.postingPrices-module__price').first().text().trim()
      || card.find('[class*="price"]').first().text().trim()

    // Specs: h3 with main-features class
    const specsText = card.find('h3.postingMainFeatures-module__posting-main-features-block').first().text().trim()
      || card.find('h3').first().text().trim()

    // Link: find anchor with propiedad path
    const link = card.find('a[href*="/propiedades/"]').first().attr('href')
      || card.find('a[href]').first().attr('href')
      || ''

    // Images: in gallery container
    const imgs: string[] = []
    card.find('.postingGallery-module__gallery-container img, [class*="gallery"] img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src') || ''
      if (src && !src.includes('placeholder') && !src.includes('blank')) imgs.push(src)
    })
    // Also try any img with zonapropcdn
    if (imgs.length === 0) {
      card.find('img').each((_, img) => {
        const src = $(img).attr('data-src') || $(img).attr('src') || ''
        if (src && src.includes('zonapropcdn')) imgs.push(src)
      })
    }

    // Address: location block
    const addressBlock = card.find('.postingLocations-module__location-block').first()
    const addressStreet = addressBlock.find('h4').first().text().trim()
    const addressCity = addressBlock.find('h4').last().text().trim()
    const address = addressStreet && addressCity ? `${addressStreet}, ${addressCity}` : (addressBlock.text().trim() || '')

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

  // Cards are a.card with href starting with /departamento-en-venta-en-
  $('a.card[href*="departamento-en-venta-en"]').each((_, el) => {
    const card = $(el)
    const href = card.attr('href') || ''
    const fullUrl = href.startsWith('http') ? href : `https://www.argenprop.com${href}`

    // Price: span.card__currency + text = "USD 155.000" or "USD 2.400.000"
    const currency = card.find('span.card__currency').first().text().trim()
    const priceNum = card.find('p.card__price').clone().children('span').remove().end().text().trim()
    const priceText = currency ? `${currency} ${priceNum}` : priceNum

    // Expenses from span.card__expenses title attribute
    const expensesEl = card.find('span.card__expenses')
    const expensesText = expensesEl.attr('title') || expensesEl.text().trim()

    // Address
    const address = card.find('p.card__address').first().text().trim()

    // Title from card__title
    const title = card.find('h2.card__title').first().text().trim()

    // Specs from ul.card__main-features
    const specsText = card.find('ul.card__main-features').text().trim()

    // Image: first img with data-src (real image, not placeholder)
    let img = ''
    card.find('ul.card__photos img').each((_, imgEl) => {
      const src = $(imgEl).attr('data-src') || ''
      if (src && !img) img = src
    })
    if (!img) {
      // Fallback: try any img with data-src
      card.find('img[data-src]').each((_, imgEl) => {
        const src = $(imgEl).attr('data-src') || ''
        if (src && !img) img = src
      })
    }

    if (title || priceText) {
      const { beds, baths, sqm } = extractSpecs(specsText || card.text())
      results.push({
        title: title.substring(0, 200),
        price: priceText,
        expenses: expensesText,
        url: fullUrl,
        image: img,
        address: address || 'Capital Federal',
        beds, baths, sqm,
      })
    }
  })

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
    '.ui-search-layout__item', 'li.ui-search-layout__item',
    '[class*="results"] > div', '[class*="results"] > li',
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
        url: link.startsWith('http') ? link : (() => { try { return new URL(link, baseUrl).href } catch { return link } })(),
        image: img,
        address: address.substring(0, 300),
        beds, baths, sqm,
      })
    }
  })

  return results
}

// ── MercadoLibre extractor ────────────────────────────────────────
function extractMercadoLibre(html: string): any[] {
  const $ = cheerio.load(html)
  const results: any[] = []

  // ML uses .ui-search-result or ol.ui-search-layout li
  $('li.ui-search-layout__item, .ui-search-result, .ui-search-layout .ui-search-layout__item').each((_, el) => {
    const card = $(el)
    const link = card.find('a[href*="/MLA-"]').first().attr('href') || card.find('a[href*="inmueble"]').first().attr('href') || ''
    const priceText = card.find('[class*="price"], .andes-money-amount').first().text().trim()
    const title = card.find('h2, [class*="title"]').first().text().trim()
    const img = card.find('img').first().attr('src') || ''
    const address = card.find('[class*="location"], [class*="address"]').first().text().trim()
    const specsText = card.text()

    if (title || priceText) {
      const { beds, baths, sqm } = extractSpecs(specsText)
      results.push({
        title: title.substring(0, 200),
        price: priceText,
        url: link.startsWith('http') ? link : `https://inmuebles.mercadolibre.com.ar${link}`,
        image: img,
        address: address.substring(0, 300),
        beds, baths, sqm,
      })
    }
  })

  // Fallback: any link with MLA- pattern
  if (results.length === 0) {
    $('a[href*="/MLA-"]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const card = $(el).closest('li, div')
      const priceText = card.find('[class*="price"]').first().text().trim() || $(el).find('[class*="price"]').first().text().trim()
      const title = card.find('h2, h3, [class*="title"]').first().text().trim()

      if (href && !results.find(r => r.url === href)) {
        results.push({
          title: title.substring(0, 200) || 'Inmueble',
          price: priceText,
          url: href,
          image: card.find('img').first().attr('src') || '',
          address: '',
          beds: null, baths: null, sqm: null,
        })
      }
    })
  }

  return results
}

function normalize(raw: any, portal: string): NormalizedProperty {
  const { price, currency } = parsePrice(raw.price || '')
  const expenses = raw.expenses ? parsePrice(raw.expenses).price : null
  return {
    id: Math.random().toString(36).slice(2, 10),
    portal,
    title: raw.title || '',
    price,
    currency,
    priceUsd: price,
    monthlyExpenses: expenses,
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

  const portal: Portal = (portalOverride as Portal) || detectPortal(urls[0])
  const properties: NormalizedProperty[] = []

  for (const url of urls.slice(0, 5)) {
    const isHomepage = url === `https://www.${portal}.com` || url === `https://www.${portal}.com/`
    const targetUrl = (portalOverride && (!url.startsWith('http') || isHomepage))
      ? (PORTAL_INFO[portal]?.searchUrl || url)
      : url

    console.log(`[Scrape] Fetching: ${targetUrl} (portal: ${portal})`)

    const html = await fetchPage(targetUrl, portal)
    let raw: any[]

    switch (portal) {
      case 'zonaprop':
        raw = extractZonaprop(html)
        break
      case 'argenprop':
        raw = extractArgenprop(html)
        break
      case 'mercadolibre':
        raw = await extractMercadoLibreAPI(targetUrl, maxItems)
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
    ? (() => {
      if (portal === 'mercadolibre') return 'MercadoLibre bloquea scraping automatizado. Intentá exportar propiedades desde MercadoLibre y subir el CSV/JSON.'
      if (portal === 'zillow') return 'Zillow bloquea accesos desde Argentina. Probá con ZonaProp o Argenprop.'
      if (portal === 'realtor') return 'Realtor.com no está disponible desde esta región. Probá con ZonaProp o Argenprop.'
      if (portal === 'vivareal') return 'VivaReal puede estar temporalmente bloqueado. Intentá de nuevo en unos minutos.'
      return 'No se encontraron propiedades. El sitio puede haber cambiado su estructura. Intentá con otro portal.'
    })()
    : undefined

  return { portal, properties: properties.slice(0, maxItems), warning }
}

export async function scrapeSingleUrl(url: string): Promise<NormalizedProperty[]> {
  const { properties } = await scrapeUrls([url], 1)
  return properties
}
