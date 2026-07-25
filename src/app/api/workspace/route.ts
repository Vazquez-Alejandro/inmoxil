import { NextRequest, NextResponse } from 'next/server'
import { createWorkspace, getWorkspace, getWorkspaceBySlug } from '@/lib/workspace'
import { createCustomer } from '@/lib/stripe'
import { query } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { requireAuth, requireWorkspaceAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { name, slug, email, userId } = await request.json()
    if (!name || !slug || !email || !userId) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    if (userId !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const workspace = await createWorkspace(name, cleanSlug, userId)

    try {
      const customer = await createCustomer(email, name)
      if (customer.id !== 'mp_pending') {
        await query('UPDATE workspaces SET stripe_customer_id=$1 WHERE id=$2', [customer.id, workspace.id])
      }
    } catch {}

    try { await sendWelcomeEmail(email, name) } catch {}

    return NextResponse.json({ success: true, workspace })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspaceId, name, plan, onboardingCompleted } = await request.json()
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { user, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const isAdmin = user?.role === 'owner' || user?.role === 'admin' || user?.role_in_workspace === 'owner' || user?.role_in_workspace === 'admin'

    const updates: string[] = []
    const values: any[] = []
    let idx = 1

    if (name && isAdmin) {
      updates.push(`name = $${idx++}`)
      values.push(name)
    }
    if (plan && isAdmin) {
      updates.push(`plan = $${idx++}`)
      values.push(plan)
    }
    if (onboardingCompleted !== undefined) {
      updates.push(`onboarding_completed = $${idx++}`)
      values.push(onboardingCompleted)
    }

    if (updates.length > 0) {
      values.push(workspaceId)
      await query(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = $${idx}`, values)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
