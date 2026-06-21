import { NextRequest, NextResponse } from 'next/server'
import { requireWorkspaceAuth } from '@/lib/api-auth'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/lib/notifications/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId requerido' }, { status: 400 })

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const count = searchParams.get('count') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (count) {
      const c = await getUnreadCount(workspaceId)
      return NextResponse.json({ count: c })
    }

    const notifications = await getNotifications(workspaceId, limit, unreadOnly)
    return NextResponse.json({ notifications })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workspaceId, notificationId, action } = body

    const { workspace, error } = await requireWorkspaceAuth(workspaceId)
    if (error) return error

    if (action === 'read' && notificationId) {
      await markAsRead(notificationId)
    } else if (action === 'readAll') {
      await markAllAsRead(workspaceId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}