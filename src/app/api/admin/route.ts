import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

export async function GET() {
  try {
    const { user, error } = await requireAdmin()
    if (error) return error

    const [workspaces, users] = await Promise.all([
      query('SELECT id, name, slug, plan, created_at FROM workspaces ORDER BY created_at DESC'),
      query('SELECT id, email, full_name, role, workspace_id, created_at FROM users ORDER BY created_at DESC'),
    ])

    const workspaceCount = (workspaces as any[]).length
    const userCount = (users as any[]).length
    const planPrices: Record<string, number> = { starter: 29, pro: 79, enterprise: 199 }
    const revenueEstimate = (workspaces || []).reduce((sum: number, ws: any) => sum + (planPrices[ws.plan || 'starter'] || 29), 0)
    const workspacesWithUsers = (workspaces || []).map((ws: any) => ({
      ...ws,
      user_count: (users || []).filter((u: any) => u.workspace_id === ws.id).length,
    }))

    return NextResponse.json({
      workspaces: workspacesWithUsers,
      users: users || [],
      stats: { totalWorkspaces: workspaceCount, totalUsers: userCount, revenueEstimate },
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
