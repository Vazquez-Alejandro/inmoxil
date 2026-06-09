import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const userData = await queryOne('SELECT workspace_id FROM users WHERE id = $1', [user.id])
    if (!userData?.workspace_id) return NextResponse.json({ needsOnboarding: true })

    const ws = await queryOne('SELECT name FROM workspaces WHERE id = $1', [userData.workspace_id])
    return NextResponse.json({ needsOnboarding: ws?.name === 'Mi Inmobiliaria', workspaceId: userData.workspace_id })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
