import React from 'react'
import type { Task } from '@/shared/task'
import { statusConfig, priorityConfig } from '@/client/lib/configs'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Textarea } from '@/client/components/ui/textarea'
import { Badge } from '@/client/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Separator } from '@/client/components/ui/separator'
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
import { Clock, AlertCircle, CheckCircle2, Pause, Trash2, Edit2, MessageSquare, Loader2 } from 'lucide-react'
import { DateTimePicker } from '@/client/components/datetime-picker'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskFormSchema } from '@/client/types/form.types'
import { Label } from './ui/label'

interface TaskDetailsContentProps {
  task: Task
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (payload: Partial<Task>) => Promise<void>
  onStatusChange: (status: string) => Promise<void>
  onDeleteRequest: () => Promise<void>
  isUpdating: boolean
  isDeleting: boolean
}

export const TaskDetailsContent = ({
  task,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onStatusChange,
  onDeleteRequest,
  isUpdating,
  isDeleting,
}: TaskDetailsContentProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      name: task?.name || '',
      description: task?.description || '',
      notes: task?.notes || '',
      priority: task?.priority || 2,
      effort: task?.effort || 3,
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      blockedReason: task?.blockedReason || '',
      status: task?.status,
    },
  })

  React.useEffect(() => {
    if (task && isEditing) {
      reset({
        name: task.name,
        description: task.description || '',
        notes: task.notes || '',
        priority: task.priority,
        effort: task.effort,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        blockedReason: task.blockedReason || '',
        status: task.status,
      })
    }
  }, [task, isEditing, reset])

  const priority = watch('priority')
  const effort = watch('effort')
  const dueDate = watch('dueDate')
  const isValid = !!watch('name') && !!watch('effort')
  const taskStatus = watch('status')

  const handleSave = handleSubmit(async (payload) => {
    await onSave(payload)
  })

  const handleDelete = async () => {
    await onDeleteRequest()
    setShowDeleteDialog(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const StatusIcon = statusConfig[task?.status]?.icon

  return (
    <div className="space-y-6 w-full md:max-w-4xl md:mx-auto md:p-6 pb-24 md:pb-6">
      {/* HEADER (desktop only - mobile gets its own wrapper) */}
      <div className="hidden md:flex items-start justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Task Details</h2>
        {!isEditing && (
          <Button variant="outline" onClick={onEdit} disabled={isUpdating || isDeleting}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        )}
      </div>

      {/* Task Name */}
      {isEditing ? (
        <>
          <Input id="name" {...register('name')} className="text-xl font-semibold" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </>
      ) : (
        <h1 className="text-xl md:text-2xl font-bold">{task?.name}</h1>
      )}

      {/* STATUS + PRIORITY */}
      <div className="flex flex-wrap gap-2">
        <Badge className={`${statusConfig[task?.status]?.color} border-2 px-3 py-1`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {statusConfig[task?.status]?.label}
        </Badge>
        <Badge variant="outline" className={`${priorityConfig[task?.priority]?.color} border-2 px-3 py-1`}>
          {priorityConfig[task?.priority]?.label} Priority
        </Badge>
      </div>

      {/* QUICK ACTIONS */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2">
          {task?.status === 'todo' && (
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => onStatusChange('in_progress')}
              disabled={isUpdating || isDeleting}
            >
              <Clock className="w-4 h-4 mr-2" />
              Start Task
            </Button>
          )}
          {(task?.status === 'todo' || task?.status === 'in_progress') && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => onStatusChange('completed')}
                disabled={isUpdating || isDeleting}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => onStatusChange('blocked')}
                disabled={isUpdating || isDeleting}
              >
                <Pause className="w-4 h-4 mr-2" />
                Mark Blocked
              </Button>
            </>
          )}
          {task?.status === 'blocked' && (
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => onStatusChange('in_progress')}
              disabled={isUpdating || isDeleting}
            >
              <Clock className="w-4 h-4 mr-2" />
              Resume Task
            </Button>
          )}
        </div>
      )}

      <Separator />

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
            {isEditing ? (
              <Textarea id="description" {...register('description')} rows={4} className="resize-none" />
            ) : (
              <div className="text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-4 border min-h-[100px]">
                {task?.description || (
                  <span className="text-slate-400 italic">No description provided. Add a description here.</span>
                )}
              </div>
            )}
          </div>

          {/* Blocked Reason - Only show if blocked */}
          {(isEditing && task?.status === 'blocked') || task?.status === 'blocked' ? (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Blocked Reason</label>
              {isEditing ? (
                <>
                  <Input id="blockedReason" {...register('blockedReason')} placeholder="Why is this task blocked?" />
                  {errors.blockedReason && <p className="text-sm text-red-500">{errors.blockedReason.message}</p>}
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{task?.blockedReason || 'No reason specified'}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* RightColumn - Metadata Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <h3 className="font-semibold text-slate-900">Details</h3>

            {/* Status */}
            {isEditing && (
              <div>
                <Label htmlFor="status" className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Status
                </Label>
                <Select
                  onValueChange={(value) => setValue('status', value)}
                  {...register('status')}
                  value={taskStatus || undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority - Only in edit mode */}
            {isEditing && (
              <div>
                <Label htmlFor="priority" className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Priority
                </Label>
                <Select
                  onValueChange={(value) => setValue('priority', parseInt(value))}
                  {...register('priority', { valueAsNumber: true })}
                  value={priority ? priority.toString() : undefined}
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
            )}

            {/* Effort */}
            <div>
              <Label htmlFor="effort" className="text-xs font-medium text-slate-500 mb-1.5 block">
                Effort
              </Label>
              {isEditing ? (
                <>
                  <Select
                    onValueChange={(value) => setValue('effort', parseInt(value))}
                    {...register('effort', { valueAsNumber: true })}
                    value={effort ? effort.toString() : undefined}
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
                </>
              ) : (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded ${i < task?.effort ? 'bg-blue-500' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate" className="text-xs font-medium text-slate-500 mb-1.5 block">
                Due Date
              </Label>
              {isEditing ? (
                <>
                  <DateTimePicker
                    value={dueDate ? new Date(dueDate) : undefined}
                    onChange={(date: Date | undefined) => setValue('dueDate', date)}
                    granularity="minute"
                    previewFormat="short"
                  />
                </>
              ) : (
                <p className="text-sm text-slate-900">{formatDate(task?.dueDate as string)}</p>
              )}
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-2 text-xs text-slate-500">
              {task?.createdAt && (
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">{formatDateTime(task?.createdAt as string)}</span>
                </div>
              )}
              {task?.startedAt && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span className="font-medium">{formatDateTime(task?.startedAt as string)}</span>
                </div>
              )}
              {task?.completedAt && (
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">{formatDateTime(task?.completedAt as string)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          {!isEditing && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting || isUpdating}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Notes
        </Label>

        {isEditing ? (
          <>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes"
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
          </>
        ) : (
          <div className="bg-slate-50 rounded-lg p-4 border min-h-[80px] whitespace-pre-wrap">
            {task?.notes || <span className="text-slate-400 italic">No notes</span>}
          </div>
        )}
      </div>

      {/* EDITING ACTIONS (DESKTOP ONLY; mobile version will wrap via sticky footer) */}
      {isEditing && (
        <div className="hidden md:flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !isValid || isSubmitting}>
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      )}

      {/* EDITING ACTIONS (MOBILE STICKY FOOTER) */}
      {isEditing && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || !isValid || isSubmitting}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
