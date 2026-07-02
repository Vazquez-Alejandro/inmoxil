import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { query, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const templates = await query(
      `SELECT * FROM expensa_templates WHERE workspace_id=$1 ORDER BY name ASC`,
      [workspaceId]
    )

    return NextResponse.json({ templates: templates || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, name, maintenanceFee, waterFee, gasFee, electricityFee, insuranceFee, adminFee, otherFees } = body

    if (!workspaceId || !name) {
      return NextResponse.json({ error: 'workspaceId y name requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const result = await queryOne(
      `INSERT INTO expensa_templates (workspace_id, name, maintenance_fee, water_fee, gas_fee, electricity_fee, insurance_fee, admin_fee, other_fees)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [workspaceId, name, maintenanceFee || 0, waterFee || 0, gasFee || 0, electricityFee || 0, insuranceFee || 0, adminFee || 0, otherFees || 0]
    )

    return NextResponse.json({ success: true, template: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const id = searchParams.get('id')
    if (!workspaceId || !id) return NextResponse.json({ error: 'workspaceId y id requeridos' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    await queryOne('DELETE FROM expensa_templates WHERE id=$1 AND workspace_id=$2', [id, workspaceId])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
