export interface MLToken {
  accessToken: string
  refreshToken: string
  userId: string
  sellerId: string
  expiresAt: string
}

export interface MLItem {
  id: string
  title: string
  price: number
  currency_id: string
  available_quantity: number
  condition: 'new' | 'used'
  listing_type_id: 'gold_special' | 'gold_premium' | 'silver' | 'bronze' | 'free'
  pictures: { source: string }[]
  description: string
  category_id: string
  tags?: string[]
  status?: string
  permalink?: string
}

const API_BASE = 'https://api.mercadolibre.com'
const AUTH_BASE = 'https://auth.mercadolibre.com.ar'

export function getAuthUrl(clientId: string, redirectUri: string, state: string): string {
  return `${AUTH_BASE}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
}

export async function exchangeCode(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<MLToken> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) throw new Error(`ML OAuth error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId: data.user_id?.toString(),
    sellerId: data.user_id?.toString(),
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export async function refreshToken(clientId: string, clientSecret: string, refreshTokenValue: string): Promise<MLToken> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshTokenValue,
    }),
  })
  if (!res.ok) throw new Error(`ML refresh error: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId: data.user_id?.toString(),
    sellerId: data.user_id?.toString(),
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export async function getMyItems(accessToken: string, userId: string): Promise<MLItem[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/items/search?status=active&limit=50`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`ML items search error: ${res.status}`)
  const data = await res.json()

  if (!data.results?.length) return []

  const items: MLItem[] = []
  for (const id of data.results.slice(0, 20)) {
    const itemRes = await fetch(`${API_BASE}/items/${id}?include_attributes=all`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    if (itemRes.ok) {
      const item = await itemRes.json()
      items.push({
        id: item.id, title: item.title, price: item.price,
        currency_id: item.currency_id, available_quantity: item.available_quantity,
        condition: item.condition, listing_type_id: item.listing_type_id,
        pictures: (item.pictures || []).map((p: any) => ({ source: p.secure_url || p.url })),
        description: '', category_id: item.category_id,
        status: item.status, permalink: item.permalink,
      })
    }
  }
  return items
}

export async function createItem(accessToken: string, item: MLItem): Promise<MLItem> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!res.ok) throw new Error(`ML create error: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function updateItem(accessToken: string, itemId: string, updates: Partial<MLItem>): Promise<MLItem> {
  const res = await fetch(`${API_BASE}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(`ML update error: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getCategories(query: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/sites/MLA/categories`, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) return []

  const all: any[] = await res.json()
  const q = query.toLowerCase()
  return all.filter(c => c.name.toLowerCase().includes(q)).slice(0, 10).map(c => ({ id: c.id, name: c.name }))
}

export async function getSiteCategories(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/sites/MLA/categories`, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) return []
  const data: any[] = await res.json()
  return data.map(c => ({ id: c.id, name: c.name }))
}

export async function getCategoryPredictor(accessToken: string, title: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/sites/MLA/category_predictor/predict?q=${encodeURIComponent(title)}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
  })
  if (!res.ok) return []
  const data: any[] = await res.json()
  return data.slice(0, 5).map(c => ({ id: c.id, name: c.name }))
}