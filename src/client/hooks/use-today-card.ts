import type { Task } from '@/shared/task'
import { isToday, isPast } from '@/client/utils/date-predicates'

export const useTodayCard = () => {
  const diffDays = (date: string) =>
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
    if (dd && isPast(dd as string)) return 'overdue'
    if (dd && isToday(dd as string)) return 'due-today'
    if (sb && isToday(sb as string) && !dd) return 'starts-today'
    const d = diffDays(dd as string)
    if (d && d <= 3 && d > 0) return 'due-soon'
    return null
  }

  return { formatDate, getTaskUrgency }
}
