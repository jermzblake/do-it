import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { DateTimePicker } from '@/client/components/datetime-picker'
import { useRef, type FormEvent } from 'react'
import { apiClient } from '../lib/axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskFormSchema } from '../../types/form.types'

export function TaskFormDeprecated() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null)

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const taskName = formData.get('taskName') as string
      const taskDescription = formData.get('taskDescription') as string
      // Simulate API call
      const res = await apiClient.post('/tasks', {
        name: taskName,
        description: taskDescription,
      })
      const data = res.data
      responseInputRef.current!.value = JSON.stringify(data, null, 2)
    } catch (error) {
      responseInputRef.current!.value = String(error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submitForm} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="taskName">Task Name</Label>
          <Input id="taskName" type="text" name="taskName" required placeholder="Enter task name" />
        </div>
        <div>
          <Label htmlFor="taskDescription">Task Description</Label>
          <Textarea
            id="taskDescription"
            name="taskDescription"
            required
            placeholder="Enter task description"
            className="resize-y"
          />
        </div>
        <Button type="submit" variant="secondary">
          Create Task
        </Button>
      </form>
      <Label htmlFor="response" className="sr-only">
        Response
      </Label>
      <Textarea
        ref={responseInputRef}
        id="response"
        readOnly
        placeholder="Response will appear here..."
        className="min-h-[140px] font-mono resize-y"
      />
    </div>
  )
}

export function TaskForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
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
  const dueDate = watch('dueDate')

  const onSubmit = async (payload: z.infer<typeof TaskFormSchema>) => {
    try {
      const res = await apiClient.post('/tasks', payload) //TODO move this to a api service (with react query?)
      const data = res.data
      console.log('SUCCESS', data) //TODO show success message or replace with toast
      reset()
    } catch (error) {
      console.log('ERROR', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="grid col-auto">
        <h1 className="text-3xl font-bold mb-4">Create Task Form</h1>
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
            {...register('effort', { valueAsNumber: true })}
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
          <Input
            id="effort"
            type="number"
            {...register('effort', { valueAsNumber: true })}
            placeholder="1-5"
            min="1"
            max="5"
            className={errors.effort ? 'border-red-500' : ''}
          />
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
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating Task...' : 'Create Task'}
      </Button>
    </form>
  )
}
