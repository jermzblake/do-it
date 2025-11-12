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
}

export interface TasksByStatusProps {
  status: string
  page?: number
  pageSize?: number
}
