export type ContractType = 'alquiler' | 'garantia_propietaria' | 'seguro_caucion' | 'renuncia_derechos' | 'comodato_precario'

export type ContractStatus = 'borrador' | 'activo' | 'vigente' | 'vencido' | 'rescindido'

export type AdjustmentIndex = 'IPC' | 'ICL' | 'NONE'

export interface ContractParty {
  fullName: string
  documentType: 'DNI' | 'CUIL' | 'CUIT'
  documentNumber: string
  address?: string
  phone?: string
  email?: string
}

export interface PropertyInfo {
  address: string
  city: string
  province: string
  description?: string
  cpa?: string
  registrationData?: string
}

export interface ContractFinancial {
  amount: number
  currency: 'ARS' | 'USD'
  adjustmentIndex: AdjustmentIndex
  adjustmentFrequencyMonths: number
  depositAmount?: number
  commissionPercentage?: number
  commissionAmount?: number
  expensesIncluded?: boolean
  expensesAmount?: number
}

export interface ContractClause {
  number: number
  title: string
  content: string
}

export interface ContractData {
  id?: string
  workspaceId: string
  type: ContractType
  status: ContractStatus
  number: string
  title: string
  startDate: string
  endDate: string
  durationMonths: number
  lessor: ContractParty
  lessee: ContractParty
  guarantor?: ContractParty
  property: PropertyInfo
  financial: ContractFinancial
  clauses: ContractClause[]
  notes?: string
  lastAdjustmentDate?: string
  lastAdjustmentValue?: number
  nextAdjustmentDate?: string
  createdAt?: string
  updatedAt?: string
  signedByLessor?: boolean
  signedByLessee?: boolean
  signedAt?: string
}

export interface GuarantorData {
  id?: string
  contractId: string
  fullName: string
  documentType: 'DNI' | 'CUIL' | 'CUIT'
  documentNumber: string
  income: number
  incomeCurrency: 'ARS' | 'USD'
  propertyAddress?: string
  propertyValue?: number
  phone: string
  email?: string
  relationship: string
  createdAt?: string
}

export interface AdjustmentRecord {
  id?: string
  contractId: string
  previousAmount: number
  newAmount: number
  previousIndex: number
  currentIndex: number
  variation: number
  indexType: AdjustmentIndex
  adjustmentDate: string
  createdAt?: string
}

export interface AlertConfig {
  id?: string
  contractId: string
  daysBefore: number
  channel: 'email' | 'whatsapp'
  enabled: boolean
  lastSentAt?: string
}