import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TaskDetailsContent } from '@/client/components/task-details-content'
import type { Task } from '@/types/tasks.types'

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'My Task',
  description: 'Desc',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

describe('TaskDetailsContent', () => {
  it('renders task title and quick actions; triggers onStatusChange', async () => {
    const calls: string[] = []
    const onStatusChange = async (status: string) => {
      calls.push(status)
    }

    const { container } = render(
      <TaskDetailsContent
        task={task({ status: 'in_progress' })}
        isEditing={false}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={async () => {}}
        onStatusChange={onStatusChange}
        onDeleteRequest={async () => {}}
        isUpdating={false}
        isDeleting={false}
      />,
    )

    // Title
    expect(within(container).getByText('My Task')).toBeTruthy()

    // Quick action buttons present for in_progress
    const completeBtn = within(container).getByRole('button', { name: /mark complete/i })
    fireEvent.click(completeBtn)

    const blockedBtn = within(container).getByRole('button', { name: /mark blocked/i })
    fireEvent.click(blockedBtn)

    expect(calls).toEqual(['completed', 'blocked'])
  })

  it('shows edit button when not editing and calls onEdit', () => {
    let editCalled = 0
    const { container } = render(
      <TaskDetailsContent
        task={task()}
        isEditing={false}
        onEdit={() => {
          editCalled++
        }}
        onCancel={() => {}}
        onSave={async () => {}}
        onStatusChange={async () => {}}
        onDeleteRequest={async () => {}}
        isUpdating={false}
        isDeleting={false}
      />,
    )

    const edits = within(container).getAllByRole('button', { name: /edit task/i })
    expect(edits.length).toBeGreaterThan(0)
    fireEvent.click(edits[0]!)
    expect(editCalled).toBe(1)
  })

  it('in edit mode, Save Changes calls onSave with form values and Cancel calls onCancel', async () => {
    let saved: any = null
    let cancelled = 0

    const { container } = render(
      <TaskDetailsContent
        task={task()}
        isEditing={true}
        onEdit={() => {}}
        onCancel={() => {
          cancelled++
        }}
        onSave={async (payload) => {
          saved = payload
        }}
        onStatusChange={async () => {}}
        onDeleteRequest={async () => {}}
        isUpdating={false}
        isDeleting={false}
      />,
    )

    // Change name field, then click Save Changes
    const nameInput = container.querySelector('#name') as HTMLInputElement | null
    expect(nameInput).toBeTruthy()
    fireEvent.change(nameInput!, { target: { value: 'Updated Name' } })

    const saveBtns = within(container).getAllByRole('button', { name: /save changes/i })
    expect(saveBtns.length).toBeGreaterThan(0)
    fireEvent.click(saveBtns[0]!)
    // Saved payload should include at least the name
    await new Promise((r) => setTimeout(r, 0))
    expect(saved?.name).toBe('Updated Name')

    const cancelButtons = within(container).getAllByRole('button', { name: /cancel/i })
    expect(cancelButtons.length).toBeGreaterThan(0)
    fireEvent.click(cancelButtons[0]!)
    expect(cancelled).toBe(1)
  })
})
