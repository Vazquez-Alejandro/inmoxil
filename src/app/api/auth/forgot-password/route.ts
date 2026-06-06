import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Always return success to prevent email enumeration
    const user = await queryOne('SELECT id FROM users WHERE email = $1', [email])

    if (user) {
      // Generate reset token (valid for 1 hour)
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 3600000).toISOString()

      // Store token in a simple way (in production, use a separate table)
      // For now, we'll just log it since email isn't configured yet
      console.log(`[Password Reset] Token for ${email}: ${token}`)
      console.log(`[Password Reset] Expires: ${expires}`)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
