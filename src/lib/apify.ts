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

type Portal =
  | 'zillow'
  | 'realtor'
  | 'vivareal'
  | 'zonaprop'
  | 'argenprop'
  | 'mercadolibre'
  | 'generic'

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

function getPortalSearchUrl(portal: string): string {
  const urls: Record<string, string> = {
    zonaprop: 'https://www.zonaprop.com.ar/propiedades/venta-departamentos-capital-federal.html',
    argenprop: 'https://www.argenprop.com/venta/departamento-capital-federal',
    mercadolibre: 'https://inmuebles.mercadolibre.com.ar/departamentos/venta/capital-federal/',
    zillow: 'https://www.zillow.com/homes/for_sale/',
    realtor: 'https://www.realtor.com/realestateandhomes-for-sale',
    vivareal: 'https://www.vivareal.com.br/venda/sp/sao-paulo/apartamento_residencial/',
  }
  return urls[portal] || urls.zonaprop
}

function normalizeGeneric(item: any, portal: string): NormalizedProperty {
  const extractPrice = (obj: any): number | null => {
    const val = obj.price || obj.listPrice || obj.list_price || obj.priceValue ||
      (typeof obj.price === 'object' ? obj.price.value : null)
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }
    return null
  }

  const extractCurrency = (obj: any): string => {
    const c = obj.currency || obj.priceCurrency || obj.price_currency || ''
    if (typeof c === 'string' && c.length === 3) return c.toUpperCase()
    const title = (obj.title || '').toLowerCase()
    if (title.includes('usd') || title.includes('u$s') || title.includes('dolar')) return 'USD'
    if (title.includes('ars') || title.includes('$')) return 'ARS'
    if (title.includes('brl') || title.includes('r$')) return 'BRL'
    return 'USD'
  }

  return {
    id: item.id || item.propertyId || item.zpid || item.listing_id || Math.random().toString(36).slice(2, 10),
    portal,
    title: item.title || item.address || item.propertyTitle || '',
    price: extractPrice(item),
    currency: extractCurrency(item),
    priceUsd: extractPrice(item),
    monthlyExpenses: item.condoFee || item.hoa || item.expenses || null,
    address: item.address || item.fullAddress || item.location || item.propertyAddress || '',
    street: item.street || item.streetName || '',
    neighborhood: item.neighborhood || item.barrio || item.district || '',
    city: item.city || item.locality || '',
    state: item.state || item.province || '',
    country: item.country || '',
    zipCode: item.zipCode || item.postalCode || item.zip || '',
    lat: parseFloat(item.lat || item.latitude || item.latLong?.latitude) || null,
    lng: parseFloat(item.lng || item.longitude || item.latLong?.longitude) || null,
    beds: parseInt(item.beds || item.bedrooms || item.rooms || '0') || null,
    baths: parseInt(item.baths || item.bathrooms || item.banos || '0') || null,
    sqm: parseInt(item.sqm || item.area || item.usableArea || item.sqft || '0') || null,
    lotSqm: parseInt(item.lotSize || item.totalArea || '0') || null,
    propertyType: item.propertyType || item.type || '',
    status: item.status || item.listingType || '',
    url: item.url || item.permalink || item.detailUrl || item.link || '',
    photos: item.photos || item.images || (item.imgSrc ? [item.imgSrc] : []),
    description: item.description || item.descriptionText || '',
    features: item.features || item.amenities || [],
    yearBuilt: parseInt(item.yearBuilt || '0') || null,
    garage: parseInt(item.garage || item.garageSpaces || '0') || null,
    publisher: item.publisher || item.advertiserName || '',
    publisherPhone: item.publisherPhone || item.phone || '',
    scrapedAt: new Date().toISOString(),
  }
}

const WEB_SCRAPER_PAGE_FUNCTION = `async function pageFunction(context) {
  const $ = context.jQuery;
  const url = context.request.url;
  
  // Generic extraction for any real estate page
  const results = [];
  
  // Try common listing selectors
  const selectors = [
    '[data-testid="property-card"]',
    '.property-card',
    '.card-container',
    '.listing-card',
    '.search-result',
    'article[data-id]',
    '.geo-card',
    '.aviso-card',
    '.postingsContainer a',
    '.results-list article',
    '.ui-search-layout__item',
    '.ant-card',
    '[class*="CardContainer"]',
    '[class*="property"]',
    'li.result',
    '.results article',
  ];
  
  let items = $();
  for (const sel of selectors) {
    items = $(sel);
    if (items.length > 0) break;
  }
  
  // If no structured listings, extract all links with property-like patterns
  if (items.length === 0) {
    const links = $('a[href]');
    links.each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().substring(0, 200);
      if (text.length > 10 && (
        href.includes('/propiedad') || href.includes('/property') || 
        href.includes('/imovel') || href.includes('/listing') ||
        href.includes('/homedetails') || href.includes('/realestateandhomes')
      )) {
        results.push({
          title: text.replace(/\\s+/g, ' ').substring(0, 150),
          url: href.startsWith('http') ? href : new URL(href, url).href,
        });
      }
    });
    return results.slice(0, context.customData?.maxItems || 50);
  }
  
  items.each((i, el) => {
    if (i >= (context.customData?.maxItems || 50)) return false;
    const card = $(el);
    
    const title = card.find('h2, h3, [class*="title"], [class*="Title"]').first().text().trim() || 
                  card.find('a').first().text().trim().substring(0, 150);
    
    const priceText = card.find('[class*="price"], [class*="Price"], [class*="valor"]').first().text().trim();
    
    const link = card.find('a[href]').first().attr('href') || '';
    
    const img = card.find('img[src]').first().attr('src') || '';
    
    const address = card.find('[class*="address"], [class*="location"], [class*="ubicacion"], [class*="Address"]').first().text().trim();
    
    if (title || link) {
      results.push({
        title: title.substring(0, 150),
        price: priceText,
        url: link.startsWith('http') ? link : new URL(link, url).href,
        address: address.substring(0, 200),
        image: img,
      });
    }
  });
  
  return results;
}`

export async function scrapeUrls(
  urls: string[],
  maxItems: number = 50,
  portalOverride?: string
): Promise<{ portal: string; properties: NormalizedProperty[] }> {
  const client = getClient()
  const portal = portalOverride || detectPortal(urls[0])

  console.log(`[Scrape] Portal: ${portal}, URLs: ${urls.length}, Max: ${maxItems}`)

  try {
    const startUrls = urls.map(url => {
      if (portalOverride && !url.startsWith('http')) {
        return { url: getPortalSearchUrl(portal) }
      }
      return { url }
    })

    const run = await client.actor('apify/web-scraper').call(
      {
        startUrls,
        maxItems,
        pageFunction: WEB_SCRAPER_PAGE_FUNCTION,
        proxyConfiguration: { useApifyProxy: true },
      },
      {
        timeout: 120,
        memory: 2048,
        build: 'latest',
      }
    )

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    console.log(`[Scrape] Got ${items.length} raw items`)

    const properties = items
      .flat()
      .filter((item: any) => item && (item.title || item.url))
      .map((item: any) => normalizeGeneric(item, portal))
      .filter((p: NormalizedProperty) => p.title || p.url)
      .slice(0, maxItems)

    console.log(`[Scrape] Normalized ${properties.length} properties`)

    return { portal, properties }
  } catch (error: any) {
    const msg = error.message || ''
    if (msg.includes('approve') || msg.includes('permissions')) {
      throw new Error(
        'Necesitás aprobar el scraper de Apify. Andá a https://console.apify.com/actors/moJRLRc85AitArpNN?approvePermissions=true y dale "Approve". Es gratis.'
      )
    }
    if (msg.includes('rent') || msg.includes('paid')) {
      throw new Error('Este scraper requiere un plan de pago en Apify. Probá con otra URL.')
    }
    throw error
  }
}

export async function scrapeSingleUrl(url: string): Promise<NormalizedProperty[]> {
  const { properties } = await scrapeUrls([url], 1)
  return properties
}
