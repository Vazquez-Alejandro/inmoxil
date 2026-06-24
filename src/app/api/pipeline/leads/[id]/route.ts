import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getLead, updateLead, deleteLead } from '@/lib/pipeline/db'
import { createActivity } from '@/lib/pipeline/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    return NextResponse.json({ lead })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    const body = await request.json()
    const updated = await updateLead(params.id, body)
    return NextResponse.json({ success: true, lead: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lead = await getLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(lead.workspaceId)
    if (error) return error

    await deleteLead(params.id)
    await createActivity({ leadId: params.id, type: 'otro', description: 'Lead descartado' })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}