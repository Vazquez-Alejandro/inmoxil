import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = session.user as any
  if (!user.id) return null
  return { id: user.id as string, email: user.email as string, name: user.name as string | null, role: user.role as string }
}

export async function requireWorkspaceAuth(workspaceId: string) {
  const user = await requireAuth()
  if (!user) return { user: null, workspace: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const workspace = await queryOne('SELECT * FROM workspaces WHERE id = $1', [workspaceId])
  if (!workspace) return { user, workspace: null, error: NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 }) }

  const membership = await queryOne('SELECT workspace_id FROM users WHERE id = $1 AND workspace_id = $2', [user.id, workspaceId])
  if (!membership) return { user, workspace: null, error: NextResponse.json({ error: 'No tenés acceso a este workspace' }, { status: 403 }) }

  return { user, workspace, error: null }
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (!user) return { user: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const membership = await queryOne('SELECT role FROM users WHERE id = $1', [user.id])
  if (!membership || membership.role !== 'owner') {
    return { user, error: NextResponse.json({ error: 'No tenés permisos de administrador' }, { status: 403 }) }
  }

  return { user, error: null }
}
