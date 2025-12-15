import { describe, it, expect } from 'bun:test'
import { isOverdue } from '@/client/utils/is-overdue'
import { normalizeDates } from '@/client/utils/normalize-date'

describe('isOverdue', () => {
  it('returns false for undefined/null/empty', () => {
    expect(isOverdue(undefined)).toBe(false)
    expect(isOverdue(null as null)).toBe(false)
    expect(isOverdue('')).toBe(false)
  })

  it('correctly detects past ISO string', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    expect(isOverdue(past)).toBe(true)
  })

  it('correctly detects future ISO string', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    expect(isOverdue(future)).toBe(false)
  })

  it('accepts Date objects', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24)
    expect(isOverdue(past)).toBe(true)
  })
})

describe('normalizeDates', () => {
  it('converts Date fields to ISO strings', () => {
    const obj = {
      id: 't1',
      dueDate: new Date('2020-01-01T00:00:00.000Z'),
      startedAt: new Date('2020-01-02T00:00:00.000Z'),
      name: 'task',
    }

    const normalized = normalizeDates(obj as any) as any
    expect(typeof normalized.dueDate).toBe('string')
    expect(normalized.dueDate).toBe('2020-01-01T00:00:00.000Z')
    expect(typeof normalized.startedAt).toBe('string')
    expect(normalized.startedAt).toBe('2020-01-02T00:00:00.000Z')
    expect(normalized.name).toBe('task')
  })
})
