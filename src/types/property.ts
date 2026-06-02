export interface Property {
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

export interface ScrapeRequest {
  urls: string[]
  maxItems?: number
}

export interface ScrapeResponse {
  success: boolean
  data: Property[]
  error?: string
}
