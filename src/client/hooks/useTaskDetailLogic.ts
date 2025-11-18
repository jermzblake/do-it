import React from 'react'
import type { Task } from '@/types/tasks.types'
import { useUpdateTask, useDeleteTask } from './use-tasks'
import { useNavigate } from '@tanstack/react-router'
import { useIsDesktop } from '@/client/hooks/use-media-query'
import { routes } from '@/client/routes/routes'

interface UseTaskDetailLogicProps {
  task: Task
  onClose?: () => void // For closing sidebar on desktop
}

export const useTaskDetailLogic = ({ task, onClose }: UseTaskDetailLogicProps) => {
  const [isEditing, setIsEditing] = React.useState(false)
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

  const onStatusChange = async (status: string) => {
    try {
      await updateTask.mutateAsync({ status })
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
