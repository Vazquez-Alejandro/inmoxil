import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { createCommission, getCommissions, updateCommission, deleteCommission, getCommissionStats } from '@/lib/commissions/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    if (searchParams.get('stats') === 'true') {
      const stats = await getCommissionStats(workspaceId)
      return NextResponse.json({ stats })
    }

    const status = searchParams.get('status') || undefined
    const commissions = await getCommissions(workspaceId, status)
    return NextResponse.json({ commissions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, ...data } = body
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const commission = await createCommission({ ...data, workspaceId })
    return NextResponse.json({ success: true, commission })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, id, ...data } = body
    if (!workspaceId || !id) return NextResponse.json({ error: 'workspaceId e id requeridos' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const commission = await updateCommission(id, data, workspaceId)
    return NextResponse.json({ success: true, commission })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const id = searchParams.get('id')
    if (!workspaceId || !id) return NextResponse.json({ error: 'workspaceId e id requeridos' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    await deleteCommission(id, workspaceId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}