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
    const templates = await query(
      'SELECT * FROM whatsapp_templates WHERE workspace_id=$1 ORDER BY created_at DESC',
      [workspaceId]
    )
    return NextResponse.json({ templates })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, name, content, variables } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)

    const template = await queryOne(
      `INSERT INTO whatsapp_templates (workspace_id, name, content, variables)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [wsId, name, content, JSON.stringify(variables || [])]
    )
    return NextResponse.json({ success: true, template })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, templateId } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)
    await query('DELETE FROM whatsapp_templates WHERE id=$1 AND workspace_id=$2', [templateId, wsId])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
