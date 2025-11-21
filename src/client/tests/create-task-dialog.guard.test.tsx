import React from 'react'
import { describe, it, expect, afterEach } from 'bun:test'
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { CreateTaskDialog } from '@/client/components/create-task-dialog'
import { renderWithProviders, pressEscape, clickByTestId, expectDialogClosed } from './test-utils'

function openDialog() {
  clickByTestId('create-task-trigger')
}

describe('CreateTaskDialog discard guard', () => {
  afterEach(() => {
    cleanup()
  })

  it('closes immediately when pristine (no confirmation)', async () => {
    renderWithProviders(<CreateTaskDialog trigger={<button data-testid="create-task-trigger">Create</button>} />)

    // Wait for router to mount children
    await waitFor(() => {
      expect(screen.getByTestId('create-task-trigger')).toBeTruthy()
    })

    openDialog()
    // Dialog should be open
    expect(screen.getByRole('dialog', { name: /create task/i })).toBeTruthy()

    // Attempt to close while pristine
    pressEscape()

    // Closes without confirmation
    await expectDialogClosed(/create task/i)
  })

  it('shows confirmation when dirty; Keep Editing maintains open; Discard closes', async () => {
    renderWithProviders(<CreateTaskDialog trigger={<button data-testid="create-task-trigger">Create</button>} />)

    await waitFor(() => {
      expect(screen.getByTestId('create-task-trigger')).toBeTruthy()
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

    await expectDialogClosed(/create task/i)

    // Re-open: pristine → should close without prompt
    openDialog()
    expect(screen.getByRole('dialog', { name: /create task/i })).toBeTruthy()
    pressEscape()
    await expectDialogClosed(/create task/i)
  })
})
