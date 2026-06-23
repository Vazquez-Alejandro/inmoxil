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
    await requireWorkspaceAuth(workspaceId)

    const status = searchParams.get('status') || ''
    const contractId = searchParams.get('contractId') || ''
    let sql = `SELECT p.*, c.title as contract_title, c.number as contract_number,
               pr.title as property_title
               FROM payments p
               LEFT JOIN contracts c ON c.id = p.contract_id
               LEFT JOIN properties pr ON pr.id = p.property_id
               WHERE p.workspace_id=$1`
    const params: any[] = [workspaceId]
    if (status) { params.push(status); sql += ` AND p.status=$${params.length}` }
    if (contractId) { params.push(contractId); sql += ` AND p.contract_id=$${params.length}` }
    sql += ' ORDER BY p.created_at DESC LIMIT 100'

    const payments = await query(sql, params)

    const summary = await query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(amount),0) as total
       FROM payments WHERE workspace_id=$1 GROUP BY status`,
      [workspaceId]
    )

    return NextResponse.json({ payments, summary })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, contractId, propertyId, amount, currency, concept, dueDate, periodFrom, periodTo, notes } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const payment = await queryOne(
      `INSERT INTO payments (workspace_id, contract_id, property_id, amount, currency, concept, due_date, period_from, period_to, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [workspaceId, contractId || null, propertyId || null, amount, currency || 'ARS', concept, dueDate || null, periodFrom || null, periodTo || null, notes || null]
    )
    return NextResponse.json({ success: true, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const body = await request.json()
    const { workspaceId, paymentId, status, paymentMethod } = body
    if (!workspaceId) return NextResponse.json({ error: 'Falta workspaceId' }, { status: 400 })
    await requireWorkspaceAuth(workspaceId)

    const updates: string[] = ['status=$1']
    const params: any[] = [status]
    if (status === 'paid') {
      updates.push('paid_at=NOW()')
      updates.push(`payment_method=$${params.length + 1}`)
      params.push(paymentMethod || 'manual')
    }
    params.push(paymentId, workspaceId)
    const payment = await queryOne(
      `UPDATE payments SET ${updates.join(', ')} WHERE id=$${params.length - 1} AND workspace_id=$${params.length} RETURNING *`,
      params
    )
    return NextResponse.json({ success: true, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
