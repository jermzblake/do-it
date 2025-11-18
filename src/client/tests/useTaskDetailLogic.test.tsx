import React from 'react'
import { describe, it, expect } from 'bun:test'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTaskDetailLogic } from '@/client/hooks/useTaskDetailLogic'
import type { Task } from '@/types/tasks.types'
import type { ApiResponse } from '@/types/api.types'
import { apiClient } from '@/client/lib/axios'
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'

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

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'Task',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

function makeRouter(children: React.ReactNode) {
  const rootRoute = createRootRoute({
    component: () => children as React.ReactElement,
  })
  return createRouter({ routeTree: rootRoute })
}

function Wrapper({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  const router = makeRouter(children)
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

let originalPut: typeof apiClient.put = apiClient.put.bind(apiClient)
let originalDelete: typeof apiClient.delete = apiClient.delete.bind(apiClient)

describe('useTaskDetailLogic', () => {
  it('starts in non-editing mode', async () => {
    const qc = createClient()
    const { result } = renderHook(() => useTaskDetailLogic({ task: task() }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    // Wait for router to initialize
    await new Promise((r) => setTimeout(r, 10))

    expect(result.current.isEditing).toBe(false)
  })

  it('onEdit sets editing mode to true', async () => {
    const qc = createClient()
    const { result } = renderHook(() => useTaskDetailLogic({ task: task() }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    result.current.onEdit()
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true)
    })
  })

  it('onCancel sets editing mode back to false', async () => {
    const qc = createClient()
    const { result } = renderHook(() => useTaskDetailLogic({ task: task() }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    result.current.onEdit()
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true)
    })
    result.current.onCancel()
    await waitFor(() => {
      expect(result.current.isEditing).toBe(false)
    })
  })

  it('onSave calls updateTask and exits editing mode on success', async () => {
    const qc = createClient()
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => makeResponse({ ...task(), ...body })

    const { result } = renderHook(() => useTaskDetailLogic({ task: task() }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    result.current.onEdit()
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true)
    })

    await result.current.onSave({ name: 'Updated' })

    await waitFor(() => {
      expect(result.current.isEditing).toBe(false)
    })

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('onStatusChange calls updateTask with new status', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    const { result } = renderHook(() => useTaskDetailLogic({ task: task({ status: 'todo' }) }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    await result.current.onStatusChange('in_progress')
    expect(putBody?.status).toBe('in_progress')

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('onDeleteRequest calls deleteTask and invokes onClose on desktop', async () => {
    const qc = createClient()
    let closeCalled = 0
    // @ts-ignore
    apiClient.delete = async () => makeResponse(null as any)

    // Mock useIsDesktop to return true (desktop)
    const { result } = renderHook(
      () =>
        useTaskDetailLogic({
          task: task(),
          onClose: () => {
            closeCalled++
          },
        }),
      {
        wrapper: (p) => <Wrapper client={qc} {...p} />,
      },
    )

    await new Promise((r) => setTimeout(r, 10))

    await result.current.onDeleteRequest()

    await waitFor(() => {
      // On desktop with onClose provided, it should call onClose
      expect(closeCalled).toBe(1)
    })

    // restore
    // @ts-ignore
    apiClient.delete = originalDelete
  })

  it('returns isUpdating and isDeleting flags', async () => {
    const qc = createClient()
    const { result } = renderHook(() => useTaskDetailLogic({ task: task() }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    expect(typeof result.current.isUpdating).toBe('boolean')
    expect(typeof result.current.isDeleting).toBe('boolean')
  })
})
