import { query, queryOne } from '@/lib/db'

export async function upsertProperty(prop: any, workspaceId: string): Promise<any> {
  const beds = prop.beds || prop.features?.beds || null
  const baths = prop.baths || prop.features?.baths || null
  const sqm = prop.sqm || prop.features?.area || prop.features?.sqm || null

  const existing = await queryOne(
    'SELECT id FROM properties WHERE workspace_id=$1 AND url=$2',
    [workspaceId, prop.url || '']
  )

  if (existing) {
    const result = await queryOne(
      `UPDATE properties SET title=$1, price=$2, currency=$3, address=$4, neighborhood=$5,
       city=$6, state=$7, beds=$8, baths=$9, sqm=$10, property_type=$11, status=$12,
       photos=$13, description=$14, updated_at=NOW()
       WHERE id=$15 RETURNING id`,
      [prop.title || '', prop.price || null, prop.currency || 'USD',
       prop.address || '', prop.neighborhood || '', prop.city || '',
       prop.state || '', beds, baths, sqm, prop.propertyType || 'apartment',
       'active', prop.photos || [], prop.description || '', existing.id]
    )
    return result
  }

  const result = await queryOne(
    `INSERT INTO properties (workspace_id, portal, title, price, currency, address, neighborhood, city, state, country, beds, baths, sqm, property_type, status, url, photos, description, features, source_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
    [workspaceId, prop.portal || 'unknown', prop.title || '', prop.price || null, prop.currency || 'USD',
     prop.address || '', prop.neighborhood || '', prop.city || '', prop.state || '', prop.country || '',
     beds, baths, sqm, prop.propertyType || 'apartment', 'active', prop.url || '',
     prop.photos || [], prop.description || '',
     prop.features ? (Array.isArray(prop.features) ? prop.features : Object.values(prop.features).filter(Boolean).map(String)) : [],
     prop.url || '']
  )
  return result
}