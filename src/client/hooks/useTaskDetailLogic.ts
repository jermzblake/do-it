import React from 'react'
import type { Task, TaskStatus } from '@/shared/task'
import { useUpdateTask, useDeleteTask } from './use-tasks'
import { useNavigate } from '@tanstack/react-router'
import { useIsDesktop } from '@/client/hooks/use-media-query'
import { routes } from '@/client/routes/routes'
import { handleQuickStatusUpdate } from '@/client/utils/task-status-update'

interface UseTaskDetailLogicProps {
  task: Task
  onClose?: () => void // For closing sidebar on desktop
  initialIsEditing?: boolean // Start in editing mode
}

export const useTaskDetailLogic = ({ task, onClose, initialIsEditing = false }: UseTaskDetailLogicProps) => {
  const [isEditing, setIsEditing] = React.useState(initialIsEditing)
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const updateTask = useUpdateTask(task.id)
  const deleteTask = useDeleteTask(task.id)

  const onEdit = () => setIsEditing(true)
  const onCancel = () => setIsEditing(false)

  const onSave = async (payload: Partial<Task>) => {
    try {
      await updateTask.mutateAsync(payload)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const onStatusChange = async (status: TaskStatus) => {
    try {
      const additionalUpdates =
        task.status === 'blocked' && status === 'in_progress'
          ? {
              blockedReason: '',
              notes: `${task.notes || ''} \n\nUnblocked on ${new Date().toLocaleDateString()}`,
            }
          : {}
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
      } else {
        navigate({ to: routes.dashboard }) // Navigate back on mobile
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
