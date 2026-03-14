import type { Task, TaskStatus } from '@/shared/task'

type UpdateTaskFn = (updates: Partial<Task>) => Promise<unknown>

export const handleQuickStatusUpdate = async (
  updateTask: UpdateTaskFn,
  task: Task,
  newStatus: TaskStatus,
  additionalUpdates: Partial<Task> = {},
) => {
  const updates: Partial<Task> = { status: newStatus, ...additionalUpdates }

  // Set timestamps based on status
  if (newStatus === 'in_progress' && !task.startedAt) {
    updates.startedAt = new Date().toISOString()
  }
  if (newStatus === 'completed') {
    updates.completedAt = new Date().toISOString()
  }

  await updateTask(updates)
}
