export type ChannelType = 'mercadolibre' | 'zonaprop' | 'argenprop' | 'whatsapp' | 'properati'

export interface PublishChannel {
  id?: string
  workspaceId: string
  type: ChannelType
  label: string
  config: Record<string, any>
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PublishLog {
  id?: string
  workspaceId: string
  propertyId: string
  channelId?: string
  channelType: string
  propertyTitle?: string
  status: 'pending' | 'publishing' | 'success' | 'error'
  result?: Record<string, any>
  error?: string
  externalId?: string
  externalUrl?: string
  createdAt?: string
}

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  mercadolibre: 'MercadoLibre',
  zonaprop: 'ZonaProp',
  argenprop: 'Argenprop',
  whatsapp: 'WhatsApp',
  properati: 'Properati',
}

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  mercadolibre: 'M3',
  zonaprop: 'ZP',
  argenprop: 'AP',
  whatsapp: 'WA',
  properati: 'PR',
}

export const CHANNEL_COLORS: Record<ChannelType, string> = {
  mercadolibre: 'bg-amber-500',
  zonaprop: 'bg-blue-500',
  argenprop: 'bg-emerald-500',
  whatsapp: 'bg-green-500',
  properati: 'bg-purple-500',
}

export const AVAILABLE_CHANNELS: { type: ChannelType; label: string; ready: boolean; description: string }[] = [
  { type: 'mercadolibre', label: 'MercadoLibre', ready: true, description: 'Publicar en MercadoLibre.com.ar con OAuth' },
  { type: 'zonaprop', label: 'ZonaProp', ready: false, description: 'Próximamente' },
  { type: 'argenprop', label: 'Argenprop', ready: false, description: 'Próximamente' },
  { type: 'whatsapp', label: 'WhatsApp', ready: false, description: 'Próximamente' },
  { type: 'properati', label: 'Properati', ready: false, description: 'Próximamente' },
]