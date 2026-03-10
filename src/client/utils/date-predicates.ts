export const isToday = (date: string): boolean => {
  if (!date) {
    return false
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return false
  }
  const today = new Date()
  return d.toDateString() === today.toDateString()
}
export const isPast = (date: string): boolean => {
  if (!date) {
    return false
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return false
  }
  const now = new Date()
  return d < now && !isToday(date)
}
