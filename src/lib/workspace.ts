import { createServiceClient } from './supabase'
import { Database } from '@/types/database'

type Workspace = Database['public']['Tables']['workspaces']['Row']

function getDb() {
  return createServiceClient()
}

export async function getWorkspace(id: string): Promise<Workspace | null> {
  const { data, error } = await getDb()
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const { data, error } = await getDb()
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function createWorkspace(
  name: string,
  slug: string,
  ownerId: string
): Promise<Workspace> {
  const { data: workspace, error: wsError } = await getDb()
    .from('workspaces')
    .insert({ name, slug })
    .select()
    .single()

  if (wsError) throw wsError

  const { error: userError } = await getDb()
    .from('users')
    .insert({
      id: ownerId,
      workspace_id: workspace.id,
      role: 'owner',
    })

  if (userError) throw userError

  return workspace
}

export async function updateWorkspaceBrand(
  workspaceId: string,
  brand: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    accent_color?: string
  }
): Promise<Workspace> {
  const { data, error } = await getDb()
    .from('workspaces')
    .update(brand)
    .eq('id', workspaceId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkCredits(workspaceId: string): Promise<number> {
  const { data, error } = await getDb()
    .from('workspaces')
    .select('credits_remaining')
    .eq('id', workspaceId)
    .single()

  if (error) throw error
  return data.credits_remaining
}

export async function deductCredit(workspaceId: string, adId: string): Promise<boolean> {
  const { data, error } = await getDb().rpc('deduct_credit', {
    p_workspace_id: workspaceId,
    p_ad_id: adId,
  })

  if (error) throw error
  return data
}

export async function addCredits(
  workspaceId: string,
  amount: number,
  description: string
): Promise<boolean> {
  const { data, error } = await getDb().rpc('add_credits', {
    p_workspace_id: workspaceId,
    p_amount: amount,
    p_description: description,
  })

  if (error) throw error
  return data
}

export async function getCreditHistory(workspaceId: string, limit = 50) {
  const { data, error } = await getDb()
    .from('credit_transactions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function setStripeIds(
  workspaceId: string,
  customerId: string,
  subscriptionId: string
) {
  const { error } = await getDb()
    .from('workspaces')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq('id', workspaceId)

  if (error) throw error
}
