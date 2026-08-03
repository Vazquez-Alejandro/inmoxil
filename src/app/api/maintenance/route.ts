import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requireWorkspaceAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const conditions = ['t.workspace_id=$1']
    const values: any[] = [workspaceId]
    let idx = 2
    if (status) { conditions.push(`t.status=$${idx++}`); values.push(status) }
    if (priority) { conditions.push(`t.priority=$${idx++}`); values.push(priority) }

    const rows = await query(
      `SELECT t.*, p.title as property_title, p.address as property_address
       FROM maintenance_tickets t
       LEFT JOIN properties p ON p.id = t.property_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.created_at DESC`,
      values
    )

    return NextResponse.json({ tickets: rows || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, propertyId, tenantName, tenantPhone, tenantEmail, description, priority } = body

    if (!workspaceId || !tenantName || !description) {
      return NextResponse.json({ error: 'workspaceId, tenantName y description requeridos' }, { status: 400 })
    }

    const { error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const ticket = await queryOne(
      `INSERT INTO maintenance_tickets (workspace_id, property_id, tenant_name, tenant_phone, tenant_email, description, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [workspaceId, propertyId || null, tenantName, tenantPhone || null, tenantEmail || null, description, priority || 'normal']
    )

    return NextResponse.json({ success: true, ticket })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
