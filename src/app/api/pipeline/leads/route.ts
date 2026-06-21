import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth, requireAuth } from '@/lib/api-auth'
import { getLeads } from '@/lib/pipeline/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const stageId = searchParams.get('stageId') || undefined
    const search = searchParams.get('search') || undefined
    const user = await requireAuth()

    const userRole = (user as any)?.role_in_workspace || 'owner'
    const assignedTo = userRole === 'agent' ? user!.id : undefined

    const leads = await getLeads(workspaceId, stageId, search, assignedTo)

    return NextResponse.json({ leads })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}