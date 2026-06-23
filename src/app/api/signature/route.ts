import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const contractId = searchParams.get('contractId')
    await requireWorkspaceAuth(workspaceId)

    let sql = 'SELECT sr.*, c.title as contract_title, c.number as contract_number FROM signature_requests sr JOIN contracts c ON c.id = sr.contract_id WHERE sr.workspace_id=$1'
    const params: any[] = [workspaceId]
    if (contractId) { params.push(contractId); sql += ` AND sr.contract_id=$${params.length}` }
    sql += ' ORDER BY sr.created_at DESC'

    const requests = await query(sql, params)
    return NextResponse.json({ requests })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, contractId, signerName, signerEmail, signerType } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    const wsId = workspaceId
    await requireWorkspaceAuth(wsId)

    const req = await queryOne(
      `INSERT INTO signature_requests (contract_id, workspace_id, signer_name, signer_email, signer_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [contractId, wsId, signerName, signerEmail, signerType]
    )

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://inmoxil.vercel.app'
    const signUrl = `${origin}/firmar/${req.token}`

    return NextResponse.json({ success: true, request: req, signUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
