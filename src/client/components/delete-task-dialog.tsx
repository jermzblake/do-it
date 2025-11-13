import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useDeleteTask } from '@/client/hooks/use-tasks'

interface DeleteTaskDialogProps {
  deleteTaskId: string | null
  setDeleteTaskId: (taskId: string | null) => void
}

export const DeleteTaskDialog = ({ deleteTaskId, setDeleteTaskId }: DeleteTaskDialogProps) => {
  if (!deleteTaskId) return null

  const deleteTask = useDeleteTask(deleteTaskId)

  const handleDelete = async () => {
    if (!deleteTaskId) return
    await deleteTask.mutateAsync()
    setDeleteTaskId(null)
  }

  return (
    <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTask.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
