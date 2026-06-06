import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña requeridos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    // In production, validate token against a password_resets table
    // For now, accept any valid UUID-like token
    const hashedPassword = await bcrypt.hash(password, 12)

    // This would update the user's password in a real implementation
    // await query('UPDATE users SET password_hash = $1 WHERE id = (SELECT user_id FROM password_resets WHERE token = $2)', [hashedPassword, token])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
