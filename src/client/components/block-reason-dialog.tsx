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
import { Textarea } from '@/client/components/ui/textarea'
import { useUpdateTask } from '@/client/hooks/use-tasks'
import { toast } from 'sonner'
import { isDevEnvironment } from '@/client/constants/environment'

interface BlockReasonDialogProps {
  taskToBlockId: string | null
  setTaskToBlockId: (taskId: string | null) => void
}

export const BlockReasonDialog = ({ taskToBlockId, setTaskToBlockId }: BlockReasonDialogProps) => {
  if (!taskToBlockId) return null

  const updateTask = useUpdateTask(taskToBlockId)
  const [blockedReason, setBlockedReason] = React.useState('')

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({ blockedReason, status: 'blocked' })
      setTaskToBlockId(null)
      setBlockedReason('')
      toast.success('Task blocked successfully')
    } catch (error) {
      isDevEnvironment && console.log('ERROR:', error)
      toast.error('Error blocking task')
    }
  }

  const handleClose = () => {
    setTaskToBlockId(null)
    setBlockedReason('')
  }

  return (
    <AlertDialog open={!!taskToBlockId} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Blocked Reason</AlertDialogTitle>
          <AlertDialogDescription>You must provide a reason why this task is blocked.</AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={blockedReason}
          onChange={(e) => setBlockedReason(e.target.value)}
          placeholder="Enter blocked reason here..."
          className="w-full mb-4"
          rows={2}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateTask.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            disabled={updateTask.isPending || !blockedReason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {updateTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Block
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
