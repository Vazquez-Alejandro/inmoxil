import { query, queryOne } from '@/lib/db'

export interface Notification {
  id?: string
  workspaceId: string
  type: 'ajuste_proximo' | 'contrato_vencimiento' | 'lead_nuevo' | 'scraping_completado' | 'scraping_error' | 'creditos_bajos' | 'ajuste_completado' | 'pago_exitoso' | 'matching_encontrado' | 'pago_recibido'
  title: string
  message?: string
  link?: string
  icon?: string
  read?: boolean
  createdAt?: string
}

const ICONS: Record<string, string> = {
  ajuste_proximo: 'chart',
  contrato_vencimiento: 'calendar',
  lead_nuevo: 'user',
  scraping_completado: 'globe',
  scraping_error: 'alert',
  creditos_bajos: 'credit',
  ajuste_completado: 'check',
  pago_exitoso: 'credit',
  matching_encontrado: 'matching',
  pago_recibido: 'credit',
}

export async function createNotification(data: Notification): Promise<Notification> {
  const result = await queryOne(
    `INSERT INTO notifications (workspace_id, type, title, message, link, icon)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.workspaceId, data.type, data.title, data.message || null, data.link || null, ICONS[data.type] || 'bell']
  )
  return result ? mapRow(result) : data
}

export async function getNotifications(workspaceId: string, limit = 20, unreadOnly = false): Promise<Notification[]> {
  const cond = unreadOnly ? 'AND read=false' : ''
  const rows = await query(
    `SELECT * FROM notifications WHERE workspace_id=$1 ${cond} ORDER BY created_at DESC LIMIT ${limit}`,
    [workspaceId]
  )
  return (rows || []).map(mapRow)
}

export async function getUnreadCount(workspaceId: string): Promise<number> {
  const result = await queryOne(
    'SELECT COUNT(*)::int as count FROM notifications WHERE workspace_id=$1 AND read=false',
    [workspaceId]
  )
  return result?.count || 0
}

export async function markAsRead(id: string): Promise<void> {
  await query('UPDATE notifications SET read=true WHERE id=$1', [id])
}

export async function markAllAsRead(workspaceId: string): Promise<void> {
  await query('UPDATE notifications SET read=true WHERE workspace_id=$1', [workspaceId])
}

export async function deleteOldNotifications(workspaceId: string, days = 30): Promise<void> {
  await query(
    `DELETE FROM notifications WHERE workspace_id=$1 AND created_at < NOW() - INTERVAL '${days} days'`,
    [workspaceId]
  )
}

function mapRow(row: any): Notification {
  return {
    id: row.id, workspaceId: row.workspace_id, type: row.type, title: row.title,
    message: row.message, link: row.link, icon: row.icon, read: row.read,
    createdAt: row.created_at,
  }
}