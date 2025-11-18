import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskDetailsSidebar } from '@/client/components/task-details-sidebar'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'

function makeRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  return createRouter({ routeTree })
}

function QueryWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('TaskDetailsSidebar', () => {
  it('returns null when task is nullish (safety)', () => {
    const router = makeRouter(<TaskDetailsSidebar task={null as any} open={true} onOpenChange={() => {}} />)
    const { container } = render(
      <QueryWrapper>
        <RouterProvider router={router} />
      </QueryWrapper>,
    )
    // Should render nothing
    expect(container.innerHTML).toBe('')
  })
})
