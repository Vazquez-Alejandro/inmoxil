import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, contractId, email } = body

    if (!workspaceId || !contractId || !email) {
      return NextResponse.json({ error: 'workspaceId, contractId y email requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    // Verify contract belongs to workspace
    const contract = await queryOne(
      'SELECT id FROM contracts WHERE id=$1 AND workspace_id=$2',
      [contractId, workspaceId]
    )
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    // Create or update access token
    const existing = await queryOne(
      'SELECT id, token FROM tenant_access_tokens WHERE contract_id=$1 AND email=$2',
      [contractId, email]
    )

    let token: string
    if (existing) {
      // Regenerate token
      await queryOne(
        'UPDATE tenant_access_tokens SET token=gen_random_uuid(), created_at=NOW() WHERE id=$1 RETURNING token',
        [existing.id]
      )
      const updated = await queryOne('SELECT token FROM tenant_access_tokens WHERE id=$1', [existing.id])
      token = updated.token
    } else {
      const newToken = await queryOne(
        `INSERT INTO tenant_access_tokens (workspace_id, contract_id, email)
         VALUES ($1, $2, $3) RETURNING token`,
        [workspaceId, contractId, email]
      )
      token = newToken.token
    }

    return NextResponse.json({
      success: true,
      token,
      url: `/tenant?token=${token}`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const contractId = searchParams.get('contractId')

    if (!workspaceId || !contractId) {
      return NextResponse.json({ error: 'workspaceId y contractId requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const contract = await queryOne(
      'SELECT id FROM contracts WHERE id=$1 AND workspace_id=$2',
      [contractId, workspaceId]
    )
    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })

    const tokens = await query(
      'SELECT id, email, token, last_access_at, created_at FROM tenant_access_tokens WHERE contract_id=$1 AND workspace_id=$2 ORDER BY created_at DESC',
      [contractId, workspaceId]
    )

    return NextResponse.json({ tokens: tokens || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
