import { NextRequest, NextResponse } from 'next/server'
import { createWorkspace, getWorkspace, getWorkspaceBySlug } from '@/lib/workspace'
import { createCustomer } from '@/lib/stripe'
import { query } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, slug, email, userId } = await request.json()

    if (!name || !slug || !email || !userId) {
      return NextResponse.json({ error: 'Faltan campos requeridos: name, slug, email, userId' }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const workspace = await createWorkspace(name, cleanSlug, userId)

    const customer = await createCustomer(email, name)
    await query('UPDATE workspaces SET stripe_customer_id=$1 WHERE id=$2', [customer.id, workspace.id])

    try {
      await sendWelcomeEmail(email, name)
    } catch (e) {
      console.error('[Workspace] Failed to send welcome email:', e)
    }

    return NextResponse.json({ success: true, workspace: { ...workspace, stripe_customer_id: customer.id } })
  } catch (error) {
    console.error('[Workspace] Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error creando workspace' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (!id && !slug) {
      return NextResponse.json({ error: 'Se requiere id o slug' }, { status: 400 })
    }

    const workspace = slug ? await getWorkspaceBySlug(slug) : await getWorkspace(id!)
    return NextResponse.json({ success: true, workspace })
  } catch (error) {
    return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspaceId, name } = await request.json()

    if (!workspaceId || !name) {
      return NextResponse.json({ error: 'workspaceId y name requeridos' }, { status: 400 })
    }

    await query('UPDATE workspaces SET name = $1 WHERE id = $2', [name, workspaceId])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando workspace' }, { status: 500 })
  }
}
