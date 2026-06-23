import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, tenantName, tenantPhone, tenantEmail, description } = body

    if (!propertyId || !tenantName || !description) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const prop = await queryOne('SELECT workspace_id FROM properties WHERE id=$1', [propertyId])
    if (!prop) return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })

    const ticket = await queryOne(
      `INSERT INTO maintenance_tickets (workspace_id, property_id, tenant_name, tenant_phone, tenant_email, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at`,
      [prop.workspace_id, propertyId, tenantName, tenantPhone || null, tenantEmail || null, description]
    )

    return NextResponse.json({ success: true, ticket })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
