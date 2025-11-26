import {
  fetchTasksByStatus,
  createTask,
  updateTaskById,
  deleteTaskById,
  fetchTaskById,
} from '@/client/services/tasks.service'
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

export const useTaskById = (taskId: string) => {
  return useQuery({
    queryKey: tasksKeys.byId(taskId),
    queryFn: () => fetchTaskById(taskId),
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskPayload: Partial<Task>) => createTask(taskPayload),
    onSuccess: (response, variables) => {
      // Prefer server-truth for status; fall back to submitted payload
      const createdStatus = response?.data?.status ?? variables.status

      queryClient.invalidateQueries({
        queryKey: tasksKeys.lists(),
        refetchType: 'active',
        predicate: (query) => {
          // If status can't be determined, refresh all status lists to be safe
          if (!createdStatus) return true
          const params = query.queryKey[2] as TasksByStatusProps | undefined
          return params?.status === createdStatus
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

      // Optimistically update the task detail cache, and capture previous status for correct change detection
      const previousById = queryClient.getQueryData<{ data: Task }>(tasksKeys.byId(taskId))
      const previousStatus = previousById?.data?.status

      if (previousById?.data) {
        queryClient.setQueryData(tasksKeys.byId(taskId), {
          ...previousById,
          data: { ...previousById.data, ...updatedTask },
        })
      }

      const previousQueries = queryClient.getQueriesData<{ data: Task[] }>({ queryKey: tasksKeys.lists() })

      // Only treat as status change if the value actually changes
      const hasStatusField = Object.prototype.hasOwnProperty.call(updatedTask, 'status')
      const isStatusChange = hasStatusField && updatedTask.status && updatedTask.status !== previousStatus

      if (isStatusChange) {
        // Remove from any list that currently contains this task (it’s moving to another status)
        previousQueries.forEach(([queryKey, oldData]) => {
          if (!oldData?.data) return
          const taskInList = oldData.data.find((task: Task) => task.id === taskId)
          if (taskInList) {
            queryClient.setQueryData(queryKey, {
              ...oldData,
              data: oldData.data.filter((task: Task) => task.id !== taskId),
            })
          }
        })
        // We don't optimistically add to the new list due to pagination/ordering uncertainty
      } else {
        // Non-status updates: update in place in any list where it exists
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

      return {
        previousQueries,
        previousById,
        previousStatus,
        isStatusChange,
        newStatus: (updatedTask.status as TaskStatus | undefined) ?? undefined,
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousById) {
        queryClient.setQueryData(tasksKeys.byId(taskId), context.previousById)
      }
    },
    onSuccess: (response) => {
      // Ensure detail view reflects server truth after mutation
      if (response) {
        queryClient.setQueryData(tasksKeys.byId(taskId), response)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (context?.isStatusChange) {
        // Use server-truth for the new status if available; also refresh the source column for correctness (totals)
        const serverNew = data?.data?.status as TaskStatus | undefined
        const newStatus = serverNew ?? context.newStatus
        const oldStatus = context.previousStatus as TaskStatus | undefined

        queryClient.invalidateQueries({
          queryKey: tasksKeys.lists(),
          refetchType: 'active',
          predicate: (query) => {
            const params = query.queryKey[2] as TasksByStatusProps | undefined
            if (!params?.status) return false
            return params.status === newStatus || params.status === oldStatus
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
