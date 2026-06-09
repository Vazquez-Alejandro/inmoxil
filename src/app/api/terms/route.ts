import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function POST() {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    await query('UPDATE users SET terms_accepted_at = now() WHERE id = $1', [user.id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const result = await query('SELECT terms_accepted_at FROM users WHERE id = $1', [user.id])
    const accepted = result?.[0]?.terms_accepted_at != null
    return NextResponse.json({ accepted, acceptedAt: result?.[0]?.terms_accepted_at || null })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
