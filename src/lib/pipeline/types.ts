export type LeadSource = 'whatsapp' | 'portal' | 'referido' | 'llamada' | 'email' | 'web' | 'manual'
export type LeadStatus = 'activo' | 'perdido' | 'ganado'
export type ActivityType = 'llamada' | 'visita' | 'mensaje' | 'email' | 'reunion' | 'otro'

export interface PipelineStage {
  id?: string
  workspaceId: string
  name: string
  order: number
  color: string
  isDefault: boolean
  createdAt?: string
}

export interface PipelineLead {
  id?: string
  workspaceId: string
  stageId: string
  stageName?: string
  propertyId?: string
  propertyTitle?: string
  fullName: string
  phone: string
  email?: string
  documentType: 'DNI' | 'CUIL' | 'CUIT'
  documentNumber?: string
  source: LeadSource
  status: LeadStatus
  notes?: string
  budgetMin?: number
  budgetMax?: number
  currency?: 'ARS' | 'USD'
  requirements?: string
  stageOrder: number
  assignedTo?: string
  lastContactAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface Activity {
  id?: string
  leadId: string
  type: ActivityType
  description: string
  outcome?: string
  scheduledAt?: string
  completedAt?: string
  createdBy?: string
  createdAt?: string
}

export const DEFAULT_STAGES = [
  { name: 'Nuevo', color: '#6366f1', order: 0 },
  { name: 'Contactado', color: '#3b82f6', order: 1 },
  { name: 'Agendó visita', color: '#f59e0b', order: 2 },
  { name: 'Visitó', color: '#8b5cf6', order: 3 },
  { name: 'Negociación', color: '#f97316', order: 4 },
  { name: 'Ganado', color: '#10b981', order: 5 },
  { name: 'Perdido', color: '#ef4444', order: 6 },
]