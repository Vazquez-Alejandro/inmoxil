import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'
import { queryOne, insertOne, query } from '@/lib/db'
import { createCustomer } from '@/lib/stripe'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfter } = await checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)
    if (!allowed) return NextResponse.json({ error: `Demasiados registros. Esperá ${retryAfter}s` }, { status: 429 })

    const isForm = request.headers.get('content-type')?.includes('form-urlencoded')

    let email: string, password: string, name: string, companyName: string
    if (isForm) {
      const formData = await request.formData()
      email = formData.get('email') as string
      password = formData.get('password') as string
      name = formData.get('name') as string
      companyName = formData.get('companyName') as string
    } else {
      const body = await request.json()
      email = body.email
      password = body.password
      name = body.name
      companyName = body.companyName
    }

    if (!email || !password || !name || !companyName) {
      if (isForm) return NextResponse.redirect(new URL('/register?error=campos', request.url))
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }
    if (password.length < 8) {
      if (isForm) return NextResponse.redirect(new URL('/register?error=password', request.url))
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      if (isForm) return NextResponse.redirect(new URL('/register?error=password', request.url))
      return NextResponse.json({ error: 'La contraseña debe tener al menos 1 mayúscula y 1 número' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      if (isForm) return NextResponse.redirect(new URL('/register?error=email-exists', request.url))
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const workspace = await insertOne('workspaces', { name: companyName, slug, trial_ends_at: trialEndsAt })
    const userId = crypto.randomUUID()
    await insertOne('users', { id: userId, email, password_hash: hashedPassword, full_name: name, workspace_id: workspace.id, role: 'owner' })

    try {
      const customer = await createCustomer(email, companyName)
      await query('UPDATE workspaces SET stripe_customer_id = $1 WHERE id = $2', [customer.id, workspace.id])
    } catch {}

    try {
      const { sendWelcomeEmail } = await import('@/lib/email')
      await sendWelcomeEmail(email, name)
    } catch {}

    // Generate session JWT and set cookie
    const token = await encode({
      token: { id: userId, email, name, role: 'owner', workspace_id: workspace.id },
      secret: process.env.NEXTAUTH_SECRET!,
    })

    if (isForm) {
      const response = NextResponse.redirect(new URL('/onboarding', request.url))
      response.cookies.set('next-auth.session-token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      })
      return response
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
