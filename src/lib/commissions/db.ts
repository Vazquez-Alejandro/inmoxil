import { query, queryOne } from '@/lib/db'

export interface Commission {
  id?: string
  workspaceId: string
  propertyId?: string
  leadId?: string
  contractId?: string
  title: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled'
  commissionPercentage?: number
  description?: string
  dueDate?: string
  paidAt?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export async function createCommission(data: Commission): Promise<Commission> {
  const result = await queryOne(
    `INSERT INTO commissions (workspace_id, property_id, lead_id, contract_id, title, amount, currency, status, commission_percentage, description, due_date, paid_at, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [data.workspaceId, data.propertyId || null, data.leadId || null, data.contractId || null,
     data.title, data.amount, data.currency || 'ARS', data.status || 'pending',
     data.commissionPercentage || null, data.description || null,
     data.dueDate || null, data.paidAt || null, data.createdBy || null]
  )
  return mapRow(result!)
}

export async function getCommissions(workspaceId: string, status?: string): Promise<Commission[]> {
  const conditions = ['workspace_id=$1']
  const values: any[] = [workspaceId]
  let idx = 2

  if (status) { conditions.push(`status=$${idx++}`); values.push(status) }

  const rows = await query(
    `SELECT * FROM commissions WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    values
  )
  return (rows || []).map(mapRow)
}

export async function getCommission(id: string): Promise<Commission | null> {
  const result = await queryOne('SELECT * FROM commissions WHERE id=$1', [id])
  return result ? mapRow(result) : null
}

export async function updateCommission(id: string, data: Partial<Commission>, workspaceId: string): Promise<Commission | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.status) { fields.push(`status=$${idx++}`); values.push(data.status) }
  if (data.paidAt !== undefined) { fields.push(`paid_at=$${idx++}`); values.push(data.paidAt) }
  if (data.amount) { fields.push(`amount=$${idx++}`); values.push(data.amount) }
  if (data.title) { fields.push(`title=$${idx++}`); values.push(data.title) }
  if (data.description !== undefined) { fields.push(`description=$${idx++}`); values.push(data.description) }

  if (!fields.length) return null
  values.push(id, workspaceId)
  const result = await queryOne(`UPDATE commissions SET ${fields.join(',')}, updated_at=NOW() WHERE id=$${idx} AND workspace_id=$${idx + 1} RETURNING *`, values)
  return result ? mapRow(result) : null
}

export async function deleteCommission(id: string, workspaceId: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM commissions WHERE id=$1 AND workspace_id=$2 RETURNING id', [id, workspaceId])
  return !!result
}

export async function getCommissionStats(workspaceId: string): Promise<{
  totalPending: number
  totalPaid: number
  pendingAmount: number
  paidAmount: number
  thisMonth: number
}> {
  const pending = await queryOne(
    "SELECT COALESCE(SUM(amount),0) as amount, COUNT(*)::int as count FROM commissions WHERE workspace_id=$1 AND status='pending'",
    [workspaceId]
  )
  const paid = await queryOne(
    "SELECT COALESCE(SUM(amount),0) as amount, COUNT(*)::int as count FROM commissions WHERE workspace_id=$1 AND status='paid'",
    [workspaceId]
  )
  const thisMonth = await queryOne(
    "SELECT COALESCE(SUM(amount),0) as amount FROM commissions WHERE workspace_id=$1 AND status='paid' AND paid_at >= DATE_TRUNC('month', NOW())",
    [workspaceId]
  )

  return {
    totalPending: pending?.count || 0,
    totalPaid: paid?.count || 0,
    pendingAmount: parseFloat(pending?.amount) || 0,
    paidAmount: parseFloat(paid?.amount) || 0,
    thisMonth: parseFloat(thisMonth?.amount) || 0,
  }
}

function mapRow(row: any): Commission {
  return {
    id: row.id, workspaceId: row.workspace_id, propertyId: row.property_id,
    leadId: row.lead_id, contractId: row.contract_id, title: row.title,
    amount: parseFloat(row.amount), currency: row.currency, status: row.status,
    commissionPercentage: row.commission_percentage ? parseFloat(row.commission_percentage) : undefined,
    description: row.description, dueDate: row.due_date, paidAt: row.paid_at,
    createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at,
  }
}