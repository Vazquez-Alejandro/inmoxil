import { query, queryOne } from '@/lib/db'
import type { ContractData, GuarantorData, AdjustmentRecord, AlertConfig, ContractStatus, ContractType } from './types'

export async function createContract(data: ContractData): Promise<ContractData> {
  const result = await queryOne(
    `INSERT INTO contracts (
      workspace_id, type, status, number, title, start_date, end_date, duration_months,
      lessor_name, lessor_document_type, lessor_document_number, lessor_address, lessor_phone, lessor_email,
      lessee_name, lessee_document_type, lessee_document_number, lessee_address, lessee_phone, lessee_email,
      property_address, property_city, property_province, property_description, property_cpa, property_registration,
      amount, currency, adjustment_index, adjustment_frequency_months, deposit_amount,
      commission_percentage, commission_amount, expenses_included, expenses_amount,
      clauses, notes, last_adjustment_date, last_adjustment_value, next_adjustment_date
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40) RETURNING *`,
    [
      data.workspaceId, data.type, data.status, data.number, data.title,
      data.startDate, data.endDate, data.durationMonths,
      data.lessor.fullName, data.lessor.documentType, data.lessor.documentNumber,
      data.lessor.address || null, data.lessor.phone || null, data.lessor.email || null,
      data.lessee.fullName, data.lessee.documentType, data.lessee.documentNumber,
      data.lessee.address || null, data.lessee.phone || null, data.lessee.email || null,
      data.property.address, data.property.city, data.property.province,
      data.property.description || null, data.property.cpa || null, data.property.registrationData || null,
      data.financial.amount, data.financial.currency, data.financial.adjustmentIndex,
      data.financial.adjustmentFrequencyMonths, data.financial.depositAmount || null,
      data.financial.commissionPercentage || null, data.financial.commissionAmount || null,
      data.financial.expensesIncluded || false, data.financial.expensesAmount || null,
      JSON.stringify(data.clauses || []), data.notes || null,
      data.lastAdjustmentDate || null, data.lastAdjustmentValue || null, data.nextAdjustmentDate || null,
    ]
  )
  return mapRow(result)
}

export async function updateContract(id: string, data: Partial<ContractData>): Promise<ContractData | null> {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.status) { fields.push(`status=$${idx++}`); values.push(data.status) }
  if (data.title) { fields.push(`title=$${idx++}`); values.push(data.title) }
  if (data.notes !== undefined) { fields.push(`notes=$${idx++}`); values.push(data.notes) }
  if (data.lastAdjustmentDate) { fields.push(`last_adjustment_date=$${idx++}`); values.push(data.lastAdjustmentDate) }
  if (data.lastAdjustmentValue !== undefined) { fields.push(`last_adjustment_value=$${idx++}`); values.push(data.lastAdjustmentValue) }
  if (data.nextAdjustmentDate) { fields.push(`next_adjustment_date=$${idx++}`); values.push(data.nextAdjustmentDate) }
  if (data.signedByLessor !== undefined) { fields.push(`signed_by_lessor=$${idx++}`); values.push(data.signedByLessor) }
  if (data.signedByLessee !== undefined) { fields.push(`signed_by_lessee=$${idx++}`); values.push(data.signedByLessee) }
  if (data.signedAt) { fields.push(`signed_at=$${idx++}`); values.push(data.signedAt) }
  if (data.clauses) { fields.push(`clauses=$${idx++}`); values.push(JSON.stringify(data.clauses)) }
  if (data.financial) {
    if (data.financial.amount) { fields.push(`amount=$${idx++}`); values.push(data.financial.amount) }
    if (data.financial.adjustmentIndex) { fields.push(`adjustment_index=$${idx++}`); values.push(data.financial.adjustmentIndex) }
    if (data.financial.adjustmentFrequencyMonths) { fields.push(`adjustment_frequency_months=$${idx++}`); values.push(data.financial.adjustmentFrequencyMonths) }
  }

  if (!fields.length) return null

  values.push(id)
  const result = await queryOne(`UPDATE contracts SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`, values)
  return result ? mapRow(result) : null
}

export async function getContracts(workspaceId: string, options?: {
  status?: ContractStatus
  type?: ContractType
  search?: string
  limit?: number
  offset?: number
}): Promise<{ contracts: ContractData[]; total: number }> {
  const conditions = ['workspace_id=$1']
  const values: any[] = [workspaceId]
  let idx = 2

  if (options?.status) { conditions.push(`status=$${idx++}`); values.push(options.status) }
  if (options?.type) { conditions.push(`type=$${idx++}`); values.push(options.type) }
  if (options?.search) {
    conditions.push(`(title ILIKE $${idx} OR lessor_name ILIKE $${idx} OR lessee_name ILIKE $${idx} OR property_address ILIKE $${idx})`)
    values.push(`%${options.search}%`)
    idx++
  }

  const where = conditions.join(' AND ')
  const limit = options?.limit || 50
  const offset = options?.offset || 0

  const countResult = await queryOne(`SELECT COUNT(*)::int as total FROM contracts WHERE ${where}`, values)
  const rows = await query(`SELECT * FROM contracts WHERE ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, values)

  return {
    contracts: (rows || []).map(mapRow),
    total: countResult?.total || 0,
  }
}

export async function getContract(id: string): Promise<ContractData | null> {
  const row = await queryOne('SELECT * FROM contracts WHERE id=$1', [id])
  return row ? mapRow(row) : null
}

export async function deleteContract(id: string): Promise<boolean> {
  const result = await queryOne('DELETE FROM contracts WHERE id=$1 RETURNING id', [id])
  return !!result
}

export async function createGuarantor(data: GuarantorData): Promise<GuarantorData> {
  const result = await queryOne(
    `INSERT INTO guarantors (contract_id, full_name, document_type, document_number, income, income_currency,
      property_address, property_value, phone, email, relationship)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [data.contractId, data.fullName, data.documentType, data.documentNumber,
     data.income, data.incomeCurrency, data.propertyAddress || null, data.propertyValue || null,
     data.phone, data.email || null, data.relationship]
  )
  return mapGuarantorRow(result)
}

export async function getGuarantors(contractId: string): Promise<GuarantorData[]> {
  const rows = await query('SELECT * FROM guarantors WHERE contract_id=$1 ORDER BY created_at DESC', [contractId])
  return (rows || []).map(mapGuarantorRow)
}

export async function createAdjustment(data: AdjustmentRecord): Promise<AdjustmentRecord> {
  const result = await queryOne(
    `INSERT INTO adjustments (contract_id, previous_amount, new_amount, previous_index, current_index, variation, index_type, adjustment_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.contractId, data.previousAmount, data.newAmount, data.previousIndex, data.currentIndex, data.variation, data.indexType, data.adjustmentDate]
  )
  return mapAdjustmentRow(result)
}

export async function getAdjustments(contractId: string): Promise<AdjustmentRecord[]> {
  const rows = await query('SELECT * FROM adjustments WHERE contract_id=$1 ORDER BY adjustment_date DESC', [contractId])
  return (rows || []).map(mapAdjustmentRow)
}

export async function getPendingAdjustments(workspaceId: string, days: number = 30): Promise<ContractData[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  const rows = await query(
    `SELECT * FROM contracts WHERE workspace_id=$1 AND status='activo' AND next_adjustment_date IS NOT NULL
     AND next_adjustment_date <= $2 ORDER BY next_adjustment_date ASC`,
    [workspaceId, cutoff.toISOString().split('T')[0]]
  )
  return (rows || []).map(mapRow)
}

export async function createAlert(config: AlertConfig): Promise<AlertConfig> {
  const result = await queryOne(
    `INSERT INTO alerts (contract_id, days_before, channel, enabled)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [config.contractId, config.daysBefore, config.channel, config.enabled]
  )
  return mapAlertRow(result)
}

export async function getAlerts(contractId: string): Promise<AlertConfig[]> {
  const rows = await query('SELECT * FROM alerts WHERE contract_id=$1 ORDER BY days_before ASC', [contractId])
  return (rows || []).map(mapAlertRow)
}

function mapRow(row: any): ContractData {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    type: row.type,
    status: row.status,
    number: row.number,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    durationMonths: row.duration_months,
    lessor: {
      fullName: row.lessor_name,
      documentType: row.lessor_document_type,
      documentNumber: row.lessor_document_number,
      address: row.lessor_address,
      phone: row.lessor_phone,
      email: row.lessor_email,
    },
    lessee: {
      fullName: row.lessee_name,
      documentType: row.lessee_document_type,
      documentNumber: row.lessee_document_number,
      address: row.lessee_address,
      phone: row.lessee_phone,
      email: row.lessee_email,
    },
    property: {
      address: row.property_address,
      city: row.property_city,
      province: row.property_province,
      description: row.property_description,
      cpa: row.property_cpa,
      registrationData: row.property_registration,
    },
    financial: {
      amount: row.amount,
      currency: row.currency,
      adjustmentIndex: row.adjustment_index,
      adjustmentFrequencyMonths: row.adjustment_frequency_months,
      depositAmount: row.deposit_amount,
      commissionPercentage: row.commission_percentage,
      commissionAmount: row.commission_amount,
      expensesIncluded: row.expenses_included,
      expensesAmount: row.expenses_amount,
    },
    clauses: typeof row.clauses === 'string' ? JSON.parse(row.clauses) : (row.clauses || []),
    notes: row.notes,
    lastAdjustmentDate: row.last_adjustment_date,
    lastAdjustmentValue: row.last_adjustment_value,
    nextAdjustmentDate: row.next_adjustment_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signedByLessor: row.signed_by_lessor,
    signedByLessee: row.signed_by_lessee,
    signedAt: row.signed_at,
  }
}

function mapGuarantorRow(row: any): GuarantorData {
  return {
    id: row.id,
    contractId: row.contract_id,
    fullName: row.full_name,
    documentType: row.document_type,
    documentNumber: row.document_number,
    income: row.income,
    incomeCurrency: row.income_currency,
    propertyAddress: row.property_address,
    propertyValue: row.property_value,
    phone: row.phone,
    email: row.email,
    relationship: row.relationship,
    createdAt: row.created_at,
  }
}

function mapAdjustmentRow(row: any): AdjustmentRecord {
  return {
    id: row.id,
    contractId: row.contract_id,
    previousAmount: row.previous_amount,
    newAmount: row.new_amount,
    previousIndex: row.previous_index,
    currentIndex: row.current_index,
    variation: row.variation,
    indexType: row.index_type,
    adjustmentDate: row.adjustment_date,
    createdAt: row.created_at,
  }
}

function mapAlertRow(row: any): AlertConfig {
  return {
    id: row.id,
    contractId: row.contract_id,
    daysBefore: row.days_before,
    channel: row.channel,
    enabled: row.enabled,
    lastSentAt: row.last_sent_at,
  }
}