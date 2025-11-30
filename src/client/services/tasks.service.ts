import { apiClient } from '../lib/axios'
import { checkHasMore } from '@/client/utils/check-has-more'
import type { Task, TasksByStatusProps } from '@/shared/task'
import type { ApiResponse } from '@/shared/api'

export const fetchTasksByStatus = async ({ status, page, pageSize = 5 }: TasksByStatusProps) => {
  const response = await apiClient.get(`/tasks?status=${status}&page=${page}&pageSize=${pageSize}`)

  return {
    ...response,
    hasMore: response.metaData.pagination
      ? checkHasMore(
          response.metaData.pagination.page,
          response.metaData.pagination.pageSize,
          response.metaData.pagination.totalCount as number,
        )
      : false,
  }
}

export const fetchTaskById = async (taskId: string): Promise<ApiResponse<Task>> => {
  const response: ApiResponse<Task> = await apiClient.get(`/tasks/${taskId}`)
  return response
}

export const createTask = async (taskPayload: Partial<Task>): Promise<ApiResponse<Task>> => {
  const response: ApiResponse<Task> = await apiClient.post('/tasks', taskPayload)
  return response
}

export const updateTaskById = async (taskId: string, taskPayload: Partial<Task>): Promise<ApiResponse<Task>> => {
  const response: ApiResponse<Task> = await apiClient.put(`/tasks/${taskId}`, taskPayload)
  return response
}

export const deleteTaskById = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`)
}
