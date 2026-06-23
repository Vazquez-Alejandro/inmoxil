import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)
    const ws = await queryOne('SELECT * FROM workspaces WHERE id=$1', [workspaceId])
    return NextResponse.json({ workspace: ws })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, ...fields } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)

    const allowed = [
      'name', 'slug', 'logo_url', 'primary_color', 'secondary_color', 'accent_color',
      'public_catalog_enabled', 'pub_catalog_slug',
      'contact_email', 'contact_phone', 'contact_address',
      'social_instagram', 'social_facebook', 'social_twitter', 'social_linkedin',
      'whatsapp_number', 'timezone',
    ]

    const updates: string[] = []
    const vals: any[] = []
    let idx = 1
    for (const key of allowed) {
      if (key in fields) {
        updates.push(`${key === 'name' ? 'name' : key}=$${idx}`)
        vals.push(fields[key])
        idx++
      }
    }
    if (updates.length === 0) return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })

    vals.push(wsId)
    const sql = `UPDATE workspaces SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`
    const ws = await queryOne(sql, vals)
    return NextResponse.json({ success: true, workspace: ws })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
