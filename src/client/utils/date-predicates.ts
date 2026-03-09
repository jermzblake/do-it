export const isToday = (date: string) => date && new Date(date).toDateString() === new Date().toDateString()

export const isPast = (date: string) => date && new Date(date) < new Date() && !isToday(date)
