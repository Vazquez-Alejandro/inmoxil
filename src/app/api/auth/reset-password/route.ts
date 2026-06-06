import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña requeridos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const resetRecord = await queryOne(
      'SELECT user_id, expires_at, used FROM password_resets WHERE token = $1',
      [token]
    )

    if (!resetRecord) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    if (resetRecord.used) {
      return NextResponse.json({ error: 'Este enlace ya fue utilizado' }, { status: 400 })
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este enlace expiró. Solicitá uno nuevo' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, resetRecord.user_id])
    await query('UPDATE password_resets SET used = TRUE WHERE token = $1', [token])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Reset Password] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
