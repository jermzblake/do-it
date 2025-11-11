import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { TaskTable } from '../db/schema'
import { z } from 'zod'

export const insertTaskSchema = createInsertSchema(TaskTable, {
  name: z.string().min(1, 'Task name is required').max(512, 'Task name must be 512 characters or less'),
  description: z.string().optional(),
  notes: z.string().optional(),
  priority: z.number().int().min(1, 'Priority must be at least 1').max(3, 'Priority must be at most 3'),
  effort: z.number().int().min(1, 'Effort must be at least 1').max(5, 'Effort must be at most 5'),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked', 'cancelled']).optional(),
  blockedReason: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
})

export const updateTaskSchema = insertTaskSchema.partial().omit({
  userId: true, // Don't allow changing userId
  id: true, // Don't allow changing id
})

export const selectTaskSchema = createSelectSchema(TaskTable)

export type InsertTaskSchema = z.infer<typeof insertTaskSchema>
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>
export type SelectTaskSchema = z.infer<typeof selectTaskSchema>
