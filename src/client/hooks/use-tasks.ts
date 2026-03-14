import {
  fetchTasksByStatus,
  createTask,
  updateTaskById,
  deleteTaskById,
  fetchTaskById,
  fetchTodayTasks,
} from '@/client/services/tasks.service'
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task, TasksByStatusProps, TaskStatus } from '@/shared/task'
import { normalizeDates } from '@/client/utils/normalize-date'

export const tasksKeys = {
  all: ['tasks'],
  lists: () => [...tasksKeys.all, 'list'],
  statusList: (params: TasksByStatusProps) => [...tasksKeys.lists(), params],
  byId: (id: string) => [...tasksKeys.all, id],
  byUserId: (userId: string) => [...tasksKeys.all, userId],
  todayView: () => [...tasksKeys.all, 'today-view'],
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
    // TODO: consider using placeholderData with the task from the lists if available to avoid loading state on detail view when coming from a list
  })
}

export const useTodayTasks = () => {
  return useQuery({
    queryKey: tasksKeys.todayView(),
    queryFn: () => fetchTodayTasks(),
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
    mutationFn: (taskPayload: Partial<Task>) => updateTaskById(taskId, normalizeDates(taskPayload) || taskPayload),
    onMutate: async (updatedTask) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: tasksKeys.lists() }),
        queryClient.cancelQueries({ queryKey: tasksKeys.todayView() }),
        queryClient.cancelQueries({ queryKey: tasksKeys.byId(taskId) }),
      ])

      const normalized = normalizeDates(updatedTask) || updatedTask
      const isStatusChange = 'status' in updatedTask

      // Optimistically update the task detail cache as well
      const previousById = queryClient.getQueryData<{ data: Task }>(tasksKeys.byId(taskId))
      if (previousById?.data) {
        queryClient.setQueryData(tasksKeys.byId(taskId), {
          ...previousById,
          data: { ...previousById.data, ...normalized },
        })
      }

      const previousListQueries = queryClient.getQueriesData<{ data: Task[] }>({ queryKey: tasksKeys.lists() })
      const previousTodayView = queryClient.getQueryData<{ data: Task[] }>(tasksKeys.todayView())

      if (isStatusChange) {
        // For status changes, we need to remove from old list and add to new list
        previousListQueries.forEach(([queryKey, oldData]) => {
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

        if (previousTodayView?.data) {
          queryClient.setQueryData(tasksKeys.todayView(), {
            ...previousTodayView,
            data: previousTodayView.data.map((task: Task) => (task.id === taskId ? { ...task, ...normalized } : task)),
          })
        }

        // Note: We don't optimistically add to the new list because we don't know
        // which page it should appear on. Let invalidation handle the refetch.
      } else {
        // For non-status updates (like name, priority, etc.), update in place
        previousListQueries.forEach(([queryKey, oldData]) => {
          if (!oldData?.data) return

          const taskExists = oldData.data.some((task: Task) => task.id === taskId)

          if (taskExists) {
            const normalized = normalizeDates(updatedTask) || updatedTask
            queryClient.setQueryData(queryKey, {
              ...oldData,
              data: oldData.data.map((task: Task) => (task.id === taskId ? { ...task, ...normalized } : task)),
            })
          }
        })
      }

      return {
        previousListQueries,
        previousTodayView,
        isStatusChange,
        newStatus: updatedTask.status as TaskStatus | undefined,
        previousById,
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousListQueries) {
        context.previousListQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousTodayView) {
        queryClient.setQueryData(tasksKeys.todayView(), context.previousTodayView)
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
