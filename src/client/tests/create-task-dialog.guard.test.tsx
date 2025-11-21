import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { CreateTaskDialog } from '@/client/components/create-task-dialog'

function withProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const root = createRootRoute({ component: () => ui as React.ReactElement })
  const router = createRouter({ routeTree: root })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function openDialog() {
  // The trigger button text is exactly 'Create'; enforce an exact match to avoid matching 'Create Task'
  fireEvent.click(screen.getByRole('button', { name: /^create$/i }))
}

function pressEscape() {
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
}

describe('CreateTaskDialog discard guard', () => {
  it('closes immediately when pristine (no confirmation)', async () => {
    withProviders(<CreateTaskDialog trigger={<button>Create</button>} />)

    // Wait for router to mount children
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create$/i })).toBeTruthy()
    })

    openDialog()
    // Dialog should be open
    expect(screen.getByRole('dialog', { name: /create task/i })).toBeTruthy()

    // Attempt to close while pristine
    pressEscape()

    // Closes without confirmation
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create task/i })).toBeNull()
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('shows confirmation when dirty; Keep Editing maintains open; Discard closes', async () => {
    withProviders(<CreateTaskDialog trigger={<button>Create</button>} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^create$/i })).toBeTruthy()
    })

    openDialog()
    const dialog = screen.getByRole('dialog', { name: /create task/i })
    expect(dialog).toBeTruthy()

    // Make form dirty (type in "Task")
    const nameInput = screen.getByPlaceholderText(/enter task name/i)
    fireEvent.change(nameInput, { target: { value: 'Task' } })

    // Try to close
    pressEscape()

    // Confirmation appears; main dialog stays in DOM (but is aria-hidden while alertdialog is open)
    const confirm = await screen.findByRole('alertdialog', { name: /discard unsaved changes/i })
    expect(confirm).toBeTruthy()
    // The dialog is aria-hidden while the alert is open, so assert via hidden heading
    expect(screen.getByRole('heading', { name: /create task/i, hidden: true })).toBeTruthy()

    // Keep Editing
    fireEvent.click(screen.getByRole('button', { name: /keep editing/i }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
      expect(screen.getByRole('dialog', { name: /create task/i })).toBeTruthy()
    })

    // Try to close again, then Discard
    pressEscape()
    await screen.findByRole('alertdialog', { name: /discard unsaved changes/i })
    fireEvent.click(screen.getByRole('button', { name: /discard/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
      expect(screen.queryByRole('dialog', { name: /create task/i })).toBeNull()
    })

    // Re-open: pristine → should close without prompt
    openDialog()
    expect(screen.getByRole('dialog', { name: /create task/i })).toBeTruthy()
    pressEscape()
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
      expect(screen.queryByRole('dialog', { name: /create task/i })).toBeNull()
    })
  })
})
