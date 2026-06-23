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

    const properties = await query(
      `SELECT id, title, price, currency, address, neighborhood, city, beds, baths, sqm,
              property_type, status, photos, description, created_at
       FROM properties WHERE owner_id=$1 ORDER BY created_at DESC`,
      [owner.id]
    )

    return NextResponse.json({ properties: properties || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
