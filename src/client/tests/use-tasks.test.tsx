import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { render, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { tasksKeys, useCreateTask, useDeleteTask, useTasksByStatus, useUpdateTask } from '@/client/hooks/use-tasks'
import type { Task, TaskStatus, TasksByStatusProps } from '@/types/tasks.types'
import type { ApiResponse } from '@/types/api.types'
import { apiClient } from '@/client/lib/axios'

type MetaExtra<T> = {
  metaData?: Partial<ApiResponse<T>['metaData']>
} & Omit<Partial<ApiResponse<T>>, 'metaData'>

function makeResponse<T>(data: T, extra?: MetaExtra<T>): ApiResponse<T> {
  return {
    data,
    // Cast to avoid over-widening due to spread of partial metaData in TS inferrence
    metaData: {
      message: 'ok',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      ...(extra?.metaData ?? {}),
    } as any,
    ...(extra ?? {}),
  } as ApiResponse<T>
}

function statusKey(params: TasksByStatusProps) {
  return tasksKeys.statusList(params)
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'Original',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

let originalGet: typeof apiClient.get
let originalPost: typeof apiClient.post
let originalPut: typeof apiClient.put
let originalDelete: typeof apiClient.delete

beforeEach(() => {
  originalGet = apiClient.get.bind(apiClient)
  originalPost = apiClient.post.bind(apiClient)
  originalPut = apiClient.put.bind(apiClient)
  originalDelete = apiClient.delete.bind(apiClient)
})

afterEach(() => {
  // restore
  // @ts-ignore
  apiClient.get = originalGet
  // @ts-ignore
  apiClient.post = originalPost
  // @ts-ignore
  apiClient.put = originalPut
  // @ts-ignore
  apiClient.delete = originalDelete
})

describe('useUpdateTask - non-status updates', () => {
  it('optimistically updates only the list that contains the task (no refetch)', async () => {
    const qc = new QueryClient()
    const wrapper = createWrapper(qc)

    // Seed cache for todo and completed lists
    const todoParams = { status: 'todo', page: 1, pageSize: 5 } as const
    const completedParams = { status: 'completed', page: 1, pageSize: 5 } as const

    const todoTasks: Task[] = [baseTask({ id: 't1', name: 'Original', status: 'todo' })]
    const completedTasks: Task[] = [baseTask({ id: 't2', name: 'Done', status: 'completed' })]

    qc.setQueryData(
      statusKey(todoParams),
      makeResponse(todoTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
      }),
    )
    qc.setQueryData(
      statusKey(completedParams),
      makeResponse(completedTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
      }),
    )

    // Stub network call for update
    // @ts-ignore
    apiClient.put = async () => makeResponse(baseTask({ id: 't1', name: 'Renamed', status: 'todo' }))

    const { result } = renderHook(() => useUpdateTask('t1'), { wrapper })

    await result.current.mutateAsync({ name: 'Renamed' })

    // Validate cache updated for todo only
    const todoData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(todoParams))
    const completedData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(completedParams))

    expect(todoData?.data?.find((t) => t.id === 't1')?.name).toBe('Renamed')
    expect(completedData?.data?.find((t) => t.id === 't1')).toBeUndefined()
  })
})

describe('useUpdateTask - status change', () => {
  it('removes from old list immediately and only refetches the new status list', async () => {
    const qc = new QueryClient()
    const wrapper = createWrapper(qc)

    const oldParams = { status: 'todo', page: 1, pageSize: 5 } as const
    const newParams = { status: 'in_progress', page: 1, pageSize: 5 } as const

    const oldTasks: Task[] = [baseTask({ id: 't1', status: 'todo' })]
    const newTasks: Task[] = []

    qc.setQueryData(
      statusKey(oldParams),
      makeResponse(oldTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
      }),
    )
    qc.setQueryData(
      statusKey(newParams),
      makeResponse(newTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 0 } as any },
      }),
    )

    // Track GET calls per status when refetch occurs
    let getCallsNew = 0
    let getCallsOld = 0
    // @ts-ignore
    apiClient.get = async (url: string) => {
      const isNew = url.includes('status=in_progress')
      const isOld = url.includes('status=todo')
      if (isNew) getCallsNew++
      if (isOld) getCallsOld++
      // Simulate server responding with t1 now in new status list
      if (isNew) {
        return makeResponse([baseTask({ id: 't1', status: 'in_progress' })], {
          metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
        })
      }
      return makeResponse([], {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 0 } as any },
      })
    }

    // Mount components to create active observers for both lists
    function Columns() {
      useTasksByStatus(oldParams)
      useTasksByStatus(newParams)
      return null
    }
    render(
      <QueryClientProvider client={qc}>
        <Columns />
      </QueryClientProvider>,
    )

    // Wait for initial fetches for both to occur, then reset counters
    await waitFor(() => {
      expect(getCallsNew).toBeGreaterThan(0)
      expect(getCallsOld).toBeGreaterThan(0)
    })
    getCallsNew = 0
    getCallsOld = 0

    // Stub PUT
    // @ts-ignore
    apiClient.put = async () => makeResponse(baseTask({ id: 't1', status: 'in_progress' }))

    const { result } = renderHook(() => useUpdateTask('t1'), { wrapper })

    await result.current.mutateAsync({ status: 'in_progress' as TaskStatus })

    // Immediately removed from old list
    const oldData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(oldParams))
    expect(oldData?.data?.some((t) => t.id === 't1')).toBe(false)

    // Wait for refetch to happen only for new status
    await waitFor(() => {
      expect(getCallsNew).toBeGreaterThan(0)
      expect(getCallsOld).toBe(0)
    })
  })
})

describe('useDeleteTask', () => {
  it('optimistically removes from all lists without refetch', async () => {
    const qc = new QueryClient()
    const wrapper = createWrapper(qc)

    const todoParams = { status: 'todo', page: 1, pageSize: 5 } as const
    const blockedParams = { status: 'blocked', page: 1, pageSize: 5 } as const

    const todoTasks: Task[] = [baseTask({ id: 't1', status: 'todo' })]
    const blockedTasks: Task[] = [baseTask({ id: 't1', status: 'blocked' }), baseTask({ id: 't3', status: 'blocked' })]

    qc.setQueryData(
      statusKey(todoParams),
      makeResponse(todoTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
      }),
    )
    qc.setQueryData(
      statusKey(blockedParams),
      makeResponse(blockedTasks, {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 2 } as any },
      }),
    )

    // @ts-ignore
    apiClient.delete = async () => makeResponse(null as any)

    const { result } = renderHook(() => useDeleteTask('t1'), { wrapper })
    await result.current.mutateAsync()

    const todoData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(todoParams))
    const blockedData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(blockedParams))

    expect(todoData?.data?.some((t) => t.id === 't1')).toBe(false)
    expect(blockedData?.data?.some((t) => t.id === 't1')).toBe(false)
  })
})

describe('useCreateTask', () => {
  it('only refetches the column matching the created task status', async () => {
    const qc = new QueryClient()
    const wrapper = createWrapper(qc)

    const createdStatus = 'todo'
    const otherStatus = 'completed'
    const createdParams = { status: createdStatus, page: 1, pageSize: 5 } as const
    const otherParams = { status: otherStatus, page: 1, pageSize: 5 } as const

    // Seed both lists as empty
    qc.setQueryData(
      statusKey(createdParams),
      makeResponse([] as Task[], {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 0 } as any },
      }),
    )
    qc.setQueryData(
      statusKey(otherParams),
      makeResponse([] as Task[], {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 0 } as any },
      }),
    )

    // Track GET calls
    let getCallsCreated = 0
    let getCallsOther = 0
    // @ts-ignore
    apiClient.get = async (url: string) => {
      const isCreated = url.includes(`status=${createdStatus}`)
      const isOther = url.includes(`status=${otherStatus}`)
      if (isCreated) getCallsCreated++
      if (isOther) getCallsOther++
      if (isCreated) {
        return makeResponse([baseTask({ id: 'c1', status: createdStatus, name: 'Newly Created' })], {
          metaData: { pagination: { page: 1, pageSize: 5, totalCount: 1 } as any },
        })
      }
      return makeResponse([] as Task[], {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 0 } as any },
      })
    }

    // Mount two columns so both queries are active observers
    function Columns() {
      useTasksByStatus(createdParams)
      useTasksByStatus(otherParams)
      return null
    }
    render(
      <QueryClientProvider client={qc}>
        <Columns />
      </QueryClientProvider>,
    )

    // Wait for initial fetches for both to occur, then reset counters
    await waitFor(() => {
      expect(getCallsCreated).toBeGreaterThan(0)
      expect(getCallsOther).toBeGreaterThan(0)
    })
    getCallsCreated = 0
    getCallsOther = 0

    // Stub POST response
    // @ts-ignore
    apiClient.post = async () => makeResponse(baseTask({ id: 'c1', status: createdStatus, name: 'Newly Created' }))

    const { result } = renderHook(() => useCreateTask(), { wrapper })

    await result.current.mutateAsync({ name: 'Newly Created', status: createdStatus })

    await waitFor(() => {
      expect(getCallsCreated).toBeGreaterThan(0)
      expect(getCallsOther).toBe(0)
    })

    // And the created list should end up with the new task
    const createdData = qc.getQueryData<ApiResponse<Task[]>>(statusKey(createdParams))
    expect(createdData?.data?.some((t) => t.id === 'c1' && t.name === 'Newly Created')).toBe(true)
  })

  it('does not optimistically insert into paginated lists and updates after refetch', async () => {
    const qc = new QueryClient()
    const wrapper = createWrapper(qc)

    const status = 'todo'
    const page1 = { status, page: 1, pageSize: 5 } as const
    const page2 = { status, page: 2, pageSize: 5 } as const

    const page1Seeds: Task[] = [baseTask({ id: 'p1', name: 'P1', status })]
    const page2Seeds: Task[] = [baseTask({ id: 'p2', name: 'P2', status })]

    qc.setQueryData(
      statusKey(page1),
      makeResponse(page1Seeds, { metaData: { pagination: { page: 1, pageSize: 5, totalCount: 6 } as any } }),
    )
    qc.setQueryData(
      statusKey(page2),
      makeResponse(page2Seeds, { metaData: { pagination: { page: 2, pageSize: 5, totalCount: 6 } as any } }),
    )

    // Track GET calls and allow deferred resolution per page
    let callsP1 = 0
    let callsP2 = 0
    type Deferred<T> = { promise: Promise<T>; resolve: (v: T) => void; reject: (e: any) => void }
    const deferred = <T,>(): Deferred<T> => {
      let resolve!: (v: T) => void
      let reject!: (e: any) => void
      const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    }

    // Initial GET behavior
    // @ts-ignore
    apiClient.get = async (url: string) => {
      const isP1 = url.includes('status=todo') && url.includes('page=1')
      const isP2 = url.includes('status=todo') && url.includes('page=2')
      if (isP1) callsP1++
      if (isP2) callsP2++
      if (isP1) {
        return makeResponse(page1Seeds, { metaData: { pagination: { page: 1, pageSize: 5, totalCount: 6 } as any } })
      }
      if (isP2) {
        return makeResponse(page2Seeds, { metaData: { pagination: { page: 2, pageSize: 5, totalCount: 6 } as any } })
      }
      return makeResponse([] as Task[])
    }

    function Columns() {
      useTasksByStatus(page1)
      useTasksByStatus(page2)
      return null
    }
    render(
      <QueryClientProvider client={qc}>
        <Columns />
      </QueryClientProvider>,
    )

    // Wait for initial loads
    await waitFor(() => {
      expect(callsP1).toBeGreaterThan(0)
      expect(callsP2).toBeGreaterThan(0)
    })

    // Now set GET to deferred to observe cache state before refetch resolves
    const d1 = deferred<ApiResponse<Task[]>>()
    const d2 = deferred<ApiResponse<Task[]>>()
    callsP1 = 0
    callsP2 = 0
    // @ts-ignore
    apiClient.get = async (url: string) => {
      const isP1 = url.includes('status=todo') && url.includes('page=1')
      const isP2 = url.includes('status=todo') && url.includes('page=2')
      if (isP1) return d1.promise
      if (isP2) return d2.promise
      return makeResponse([] as Task[])
    }

    // Stub POST create
    const created = baseTask({ id: 'nc1', name: 'New C', status })
    // @ts-ignore
    apiClient.post = async () => makeResponse(created)

    const { result } = renderHook(() => useCreateTask(), { wrapper })
    await result.current.mutateAsync({ name: created.name, status })

    // While refetch pending, cache should still equal seeds (no optimistic insert)
    const p1CachePending = qc.getQueryData<ApiResponse<Task[]>>(statusKey(page1))
    const p2CachePending = qc.getQueryData<ApiResponse<Task[]>>(statusKey(page2))
    expect(p1CachePending?.data).toEqual(page1Seeds)
    expect(p2CachePending?.data).toEqual(page2Seeds)

    // Resolve refetches: only page 1 returns the new item; page 2 unchanged
    d1.resolve(
      makeResponse([created, ...page1Seeds], {
        metaData: { pagination: { page: 1, pageSize: 5, totalCount: 7 } as any },
      }),
    )
    d2.resolve(
      makeResponse(page2Seeds, {
        metaData: { pagination: { page: 2, pageSize: 5, totalCount: 7 } as any },
      }),
    )

    await waitFor(() => {
      const p1 = qc.getQueryData<ApiResponse<Task[]>>(statusKey(page1))
      const p2 = qc.getQueryData<ApiResponse<Task[]>>(statusKey(page2))
      expect(p1?.data?.some((t) => t.id === created.id)).toBe(true)
      expect(p2?.data?.some((t) => t.id === created.id)).toBe(false)
    })
  })
})
