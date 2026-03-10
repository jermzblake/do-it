import type { Task } from '@/shared/task'
import { isToday, isPast } from '@/client/utils/date-predicates'

export const useTodayCard = () => {
  const toMidnight = (date: string | Date | null | undefined) => {
    if (!date) return null
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) return null
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
  }

  const diffDays = (date: string | Date | null | undefined) => {
    const dateAtMidnight = toMidnight(date)
    if (!dateAtMidnight) return null

    const now = new Date()
    const nowAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return Math.round((dateAtMidnight.getTime() - nowAtMidnight.getTime()) / 864e5)
  }

  const formatDate = (date: string | Date) => {
    const dateDifference = diffDays(date)
    if (dateDifference === null) return null

    if (dateDifference === 0) return 'Today'
    if (dateDifference === -1) return 'Yesterday'
    if (dateDifference < 0) return `${Math.abs(dateDifference)}d ago`
    return dateDifference === 1 ? 'Tomorrow' : `in ${dateDifference}d`
  }

  function getTaskUrgency(task: Task) {
    const { dueDate: dd, startBy: sb } = task
    if (dd && isPast(dd)) return 'overdue'
    if (dd && isToday(dd)) return 'due-today'
    if (sb && isToday(sb) && !dd) return 'start-today'
    const d = diffDays(dd)
    if (d && d <= 3 && d > 0) return 'due-soon'
    return null
  }

  return { formatDate, getTaskUrgency }
}
