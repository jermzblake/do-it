import { format, formatDistance, formatRelative, subDays, formatDistanceToNow } from 'date-fns'
export const formatDate = (dateString: string) => {
  if (!dateString) return null
  const date = new Date(dateString)
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
  return date.toString()
}
