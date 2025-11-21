import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect } from 'bun:test'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(ui: React.ReactElement) {
  const qc = makeQueryClient()
  const root = createRootRoute({ component: () => ui })
  const router = createRouter({ routeTree: root })
  return {
    ...render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
    queryClient: qc,
  }
}

export function pressEscape() {
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
}

export function clickByTestId(testId: string) {
  fireEvent.click(screen.getByTestId(testId))
}

export async function expectDialogOpen(titleRegex: RegExp) {
  // Try visible dialog by accessible name
  const dlg = screen.queryByRole('dialog', { name: titleRegex })
  if (dlg) {
    expect(dlg).toBeTruthy()
    return
  }
  // Fallback hidden heading when underlying dialog is aria-hidden beneath AlertDialog focus trap
  const heading = screen.getByRole('heading', { name: titleRegex, hidden: true })
  expect(heading).toBeTruthy()
}

export async function expectDialogClosed(titleRegex: RegExp) {
  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: titleRegex })).toBeNull()
    const hiddenHeading = screen.queryByRole('heading', { name: titleRegex, hidden: true })
    expect(hiddenHeading).toBeNull()
  })
}
