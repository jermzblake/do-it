import { describe, expect, test } from 'bun:test'
import { getTodayViewUtcBoundaries, sanitizeTimezoneHeader } from '../../utils/timezone'

describe('sanitizeTimezoneHeader', () => {
  test('returns UTC when timezone header is missing', () => {
    expect(sanitizeTimezoneHeader(undefined)).toBe('UTC')
    expect(sanitizeTimezoneHeader(null)).toBe('UTC')
  })

  test('returns UTC when timezone header is empty or whitespace', () => {
    expect(sanitizeTimezoneHeader('')).toBe('UTC')
    expect(sanitizeTimezoneHeader('   ')).toBe('UTC')
  })

  test('returns validated IANA timezone when valid', () => {
    const timezone = sanitizeTimezoneHeader('America/New_York')
    expect(timezone).toBe('America/New_York')
  })

  test('returns UTC when timezone header is invalid', () => {
    expect(sanitizeTimezoneHeader('Not/A_Real_Timezone')).toBe('UTC')
    expect(sanitizeTimezoneHeader("'; DROP TABLE tasks; --")).toBe('UTC')
  })
})

describe('getTodayViewUtcBoundaries', () => {
  test('computes UTC day boundaries for a standard day', () => {
    const now = new Date('2026-01-15T12:00:00.000Z')
    const boundaries = getTodayViewUtcBoundaries('America/New_York', now)

    expect(boundaries.startOfTodayUtc.toISOString()).toBe('2026-01-15T05:00:00.000Z')
    expect(boundaries.startOfTomorrowUtc.toISOString()).toBe('2026-01-16T05:00:00.000Z')
    expect(boundaries.startOfThreeDaysOutUtc.toISOString()).toBe('2026-01-18T05:00:00.000Z')
  })

  test('handles spring-forward DST transition with a 23-hour local day', () => {
    const now = new Date('2026-03-08T12:00:00.000Z')
    const boundaries = getTodayViewUtcBoundaries('America/New_York', now)
    const dayLengthMs = boundaries.startOfTomorrowUtc.getTime() - boundaries.startOfTodayUtc.getTime()

    expect(boundaries.startOfTodayUtc.toISOString()).toBe('2026-03-08T05:00:00.000Z')
    expect(boundaries.startOfTomorrowUtc.toISOString()).toBe('2026-03-09T04:00:00.000Z')
    expect(dayLengthMs).toBe(23 * 60 * 60 * 1000)
  })

  test('handles fall-back DST transition with a 25-hour local day', () => {
    const now = new Date('2026-11-01T12:00:00.000Z')
    const boundaries = getTodayViewUtcBoundaries('America/New_York', now)
    const dayLengthMs = boundaries.startOfTomorrowUtc.getTime() - boundaries.startOfTodayUtc.getTime()

    expect(boundaries.startOfTodayUtc.toISOString()).toBe('2026-11-01T04:00:00.000Z')
    expect(boundaries.startOfTomorrowUtc.toISOString()).toBe('2026-11-02T05:00:00.000Z')
    expect(dayLengthMs).toBe(25 * 60 * 60 * 1000)
  })
})
