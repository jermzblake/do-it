import { useQueryClient } from '@tanstack/react-query'
import { tasksKeys } from './use-tasks'
import type { Task } from '@/types/tasks.types'
import type { ApiResponse } from '@/types/api.types'
import { useSyncExternalStore } from 'react'

export const useTotalTaskCount = () => {
  const queryClient = useQueryClient()

  //this function synchronously checks the *entire* cache
  const getTotalCount = () => {
    const allLists = queryClient.getQueriesData<ApiResponse<Task[]> & { hasMore: boolean }>({
      queryKey: tasksKeys.lists(),
    })

    if (!allLists || !Array.isArray(allLists) || allLists.length === 0) {
      return 0
    }
    let totalCount = 0
    // Iterate over all cached lists - allLists is an array of [queryKey, data] tuples
    for (const [queryKey, data] of allLists) {
      if (data?.data && Array.isArray(data.data)) {
        // Count the actual tasks in this cached query
        totalCount += data.data.length
      }
    }
    return totalCount
  }

  // Subscribe to query cache changes so this updates reactively
  const totalTaskCount = useSyncExternalStore(
    (onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
    getTotalCount,
    getTotalCount,
  )

  return { totalTaskCount }
}
