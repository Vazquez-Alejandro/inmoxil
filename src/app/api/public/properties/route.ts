import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const beds = searchParams.get('beds')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // First get the workspace by catalog slug
    const workspace = await query(
      'SELECT id, name FROM workspaces WHERE pub_catalog_slug=$1 AND public_catalog_enabled=true',
      [slug]
    )
    if (!workspace || workspace.length === 0) {
      return NextResponse.json({ properties: [], workspace: null })
    }

    const wsId = workspace[0].id
    const conditions = ['p.workspace_id=$1', 'p.public_visible=true']
    const values: any[] = [wsId]
    let idx = 2

    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.address ILIKE $${idx} OR p.neighborhood ILIKE $${idx} OR p.description ILIKE $${idx})`)
      values.push(`%${search}%`)
      idx++
    }
    if (type) { conditions.push(`p.property_type=$${idx++}`); values.push(type) }
    if (priceMin) { conditions.push(`p.price>=$${idx++}`); values.push(parseFloat(priceMin)) }
    if (priceMax) { conditions.push(`p.price<=$${idx++}`); values.push(parseFloat(priceMax)) }
    if (beds) { conditions.push(`p.beds=$${idx++}`); values.push(parseInt(beds)) }

    const rows = await query(
      `SELECT p.id, p.title, p.price, p.currency, p.address, p.neighborhood, p.city,
              p.beds, p.baths, p.sqm, p.property_type, p.photos, p.description, p.lat, p.lng
       FROM properties p
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...values, limit, offset]
    )

    const countResult = await query(
      `SELECT COUNT(*)::int as total FROM properties p WHERE ${conditions.join(' AND ')}`,
      values
    )

    return NextResponse.json({
      properties: rows || [],
      workspace: workspace[0],
      total: countResult[0]?.total || 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
