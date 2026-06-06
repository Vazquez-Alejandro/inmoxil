import { ApifyClient } from 'apify-client'

let _client: ApifyClient | null = null

function getClient() {
  if (!_client) {
    const token = process.env.APIFY_TOKEN
    if (!token) throw new Error('APIFY_TOKEN not set')
    _client = new ApifyClient({ token })
  }
  return _client
}

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

export const PORTAL_INFO: Record<string, { name: string; country: string; requiresPaidPlan: boolean; searchUrl: string }> = {
  zonaprop: { name: 'ZonaProp', country: 'AR', requiresPaidPlan: true, searchUrl: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html' },
  argenprop: { name: 'Argenprop', country: 'AR', requiresPaidPlan: true, searchUrl: 'https://www.argenprop.com/venta/departamento-capital-federal' },
  mercadolibre: { name: 'MercadoLibre', country: 'AR', requiresPaidPlan: true, searchUrl: 'https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/' },
  zillow: { name: 'Zillow', country: 'US', requiresPaidPlan: true, searchUrl: 'https://www.zillow.com/for_sale/' },
  realtor: { name: 'Realtor', country: 'US', requiresPaidPlan: true, searchUrl: 'https://www.realtor.com/realestateandhomes-for-sale' },
  vivareal: { name: 'VivaReal', country: 'BR', requiresPaidPlan: true, searchUrl: 'https://www.vivareal.com.br/venda/sp/sao-paulo/' },
}

function normalizeGeneric(item: any, portal: string): NormalizedProperty {
  const extractPrice = (obj: any): number | null => {
    const val = obj.price || obj.listPrice || obj.list_price || obj.priceValue ||
      (typeof obj.price === 'object' && obj.price?.value) || null
    if (typeof val === 'number' && val > 0) return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')
      const num = parseFloat(cleaned)
      return isNaN(num) || num <= 0 ? null : num
    }
    return null
  }

  const extractCurrency = (obj: any): string => {
    const raw = JSON.stringify(obj).toLowerCase()
    if (raw.includes('usd') || raw.includes('u$s') || raw.includes('dólar')) return 'USD'
    if (raw.includes('brl') || raw.includes('r$')) return 'BRL'
    return 'ARS'
  }

  return {
    id: item.id || item.propertyId || item.zpid || Math.random().toString(36).slice(2, 10),
    portal,
    title: String(item.title || item.address || item.propertyTitle || '').substring(0, 200),
    price: extractPrice(item),
    currency: extractCurrency(item),
    priceUsd: extractPrice(item),
    monthlyExpenses: item.condoFee || item.hoa || item.expenses || null,
    address: String(item.address || item.fullAddress || item.location || '').substring(0, 300),
    street: String(item.street || item.streetName || ''),
    neighborhood: String(item.neighborhood || item.barrio || item.district || ''),
    city: String(item.city || item.locality || ''),
    state: String(item.state || item.province || ''),
    country: String(item.country || ''),
    zipCode: String(item.zipCode || item.postalCode || ''),
    lat: parseFloat(item.lat) || parseFloat(item.latitude) || null,
    lng: parseFloat(item.lng) || parseFloat(item.longitude) || null,
    beds: parseInt(String(item.beds || item.bedrooms || item.rooms || '0')) || null,
    baths: parseInt(String(item.baths || item.bathrooms || item.banos || '0')) || null,
    sqm: parseInt(String(item.sqm || item.area || item.usableArea || item.sqft || '0')) || null,
    lotSqm: parseInt(String(item.lotSize || item.totalArea || '0')) || null,
    propertyType: String(item.propertyType || item.type || ''),
    status: String(item.status || item.listingType || ''),
    url: String(item.url || item.permalink || item.detailUrl || item.link || ''),
    photos: Array.isArray(item.photos) ? item.photos : (item.image ? [item.image] : []),
    description: String(item.description || item.descriptionText || '').substring(0, 1000),
    features: Array.isArray(item.features) ? item.features : [],
    yearBuilt: parseInt(String(item.yearBuilt || '0')) || null,
    garage: parseInt(String(item.garage || item.garageSpaces || '0')) || null,
    publisher: String(item.publisher || item.advertiserName || ''),
    publisherPhone: String(item.publisherPhone || item.phone || ''),
    scrapedAt: new Date().toISOString(),
  }
}

const GENERIC_PAGE_FUNCTION = `async function pageFunction(context) {
  const $ = context.jQuery;
  const results = [];
  
  const selectors = [
    '.ui-search-layout__item',
    '[data-testid="property-card"]',
    '.property-card',
    '.card-container',
    '.listing-card',
    '.search-result',
    'article[data-id]',
    '.geo-card',
    '.aviso-card',
    '.ant-card',
    '[class*="CardContainer"]',
    'li.result',
    '.results article',
  ];
  
  let items = $();
  for (const sel of selectors) {
    items = $(sel);
    if (items.length > 0) break;
  }
  
  items.each((i, el) => {
    if (i >= (context.customData?.maxItems || 50)) return false;
    const card = $(el);
    const title = card.find('h2, h3, [class*="title"], [class*="Title"]').first().text().trim() || card.find('a').first().text().trim().substring(0, 150);
    const priceText = card.find('[class*="price"], [class*="Price"], .andes-money-amount__fraction, [class*="valor"]').first().text().trim();
    const link = card.find('a[href]').first().attr('href') || '';
    const img = card.find('img[src]').first().attr('src') || '';
    const address = card.find('[class*="address"], [class*="location"], [class*="ubicacion"]').first().text().trim();
    
    if (title || link) {
      results.push({
        title: title.substring(0, 200),
        price: priceText,
        url: link.startsWith('http') ? link : new URL(link, context.request.url).href,
        address: address.substring(0, 300),
        image: img,
      });
    }
  });
  
  if (results.length === 0) {
    results.push({
      _noResults: true,
      pageTitle: $('title').text(),
      url: context.request.url,
    });
  }
  
  return results;
}`

export async function scrapeUrls(
  urls: string[],
  maxItems: number = 50,
  portalOverride?: string
): Promise<{ portal: string; properties: NormalizedProperty[]; warning?: string }> {
  const client = getClient()
  const portal = portalOverride || detectPortal(urls[0])

  console.log(`[Scrape] Portal: ${portal}, URLs: ${urls.length}, Max: ${maxItems}`)

  const startUrls = urls.map(url => {
    if (portalOverride && !url.startsWith('http')) {
      return { url: PORTAL_INFO[portal]?.searchUrl || url }
    }
    return { url }
  })

  try {
    const run = await client.actor('apify/web-scraper').call(
      {
        startUrls,
        maxItems,
        pageFunction: GENERIC_PAGE_FUNCTION,
        proxyConfiguration: { useApifyProxy: true },
      },
      { timeout: 120, memory: 2048 }
    )

    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    console.log(`[Scrape] Got ${items.length} raw items`)

    const raw = items.flat().filter((item: any) => item && !item['#error'] && !item._noResults)
    const properties = raw
      .map((item: any) => normalizeGeneric(item, portal))
      .filter((p: NormalizedProperty) => p.title || p.url)
      .slice(0, maxItems)

    const warning = properties.length === 0
      ? `No se pudieron extraer propiedades de ${PORTAL_INFO[portal]?.name || portal}. El sitio puede estar bloqueando scraping. Probá importar un CSV o JSON con tus propiedades.`
      : undefined

    return { portal, properties, warning }
  } catch (error: any) {
    const msg = error.message || ''

    if (msg.includes('approve') || msg.includes('permissions')) {
      throw new Error('Necesitás aprobar el scraper de Apify: https://console.apify.com/actors/moJRLRc85AitArpNN?approvePermissions=true')
    }

    if (msg.includes('403') || msg.includes('blocked')) {
      throw new Error(
        `El sitio bloqueó el scraping (403). Los portales inmobiliarios requieren proxy residencial (~$49/mes en Apify). ` +
        `Mientras tanto, podés importar propiedades por CSV o JSON desde la pestaña "Importar".`
      )
    }

    if (msg.includes('rent') || msg.includes('paid')) {
      throw new Error('Este actor requiere un plan de pago en Apify. Probá importar propiedades por CSV/JSON.')
    }

    throw new Error(`Error al scrapear: ${msg.slice(0, 200)}`)
  }
}

export async function scrapeSingleUrl(url: string): Promise<NormalizedProperty[]> {
  const { properties } = await scrapeUrls([url], 1)
  return properties
}
