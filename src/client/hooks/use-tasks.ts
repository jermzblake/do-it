import { fetchTasksByStatus, createTask } from '@/client/services/tasks.service'
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task, TasksByStatusProps } from '@/types/tasks.types'

export const tasksKeys = {
  all: ['tasks'],
  lists: () => [...tasksKeys.all, 'list'],
  statusList: (params: TasksByStatusProps) => [...tasksKeys.lists(), params],
  byId: (id: string) => [...tasksKeys.all, id],
  byUserId: (userId: string) => [...tasksKeys.all, userId],
}

export const useTasksByStatus = ({ status, page, pageSize = 5 }: TasksByStatusProps) => {
  return useQuery({
    queryKey: tasksKeys.statusList({ status, page, pageSize }),
    queryFn: () => fetchTasksByStatus({ status, page, pageSize }),
    placeholderData: keepPreviousData,
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskPayload: Partial<Task>) => createTask(taskPayload),
    onSuccess: () => {
      // Invalidate and refetch all task lists
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
    },
  })
}
