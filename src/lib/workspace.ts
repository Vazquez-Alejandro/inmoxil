import { query, queryOne, insertOne } from './db'

type WorkspaceRow = {
  id: string; name: string; slug: string; logo_url: string | null
  primary_color: string; secondary_color: string; accent_color: string
  plan: string; credits_remaining: number; credits_used: number
  stripe_customer_id: string | null; stripe_subscription_id: string | null
  created_at: string; updated_at: string
  public_catalog_enabled: boolean; pub_catalog_slug: string | null
  contact_email: string | null; contact_phone: string | null; contact_address: string | null
  social_instagram: string | null; social_facebook: string | null
  social_twitter: string | null; social_linkedin: string | null
  whatsapp_number: string | null; timezone: string | null
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
  const ALLOWED_COLUMNS = new Set([
    'name', 'logo_url', 'primary_color', 'secondary_color', 'accent_color',
    'public_catalog_enabled', 'pub_catalog_slug', 'contact_email', 'contact_phone',
    'contact_address', 'social_instagram', 'social_facebook', 'social_twitter',
    'social_linkedin', 'whatsapp_number', 'timezone',
  ])

  const keys = Object.keys(brand).filter(k => brand[k] !== undefined && ALLOWED_COLUMNS.has(k))
  if (keys.length === 0) return (await getWorkspace(workspaceId)) as WorkspaceRow

  const data: Record<string, any> = {}
  for (const k of keys) data[k] = brand[k]

  const setClauses = Object.keys(data).map((k, i) => `${k}=$${i + 1}`)
  const values = Object.values(data)
  const sql = `UPDATE workspaces SET ${setClauses.join(',')} WHERE id=$${values.length + 1} RETURNING *`
  const rows = await query(sql, [...values, workspaceId])
  return rows[0]
}

export async function setStripeIds(workspaceId: string, customerId: string, subscriptionId: string) {
  await query(
    'UPDATE workspaces SET stripe_customer_id=$1, stripe_subscription_id=$2 WHERE id=$3',
    [customerId, subscriptionId, workspaceId]
  )
}
