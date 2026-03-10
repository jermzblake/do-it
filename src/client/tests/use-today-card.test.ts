import { describe, it, expect } from 'bun:test'
import { useTodayCard } from '@/client/hooks/use-today-card'
import type { Task } from '@/shared/task'

const RealDate = Date

const freezeTime = (isoDate: string) => {
  const fixed = new RealDate(isoDate)

  type DateCtorArgs =
    | []
    | [value: string | number | Date]
    | [year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number]

  class MockDate extends RealDate {
    constructor(...args: DateCtorArgs) {
      if (args.length === 0) {
        super(fixed.getTime())
        return
      }

      if (args.length === 1) {
        super(args[0])
        return
      }

      if (args.length === 2) {
        super(args[0], args[1])
        return
      }

      if (args.length === 3) {
        super(args[0], args[1], args[2])
        return
      }

      if (args.length === 4) {
        super(args[0], args[1], args[2], args[3])
        return
      }

      if (args.length === 5) {
        super(args[0], args[1], args[2], args[3], args[4])
        return
      }

      if (args.length === 6) {
        super(args[0], args[1], args[2], args[3], args[4], args[5])
        return
      }

      super(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
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

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  name: 'Task',
  description: '',
  status: 'todo',
  priority: 2,
  effort: 2,
  ...overrides,
})

describe('useTodayCard', () => {
  it('formats yesterday consistently at calendar-day boundaries', () => {
    const restore = freezeTime('2026-03-09T15:30:00')
    const { formatDate } = useTodayCard()

    expect(formatDate('2026-03-08T12:00:00')).toBe('Yesterday')

    restore()
  })

  it('returns null for invalid dates instead of rendering nulld', () => {
    const { formatDate } = useTodayCard()

    expect(formatDate('not-a-date')).toBeNull()
  })

  it('formats future dates with stable labels', () => {
    const restore = freezeTime('2026-03-09T15:30:00')
    const { formatDate } = useTodayCard()

    expect(formatDate('2026-03-10T12:00:00')).toBe('Tomorrow')
    expect(formatDate('2026-03-12T12:00:00')).toBe('in 3d')

    restore()
  })

  it('keeps due-soon urgency based on positive calendar-day diffs', () => {
    const restore = freezeTime('2026-03-09T15:30:00')
    const { getTaskUrgency } = useTodayCard()

    const dueSoon = makeTask({ dueDate: '2026-03-11T12:00:00' })
    expect(getTaskUrgency(dueSoon)).toBe('due-soon')

    restore()
  })
})
