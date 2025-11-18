import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MobileTaskCard } from '@/client/components/mobile-task-card'
import type { Task } from '@/types/tasks.types'
import type { ApiResponse } from '@/types/api.types'
import { apiClient } from '@/client/lib/axios'

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

function Wrapper({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

let originalPut: typeof apiClient.put = apiClient.put.bind(apiClient)

// Helper to make a basic API response
function makeResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    metaData: { message: 'ok', status: 'SUCCESS', timestamp: new Date().toISOString() },
  }
}

describe('MobileTaskCard quick actions', () => {
  it('Start task sends status=in_progress and sets startedAt when missing', async () => {
    const qc = createClient()

    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    render(
      <Wrapper client={qc}>
        <MobileTaskCard
          task={task({ status: 'todo', startedAt: undefined })}
          onEdit={() => {}}
          onDelete={() => {}}
          onBlock={() => {}}
        />
      </Wrapper>,
    )

    // Button has title attribute "Start task"
    const startBtn = screen.getByTitle(/start task/i)
    fireEvent.click(startBtn)

    // After click, mutation runs with expected payload (allow microtask flush)
    await new Promise((r) => setTimeout(r, 0))
    expect(putBody?.status).toBe('in_progress')
    expect(typeof putBody?.startedAt).toBe('string')

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('Complete task sends status=completed and sets completedAt', async () => {
    const qc = createClient()
    let putBody: any = null
    // @ts-ignore
    apiClient.put = async (_url: string, body: any) => {
      putBody = body
      return makeResponse({ ...task(), ...body })
    }

    render(
      <Wrapper client={qc}>
        <MobileTaskCard
          task={task({ status: 'in_progress' })}
          onEdit={() => {}}
          onDelete={() => {}}
          onBlock={() => {}}
        />
      </Wrapper>,
    )

    const completeBtns = screen.getAllByTitle(/complete task/i)
    expect(completeBtns.length).toBeGreaterThan(0)
    fireEvent.click(completeBtns[0]!)

    await new Promise((r) => setTimeout(r, 0))
    expect(putBody?.status).toBe('completed')
    expect(typeof putBody?.completedAt).toBe('string')

    // restore
    // @ts-ignore
    apiClient.put = originalPut
  })

  it('Card click calls onSelect when provided', () => {
    const qc = createClient()
    let selected = 0
    const { container } = render(
      <Wrapper client={qc}>
        <MobileTaskCard
          task={task()}
          onEdit={() => {}}
          onDelete={() => {}}
          onBlock={() => {}}
          onSelect={() => {
            selected++
          }}
        />
      </Wrapper>,
    )

    // Click the Card container directly
    const card = container.querySelector('[data-slot="card"]') as HTMLElement | null
    expect(card).toBeTruthy()
    fireEvent.click(card!)
    expect(selected).toBe(1)
  })
})
