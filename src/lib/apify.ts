import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
})

export interface PropertyListing {
  id: string
  title: string
  price: number
  currency: string
  address: string
  city: string
  state: string
  zipCode: string
  beds: number
  baths: number
  sqft: number
  propertyType: string
  status: string
  url: string
  photos: string[]
  description?: string
  yearBuilt?: number
  lotSize?: number
  garage?: number
  features?: string[]
  scrapedAt: string
}

export interface ScrapeInput {
  urls: string[]
  maxItems?: number
  proxyConfiguration?: {
    useApifyProxy?: boolean
    apifyProxyGroups?: string[]
  }
}

export async function scrapeProperties(input: ScrapeInput): Promise<PropertyListing[]> {
  const run = await client.actor('whitewalk/real-estate-scraper').call({
    startUrls: input.urls.map((url) => ({ url })),
    maxItems: input.maxItems || 100,
    proxyConfiguration: input.proxyConfiguration || {
      useApifyProxy: true,
    },
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items.map((item: any) => ({
    id: item.id || item.zpid || item.propertyId || '',
    title: item.address?.full || item.title || '',
    price: item.price || 0,
    currency: item.currency || 'USD',
    address: item.address?.full || '',
    city: item.address?.city || '',
    state: item.address?.state || '',
    zipCode: item.address?.zipCode || '',
    beds: item.beds || 0,
    baths: item.baths || 0,
    sqft: item.sqft || 0,
    propertyType: item.propertyType || '',
    status: item.status || '',
    url: item.url || item.permalink || '',
    photos: item.photos || [],
    description: item.description,
    yearBuilt: item.yearBuilt,
    lotSize: item.lotSize,
    garage: item.garage,
    features: item.features || [],
    scrapedAt: new Date().toISOString(),
  }))
}

export async function scrapeFromUrl(url: string): Promise<PropertyListing[]> {
  return scrapeProperties({ urls: [url], maxItems: 50 })
}
