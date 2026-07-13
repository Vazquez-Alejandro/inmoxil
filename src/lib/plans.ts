export type PlanId = 'starter' | 'pro' | 'enterprise'

export type PlanConfig = {
  id: PlanId
  name: string
  nameEs: string
  description: string
  price: number
  limits: {
    properties: number
    pipelineLeads: number
    contracts: number
    importPortals: number
    publishPortals: number
    adTemplates: number
    users: number
    scheduledScraping: 'none' | 'daily' | 'realtime'
    whatsappMessages: number
    brandCustomization: 'none' | 'basic' | 'full'
    reports: 'basic' | 'advanced' | 'full'
    apiAccess: boolean
    digitalSignature: boolean
    csvExport: boolean
    publicCatalog: boolean
    support: 'email' | 'priority' | 'dedicated'
    sla: string | null
  }
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    nameEs: 'Básico',
    description: 'Para inmobiliarias chicas que están empezando',
    price: 29,
    limits: {
      properties: 50,
      pipelineLeads: 50,
      contracts: 10,
      importPortals: 2,
      publishPortals: 2,
      adTemplates: 3,
      users: 1,
      scheduledScraping: 'none',
      whatsappMessages: 50,
      brandCustomization: 'none',
      reports: 'basic',
      apiAccess: false,
      digitalSignature: false,
      csvExport: false,
      publicCatalog: false,
      support: 'email',
      sla: null,
    },
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    nameEs: 'Profesional',
    description: 'Para inmobiliarias en crecimiento',
    price: 79,
    limits: {
      properties: 250,
      pipelineLeads: 250,
      contracts: 50,
      importPortals: -1,
      publishPortals: -1,
      adTemplates: 6,
      users: 5,
      scheduledScraping: 'daily',
      whatsappMessages: 500,
      brandCustomization: 'basic',
      reports: 'advanced',
      apiAccess: false,
      digitalSignature: false,
      csvExport: true,
      publicCatalog: true,
      support: 'priority',
      sla: null,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameEs: 'Empresarial',
    description: 'Para grandes inmobiliarias y grupos',
    price: 199,
    limits: {
      properties: -1,
      pipelineLeads: -1,
      contracts: -1,
      importPortals: -1,
      publishPortals: -1,
      adTemplates: -1,
      users: -1,
      scheduledScraping: 'realtime',
      whatsappMessages: -1,
      brandCustomization: 'full',
      reports: 'full',
      apiAccess: true,
      digitalSignature: true,
      csvExport: true,
      publicCatalog: true,
      support: 'dedicated',
      sla: '99.9%',
    },
  },
}

export function getPlan(planId: string): PlanConfig {
  return PLANS[planId as PlanId] || PLANS.starter
}

export function isUnlimited(val: number): boolean {
  return val === -1
}

export function formatLimit(val: number, label: string): string {
  if (val === -1) return `${label} ilimitados`
  return `${val} ${label}`
}

export function checkLimit(current: number, max: number): { allowed: boolean; remaining: number } {
  if (max === -1) return { allowed: true, remaining: Infinity }
  return { allowed: current < max, remaining: Math.max(0, max - current) }
}
