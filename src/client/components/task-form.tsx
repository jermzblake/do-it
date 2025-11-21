import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { DateTimePicker } from '@/client/components/datetime-picker'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskFormSchema } from '../../types/form.types'
import { useCreateTask } from '@/client/hooks/use-tasks'
import { toast } from 'sonner'
import { isDevEnvironment } from '@/client/constants/environment'
import { useIsDesktop } from '@/client/hooks/use-media-query'
import { useNavigate } from '@tanstack/react-router'
import { routes } from '@/client/routes/routes'

interface TaskFormProps {
  setShowForm?: (show: boolean) => void
}

export function TaskForm({ setShowForm }: TaskFormProps) {
  const createTaskMutation = useCreateTask()
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()

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
      name: '',
      description: '',
      status: 'todo',
      priority: 2,
      effort: undefined,
      dueDate: undefined,
      blockedReason: undefined,
      notes: undefined,
    },
  })

  const status = watch('status')
  const priority = watch('priority')
  const effort = watch('effort')
  const dueDate = watch('dueDate')
  const isValid = !!watch('name') && !!watch('effort')

  const onSubmit = async (payload: z.infer<typeof TaskFormSchema>) => {
    try {
      await createTaskMutation.mutateAsync(payload)
      isDevEnvironment && console.log('SUCCESS: Task created successfully')
      toast.success('Task created successfully')
      reset()
      if (!isDesktop) {
        navigate({ to: routes.dashboard })
      }
      setShowForm?.(false)
    } catch (error) {
      // You can set form errors here if needed
      isDevEnvironment && console.log('ERROR:', error)
      toast.error('Error creating task')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      {/* instructions only visible on mobile */}
      <div className="grid col-auto md:hidden text-sm text-gray-600 -mt-4">
        <h4 className="font-bold">Fill out the form to create a new task.</h4>
      </div>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Task <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter task name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter task description"
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Status Field */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => setValue('status', value)} defaultValue={status}>
          <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
      </div>

      {/* Blocked Reason - Conditional */}
      {status === 'blocked' && (
        <div className="space-y-2">
          <Label htmlFor="blockedReason">
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

      {/* Priority and Effort - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            onValueChange={(value) => setValue('priority', parseInt(value))}
            defaultValue={priority?.toString()}
            {...register('priority', { valueAsNumber: true })}
          >
            <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Low</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="effort">
            Effort <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue('effort', parseInt(value))}
            defaultValue={effort?.toString()}
            {...register('effort', { valueAsNumber: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="1 (min) - 5 (max)" />
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

      {/* Due Date and Time Field */}
      <div className="space-y-2">
        <Label>Due Date</Label>
        <DateTimePicker
          value={dueDate}
          onChange={(date: Date | undefined) => setValue('dueDate', date)}
          granularity="minute"
        />
        {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate.message}</p>}
      </div>

      {/* Notes Field */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes"
          rows={3}
          className={errors.notes ? 'border-red-500' : ''}
        />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || !isValid || createTaskMutation.isPending} className="w-full">
        {createTaskMutation.isPending ? 'Creating Task...' : 'Create Task'}
      </Button>
    </form>
  )
}
