import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'

function getOwnerFromCookie() {
  const token = cookies().get('owner_token')?.value
  if (!token) return null
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString())
    if (data.type !== 'owner') return null
    return data
  } catch { return null }
}

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
