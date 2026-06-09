import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const property = await queryOne('SELECT workspace_id FROM properties WHERE id = $1', [params.id])
    if (!property) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const membership = await queryOne('SELECT workspace_id FROM users WHERE id = $1 AND workspace_id = $2', [user.id, property.workspace_id])
    if (!membership) return NextResponse.json({ error: 'No tenés acceso' }, { status: 403 })

    await query('DELETE FROM properties WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
