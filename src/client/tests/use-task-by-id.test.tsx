import React from 'react'
import { describe, it, expect } from 'bun:test'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { tasksKeys, useTaskById, useUpdateTask } from '@/client/hooks/use-tasks'
import type { Task } from '@/shared/task'
import type { ApiResponse } from '@/shared/api'
import { apiClient } from '@/client/lib/axios'

function makeResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    metaData: {
      message: 'ok',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    },
  }
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function Wrapper({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const base = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'Original',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

// Keep originals to restore between tests
let originalGet: typeof apiClient.get = apiClient.get.bind(apiClient)
let originalPut: typeof apiClient.put = apiClient.put.bind(apiClient)

describe('useTaskById + task detail cache behavior', () => {
  it('fetches by id and returns data', async () => {
    const qc = createClient()
    // @ts-ignore
    apiClient.get = async (url: string) => {
      if (url.includes('/tasks/t1')) return makeResponse(base())
      return makeResponse(null as any)
    }

    const { result } = renderHook(() => useTaskById('t1'), { wrapper: (p) => <Wrapper client={qc} {...p} /> })

    await waitFor(() => {
      expect(result.current.data?.data?.id).toBe('t1')
      expect(result.current.data?.data?.name).toBe('Original')
    })

    // restore
    // @ts-ignore
    apiClient.get = originalGet
  })

  it('optimistically updates byId cache on mutate, then writes server response', async () => {
    const qc = createClient()

    // Seed detail cache
    qc.setQueryData<ApiResponse<Task>>(tasksKeys.byId('t1'), makeResponse(base({ name: 'Original' })))

    // Create a deferred PUT
    let resolvePut: (v: ApiResponse<Task>) => void
    let putBody: Partial<Task> | null = null
    const putPromise = new Promise<ApiResponse<Task>>((res) => {
      resolvePut = res
    })
    // @ts-ignore
    apiClient.put = async (_url: string, body: Partial<Task>) => {
      putBody = body
      return putPromise
    }

    const { result } = renderHook(() => useUpdateTask('t1'), { wrapper: (p) => <Wrapper client={qc} {...p} /> })

    // Fire mutation but do not resolve server yet; observe optimistic state
    result.current.mutate({ name: 'Local Rename' })

    await waitFor(() => {
      const optimistic = qc.getQueryData<ApiResponse<Task>>(tasksKeys.byId('t1'))
      expect(optimistic?.data?.name).toBe('Local Rename')
    })

    // Now resolve server response with a different name to ensure server truth wins
    // @ts-ignore
    resolvePut!(makeResponse(base({ name: 'Server Name' })))

    await waitFor(() => {
      const after = qc.getQueryData<ApiResponse<Task>>(tasksKeys.byId('t1'))
      expect(after?.data?.name).toBe('Server Name')
      // And PUT body is exactly the patch payload we sent
      expect(putBody).toEqual({ name: 'Local Rename' })
    })

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('rolls back byId cache on error', async () => {
    const qc = createClient()

    // Seed detail cache
    qc.setQueryData<ApiResponse<Task>>(tasksKeys.byId('t1'), makeResponse(base({ name: 'Original' })))

    // @ts-ignore
    apiClient.put = async () => {
      throw new Error('Network failed')
    }

    const { result } = renderHook(() => useUpdateTask('t1'), { wrapper: (p) => <Wrapper client={qc} {...p} /> })

    await expect(result.current.mutateAsync({ name: 'Broken' })).rejects.toThrow()

    const final = qc.getQueryData<ApiResponse<Task>>(tasksKeys.byId('t1'))
    expect(final?.data?.name).toBe('Original')

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })
})
