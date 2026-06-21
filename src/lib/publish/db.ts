import { query, queryOne } from '@/lib/db'
import type { PublishChannel, PublishLog, ChannelType } from './types'

export async function upsertChannel(data: PublishChannel): Promise<PublishChannel> {
  const result = await queryOne(
    `INSERT INTO publish_channels (workspace_id, type, label, config, active)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (workspace_id, type) DO UPDATE SET
       label=EXCLUDED.label, config=EXCLUDED.config, active=EXCLUDED.active, updated_at=NOW()
     RETURNING *`,
    [data.workspaceId, data.type, data.label, JSON.stringify(data.config), data.active]
  )
  return mapChannel(result!)
}

export async function getChannels(workspaceId: string): Promise<PublishChannel[]> {
  const rows = await query(
    'SELECT * FROM publish_channels WHERE workspace_id=$1 ORDER BY type ASC',
    [workspaceId]
  )
  return (rows || []).map(mapChannel)
}

export async function getChannel(workspaceId: string, type: string): Promise<PublishChannel | null> {
  const result = await queryOne(
    'SELECT * FROM publish_channels WHERE workspace_id=$1 AND type=$2',
    [workspaceId, type]
  )
  return result ? mapChannel(result) : null
}

export async function deleteChannel(id: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM publish_channels WHERE id=$1 RETURNING id', [id])
  return !!result
}

export async function createPublishLog(data: PublishLog): Promise<PublishLog> {
  const result = await queryOne(
    `INSERT INTO publish_logs (workspace_id, property_id, channel_id, channel_type, property_title, status, result, error, external_id, external_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.workspaceId, data.propertyId, data.channelId || null, data.channelType,
     data.propertyTitle || null, data.status, JSON.stringify(data.result || {}),
     data.error || null, data.externalId || null, data.externalUrl || null]
  )
  return mapLog(result!)
}

export async function updatePublishLog(id: string, data: Partial<PublishLog>): Promise<PublishLog | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.status) { fields.push(`status=$${idx++}`); values.push(data.status) }
  if (data.result) { fields.push(`result=$${idx++}`); values.push(JSON.stringify(data.result)) }
  if (data.error) { fields.push(`error=$${idx++}`); values.push(data.error) }
  if (data.externalId) { fields.push(`external_id=$${idx++}`); values.push(data.externalId) }
  if (data.externalUrl) { fields.push(`external_url=$${idx++}`); values.push(data.externalUrl) }

  if (!fields.length) return null
  values.push(id)
  const result = await queryOne(`UPDATE publish_logs SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`, values)
  return result ? mapLog(result) : null
}

export async function getPublishLogs(workspaceId: string, propertyId?: string, limit = 50): Promise<PublishLog[]> {
  const conditions = ['workspace_id=$1']
  const values: any[] = [workspaceId]
  let idx = 2

  if (propertyId) { conditions.push(`property_id=$${idx++}`); values.push(propertyId) }

  const rows = await query(
    `SELECT * FROM publish_logs WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT ${limit}`,
    values
  )
  return (rows || []).map(mapLog)
}

function mapChannel(row: any): PublishChannel {
  return {
    id: row.id, workspaceId: row.workspace_id, type: row.type,
    label: row.label, config: typeof row.config === 'string' ? JSON.parse(row.config) : (row.config || {}),
    active: row.active, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

function mapLog(row: any): PublishLog {
  return {
    id: row.id, workspaceId: row.workspace_id, propertyId: row.property_id,
    channelId: row.channel_id, channelType: row.channel_type,
    propertyTitle: row.property_title, status: row.status,
    result: typeof row.result === 'string' ? JSON.parse(row.result) : (row.result || {}),
    error: row.error, externalId: row.external_id,
    externalUrl: row.external_url, createdAt: row.created_at,
  }
}