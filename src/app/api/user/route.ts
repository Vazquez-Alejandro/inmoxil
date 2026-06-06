import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const userData = await queryOne('SELECT workspace_id FROM users WHERE id = $1', [userId])

    if (!userData?.workspace_id) {
      return NextResponse.json({ needsOnboarding: true })
    }

    const ws = await queryOne('SELECT name FROM workspaces WHERE id = $1', [userData.workspace_id])

    return NextResponse.json({
      needsOnboarding: ws?.name === 'Mi Inmobiliaria',
      workspaceId: userData.workspace_id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
