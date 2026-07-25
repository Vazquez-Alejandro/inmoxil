import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { queryOne } from '@/lib/db'
import { createOwnerToken } from '@/lib/owner-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    const owner = await queryOne('SELECT * FROM property_owners WHERE email=$1', [email])
    if (!owner) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

    const valid = await compare(password, owner.password_hash)
    if (!valid) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

    const token = createOwnerToken({ id: owner.id, email: owner.email, name: owner.name, workspaceId: owner.workspace_id })

    const response = NextResponse.json({ success: true, owner: { id: owner.id, name: owner.name, email: owner.email } })
    response.cookies.set('owner_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
