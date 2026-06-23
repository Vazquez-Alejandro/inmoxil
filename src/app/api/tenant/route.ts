import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const access = await queryOne(
      `SELECT ta.*, c.title as contract_title, c.number as contract_number,
              c.lessor_name, c.lessor_email, c.lessor_phone,
              c.property_address, c.property_city,
              c.amount, c.currency, c.start_date, c.end_date, c.status as contract_status,
              w.name as workspace_name, w.contact_email, w.contact_phone, w.whatsapp_number,
              w.primary_color, w.secondary_color
       FROM tenant_access_tokens ta
       JOIN contracts c ON c.id = ta.contract_id
       JOIN workspaces w ON w.id = ta.workspace_id
       WHERE ta.token=$1 AND ta.created_at > NOW() - INTERVAL '365 days'`,
      [token]
    )
    if (!access) return NextResponse.json({ error: 'Acceso no válido o expirado' }, { status: 404 })

    await queryOne('UPDATE tenant_access_tokens SET last_access_at=NOW() WHERE id=$1', [access.id])

    const payments = await query(
      'SELECT * FROM payments WHERE contract_id=$1 ORDER BY created_at DESC LIMIT 20',
      [access.contract_id]
    )

    const tickets = await query(
      `SELECT * FROM maintenance_tickets
       WHERE property_id=(SELECT property_id FROM contracts WHERE id=$1)
       ORDER BY created_at DESC LIMIT 10`,
      [access.contract_id]
    )

    return NextResponse.json({
      tenant: { name: access.name, email: access.email },
      contract: {
        title: access.contract_title, number: access.contract_number,
        lessorName: access.lessor_name, lessorEmail: access.lessor_email, lessorPhone: access.lessor_phone,
        propertyAddress: access.property_address, propertyCity: access.property_city,
        amount: access.amount, currency: access.currency,
        startDate: access.start_date, endDate: access.end_date, status: access.contract_status,
      },
      workspace: {
        name: access.workspace_name, contactEmail: access.contact_email,
        contactPhone: access.contact_phone, whatsapp: access.whatsapp_number,
        primaryColor: access.primary_color, secondaryColor: access.secondary_color,
      },
      payments,
      tickets,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
