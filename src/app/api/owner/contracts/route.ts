import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOwnerFromCookie } from '@/lib/owner-auth'

export async function GET() {
  try {
    const owner = getOwnerFromCookie()
    if (!owner) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const contracts = await query(
      `SELECT c.id, c.code, c.property_id, c.tenant_name, c.monthly_price, c.currency,
              c.start_date, c.end_date, c.status, c.adjustment_index,
              p.title as property_title, p.address as property_address
       FROM contracts c
       LEFT JOIN properties p ON p.id = c.property_id
       WHERE c.owner_id=$1
       ORDER BY c.created_at DESC`,
      [owner.id]
    )

    return NextResponse.json({ contracts: contracts || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
