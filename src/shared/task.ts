/**
 * Shared task types used across client and server.
 */

export interface Task {
  id: string
  name: string
  description: string
  status: string
  priority: number
  effort: number
  dueDate?: Date | string
  blockedReason?: string
  notes?: string
  startedAt?: Date | string
  completedAt?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface TasksByStatusProps {
  status: string
  page?: number
  pageSize?: number
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
