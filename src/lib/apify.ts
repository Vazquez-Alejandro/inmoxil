import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
})

// ─── Tipos ────────────────────────────────────────────────────────
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
  | 'zapimoveis'
  | 'zonaprop'
  | 'argenprop'
  | 'mercadolibre'
  | 'olx'
  | 'generic'

// ─── Detección de portal ──────────────────────────────────────────
function detectPortal(url: string): Portal {
  const u = url.toLowerCase()
  if (u.includes('zillow.com')) return 'zillow'
  if (u.includes('realtor.com')) return 'realtor'
  if (u.includes('vivareal.com.br')) return 'vivareal'
  if (u.includes('zapimoveis.com.br')) return 'zapimoveis'
  if (u.includes('zonaprop.com.ar')) return 'zonaprop'
  if (u.includes('argenprop.com')) return 'argenprop'
  if (u.includes('mercadolibre.com') || u.includes('inmuebles.mercadolibre')) return 'mercadolibre'
  if (u.includes('olx.com')) return 'olx'
  return 'generic'
}

// ─── Actor mapping por portal ──────────────────────────────────────
function getActorForPortal(portal: Portal): string {
  const actors: Record<Portal, string> = {
    zillow: 'aknahin/zillow-property-info-scraper',
    realtor: 'epctex/realtor-scraper',
    vivareal: 'gio21/vivareal-zap-scraper',
    zapimoveis: 'gio21/vivareal-zap-scraper',
    zonaprop: 'solidcode/zonaprop-scraper',
    argenprop: 'whitewalk/real-estate-scraper',
    mercadolibre: 'whitewalk/real-estate-scraper',
    olx: 'whitewalk/real-estate-scraper',
    generic: 'whitewalk/real-estate-scraper',
  }
  return actors[portal]
}

// ─── Input builder por portal ──────────────────────────────────────
function buildActorInput(portal: Portal, urls: string[], maxItems: number) {
  switch (portal) {
    case 'zillow':
      return {
        addresses: urls,
        maxItems,
      }
    case 'realtor':
      return {
        startUrls: urls.map((url) => ({ url })),
        maxItems,
        mode: 'BUY',
      }
    case 'vivareal':
    case 'zapimoveis':
      return {
        location: urls[0],
        maxItems,
      }
    case 'zonaprop':
      return {
        startUrls: urls.map((url) => ({ url })),
        maxItems,
      }
    default:
      return {
        startUrls: urls.map((url) => ({ url })),
        maxItems,
      }
  }
}

// ─── Normalizadores por portal ─────────────────────────────────────
function normalizeZillow(item: any): NormalizedProperty {
  return {
    id: item.zpid || item.id || '',
    portal: 'zillow',
    title: item.address || '',
    price: item.price || null,
    currency: 'USD',
    priceUsd: item.price || null,
    monthlyExpenses: null,
    address: item.address || '',
    street: '',
    neighborhood: '',
    city: item.city || '',
    state: item.state || '',
    country: 'US',
    zipCode: item.zipcode || '',
    lat: item.latLong?.latitude || null,
    lng: item.latLong?.longitude || null,
    beds: item.beds || null,
    baths: item.baths || null,
    sqm: item.area || null,
    lotSqm: item.lotSize || null,
    propertyType: item.propertyType || '',
    status: item.statusText || '',
    url: item.detailUrl ? `https://www.zillow.com${item.detailUrl}` : '',
    photos: item.imgSrc ? [item.imgSrc] : [],
    description: '',
    features: [],
    yearBuilt: item.yearBuilt || null,
    garage: item.garageSpaces || null,
    publisher: '',
    publisherPhone: '',
    scrapedAt: new Date().toISOString(),
  }
}

function normalizeRealtor(item: any): NormalizedProperty {
  return {
    id: item.property_id || item.id || '',
    portal: 'realtor',
    title: item.location?.address?.line || '',
    price: item.list_price || null,
    currency: 'USD',
    priceUsd: item.list_price || null,
    monthlyExpenses: null,
    address: item.location?.address?.line || '',
    street: item.location?.address?.line || '',
    neighborhood: item.location?.neighborhoods?.[0]?.name || '',
    city: item.location?.address?.city || '',
    state: item.location?.address?.state_code || '',
    country: 'US',
    zipCode: item.location?.address?.postal_code || '',
    lat: item.location?.address?.coordinate?.lat || null,
    lng: item.location?.address?.coordinate?.lon || null,
    beds: item.description?.beds || null,
    baths: item.description?.baths || null,
    sqm: item.description?.sqft || null,
    lotSqm: item.description?.lot_sqft || null,
    propertyType: item.description?.type || '',
    status: item.status || '',
    url: item.permalink || '',
    photos: (item.primary_photo?.href ? [item.primary_photo.href] : []),
    description: item.description?.text || '',
    features: (item.features || []).map((f: any) => f.text || f.category || ''),
    yearBuilt: item.description?.year_built || null,
    garage: item.description?.garage || null,
    publisher: item.list_agent?.full_name || '',
    publisherPhone: item.list_agent?.phones?.[0]?.number || '',
    scrapedAt: new Date().toISOString(),
  }
}

function normalizeVivaReal(item: any): NormalizedProperty {
  return {
    id: item.externalId || item.id || '',
    portal: 'vivareal',
    title: item.title || '',
    price: item.price || null,
    currency: 'BRL',
    priceUsd: null,
    monthlyExpenses: item.condoFee || null,
    address: `${item.street || ''}, ${item.neighborhood || ''}, ${item.city || ''}`.trim(),
    street: item.street || '',
    neighborhood: item.neighborhood || '',
    city: item.city || '',
    state: item.state || '',
    country: 'BR',
    zipCode: item.zipCode || '',
    lat: item.lat || null,
    lng: item.lng || null,
    beds: item.bedrooms || null,
    baths: item.bathrooms || null,
    sqm: item.usableArea || null,
    lotSqm: item.totalArea || null,
    propertyType: item.propertyType || '',
    status: item.listingType || '',
    url: item.url || '',
    photos: item.images || [],
    description: item.description || '',
    features: item.amenities || [],
    yearBuilt: null,
    garage: item.parkingSpaces || null,
    publisher: item.advertiserName || '',
    publisherPhone: item.advertiserPhones?.[0] || '',
    scrapedAt: new Date().toISOString(),
  }
}

function normalizeGeneric(item: any): NormalizedProperty {
  return {
    id: item.id || item.zpid || item.propertyId || item.listing_id || '',
    portal: 'generic',
    title: item.title || item.address?.full || item.address || '',
    price: item.price || item.list_price || null,
    currency: item.currency || 'USD',
    priceUsd: item.price || item.list_price || null,
    monthlyExpenses: item.condoFee || item.hoa || null,
    address: item.address?.full || item.address || item.location?.address?.line || '',
    street: item.address?.street || item.street || '',
    neighborhood: item.address?.neighborhood || item.neighborhood || '',
    city: item.address?.city || item.city || item.location?.address?.city || '',
    state: item.address?.state || item.state || item.location?.address?.state_code || '',
    country: item.address?.country || item.country || '',
    zipCode: item.address?.zipCode || item.zipCode || item.location?.address?.postal_code || '',
    lat: item.address?.latitude || item.coordinates?.latitude || item.lat || null,
    lng: item.address?.longitude || item.coordinates?.longitude || item.lng || null,
    beds: item.beds || item.bedrooms || item.description?.beds || null,
    baths: item.baths || item.bathrooms || item.description?.baths || null,
    sqm: item.sqft || item.area || item.usableArea || item.description?.sqft || null,
    lotSqm: item.lotSize || item.lotSqm || item.totalArea || null,
    propertyType: item.propertyType || item.type || '',
    status: item.status || item.listingType || '',
    url: item.url || item.permalink || item.detailUrl || '',
    photos: item.photos || item.images || (item.imgSrc ? [item.imgSrc] : []),
    description: item.description || item.descriptionText || '',
    features: item.features || item.amenities || [],
    yearBuilt: item.yearBuilt || null,
    garage: item.garage || item.garageSpaces || null,
    publisher: item.publisher || item.listingAgent?.name || item.advertiserName || '',
    publisherPhone: item.publisherPhone || item.listingAgent?.phone || item.advertiserPhones?.[0] || '',
    scrapedAt: new Date().toISOString(),
  }
}

function normalizeByPortal(portal: Portal, item: any): NormalizedProperty {
  switch (portal) {
    case 'zillow':
      return normalizeZillow(item)
    case 'realtor':
      return normalizeRealtor(item)
    case 'vivareal':
    case 'zapimoveis':
      return normalizeVivaReal(item)
    default:
      return normalizeGeneric(item)
  }
}

// ─── Función principal ─────────────────────────────────────────────
export async function scrapePortal(
  urls: string[],
  maxItems: number = 50
): Promise<{ portal: Portal; properties: NormalizedProperty[] }> {
  if (!urls.length) throw new Error('Se requiere al menos una URL')

  const portal = detectPortal(urls[0])
  const actorId = getActorForPortal(portal)
  const input = buildActorInput(portal, urls, maxItems)

  console.log(`[Inmoxil] Portal detectado: ${portal}`)
  console.log(`[Inmoxil] Actor: ${actorId}`)

  const run = await client.actor(actorId).call(input, {
    timeout: 120,
    memory: 1024,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  const properties = items.map((item) => normalizeByPortal(portal, item))

  return { portal, properties }
}

export async function scrapeSingleUrl(url: string): Promise<NormalizedProperty[]> {
  const { properties } = await scrapePortal([url], 1)
  return properties
}
