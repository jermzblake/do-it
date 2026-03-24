import React from 'react'
import { describe, it, expect, afterEach } from 'bun:test'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTaskDetailLogic } from '@/client/hooks/useTaskDetailLogic'
import type { Task } from '@/shared/task'
import type { ApiResponse } from '@/shared/api'
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

const originalPut: typeof apiClient.put = apiClient.put.bind(apiClient)
const originalDelete: typeof apiClient.delete = apiClient.delete.bind(apiClient)

afterEach(() => {
  // Always restore client methods to avoid test-order coupling if a test throws.
  // @ts-ignore
  apiClient.put = originalPut
  // @ts-ignore
  apiClient.delete = originalDelete
})

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
  })

  it('onStatusChange to in_progress adds startedAt when missing', async () => {
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

    const before = Date.now()
    await result.current.onStatusChange('in_progress')
    const after = Date.now()

    expect(putBody?.status).toBe('in_progress')
    expect(typeof putBody?.startedAt).toBe('string')

    const startedAtMs = Date.parse(putBody.startedAt)
    expect(Number.isNaN(startedAtMs)).toBe(false)
    expect(startedAtMs >= before).toBe(true)
    expect(startedAtMs <= after).toBe(true)
  })

  it('onStatusChange to in_progress does not overwrite existing startedAt', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    const existingStartedAt = '2026-01-15T08:00:00.000Z'
    const { result } = renderHook(
      () => useTaskDetailLogic({ task: task({ status: 'todo', startedAt: existingStartedAt }) }),
      {
        wrapper: (p) => <Wrapper client={qc} {...p} />,
      },
    )

    await new Promise((r) => setTimeout(r, 10))

    await result.current.onStatusChange('in_progress')

    expect(putBody?.status).toBe('in_progress')
    expect('startedAt' in putBody).toBe(false)
  })

  it('onStatusChange to completed adds completedAt when missing', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    const { result } = renderHook(() => useTaskDetailLogic({ task: task({ status: 'in_progress' }) }), {
      wrapper: (p) => <Wrapper client={qc} {...p} />,
    })

    await new Promise((r) => setTimeout(r, 10))

    const before = Date.now()
    await result.current.onStatusChange('completed')
    const after = Date.now()

    expect(putBody?.status).toBe('completed')
    expect(typeof putBody?.completedAt).toBe('string')

    const completedAtMs = Date.parse(putBody.completedAt)
    expect(Number.isNaN(completedAtMs)).toBe(false)
    expect(completedAtMs >= before).toBe(true)
    expect(completedAtMs <= after).toBe(true)
  })

  it('onStatusChange to completed does not overwrite existing completedAt', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    const existingCompletedAt = '2026-01-20T10:30:00.000Z'
    const { result } = renderHook(
      () => useTaskDetailLogic({ task: task({ status: 'in_progress', completedAt: existingCompletedAt }) }),
      {
        wrapper: (p) => <Wrapper client={qc} {...p} />,
      },
    )

    await new Promise((r) => setTimeout(r, 10))

    await result.current.onStatusChange('completed')

    expect(putBody?.status).toBe('completed')
    expect('completedAt' in putBody).toBe(false)
  })

  it('onStatusChange from blocked to in_progress clears blockedReason and appends unblock note', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    const { result } = renderHook(
      () =>
        useTaskDetailLogic({
          task: task({ status: 'blocked', blockedReason: 'Waiting for design', notes: 'Some notes' }),
        }),
      {
        wrapper: (p) => <Wrapper client={qc} {...p} />,
      },
    )

    await new Promise((r) => setTimeout(r, 10))

    await result.current.onStatusChange('in_progress')

    expect(putBody?.status).toBe('in_progress')
    expect(putBody?.blockedReason).toBe('')
    expect(putBody?.notes).toContain('Unblocked on')
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
