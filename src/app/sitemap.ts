import type { MetadataRoute } from 'next'

const BASE_URL = 'https://inmoxil.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/terminos`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/privacidad`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return staticPages
}
