import { NextResponse } from 'next/server'
import { queryOne, insertOne } from '@/lib/db'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfter } = await checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000)
    if (!allowed) return NextResponse.json({ error: `Demasiados intentos. Esperá ${retryAfter}s` }, { status: 429 })

    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const user = await queryOne('SELECT id, full_name FROM users WHERE email = $1', [email])
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 3600000).toISOString()
      await insertOne('password_resets', { user_id: user.id, token, expires_at: expires })
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inmoxil.vercel.app'
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      await sendPasswordResetEmail(email, user.full_name || 'Usuario', resetUrl)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
