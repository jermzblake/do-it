import { fetchTasksByStatus } from '@/client/services/tasks.service'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TasksByStatusProps } from '@/types/tasks.types'

export const tasksKeys = {
  all: ['tasks'],
  lists: () => [...tasksKeys.all, 'list'],
  statusList: (params: TasksByStatusProps) => [...tasksKeys.lists(), params],
  byId: (id: string) => [...tasksKeys.all, id],
  byUserId: (userId: string) => [...tasksKeys.all, userId],
}

export const useTasksByStatus = ({ status, userId, page, pageSize = 5 }: TasksByStatusProps) => {
  return useQuery({
    queryKey: tasksKeys.statusList({ status, userId, page, pageSize }),
    queryFn: () => fetchTasksByStatus({ status, userId, page, pageSize }),
    placeholderData: keepPreviousData,
  })
}
