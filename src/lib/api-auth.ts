import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { queryOne } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = session.user as any
  if (!user.id) return null
  return { id: user.id as string, email: user.email as string, name: user.name as string | null, role: user.role as string, role_in_workspace: user.role_in_workspace as string | undefined }
}

export async function requireWorkspaceAuth(workspaceId: string) {
  const user = await requireAuth()
  if (!user) return { user: null, workspace: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const workspace = await queryOne('SELECT * FROM workspaces WHERE id = $1', [workspaceId])
  if (!workspace) return { user, workspace: null, error: NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 }) }

  const membership = await queryOne('SELECT workspace_id FROM users WHERE id = $1 AND workspace_id = $2', [user.id, workspaceId])
  if (!membership) return { user, workspace: null, error: NextResponse.json({ error: 'No tenés acceso a este workspace' }, { status: 403 }) }

  // Trial enforcement: block if trial expired and no active subscription
  if (workspace.trial_ends_at && !workspace.stripe_subscription_id) {
    const trialEnd = new Date(workspace.trial_ends_at)
    if (trialEnd < new Date()) {
      return { user, workspace, error: NextResponse.json({ error: 'Período de prueba finalizado. Elegí un plan para continuar.' }, { status: 402 }) }
    }
  }

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

export async function requireWorkspaceOwner(workspaceId: string) {
  const user = await requireAuth()
  if (!user) return { owner: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const membership = await queryOne(
    'SELECT role_in_workspace, role FROM users WHERE id = $1 AND workspace_id = $2',
    [user.id, workspaceId]
  )
  const isOwner = membership && (membership.role_in_workspace === 'owner' || membership.role === 'owner')
  if (!isOwner) {
    return { owner: null, error: NextResponse.json({ error: 'Solo el dueño del workspace puede realizar esta acción' }, { status: 403 }) }
  }

  return { owner: user, error: null }
}
