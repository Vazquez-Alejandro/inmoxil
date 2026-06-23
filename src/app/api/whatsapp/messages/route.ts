import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)
    const messages = await query(
      `SELECT m.*, pl.full_name as lead_name, p.title as property_title
       FROM whatsapp_messages m
       LEFT JOIN pipeline_leads pl ON pl.id = m.lead_id
       LEFT JOIN properties p ON p.id = m.property_id
       WHERE m.workspace_id=$1
       ORDER BY m.created_at DESC LIMIT 100`,
      [workspaceId]
    )
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, leadId, propertyId, content, direction } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)

    const msg = await queryOne(
      `INSERT INTO whatsapp_messages (workspace_id, lead_id, property_id, direction, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [wsId, leadId || null, propertyId || null, direction || 'sent', content]
    )
    return NextResponse.json({ success: true, message: msg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
