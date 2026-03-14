import { useUpdateTask } from '@/client/hooks/use-tasks'
import type { Task, TaskStatus } from '@/shared/task'

export const handleQuickStatusUpdate = async (
  task: Task,
  newStatus: TaskStatus,
  additionalUpdates: Partial<Task> = {},
) => {
  const updateTask = useUpdateTask(task.id)
  const updates: Partial<Task> = { status: newStatus, ...additionalUpdates }

  // Set timestamps based on status
  if (newStatus === 'in_progress' && !task.startedAt) {
    updates.startedAt = new Date().toISOString()
  }
  if (newStatus === 'completed') {
    updates.completedAt = new Date().toISOString()
  }

  await updateTask.mutateAsync(updates)
}
