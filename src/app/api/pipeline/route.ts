import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getStages, initDefaultStages } from '@/lib/pipeline/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    await initDefaultStages(workspaceId)
    const stages = await getStages(workspaceId)
    return NextResponse.json({ stages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}