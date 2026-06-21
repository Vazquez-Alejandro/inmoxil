import { getMLToken, saveMLToken } from '@/lib/ml/db'
import { refreshToken } from '@/lib/ml/api'
import type { PublishChannel } from '../types'

const CLIENT_ID = process.env.ML_CLIENT_ID || ''
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET || ''

function buildItem(property: any, channel: PublishChannel) {
  const price = parseFloat(property.price) || 0
  const currency = property.currency || 'ARS'

  const pictures = (property.photos || []).map((url: string) => ({ source: url.startsWith('http') ? url : '' })).filter((p: any) => p.source)

  const title = property.title || `${property.propertyType || 'Propiedad'} en ${property.city || ''}`.trim()
  const item: Record<string, any> = {
    title: title.slice(0, 60),
    price: currency === 'USD' ? Math.round(price * 1200) : Math.round(price),
    currency_id: 'ARS',
    available_quantity: 1,
    condition: 'used',
    listing_type_id: channel.config.listingType || 'gold_special',
    pictures,
    description: { plain_text: (property.description || '').slice(0, 5000) || `${title} - ${property.address || ''}, ${property.city || ''}`.slice(0, 5000) },
    category_id: channel.config.categoryId || 'MLA1459',
  }

  const beds = parseInt(property.beds) || 0
  const baths = parseInt(property.baths) || 0
  const sqm = parseFloat(property.sqm) || 0

  if (beds || baths || sqm) {
    item.attributes = []
    if (beds) item.attributes.push({ id: 'ROOMS', value_name: `${beds} ambientes` })
    if (baths) item.attributes.push({ id: 'BATHROOMS', value_name: `${baths} baños` })
    if (sqm) item.attributes.push({ id: 'TOTAL_SQUARE_METER', value_name: `${sqm} m²` })
  }

  return item
}

export async function publishToML(property: any, channel: PublishChannel): Promise<{ success: boolean; externalId?: string; externalUrl?: string; error?: string }> {
  try {
    const token = await getMLToken(channel.workspaceId)
    if (!token) return { success: false, error: 'No conectado a MercadoLibre. Conectá tu cuenta primero.' }

    if (new Date(token.expiresAt) < new Date()) {
      if (!CLIENT_ID || !CLIENT_SECRET) return { success: false, error: 'ML_CLIENT_ID/ML_CLIENT_SECRET no configurados' }
      const refreshed = await refreshToken(CLIENT_ID, CLIENT_SECRET, token.refreshToken)
      await saveMLToken(channel.workspaceId, refreshed)
      token.accessToken = refreshed.accessToken
      token.userId = refreshed.userId
    }

    const item = buildItem(property, channel)

    const res = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.message || data.cause?.[0]?.message || `Error ${res.status} de ML` }
    }

    return {
      success: true,
      externalId: data.id,
      externalUrl: data.permalink || `https://www.mercadolibre.com.ar/item/${data.id}`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al publicar en ML' }
  }
}