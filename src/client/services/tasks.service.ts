import { apiClient } from '../lib/axios'
import { checkHasMore } from '@/client/utils/check-has-more'
import type { Task, TasksByStatusProps } from '@/types/tasks.types'

export const fetchTasksByStatus = async ({
  status,
  userId,
  page,
  pageSize = 5,
}: TasksByStatusProps): Promise<{ data: Task[]; hasMore: boolean }> => {
  const response = await apiClient.get(`/tasks?status=${status}&userId=${userId}&page=${page}&pageSize=${pageSize}`)

  return {
    data: response.data as Task[],
    hasMore: response.metaData.pagination
      ? checkHasMore(
          response.metaData.pagination.page,
          response.metaData.pagination.pageSize,
          response.metaData.pagination.totalCount as number,
        )
      : false,
  }
}
