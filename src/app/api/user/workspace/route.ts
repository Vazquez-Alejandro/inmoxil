import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const userData = await queryOne('SELECT workspace_id FROM users WHERE id = $1', [user.id])
    if (!userData?.workspace_id) return NextResponse.json({ workspace: null })

    const ws = await queryOne('SELECT * FROM workspaces WHERE id = $1', [userData.workspace_id])
    return NextResponse.json({ workspace: ws })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
