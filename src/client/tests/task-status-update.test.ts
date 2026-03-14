import { describe, it, expect, afterEach } from 'bun:test'
import { handleQuickStatusUpdate } from '@/client/utils/task-status-update'
import type { Task } from '@/shared/task'

const RealDate = Date
let restoreDate: (() => void) | null = null

const freezeTime = (isoDate: string) => {
  const fixed = new RealDate(isoDate)

  class MockDate extends RealDate {
    constructor(value?: string | number | Date) {
      if (typeof value === 'undefined') {
        super(fixed.getTime())
        return
      }
      super(value)
    }

    static override now() {
      return fixed.getTime()
    }

    static override parse(dateString: string) {
      return RealDate.parse(dateString)
    }

    static override UTC(...args: Parameters<typeof RealDate.UTC>) {
      return RealDate.UTC(...args)
    }
  }

  globalThis.Date = MockDate as unknown as DateConstructor

  return () => {
    globalThis.Date = RealDate
  }
}

afterEach(() => {
  restoreDate?.()
  restoreDate = null
})

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'Task',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 3,
  ...overrides,
})

describe('handleQuickStatusUpdate', () => {
  it('sets startedAt only when moving to in_progress and startedAt is absent, while merging additional updates', async () => {
    restoreDate = freezeTime('2026-03-14T10:00:00.000Z')
    const calls: Partial<Task>[] = []

    await handleQuickStatusUpdate(
      async (updates) => {
        calls.push(updates)
      },
      makeTask({ startedAt: undefined }),
      'in_progress',
      { priority: 1, blockedReason: '' },
    )

    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({
      status: 'in_progress',
      priority: 1,
      blockedReason: '',
      startedAt: '2026-03-14T10:00:00.000Z',
    })
  })

  it('does not set startedAt when moving to in_progress if task already has startedAt', async () => {
    restoreDate = freezeTime('2026-03-14T10:00:00.000Z')
    const calls: Partial<Task>[] = []

    await handleQuickStatusUpdate(
      async (updates) => {
        calls.push(updates)
      },
      makeTask({ startedAt: '2026-02-01T08:00:00.000Z' }),
      'in_progress',
    )

    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual({ status: 'in_progress' })
  })

  it('always sets completedAt when moving to completed and can override stale completedAt from additional updates', async () => {
    restoreDate = freezeTime('2026-03-14T11:30:00.000Z')
    const calls: Partial<Task>[] = []

    await handleQuickStatusUpdate(
      async (updates) => {
        calls.push(updates)
      },
      makeTask({ status: 'in_progress' }),
      'completed',
      {
        notes: 'Finished work',
        completedAt: '2000-01-01T00:00:00.000Z',
      },
    )

    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({
      status: 'completed',
      notes: 'Finished work',
      completedAt: '2026-03-14T11:30:00.000Z',
    })
  })
})
