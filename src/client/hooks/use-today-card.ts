import type { Task } from '@/shared/task'
import { isToday, isPast } from '@/client/utils/date-predicates'

export const useTodayCard = () => {
  const diffDays = (date: string | Date | null | undefined) =>
    date ? Math.ceil((new Date(date).getTime() - new Date().getTime()) / 864e5) : null
  const formatDate = (date: string) => {
    if (isToday(date)) return 'Today'
    if (isPast(date)) {
      const dateDifference = diffDays(date)
      if (dateDifference === null) return null
      return dateDifference && dateDifference === 0 ? 'Yesterday' : `${Math.abs(dateDifference)}d ago`
    }
    const dateDifference = diffDays(date)
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
