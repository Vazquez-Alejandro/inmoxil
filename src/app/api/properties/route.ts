import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const data = await query('SELECT * FROM properties WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100', [workspaceId])

    return NextResponse.json({ properties: data || [] })
  } catch (error) {
    console.error('[Properties] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, properties } = body

    if (!workspaceId || !properties?.length) {
      return NextResponse.json({ error: 'workspaceId and properties required' }, { status: 400 })
    }

    let count = 0
    for (const p of properties) {
      const beds = p.beds || p.features?.beds || null
      const baths = p.baths || p.features?.baths || null
      const sqm = p.sqm || p.features?.area || p.features?.sqm || null
      await query(
        `INSERT INTO properties (workspace_id, portal, title, price, currency, address, neighborhood, city, state, country, beds, baths, sqm, property_type, status, url, photos, description, features, source_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          workspaceId,
          p.portal || 'unknown',
          p.title || '',
          p.price || null,
          p.currency || 'USD',
          p.address || '',
          p.neighborhood || '',
          p.city || '',
          p.state || '',
          p.country || '',
          beds,
          baths,
          sqm,
          p.propertyType || 'apartment',
          'active',
          p.url || '',
          p.photos || [],
          p.description || '',
          p.features ? (Array.isArray(p.features) ? p.features : Object.values(p.features).filter(Boolean).map(String)) : [],
          p.url || '',
        ]
      )
      count++
    }

    return NextResponse.json({ success: true, count })
  } catch (error: any) {
    console.error('[Properties] POST Error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
