import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getOwnerFromCookie } from '@/lib/owner-auth'

export async function GET() {
  try {
    const owner = getOwnerFromCookie()
    if (!owner) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const tickets = await query(
      `SELECT t.*, p.title as property_title, p.address as property_address
       FROM maintenance_tickets t
       LEFT JOIN properties p ON p.id = t.property_id
       WHERE p.owner_id=$1
       ORDER BY t.created_at DESC`,
      [owner.id]
    )

    return NextResponse.json({ tickets: tickets || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
