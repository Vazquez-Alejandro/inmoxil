import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth, requireWorkspaceOwner } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)
    const perms = await query('SELECT * FROM role_permissions WHERE workspace_id=$1 ORDER BY role, permission', [workspaceId])
    return NextResponse.json({ permissions: perms })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, role, permissions } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)
    const { error: ownerError } = await requireWorkspaceOwner(wsId)
    if (ownerError) return ownerError
    await query('DELETE FROM role_permissions WHERE workspace_id=$1 AND role=$2', [wsId, role])
    for (const perm of permissions) {
      await query('INSERT INTO role_permissions (workspace_id, role, permission) VALUES ($1, $2, $3)', [wsId, role, perm])
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
