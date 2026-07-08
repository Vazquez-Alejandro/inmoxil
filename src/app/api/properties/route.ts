import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { runAutoMatching } from '@/lib/matching/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const data = await query('SELECT * FROM properties WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 200', [workspaceId])
    return NextResponse.json({ properties: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, properties } = body
    if (!workspaceId || !properties?.length) return NextResponse.json({ error: 'workspaceId and properties required' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    let count = 0
    let totalMatches = 0
    let totalHighConfidence = 0
    const newPropertyIds: string[] = []

    for (const p of properties) {
      const beds = p.beds || p.features?.beds || null
      const baths = p.baths || p.features?.baths || null
      const sqm = p.sqm || p.features?.area || p.features?.sqm || null
      const result = await queryOne(
        `INSERT INTO properties (workspace_id, portal, title, price, currency, address, neighborhood, city, state, country, beds, baths, sqm, property_type, status, url, photos, description, features, source_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
        [
          workspaceId, p.portal || 'unknown', p.title || '', p.price || null, p.currency || 'USD',
          p.address || '', p.neighborhood || '', p.city || '', p.state || '', p.country || '',
          beds, baths, sqm, p.propertyType || 'apartment', 'active', p.url || '',
          p.photos || [], p.description || '',
          p.features ? (Array.isArray(p.features) ? p.features : Object.values(p.features).filter(Boolean).map(String)) : [],
          p.url || '',
        ]
      )
      if (result?.id) {
        newPropertyIds.push(result.id)
      }
      count++
    }

    // Run auto-matching for each new property
    for (const propertyId of newPropertyIds) {
      try {
        const matchResult = await runAutoMatching(workspaceId, propertyId)
        totalMatches += matchResult.matchesFound
        totalHighConfidence += matchResult.highConfidence
      } catch (matchError) {
        console.error(`Auto-matching failed for property ${propertyId}:`, matchError)
      }
    }

    return NextResponse.json({
      success: true,
      count,
      matching: {
        propertiesChecked: newPropertyIds.length,
        matchesFound: totalMatches,
        highConfidence: totalHighConfidence,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
