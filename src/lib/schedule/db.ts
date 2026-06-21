import { query, queryOne } from '@/lib/db'

export interface ScrapeSchedule {
  id?: string
  workspaceId: string
  portal: 'zonaprop' | 'argenprop' | 'mercadolibre'
  active: boolean
  frequencyHours: number
  maxItems: number
  urls: string[]
  lastRunAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ScrapeLog {
  id?: string
  workspaceId: string
  scheduleId?: string
  portal: string
  status: 'running' | 'success' | 'error'
  itemsScraped: number
  itemsImported: number
  error?: string
  startedAt?: string
  completedAt?: string
}

export async function upsertSchedule(data: ScrapeSchedule): Promise<ScrapeSchedule> {
  const result = await queryOne(
    `INSERT INTO scrape_schedules (workspace_id, portal, active, frequency_hours, max_items, urls)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (workspace_id, portal) DO UPDATE SET
       active=EXCLUDED.active, frequency_hours=EXCLUDED.frequency_hours,
       max_items=EXCLUDED.max_items, urls=EXCLUDED.urls, updated_at=NOW()
     RETURNING *`,
    [data.workspaceId, data.portal, data.active, data.frequencyHours, data.maxItems, data.urls]
  )
  return mapSchedule(result!)
}

export async function getSchedules(workspaceId: string): Promise<ScrapeSchedule[]> {
  const rows = await query(
    'SELECT * FROM scrape_schedules WHERE workspace_id=$1 ORDER BY portal ASC',
    [workspaceId]
  )
  return (rows || []).map(mapSchedule)
}

export async function getSchedule(workspaceId: string, portal: string): Promise<ScrapeSchedule | null> {
  const result = await queryOne(
    'SELECT * FROM scrape_schedules WHERE workspace_id=$1 AND portal=$2',
    [workspaceId, portal]
  )
  return result ? mapSchedule(result) : null
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM scrape_schedules WHERE id=$1 RETURNING id', [id])
  return !!result
}

export async function getDueSchedules(): Promise<ScrapeSchedule[]> {
  const rows = await query(
    `SELECT s.*, w.slug as workspace_slug FROM scrape_schedules s
     JOIN workspaces w ON w.id = s.workspace_id
     WHERE s.active = true
     AND (s.last_run_at IS NULL OR s.last_run_at <= NOW() - (s.frequency_hours || ' hours')::INTERVAL)`
  )
  return (rows || []).map((r: any) => ({ ...mapSchedule(r), workspaceSlug: r.workspace_slug }))
}

export async function updateLastRun(id: string): Promise<void> {
  await query('UPDATE scrape_schedules SET last_run_at=NOW() WHERE id=$1', [id])
}

export async function createLog(data: ScrapeLog): Promise<ScrapeLog> {
  const result = await queryOne(
    `INSERT INTO scrape_logs (workspace_id, schedule_id, portal, status, items_scraped, items_imported, error, completed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.workspaceId, data.scheduleId || null, data.portal, data.status,
     data.itemsScraped, data.itemsImported, data.error || null,
     data.status === 'running' ? null : new Date().toISOString()]
  )
  return mapLog(result!)
}

export async function getLogs(workspaceId: string, limit = 20): Promise<ScrapeLog[]> {
  const rows = await query(
    'SELECT * FROM scrape_logs WHERE workspace_id=$1 ORDER BY started_at DESC LIMIT $2',
    [workspaceId, limit]
  )
  return (rows || []).map(mapLog)
}

function mapSchedule(row: any): ScrapeSchedule {
  return {
    id: row.id, workspaceId: row.workspace_id, portal: row.portal,
    active: row.active, frequencyHours: row.frequency_hours,
    maxItems: row.max_items, urls: row.urls || [],
    lastRunAt: row.last_run_at, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function mapLog(row: any): ScrapeLog {
  return {
    id: row.id, workspaceId: row.workspace_id, scheduleId: row.schedule_id,
    portal: row.portal, status: row.status,
    itemsScraped: row.items_scraped, itemsImported: row.items_imported,
    error: row.error, startedAt: row.started_at, completedAt: row.completed_at,
  }
}