import { fetchTasksByStatus } from '@/client/services/tasks.service'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TasksByStatusProps } from '@/types/tasks.types'

export const useTasksByStatus = ({ status, userId, page, pageSize = 5 }: TasksByStatusProps) => {
  return useQuery({
    queryKey: ['tasks', status, userId, page, pageSize],
    queryFn: () => fetchTasksByStatus({ status, userId, page, pageSize }),
    placeholderData: keepPreviousData,
  })
}
