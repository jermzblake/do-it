import type { Task, TaskStatus } from '@/shared/task'

type UpdateTaskFn = (updates: Partial<Task>) => Promise<unknown>

// TODO: This function is doing double-duty for both quick status updates and the block action which also requires clearing the blockedReason. It would be cleaner to separate these into two functions but for now this works and keeps all the logic for status updates in one place
export const handleQuickStatusUpdate = async (
  updateTask: UpdateTaskFn,
  task: Task,
  newStatus: TaskStatus,
  additionalUpdates: Partial<Omit<Task, 'status'>> = {},
) => {
  const updates: Partial<Task> = { status: newStatus, ...additionalUpdates }

  // Set timestamps based on status
  if (newStatus === 'in_progress' && !task.startedAt) {
    updates.startedAt = new Date().toISOString()
  }
  if (newStatus === 'completed' && !task.completedAt) {
    updates.completedAt = new Date().toISOString()
  }

  await updateTask(updates)
}
