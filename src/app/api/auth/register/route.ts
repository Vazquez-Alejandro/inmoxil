import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, insertOne } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName } = await request.json()

    if (!email || !password || !name || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const workspace = await insertOne('workspaces', {
      name: companyName,
      slug,
    })

    const userId = crypto.randomUUID()

    await insertOne('users', {
      id: userId,
      email,
      password: hashedPassword,
      full_name: name,
      workspace_id: workspace.id,
      role: 'owner',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
