import React from 'react'
import { describe, it, expect, afterEach, beforeEach } from 'bun:test'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TodayCard from '@/client/components/today-card'
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
  name: 'Test Task',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

function Wrapper({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  const rootRoute = createRootRoute({ component: () => children as React.ReactElement })
  const router = createRouter({ routeTree: rootRoute })
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

const originalPut: typeof apiClient.put = apiClient.put.bind(apiClient)
const originalMatchMedia = window.matchMedia

function setMatchMedia(matches: boolean) {
  // @ts-ignore
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

afterEach(() => {
  // @ts-ignore
  apiClient.put = originalPut
  window.matchMedia = originalMatchMedia
})

describe('TodayCard', () => {
  describe('card click — onSelect', () => {
    beforeEach(() => {
      setMatchMedia(true)
    })

    it('calls onSelect when the card body is clicked', async () => {
      const qc = createClient()
      // @ts-ignore
      apiClient.put = async (_url: string, body: Partial<Task>) => makeResponse({ ...task(), ...body })

      let selectCalled = 0
      const onSelect = () => {
        selectCalled++
      }

      render(
        <Wrapper client={qc}>
          <TodayCard task={task()} onSelect={onSelect} />
        </Wrapper>,
      )

      const card = await screen.findByRole('button', { name: /view details for test task/i })
      fireEvent.click(card)

      await waitFor(() => {
        expect(selectCalled).toBe(1)
      })
    })

    it('does not throw when card is clicked with no onSelect provided', async () => {
      const qc = createClient()

      render(
        <Wrapper client={qc}>
          <TodayCard task={task()} />
        </Wrapper>,
      )

      const card = await screen.findByRole('button', { name: /view details for test task/i })
      // Must not throw
      fireEvent.click(card)
    })
  })

  describe('event propagation boundaries', () => {
    beforeEach(() => {
      setMatchMedia(true)
    })

    it('clicking the status icon does NOT call onSelect', async () => {
      const qc = createClient()
      // @ts-ignore
      apiClient.put = async (_url: string, body: Partial<Task>) => makeResponse({ ...task(), ...body })

      let selectCalled = 0
      const onSelect = () => {
        selectCalled++
      }

      render(
        <Wrapper client={qc}>
          <TodayCard task={task({ status: 'todo' })} onSelect={onSelect} />
        </Wrapper>,
      )

      const statusBtn = await screen.findByTitle('Mark as Completed')
      fireEvent.click(statusBtn)

      // Give any async handlers a chance to run, then assert no side-effect
      await waitFor(() => {
        expect(selectCalled).toBe(0)
      })
    })

    it('clicking the overflow menu trigger does NOT call onSelect', async () => {
      const qc = createClient()

      let selectCalled = 0
      const onSelect = () => {
        selectCalled++
      }

      render(
        <Wrapper client={qc}>
          <TodayCard task={task()} onSelect={onSelect} />
        </Wrapper>,
      )

      const overflowBtn = await screen.findByTitle('More actions')
      fireEvent.click(overflowBtn)

      await waitFor(() => {
        expect(selectCalled).toBe(0)
      })
    })

    it('clicking an overflow menu action does NOT call onSelect', async () => {
      const qc = createClient()
      // @ts-ignore
      apiClient.put = async (_url: string, body: Partial<Task>) => makeResponse({ ...task(), ...body })

      let selectCalled = 0
      const onSelect = () => {
        selectCalled++
      }

      render(
        <Wrapper client={qc}>
          <TodayCard task={task({ status: 'todo' })} onSelect={onSelect} />
        </Wrapper>,
      )

      // Open the overflow menu
      fireEvent.click(await screen.findByTitle('More actions'))

      // Click "Mark Complete" from the menu
      fireEvent.click(await screen.findByText('Mark Complete'))

      await waitFor(() => {
        expect(selectCalled).toBe(0)
      })
    })

    it('clicking the cancelled overflow action does NOT call onSelect', async () => {
      const qc = createClient()
      // @ts-ignore
      apiClient.put = async (_url: string, body: Partial<Task>) => makeResponse({ ...task(), ...body })

      let selectCalled = 0
      const onSelect = () => {
        selectCalled++
      }

      render(
        <Wrapper client={qc}>
          <TodayCard task={task({ status: 'todo' })} onSelect={onSelect} />
        </Wrapper>,
      )

      fireEvent.click(await screen.findByTitle('More actions'))

      fireEvent.click(await screen.findByText('Cancel'))

      await waitFor(() => {
        expect(selectCalled).toBe(0)
      })
    })
  })
})
