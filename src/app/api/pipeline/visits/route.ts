import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const rows = await query(
      `SELECT a.*, pl.full_name, pl.phone, pl.stage_id, ps.name as stage_name
       FROM pipeline_activities a
       JOIN pipeline_leads pl ON pl.id = a.lead_id
       JOIN pipeline_stages ps ON ps.id = pl.stage_id
       WHERE pl.workspace_id=$1 AND a.type='visita'
       ORDER BY a.scheduled_at DESC NULLS LAST, a.created_at DESC`,
      [workspaceId]
    )

    return NextResponse.json({ visits: rows || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
