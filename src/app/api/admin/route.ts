import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServiceClient() as any

    const [
      { data: workspaces },
      { data: users },
      { count: workspaceCount },
      { count: userCount },
    ] = await Promise.all([
      supabase.from('workspaces').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('workspaces').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ])

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
        totalWorkspaces: workspaceCount ?? workspacesWithUsers.length,
        totalUsers: userCount ?? (users || []).length,
        totalCreditsUsed,
        revenueEstimate,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
