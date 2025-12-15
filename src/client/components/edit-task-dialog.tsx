import type { Task } from '@/shared/task'
import { useUpdateTask } from '@/client/hooks/use-tasks'
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/client/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/client/components/ui/alert-dialog'
import { Label } from '@/client/components/ui/label'
import { Input } from '@/client/components/ui/input'
import { Textarea } from '@/client/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Button } from '@/client/components/ui/button'
import { Loader2 } from 'lucide-react'
import { DateTimePicker } from '@/client/components/datetime-picker'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskFormSchema } from '@/client/types/form.types'

interface EditTaskDialogProps {
  editingTask: Task | null
  setEditingTask: (task: Task | null) => void
}

export const EditTaskDialog = ({ editingTask, setEditingTask }: EditTaskDialogProps) => {
  if (!editingTask) return null

  const [showDiscardConfirmation, setShowDiscardConfirmation] = React.useState(false)
  const updateTask = useUpdateTask(editingTask?.id || '')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      name: editingTask?.name || '',
      description: editingTask?.description || '',
      notes: editingTask?.notes || '',
      priority: editingTask?.priority || 2,
      effort: editingTask?.effort || 3,
      dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate) : undefined,
      blockedReason: editingTask?.blockedReason || '',
      startBy: editingTask?.startBy ? new Date(editingTask.startBy) : undefined,
    },
  })

  React.useEffect(() => {
    if (editingTask) {
      reset({
        name: editingTask.name,
        description: editingTask.description || '',
        notes: editingTask.notes || '',
        priority: editingTask.priority,
        effort: editingTask.effort,
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
        blockedReason: editingTask.blockedReason || '',
        startBy: editingTask.startBy ? new Date(editingTask.startBy) : undefined,
      })
    }
  }, [editingTask, reset])

  const priority = watch('priority')
  const effort = watch('effort')
  const dueDate = watch('dueDate')
  const startBy = watch('startBy')
  const isValid = !!watch('name') && !!watch('effort')
  const isFormDirty = Object.keys(dirtyFields).length > 0

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isFormDirty) {
      setShowDiscardConfirmation(true)
      return
    }
    setEditingTask(null)
  }

  const handleDiscardConfirm = () => {
    setShowDiscardConfirmation(false)
    setEditingTask(null)
  }

  const handleDiscardCancel = () => {
    setShowDiscardConfirmation(false)
  }

  const handleSave = async (payload: z.infer<typeof TaskFormSchema>) => {
    if (!editingTask) return

    try {
      await updateTask.mutateAsync(payload)
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <>
      <Dialog open={!!editingTask} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-1 block">
                Task <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Task name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium mb-1 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Task description"
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Priority and Effort - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority" className="text-sm font-medium mb-1 block">
                  Priority
                </Label>
                <Select
                  onValueChange={(value) => setValue('priority', parseInt(value))}
                  defaultValue={priority?.toString()}
                  {...register('priority', { valueAsNumber: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
              </div>

              <div>
                <Label htmlFor="effort" className="text-sm font-medium mb-1 block">
                  Effort <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('effort', parseInt(value))}
                  defaultValue={effort?.toString()}
                  {...register('effort', { valueAsNumber: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Minimal</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Maximum</SelectItem>
                  </SelectContent>
                </Select>
                {errors.effort && <p className="text-sm text-red-500">{errors.effort.message}</p>}
              </div>
            </div>

            {/* Start By Field */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Start By</Label>
              <DateTimePicker
                value={startBy}
                onChange={(date: Date | undefined) => setValue('startBy', date)}
                granularity="minute"
              />
              {errors.startBy && <p className="text-sm text-red-500">{errors.startBy.message}</p>}
            </div>

            {/* Due Date & Time Field */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Due Date</Label>
              <DateTimePicker
                value={dueDate}
                onChange={(date: Date | undefined) => setValue('dueDate', date)}
                granularity="minute"
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
            </div>

            {/* Blocked Reason - Conditional */}
            {editingTask.status === 'blocked' && (
              <div>
                <Label htmlFor="blockedReason" className="text-sm font-medium mb-1 block">
                  Blocked Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="blockedReason"
                  {...register('blockedReason')}
                  placeholder="Why is this task blocked?"
                  rows={3}
                  className={errors.blockedReason ? 'border-red-500' : ''}
                />
                {errors.blockedReason && <p className="text-sm text-red-500">{errors.blockedReason.message}</p>}
              </div>
            )}

            {/* Notes Field */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-1 block">
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes"
                rows={3}
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => (isFormDirty ? setShowDiscardConfirmation(true) : setEditingTask(null))}
                disabled={updateTask.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTask.isPending || !isValid || isSubmitting}>
                {updateTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardConfirmation} onOpenChange={setShowDiscardConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your task. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardCancel}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardConfirm}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
