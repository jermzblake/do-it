import { toIsoString } from './normalize-date'

export const isOverdue = (dueDate?: string | Date | null) => {
  const dateStr = toIsoString(dueDate)
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}
