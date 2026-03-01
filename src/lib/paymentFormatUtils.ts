/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency: string = 'EUR'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse currency string to cents
 */
export function parseCurrencyToCents(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[€$£,\s]/g, '')
  const num = parseFloat(cleaned)
  return Math.round(num * 100)
}

/**
 * Calculate days until due date
 */
export function daysUntilDue(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
