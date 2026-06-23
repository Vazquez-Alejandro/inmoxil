import { NextRequest, NextResponse } from 'next/server'
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

    const [properties, contractsResult, tickets] = await Promise.all([
      query('SELECT COUNT(*)::int as total FROM properties WHERE owner_id=$1', [owner.id]),
      query('SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status=\'active\')::int as active FROM contracts WHERE owner_id=$1', [owner.id]),
      query("SELECT COUNT(*)::int as total, COUNT(*) FILTER (WHERE status='pendiente' OR status='en_proceso')::int as open FROM maintenance_tickets WHERE property_id IN (SELECT id FROM properties WHERE owner_id=$1)", [owner.id]),
    ])

    const totalProperties = properties[0]?.total || 0
    const totalContracts = contractsResult[0]?.total || 0
    const activeContracts = contractsResult[0]?.active || 0
    const openTickets = tickets[0]?.open || 0

    return NextResponse.json({ totalProperties, totalContracts, activeContracts, openTickets })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
