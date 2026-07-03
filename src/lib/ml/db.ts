import { query, queryOne } from '@/lib/db'
import type { MLToken } from './api'

export async function saveMLToken(workspaceId: string, token: MLToken): Promise<void> {
  await query('DELETE FROM ml_tokens WHERE workspace_id=$1', [workspaceId])
  await query(
    `INSERT INTO ml_tokens (workspace_id, access_token, refresh_token, user_id, seller_id, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [workspaceId, token.accessToken, token.refreshToken, token.userId, token.sellerId, token.expiresAt]
  )
}

export async function getMLToken(workspaceId: string): Promise<MLToken | null> {
  const row = await queryOne('SELECT * FROM ml_tokens WHERE workspace_id=$1', [workspaceId])
  if (!row) return null
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    userId: row.user_id,
    sellerId: row.seller_id,
    expiresAt: row.expires_at,
  }
}

export async function deleteMLToken(workspaceId: string): Promise<void> {
  await query('DELETE FROM ml_tokens WHERE workspace_id=$1', [workspaceId])
}

export async function isMLConnected(workspaceId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM ml_tokens WHERE workspace_id=$1 AND expires_at > NOW()',
    [workspaceId]
  )
  return !!row
}