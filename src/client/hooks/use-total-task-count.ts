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

// export const useTotalTaskCount = () => {
//   const queryClient = useQueryClient()

//   const getTotalCount = () => {
//     // getQueriesData returns an array of [queryKey, data] tuples
//     const allLists = queryClient.getQueriesData<ApiResponse<Task[]> & { hasMore: boolean }>({
//       queryKey: tasksKeys.lists(),
//     })

//     if (!allLists || !Array.isArray(allLists) || allLists.length === 0) {
//       return 0
//     }

//     // Use a Set to track unique status queries (avoid double-counting if multiple pages cached)
//     const seenStatuses = new Set<string>()
//     let totalCount = 0

//     for (const [queryKey, data] of allLists) {
//       // queryKey structure: ['tasks', 'list', { status, userId, page, pageSize }]
//       const params = queryKey[2] as { status: string; userId: string; page?: number }
//       const statusKey = `${params.status}-${params.userId}`

//       // Only count each status once (use first page's totalCount)
//       if (!seenStatuses.has(statusKey) && data?.metaData?.pagination?.totalCount) {
//         seenStatuses.add(statusKey)
//         totalCount += data.metaData.pagination.totalCount
//       }
//     }

//     return totalCount
//   }

//   // Subscribe to query cache changes so this updates reactively
//   const totalTaskCount = useSyncExternalStore(
//     (onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
//     getTotalCount,
//     getTotalCount,
//   )
//   console.log({ totalCount: totalTaskCount })
//   return { totalTaskCount }
// }
