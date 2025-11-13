export const isOverdue = (dueDate: string) => {
  if (!dueDate || dueDate.trim() === '') return false
  return new Date(dueDate) < new Date()
}
