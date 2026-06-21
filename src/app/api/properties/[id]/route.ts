import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

async function getProperty(id: string) {
  return queryOne('SELECT workspace_id FROM properties WHERE id = $1', [id])
}

async function checkMembership(userId: string, workspaceId: string) {
  return queryOne('SELECT workspace_id FROM users WHERE id = $1 AND workspace_id = $2', [userId, workspaceId])
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const property = await queryOne('SELECT * FROM properties WHERE id=$1', [params.id])
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    return NextResponse.json({ property })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const property = await getProperty(params.id)
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const membership = await checkMembership(user.id, property.workspace_id)
    if (!membership) return NextResponse.json({ error: 'No tenés acceso' }, { status: 403 })

    const body = await request.json()
    const allowed = [
      'title', 'price', 'currency', 'address', 'neighborhood', 'city', 'state', 'country',
      'beds', 'baths', 'sqm', 'property_type', 'status', 'url', 'description', 'lat', 'lng', 'photos',
    ]
    const sets: string[] = []
    const values: any[] = []
    let idx = 1
    for (const field of allowed) {
      if (body[field] !== undefined) {
        sets.push(`${field}=$${idx++}`)
        values.push(body[field])
      }
    }
    if (sets.length === 0) return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })

    values.push(params.id)
    const updated = await queryOne(
      `UPDATE properties SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    )
    return NextResponse.json({ success: true, property: updated })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const property = await getProperty(params.id)
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const membership = await checkMembership(user.id, property.workspace_id)
    if (!membership) return NextResponse.json({ error: 'No tenés acceso' }, { status: 403 })

    await query('DELETE FROM properties WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
