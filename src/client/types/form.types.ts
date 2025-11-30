import type { FieldError, UseFormRegister } from 'react-hook-form'
import { z } from 'zod'

export type ValidFieldNames =
  | 'name'
  | 'description'
  | 'status'
  | 'priority'
  | 'effort'
  | 'dueDate'
  | 'blockedReason'
  | 'notes'

export interface TaskFormProps {
  type: string
  placeholder?: string
  name: ValidFieldNames
  register: UseFormRegister<TaskFormData>
  error?: FieldError | undefined
  defaultValue?: string | number
  valueAsNumber?: boolean
}

export const TaskFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(512, 'Too long').trim(),
    description: z.string().trim().optional(),
    status: z.string().max(20).optional(),
    priority: z.number().optional(),
    effort: z.number('Enter a number').optional(),
    dueDate: z.date().optional(),
    blockedReason: z.string().trim().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // If status is blocked, blockedReason must be provided
      if (data.status === 'blocked') {
        return data.blockedReason && data.blockedReason.trim().length > 0
      }
      return true // Otherwise, validation passes
    },
    {
      message: 'Blocked reason is required when status is blocked',
      path: ['blockedReason'],
    },
  )

export type TaskFormData = z.infer<typeof TaskFormSchema>
