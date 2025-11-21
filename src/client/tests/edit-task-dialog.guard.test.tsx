import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { EditTaskDialog } from '@/client/components/edit-task-dialog'
import type { Task } from '@/types/tasks.types'

function pressEscape() {
  fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
}

function Host({ initial }: { initial: Task }) {
  const [task, setTask] = React.useState<Task | null>(initial)
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const root = createRootRoute({ component: () => <EditTaskDialog editingTask={task} setEditingTask={setTask} /> })
  const router = createRouter({ routeTree: root })
  return (
    <>
      <button onClick={() => setTask(initial)}>Open Edit</button>
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

const baseTask: Task = {
  id: 't-1',
  name: 'Original',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
}

describe('EditTaskDialog discard guard', () => {
  it('pristine close: Escape closes without confirmation', async () => {
    render(<Host initial={baseTask} />)

    // Wait for router to mount and dialog to open
    const dlg = await screen.findByRole('dialog', { name: /edit task/i })
    expect(dlg).toBeTruthy()

    pressEscape()

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /edit task/i })).toBeNull()
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('dirty close: Escape shows confirmation; Keep Editing keeps open; Discard closes', async () => {
    render(<Host initial={baseTask} />)

    const dlg = await screen.findByRole('dialog', { name: /edit task/i })
    expect(dlg).toBeTruthy()

    // Make dirty
    const nameInput = screen.getByPlaceholderText(/task name/i)
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

    // Try to close
    pressEscape()

    const alert = await screen.findByRole('alertdialog', { name: /discard unsaved changes/i })
    expect(alert).toBeTruthy()

    // Keep Editing
    fireEvent.click(screen.getByRole('button', { name: /keep editing/i }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
      expect(screen.getByRole('dialog', { name: /edit task/i })).toBeTruthy()
    })

    // Try to close again; Discard
    pressEscape()
    await screen.findByRole('alertdialog', { name: /discard unsaved changes/i })
    fireEvent.click(screen.getByRole('button', { name: /discard/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /edit task/i })).toBeNull()
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('Cancel button while dirty shows confirmation', async () => {
    render(<Host initial={baseTask} />)

    const dlg = await screen.findByRole('dialog', { name: /edit task/i })
    expect(dlg).toBeTruthy()

    // Make dirty
    const nameInput = screen.getByPlaceholderText(/task name/i)
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    // Expect confirmation
    const alert = await screen.findByRole('alertdialog', { name: /discard unsaved changes/i })
    expect(alert).toBeTruthy()
  })
})
