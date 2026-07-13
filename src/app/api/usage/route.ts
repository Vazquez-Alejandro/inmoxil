import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Se requiere workspaceId' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const [properties, pipelineLeads, contracts] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM properties WHERE workspace_id=$1', [workspaceId]),
      query('SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1', [workspaceId]),
      query('SELECT COUNT(*)::int as count FROM contracts WHERE workspace_id=$1', [workspaceId]),
    ])

    return NextResponse.json({
      properties: properties?.[0]?.count ?? 0,
      pipelineLeads: pipelineLeads?.[0]?.count ?? 0,
      contracts: contracts?.[0]?.count ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
