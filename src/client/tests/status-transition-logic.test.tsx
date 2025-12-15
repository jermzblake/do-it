import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, fireEvent, within, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MobileTaskCard } from '@/client/components/mobile-task-card'
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

describe('Status transition business logic', () => {
  it('sets startedAt timestamp when starting a todo task', async () => {
    const qc = createClient()
    let capturedUpdates: Partial<Task> | null = null

    // @ts-ignore
    apiClient.put = async (_url: string, body: Partial<Task>) => {
      capturedUpdates = body
      return makeResponse({ ...task(), ...body })
    }

    const { container } = render(
      <Wrapper client={qc}>
        <MobileTaskCard task={task({ status: 'todo', startedAt: undefined })} onBlock={() => {}} />
      </Wrapper>,
    )

    await new Promise((r) => setTimeout(r, 50))

    // Click the "Start" button
    const startBtn = within(container).getByTitle(/start task/i)
    fireEvent.click(startBtn)

    await waitFor(() => {
      expect(capturedUpdates).not.toBeNull()
    })

    expect(capturedUpdates!.status).toBe('in_progress')
    expect(capturedUpdates!.startedAt).toBeTruthy()
    expect(new Date(capturedUpdates!.startedAt!).getTime()).toBeLessThanOrEqual(Date.now())

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('does NOT overwrite startedAt if already set when resuming', async () => {
    const qc = createClient()
    let capturedUpdates: Partial<Task> | null = null
    const existingStartedAt = '2024-01-01T00:00:00.000Z'

    // @ts-ignore
    apiClient.put = async (_url: string, body: Partial<Task>) => {
      capturedUpdates = body
      return makeResponse({ ...task(), ...body })
    }

    const { container } = render(
      <Wrapper client={qc}>
        <MobileTaskCard task={task({ status: 'todo', startedAt: existingStartedAt })} onBlock={() => {}} />
      </Wrapper>,
    )

    await new Promise((r) => setTimeout(r, 50))

    const startBtn = within(container).getByTitle(/start task/i)
    fireEvent.click(startBtn)

    await waitFor(() => {
      expect(capturedUpdates).not.toBeNull()
    })

    expect(capturedUpdates!.status).toBe('in_progress')
    // Should NOT set a new startedAt because it already exists
    expect(capturedUpdates!.startedAt).toBeUndefined()

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('sets completedAt timestamp when completing a task', async () => {
    const qc = createClient()
    let capturedUpdates: Partial<Task> | null = null

    // @ts-ignore
    apiClient.put = async (_url: string, body: Partial<Task>) => {
      capturedUpdates = body
      return makeResponse({ ...task(), ...body })
    }

    const { container } = render(
      <Wrapper client={qc}>
        <MobileTaskCard task={task({ status: 'in_progress' })} onBlock={() => {}} />
      </Wrapper>,
    )

    await new Promise((r) => setTimeout(r, 50))

    // Click the "Complete" button
    const completeBtn = within(container).getByTitle(/complete task/i)
    fireEvent.click(completeBtn)

    await waitFor(() => {
      expect(capturedUpdates).not.toBeNull()
    })

    expect(capturedUpdates!.status).toBe('completed')
    expect(capturedUpdates!.completedAt).toBeTruthy()
    expect(new Date(capturedUpdates!.completedAt!).getTime()).toBeLessThanOrEqual(Date.now())

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('clears blockedReason and appends unblock note when resuming blocked task', async () => {
    const qc = createClient()
    let capturedUpdates: Partial<Task> | null = null

    // @ts-ignore
    apiClient.put = async (_url: string, body: Partial<Task>) => {
      capturedUpdates = body
      return makeResponse({ ...task(), ...body })
    }

    const { container } = render(
      <Wrapper client={qc}>
        <MobileTaskCard
          task={task({ status: 'blocked', blockedReason: 'Waiting for API', notes: 'Original notes' })}
          onBlock={() => {}}
        />
      </Wrapper>,
    )

    await new Promise((r) => setTimeout(r, 50))

    // Click the "Resume" button
    const resumeBtn = within(container).getByTitle(/resume task/i)
    fireEvent.click(resumeBtn)

    await waitFor(() => {
      expect(capturedUpdates).not.toBeNull()
    })

    expect(capturedUpdates!.status).toBe('in_progress')
    expect(capturedUpdates!.blockedReason).toBe('')
    expect(capturedUpdates!.notes).toContain('Original notes')
    expect(capturedUpdates!.notes).toContain('Unblocked on')

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })
})
