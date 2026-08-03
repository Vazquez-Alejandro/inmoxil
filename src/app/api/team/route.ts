import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const users = await query(
      `SELECT id, email, full_name as name, role_in_workspace, phone, avatar_url, created_at
       FROM users WHERE workspace_id=$1 ORDER BY created_at ASC`,
      [workspaceId]
    )

    return NextResponse.json({ team: users || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, email, name, role } = body
    if (!workspaceId || !email || !name) {
      return NextResponse.json({ error: 'workspaceId, email y name requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const existing = await query('SELECT id FROM users WHERE email=$1', [email])
    if (existing?.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 400 })
    }

    function escapeHtml(str: string): string {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    const bcrypt = await import('bcryptjs')
    const tempPass = Math.random().toString(36).slice(-8)
    const hashed = await bcrypt.hash(tempPass, 10)

    const result = await query(
      `INSERT INTO users (email, full_name, password_hash, workspace_id, role_in_workspace)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, email, full_name as name, role_in_workspace, created_at`,
      [email, name, hashed, workspaceId, role || 'agent']
    )

    const newUser = result?.[0]

    try {
      const mod = await import('resend').catch(() => null)
      if (mod?.Resend && process.env.RESEND_API_KEY) {
        const resend = new mod.Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Inmoxil <noreply@traceless.com.ar>',
          to: email,
          subject: 'Te invitaron a unirte a Inmoxil',
          html: `<p>Hola ${escapeHtml(name)},</p><p>Te invitaron a unirte a <strong>${escapeHtml(workspace.name || 'tu workspace')}</strong> en Inmoxil.</p><p>Tu acceso temporal:<br>Email: ${escapeHtml(email)}<br>Contraseña: <strong>${escapeHtml(tempPass)}</strong></p><p><a href="https://inmoxil.vercel.app/login">Iniciar sesión</a></p><p>Cambiá tu contraseña después de entrar.</p>`,
        })
      }
    } catch {}

    return NextResponse.json({ success: true, user: newUser, tempPassword: tempPass })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, userId, role } = body
    if (!workspaceId || !userId || !role) {
      return NextResponse.json({ error: 'workspaceId, userId y role requeridos' }, { status: 400 })
    }

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    await query('UPDATE users SET role_in_workspace=$1 WHERE id=$2 AND workspace_id=$3', [role, userId, workspaceId])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const userId = searchParams.get('userId')
    if (!workspaceId || !userId) return NextResponse.json({ error: 'workspaceId y userId requeridos' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    await query('DELETE FROM users WHERE id=$1 AND workspace_id=$2', [userId, workspaceId])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}