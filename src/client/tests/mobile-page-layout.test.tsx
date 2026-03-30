import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, fireEvent, within } from '@testing-library/react'
import { MobilePageLayout } from '@/client/components/mobile-page-layout'
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'

function Wrapper({ children }: { children: React.ReactNode }) {
  const rootRoute = createRootRoute({ component: () => children as React.ReactElement })
  const router = createRouter({ routeTree: rootRoute })
  return <RouterProvider router={router} />
}

describe('MobilePageLayout', () => {
  describe('back navigation', () => {
    it('renders a <button> and calls onBack when onBack prop is provided', async () => {
      let backCalled = 0
      const onBack = () => {
        backCalled++
      }

      const { container } = render(
        <Wrapper>
          <MobilePageLayout title="Task Details" onBack={onBack}>
            <p>Content</p>
          </MobilePageLayout>
        </Wrapper>,
      )

      await new Promise((r) => setTimeout(r, 10))

      const backBtn = within(container).getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)

      expect(backCalled).toBe(1)
    })

    it('renders a <link> when no onBack is provided', async () => {
      const { container } = render(
        <Wrapper>
          <MobilePageLayout title="Task Details">
            <p>Content</p>
          </MobilePageLayout>
        </Wrapper>,
      )

      await new Promise((r) => setTimeout(r, 10))

      const backLink = within(container).getByRole('link', { name: /back/i })
      expect(backLink).toBeTruthy()
    })

    it('calls onBack on each click independently', async () => {
      let backCalled = 0
      const onBack = () => {
        backCalled++
      }

      const { container } = render(
        <Wrapper>
          <MobilePageLayout title="Task Details" onBack={onBack}>
            <p>Content</p>
          </MobilePageLayout>
        </Wrapper>,
      )

      await new Promise((r) => setTimeout(r, 10))

      const backBtn = within(container).getByRole('button', { name: /back/i })
      fireEvent.click(backBtn)
      fireEvent.click(backBtn)

      expect(backCalled).toBe(2)
    })
  })

  describe('title', () => {
    it('renders the title in the header', async () => {
      const { container } = render(
        <Wrapper>
          <MobilePageLayout title="My Important Task">
            <p>Content</p>
          </MobilePageLayout>
        </Wrapper>,
      )

      await new Promise((r) => setTimeout(r, 10))

      expect(within(container).getByText('My Important Task')).toBeTruthy()
    })
  })
})
