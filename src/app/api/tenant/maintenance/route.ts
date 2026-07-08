import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, title, description } = body

    if (!token || !title) {
      return NextResponse.json({ error: 'Token y título son requeridos' }, { status: 400 })
    }

    // Validate token
    const access = await queryOne(
      `SELECT ta.*, c.property_id
       FROM tenant_access_tokens ta
       JOIN contracts c ON c.id = ta.contract_id
       WHERE ta.token=$1 AND ta.created_at > NOW() - INTERVAL '365 days'`,
      [token]
    )
    if (!access) return NextResponse.json({ error: 'Acceso no válido' }, { status: 404 })

    // Create maintenance ticket
    const ticket = await queryOne(
      `INSERT INTO maintenance_tickets (workspace_id, property_id, tenant_name, tenant_phone, tenant_email, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
      [
        access.workspace_id,
        access.property_id,
        access.name,
        null,
        access.email,
        `[${title}] ${description || ''}`.trim(),
      ]
    )

    return NextResponse.json({ success: true, ticket })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
