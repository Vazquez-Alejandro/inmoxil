import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [workspaces, users] = await Promise.all([
      query('SELECT * FROM workspaces ORDER BY created_at DESC'),
      query('SELECT * FROM users ORDER BY created_at DESC'),
    ])

    const workspaceCount = (workspaces as any[]).length
    const userCount = (users as any[]).length

    const totalCreditsUsed = (workspaces || []).reduce(
      (sum: number, ws: any) => sum + (ws.credits_used ?? 0),
      0
    )

    const planPrices: Record<string, number> = {
      starter: 29,
      pro: 79,
      enterprise: 199,
    }
    const revenueEstimate = (workspaces || []).reduce(
      (sum: number, ws: any) => sum + (planPrices[ws.plan || 'starter'] || 29),
      0
    )

    const workspacesWithUsers = (workspaces || []).map((ws: any) => ({
      ...ws,
      user_count: (users || []).filter((u: any) => u.workspace_id === ws.id).length,
    }))

    return NextResponse.json({
      workspaces: workspacesWithUsers,
      users: users || [],
      stats: {
        totalWorkspaces: workspaceCount,
        totalUsers: userCount,
        totalCreditsUsed,
        revenueEstimate,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
