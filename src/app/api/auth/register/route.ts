import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, insertOne } from '@/lib/db'
import { createCustomer } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName } = await request.json()

    if (!email || !password || !name || !companyName) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
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
      password_hash: hashedPassword,
      full_name: name,
      workspace_id: workspace.id,
      role: 'owner',
    })

    // Create Stripe customer (non-blocking)
    try {
      const customer = await createCustomer(email, companyName)
      await query('UPDATE workspaces SET stripe_customer_id = $1 WHERE id = $2', [customer.id, workspace.id])
    } catch (e) {
      console.error('[Register] Stripe customer creation failed:', e)
    }

    // Send welcome email (non-blocking)
    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(email, name)
    } catch (e) {
      console.error('[Register] Welcome email failed:', e)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 })
  }
}
