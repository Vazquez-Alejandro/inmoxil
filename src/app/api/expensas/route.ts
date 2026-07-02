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

    const expensas = await query(
      `SELECT * FROM expensas WHERE workspace_id=$1 ORDER BY period DESC, property_name ASC`,
      [workspaceId]
    )

    return NextResponse.json({ expensas: expensas || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, propertyName, period, maintenanceFee, waterFee, gasFee, electricityFee, insuranceFee, adminFee, otherFees, currency } = body

    if (!workspaceId || !propertyName || !period) {
      return NextResponse.json({ error: 'workspaceId, propertyName y period requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const totalExpensa = (maintenanceFee || 0) + (waterFee || 0) + (gasFee || 0) + (electricityFee || 0) + (insuranceFee || 0) + (adminFee || 0) + (otherFees || 0)

    const result = await queryOne(
      `INSERT INTO expensas (workspace_id, property_name, period, maintenance_fee, water_fee, gas_fee, electricity_fee, insurance_fee, admin_fee, other_fees, total_expensa, currency, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', NOW() + INTERVAL '10 days')
       RETURNING *`,
      [workspaceId, propertyName, period, maintenanceFee || 0, waterFee || 0, gasFee || 0, electricityFee || 0, insuranceFee || 0, adminFee || 0, otherFees || 0, totalExpensa, currency || 'ARS']
    )

    return NextResponse.json({ success: true, expensa: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, expensaId, status } = body

    if (!workspaceId || !expensaId) {
      return NextResponse.json({ error: 'workspaceId y expensaId requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const updates: string[] = []
    const params: any[] = []
    let idx = 1

    if (status) {
      updates.push(`status=$${idx}`)
      params.push(status)
      idx++
      if (status === 'paid') {
        updates.push(`paid_date=NOW()`)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    params.push(expensaId)
    await queryOne(
      `UPDATE expensas SET ${updates.join(', ')} WHERE id=$${idx} AND workspace_id=$${idx + 1} RETURNING *`,
      [...params, workspaceId]
    )

    return NextResponse.json({ success: true })
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

    await queryOne('DELETE FROM expensas WHERE id=$1 AND workspace_id=$2', [id, workspaceId])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
