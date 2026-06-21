import { query, queryOne } from '@/lib/db'
import type { PipelineStage, PipelineLead, Activity, LeadSource, LeadStatus } from './types'

export async function createStage(data: PipelineStage): Promise<PipelineStage> {
  const result = await queryOne(
    `INSERT INTO pipeline_stages (workspace_id, name, "order", color, is_default)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.workspaceId, data.name, data.order, data.color, data.isDefault]
  )
  return mapStage(result)
}

export async function getStages(workspaceId: string): Promise<PipelineStage[]> {
  const rows = await query(
    'SELECT * FROM pipeline_stages WHERE workspace_id=$1 ORDER BY "order" ASC',
    [workspaceId]
  )
  return (rows || []).map(mapStage)
}

export async function updateStage(id: string, data: Partial<PipelineStage>): Promise<PipelineStage | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.name) { fields.push(`name=$${idx++}`); values.push(data.name) }
  if (data.order !== undefined) { fields.push(`"order"=$${idx++}`); values.push(data.order) }
  if (data.color) { fields.push(`color=$${idx++}`); values.push(data.color) }

  if (!fields.length) return null
  values.push(id)
  const result = await queryOne(`UPDATE pipeline_stages SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`, values)
  return result ? mapStage(result) : null
}

export async function deleteStage(id: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM pipeline_stages WHERE id=$1 RETURNING id', [id])
  return !!result
}

export async function initDefaultStages(workspaceId: string): Promise<void> {
  const { DEFAULT_STAGES } = await import('./types')
  const existing = await getStages(workspaceId)
  if (existing.length > 0) return

  for (const s of DEFAULT_STAGES) {
    await createStage({ ...s, workspaceId, isDefault: true })
  }
}

export async function createLead(data: PipelineLead): Promise<PipelineLead> {
  const result = await queryOne(
    `INSERT INTO pipeline_leads (workspace_id, stage_id, property_id, full_name, phone, email, document_type, document_number,
      source, status, notes, budget_min, budget_max, currency, requirements, stage_order, assigned_to)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
    [data.workspaceId, data.stageId, data.propertyId || null, data.fullName, data.phone,
     data.email || null, data.documentType, data.documentNumber || null,
     data.source, data.status || 'activo', data.notes || null,
     data.budgetMin || null, data.budgetMax || null, data.currency || 'ARS',
     data.requirements || null, data.stageOrder, data.assignedTo || null]
  )
  return mapLead(result)
}

export async function getLeads(workspaceId: string, stageId?: string, search?: string): Promise<PipelineLead[]> {
  const conditions = ['ps.workspace_id=$1']
  const values: any[] = [workspaceId]
  let idx = 2

  if (stageId) { conditions.push(`pl.stage_id=$${idx++}`); values.push(stageId) }
  if (search) {
    conditions.push(`(pl.full_name ILIKE $${idx} OR pl.phone ILIKE $${idx} OR pl.email ILIKE $${idx})`)
    values.push(`%${search}%`)
    idx++
  }

  const rows = await query(
    `SELECT pl.*, p.title as property_title, ps.name as stage_name, ps.color as stage_color, ps."order" as stage_order_val
     FROM pipeline_leads pl
     JOIN pipeline_stages ps ON ps.id = pl.stage_id
     LEFT JOIN properties p ON p.id = pl.property_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY pl.updated_at DESC, pl.created_at DESC`,
    values
  )
  return (rows || []).map(mapLeadDetail)
}

export async function getLead(id: string): Promise<PipelineLead | null> {
  const result = await queryOne(
    `SELECT pl.*, p.title as property_title, ps.name as stage_name, ps.color as stage_color, ps."order" as stage_order_val
     FROM pipeline_leads pl
     JOIN pipeline_stages ps ON ps.id = pl.stage_id
     LEFT JOIN properties p ON p.id = pl.property_id
     WHERE pl.id=$1`,
    [id]
  )
  return result ? mapLeadDetail(result) : null
}

export async function updateLead(id: string, data: Partial<PipelineLead>): Promise<PipelineLead | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  const fieldMap: Record<string, string> = {
    stageId: 'stage_id', propertyId: 'property_id', fullName: 'full_name',
    phone: 'phone', email: 'email', source: 'source', status: 'status',
    notes: 'notes', budgetMin: 'budget_min', budgetMax: 'budget_max',
    currency: 'currency', requirements: 'requirements', stageOrder: 'stage_order',
    assignedTo: 'assigned_to', lastContactAt: 'last_contact_at',
  }

  for (const [key, col] of Object.entries(fieldMap)) {
    if ((data as any)[key] !== undefined) {
      fields.push(`${col}=$${idx++}`)
      values.push((data as any)[key])
    }
  }

  if (!fields.length) return null
  values.push(id)
  const result = await queryOne(`UPDATE pipeline_leads SET ${fields.join(',')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`, values)
  return result ? mapLead(result) : null
}

export async function moveLeadStage(id: string, stageId: string, stageOrder: number): Promise<PipelineLead | null> {
  const result = await queryOne(
    'UPDATE pipeline_leads SET stage_id=$1, stage_order=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
    [stageId, stageOrder, id]
  )
  return result ? mapLead(result) : null
}

export async function deleteLead(id: string): Promise<boolean> {
  const result = await queryOne('UPDATE pipeline_leads SET status=$1 WHERE id=$2 RETURNING id', ['perdido', id])
  return !!result
}
export async function getLeadsByStage(workspaceId: string): Promise<Record<string, PipelineLead[]>> {
  const all = await getLeads(workspaceId)
  const grouped: Record<string, PipelineLead[]> = {}
  for (const lead of all) {
    if (!grouped[lead.stageId]) grouped[lead.stageId] = []
    grouped[lead.stageId].push(lead)
  }
  return grouped
}

export async function createActivity(data: Activity): Promise<Activity> {
  const result = await queryOne(
    `INSERT INTO pipeline_activities (lead_id, type, description, outcome, scheduled_at, completed_at, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.leadId, data.type, data.description, data.outcome || null,
     data.scheduledAt || null, data.completedAt || null, data.createdBy || null]
  )
  return mapActivity(result)
}

export async function getActivities(leadId: string): Promise<Activity[]> {
  const rows = await query(
    'SELECT * FROM pipeline_activities WHERE lead_id=$1 ORDER BY created_at DESC',
    [leadId]
  )
  return (rows || []).map(mapActivity)
}

export async function getDashboardStats(workspaceId: string): Promise<{
  totalLeads: number
  activeLeads: number
  wonLeads: number
  lostLeads: number
  conversionRate: number
  stageBreakdown: { stageId: string; stageName: string; count: number }[]
}> {
  const totalResult = await queryOne('SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1', [workspaceId])
  const activeResult = await queryOne("SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1 AND status='activo'", [workspaceId])
  const wonResult = await queryOne("SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1 AND status='ganado'", [workspaceId])
  const lostResult = await queryOne("SELECT COUNT(*)::int as count FROM pipeline_leads WHERE workspace_id=$1 AND status='perdido'", [workspaceId])
  const total = totalResult?.count || 0
  const active = activeResult?.count || 0
  const won = wonResult?.count || 0
  const lost = lostResult?.count || 0
  const closed = won + lost
  const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0

  const breakdownRows = await query(
    `SELECT ps.id as stage_id, ps.name as stage_name, COUNT(pl.id)::int as count
     FROM pipeline_stages ps LEFT JOIN pipeline_leads pl ON pl.stage_id = ps.id AND pl.workspace_id=$1
     WHERE ps.workspace_id=$1 GROUP BY ps.id, ps.name ORDER BY ps."order" ASC`,
    [workspaceId]
  )

  return {
    totalLeads: total,
    activeLeads: active,
    wonLeads: won,
    lostLeads: lost,
    conversionRate,
    stageBreakdown: (breakdownRows || []).map((r: any) => ({ stageId: r.stage_id, stageName: r.stage_name, count: r.count })),
  }
}

function mapStage(row: any): PipelineStage {
  return { id: row.id, workspaceId: row.workspace_id, name: row.name, order: row.order, color: row.color, isDefault: row.is_default, createdAt: row.created_at }
}

function mapLead(row: any): PipelineLead {
  return { id: row.id, workspaceId: row.workspace_id, stageId: row.stage_id, propertyId: row.property_id, fullName: row.full_name, phone: row.phone, email: row.email, documentType: row.document_type, documentNumber: row.document_number, source: row.source, status: row.status, notes: row.notes, budgetMin: row.budget_min, budgetMax: row.budget_max, currency: row.currency, requirements: row.requirements, stageOrder: row.stage_order, assignedTo: row.assigned_to, lastContactAt: row.last_contact_at, createdAt: row.created_at, updatedAt: row.updated_at }
}

function mapLeadDetail(row: any): PipelineLead {
  const lead = mapLead(row)
  return { ...lead, propertyTitle: row.property_title, stageName: row.stage_name, stageColor: row.stage_color, stageOrderVal: row.stage_order_val } as any
}

function mapActivity(row: any): Activity {
  return { id: row.id, leadId: row.lead_id, type: row.type, description: row.description, outcome: row.outcome, scheduledAt: row.scheduled_at, completedAt: row.completed_at, createdBy: row.created_by, createdAt: row.created_at }
}