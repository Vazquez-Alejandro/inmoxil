import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getContract, updateContract, deleteContract } from '@/lib/contracts/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await getContract(params.id)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    return NextResponse.json({ contract })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await getContract(params.id)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    const body = await request.json()
    const updated = await updateContract(params.id, body)
    return NextResponse.json({ success: true, contract: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await getContract(params.id)
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const { error } = await requireWorkspaceAuth(contract.workspaceId)
    if (error) return error

    await deleteContract(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}