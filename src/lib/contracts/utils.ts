import { v4 as uuidv4 } from 'uuid'

let counter = 0

export function generateContractNumber(): string {
  counter++
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const seq = String(counter).padStart(4, '0')
  return `CT-${year}${month}-${seq}`
}

export function generateId(): string {
  return uuidv4()
}

export function calculateEndDate(startDate: string, durationMonths: number): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + durationMonths)
  return date.toISOString().split('T')[0]
}

export function calculateNextAdjustment(
  lastAdjustment: string | null,
  contractStart: string,
  frequencyMonths: number
): string {
  const base = lastAdjustment ? new Date(lastAdjustment) : new Date(contractStart)
  const next = new Date(base)
  next.setMonth(next.getMonth() + frequencyMonths)
  return next.toISOString().split('T')[0]
}

export function getContractStatus(
  startDate: string,
  endDate: string
): 'vigente' | 'vencido' | 'por_iniciar' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (now < start) return 'por_iniciar'
  if (now > end) return 'vencido'
  return 'vigente'
}