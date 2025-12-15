import { format, formatDistance, formatRelative, subDays, formatDistanceToNow } from 'date-fns'

export const formatDate = (dateInput?: string | Date | null, returnShortVersion = false): string | null => {
  if (!dateInput) return null
  const date = typeof dateInput === 'string' ? new Date(dateInput) : (dateInput as Date)
  if (isNaN(date.getTime())) return null

  const now = new Date()
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffDays = Math.round((dateAtMidnight.getTime() - nowAtMidnight.getTime()) / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60))

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) {
    // It's tomorrow - show hours if less than 24 hours away
    if (diffHours < 24) return `${diffHours}h`
    return 'Tomorrow'
  }
  if (diffDays < 7) return `${diffDays}d`

  // If caller requested short version, return compact human-friendly string
  if (returnShortVersion) {
    const short = format(date, 'EEE MMM dd')
    if (date.getFullYear() !== now.getFullYear()) {
      return `${short}, ${format(date, 'yyyy')}`
    }
    return short
  }

  // Default / long form fallback
  return date.toString()
}

export const formatShortDate = (dateInput?: string | Date | null): string | null => formatDate(dateInput, true)
