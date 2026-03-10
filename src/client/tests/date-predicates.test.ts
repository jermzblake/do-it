import { describe, it, expect } from 'bun:test'
import { isPast, isToday } from '@/client/utils/date-predicates'

const RealDate = Date

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

describe('date-predicates', () => {
  it('returns false for empty and invalid date strings', () => {
    expect(isToday('')).toBe(false)
    expect(isPast('')).toBe(false)
    expect(isToday('not-a-date')).toBe(false)
    expect(isPast('not-a-date')).toBe(false)
  })

  it('isToday is true only for dates on the same calendar day', () => {
    const restore = freezeTime('2026-03-09T12:00:00.000Z')

    expect(isToday('2026-03-09T08:00:00.000Z')).toBe(true)
    expect(isToday('2026-03-10T08:00:00.000Z')).toBe(false)

    restore()
  })

  it('isPast is true for prior days and false for today/future', () => {
    const restore = freezeTime('2026-03-09T12:00:00.000Z')

    expect(isPast('2026-03-08T12:00:00.000Z')).toBe(true)
    expect(isPast('2026-03-09T08:00:00.000Z')).toBe(false)
    expect(isPast('2026-03-10T08:00:00.000Z')).toBe(false)

    restore()
  })

  it('isPast remains false for earlier times on the same day', () => {
    const restore = freezeTime('2026-03-09T12:00:00.000Z')

    expect(isPast('2026-03-09T00:01:00.000Z')).toBe(false)

    restore()
  })

  it('treats equivalent timezone-offset datetime formats consistently', () => {
    const restore = freezeTime('2026-03-09T12:00:00.000Z')

    expect(isToday('2026-03-09T12:00:00.000Z')).toBe(true)
    expect(isToday('2026-03-09T07:00:00-05:00')).toBe(true)

    restore()
  })
})
