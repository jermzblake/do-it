import { fetchTasksByStatus, createTask, updateTaskById, deleteTaskById } from '@/client/services/tasks.service'
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task, TasksByStatusProps, TaskStatus } from '@/types/tasks.types'

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
    onSuccess: (response, variables) => {
      // Only invalidate the specific status list where the task was created
      queryClient.invalidateQueries({
        queryKey: tasksKeys.lists(),
        refetchType: 'active',
        predicate: (query) => {
          const params = query.queryKey[2] as TasksByStatusProps | undefined
          return params?.status === variables.status
        },
      })
    },
  })
}

export const useUpdateTask = (taskId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskPayload: Partial<Task>) => updateTaskById(taskId, taskPayload),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.lists() })

      const previousQueries = queryClient.getQueriesData<{ data: Task[] }>({ queryKey: tasksKeys.lists() })
      const isStatusChange = 'status' in updatedTask

      if (isStatusChange) {
        // For status changes, we need to remove from old list and add to new list
        previousQueries.forEach(([queryKey, oldData]) => {
          if (!oldData?.data) return

          const taskInList = oldData.data.find((task: Task) => task.id === taskId)

          if (taskInList) {
            // Found the task - remove it from this list (it's moving to another status)
            queryClient.setQueryData(queryKey, {
              ...oldData,
              data: oldData.data.filter((task: Task) => task.id !== taskId),
            })
          }
        })

        // Note: We don't optimistically add to the new list because we don't know
        // which page it should appear on. Let invalidation handle the refetch.
      } else {
        // For non-status updates (like name, priority, etc.), update in place
        previousQueries.forEach(([queryKey, oldData]) => {
          if (!oldData?.data) return

          const taskExists = oldData.data.some((task: Task) => task.id === taskId)

          if (taskExists) {
            queryClient.setQueryData(queryKey, {
              ...oldData,
              data: oldData.data.map((task: Task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
            })
          }
        })
      }

      return { previousQueries, isStatusChange, newStatus: updatedTask.status as TaskStatus | undefined }
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: (data, error, variables, context) => {
      // Only refetch if status changed (to populate the new status column)
      if (context?.isStatusChange && context?.newStatus) {
        queryClient.invalidateQueries({
          queryKey: tasksKeys.lists(),
          refetchType: 'active',
          predicate: (query) => {
            const params = query.queryKey[2] as TasksByStatusProps | undefined
            return params?.status === context.newStatus
          },
        })
      }
    },
  })
}

export const useDeleteTask = (taskId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteTaskById(taskId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.lists() })

      const previousQueries = queryClient.getQueriesData<{ data: Task[] }>({
        queryKey: tasksKeys.lists(),
      })

      // Optimistically remove the task from all lists
      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData?.data) return

        const hasTask = oldData.data.some((task: Task) => task.id === taskId)

        if (hasTask) {
          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: oldData.data.filter((task: Task) => task.id !== taskId),
          })
        }
      })

      return { previousQueries }
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
  })
}
