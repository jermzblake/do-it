import React from 'react'
import type { Task, TaskStatus } from '@/shared/task'
import { useUpdateTask, useDeleteTask } from './use-tasks'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useIsDesktop } from '@/client/hooks/use-media-query'
import { routes } from '@/client/routes/routes'
import { handleQuickStatusUpdate } from '@/client/utils/task-status-update'

const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'completed', 'blocked', 'cancelled']

const isTaskStatus = (status: string): status is TaskStatus => TASK_STATUSES.includes(status as TaskStatus)

interface UseTaskDetailLogicProps {
  task: Task
  onClose?: () => void // For closing sidebar on desktop
  initialIsEditing?: boolean // Start in editing mode
}

export const useTaskDetailLogic = ({ task, onClose, initialIsEditing = false }: UseTaskDetailLogicProps) => {
  const [isEditing, setIsEditing] = React.useState(initialIsEditing)
  const navigate = useNavigate()
  const router = useRouter()
  const isDesktop = useIsDesktop()

  const updateTask = useUpdateTask(task.id)
  const deleteTask = useDeleteTask(task.id)

  const onEdit = () => setIsEditing(true)
  const onCancel = () => setIsEditing(false)

  const getStatusTransitionUpdates = (
    status: TaskStatus,
    baseUpdates: Partial<Omit<Task, 'status'>> = {},
  ): Partial<Omit<Task, 'status'>> => {
    if (task.status !== 'blocked' || status !== 'in_progress') {
      return baseUpdates
    }

    const notesBase = typeof baseUpdates.notes === 'string' ? baseUpdates.notes : (task.notes ?? '')
    return {
      ...baseUpdates,
      blockedReason: '',
      notes: `${notesBase} \n\nUnblocked on ${new Date().toLocaleDateString()}`,
    }
  }

  const onSave = async (payload: Partial<Task>) => {
    try {
      if (payload.status && isTaskStatus(payload.status) && payload.status !== task.status) {
        const { status, ...restPayload } = payload
        const additionalUpdates = getStatusTransitionUpdates(status, restPayload)
        await handleQuickStatusUpdate(updateTask.mutateAsync, task, status, additionalUpdates)
      } else {
        const restPayload = { ...payload }
        delete restPayload.status
        await updateTask.mutateAsync(restPayload)
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const onStatusChange = async (status: TaskStatus) => {
    try {
      const additionalUpdates = getStatusTransitionUpdates(status)
      await handleQuickStatusUpdate(updateTask.mutateAsync, task, status, additionalUpdates)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const onDeleteRequest = async () => {
    try {
      await deleteTask.mutateAsync()

      if (isDesktop && onClose) {
        onClose()
      } else if (window.history.length > 1) {
        router.history.back()
      } else {
        navigate({ to: routes.dashboard })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return {
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onStatusChange,
    onDeleteRequest,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
  } as const
}
