import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { matchLeadToProperties } from '@/lib/matching/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const leadId = searchParams.get('leadId')
    if (!workspaceId || !leadId) return NextResponse.json({ error: 'workspaceId y leadId requeridos' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const result = await matchLeadToProperties(workspaceId, leadId)
    if (!result) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}