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

export interface ScrapeRequest {
  urls: string[]
  maxItems?: number
}

export interface ScrapeResponse {
  success: boolean
  portal: string
  count: number
  data: NormalizedProperty[]
  error?: string
}
