export interface AdjustmentResult {
  previousIndex: number
  currentIndex: number
  variation: number
  previousAmount: number
  newAmount: number
  adjustmentDate: string
  indexType: 'IPC' | 'ICL'
}

export function calculateIPCAdjustment(
  baseAmount: number,
  baseIndex: number,
  currentIndex: number
): AdjustmentResult {
  const variation = ((currentIndex - baseIndex) / baseIndex) * 100
  const newAmount = Math.round(baseAmount * (currentIndex / baseIndex))
  return {
    previousIndex: baseIndex,
    currentIndex,
    variation: Number(variation.toFixed(2)),
    previousAmount: baseAmount,
    newAmount,
    adjustmentDate: new Date().toISOString().split('T')[0],
    indexType: 'IPC'
  }
}

export function calculateICLAdjustment(
  baseAmount: number,
  baseIndex: number,
  currentIndex: number
): AdjustmentResult {
  const variation = ((currentIndex - baseIndex) / baseIndex) * 100
  const newAmount = Math.round(baseAmount * (currentIndex / baseIndex))
  return {
    previousIndex: baseIndex,
    currentIndex,
    variation: Number(variation.toFixed(2)),
    previousAmount: baseAmount,
    newAmount,
    adjustmentDate: new Date().toISOString().split('T')[0],
    indexType: 'ICL'
  }
}

export function calculateNextAdjustmentDate(
  contractStart: string,
  adjustmentFrequencyMonths: number,
  lastAdjustment?: string
): string {
  const start = new Date(contractStart)
  const base = lastAdjustment ? new Date(lastAdjustment) : start
  const next = new Date(base)
  next.setMonth(next.getMonth() + adjustmentFrequencyMonths)
  return next.toISOString().split('T')[0]
}

export function getPendingAdjustments(
  contractStart: string,
  adjustmentFrequencyMonths: number,
  lastAdjustmentDate: string | null,
  asOfDate: string = new Date().toISOString().split('T')[0]
): string[] {
  const pending: string[] = []
  const base = lastAdjustmentDate ? new Date(lastAdjustmentDate) : new Date(contractStart)
  const asOf = new Date(asOfDate)
  let next = new Date(base)
  next.setMonth(next.getMonth() + adjustmentFrequencyMonths)

  while (next <= asOf) {
    pending.push(next.toISOString().split('T')[0])
    next = new Date(next)
    next.setMonth(next.getMonth() + adjustmentFrequencyMonths)
  }
  return pending
}

export function calculateAnnualIncrease(
  monthlyRent: number,
  increasePercentage: number
): { monthly: number; annual: number; increase: number } {
  const increase = Math.round(monthlyRent * (increasePercentage / 100))
  const monthly = monthlyRent + increase
  return {
    monthly,
    annual: monthly * 12,
    increase
  }
}

export function calculateCommission(
  amount: number,
  percentage: number,
  minAmount?: number,
  maxAmount?: number
): number {
  let commission = Math.round(amount * (percentage / 100))
  if (minAmount !== undefined) commission = Math.max(commission, minAmount)
  if (maxAmount !== undefined) commission = Math.min(commission, maxAmount)
  return commission
}

export function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}