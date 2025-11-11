export interface Task {
  id: string
  name: string
  description: string
  status: string
  priority: number
  effort: number
  dueDate?: Date
  blockedReason?: string
  notes?: string
  startedAt?: Date
  completedAt?: Date
}

export interface TasksByStatusProps {
  status: string
  page?: number
  pageSize?: number
}
