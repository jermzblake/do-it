import type { Task } from './task'

// Centralized list of Task date keys. Keep this in sync with `Task`.
export const TASK_DATE_KEYS = [
  'dueDate',
  'startBy',
  'startedAt',
  'completedAt',
  'createdAt',
  'updatedAt',
] as const satisfies readonly (keyof Task)[]

// `satisfies` above provides a compile-time check that each entry is a key of `Task`.
