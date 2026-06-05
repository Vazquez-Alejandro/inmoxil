import { query, queryOne, insertOne, updateOne } from './db'

type WorkspaceRow = {
  id: string; name: string; slug: string; logo_url: string | null
  primary_color: string; secondary_color: string; accent_color: string
  plan: string; credits_remaining: number; credits_used: number
  stripe_customer_id: string | null; stripe_subscription_id: string | null
  created_at: string; updated_at: string
}

export async function getWorkspace(id: string): Promise<WorkspaceRow | null> {
  return await queryOne('SELECT * FROM workspaces WHERE id=$1', [id])
}

export async function getWorkspaceBySlug(slug: string): Promise<WorkspaceRow | null> {
  return await queryOne('SELECT * FROM workspaces WHERE slug=$1', [slug])
}

export async function createWorkspace(name: string, slug: string, ownerId: string): Promise<WorkspaceRow> {
  const workspace = await insertOne('workspaces', { name, slug })
  await insertOne('users', { id: ownerId, workspace_id: workspace.id, role: 'owner' })
  return workspace
}

export async function updateWorkspaceBrand(workspaceId: string, brand: Record<string, any>): Promise<WorkspaceRow> {
  const keys = Object.keys(brand).filter(k => brand[k] !== undefined)
  if (keys.length === 0) return (await getWorkspace(workspaceId)) as WorkspaceRow

  const data: Record<string, any> = {}
  for (const k of keys) data[k] = brand[k]

  const setClauses = Object.keys(data).map((k, i) => `${k}=$${i + 1}`)
  const values = Object.values(data)
  const sql = `UPDATE workspaces SET ${setClauses.join(',')} WHERE id=$${values.length + 1} RETURNING *`
  const rows = await query(sql, [...values, workspaceId])
  return rows[0]
}

export async function checkCredits(workspaceId: string): Promise<number> {
  const row = await queryOne('SELECT credits_remaining FROM workspaces WHERE id=$1', [workspaceId])
  return row?.credits_remaining ?? 0
}

export async function deductCredit(workspaceId: string, adId: string): Promise<boolean> {
  const result = await query(
    `UPDATE workspaces SET credits_remaining = credits_remaining - 1, credits_used = credits_used + 1 WHERE id=$1 AND credits_remaining > 0 RETURNING id`,
    [workspaceId]
  )
  if (result.length === 0) return false

  await insertOne('credit_transactions', {
    workspace_id: workspaceId,
    amount: -1,
    type: 'usage',
    description: `Ad ${adId} generated`,
  })
  return true
}

export async function addCredits(workspaceId: string, amount: number, description: string): Promise<boolean> {
  await query(
    'UPDATE workspaces SET credits_remaining = credits_remaining + $1 WHERE id=$2',
    [amount, workspaceId]
  )
  await insertOne('credit_transactions', {
    workspace_id: workspaceId,
    amount,
    type: 'purchase',
    description,
  })
  return true
}

export async function getCreditHistory(workspaceId: string, limit = 50) {
  return await query(
    'SELECT * FROM credit_transactions WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT $2',
    [workspaceId, limit]
  )
}

export async function setStripeIds(workspaceId: string, customerId: string, subscriptionId: string) {
  await query(
    'UPDATE workspaces SET stripe_customer_id=$1, stripe_subscription_id=$2 WHERE id=$3',
    [customerId, subscriptionId, workspaceId]
  )
}
