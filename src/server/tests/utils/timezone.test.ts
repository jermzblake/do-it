import { describe, expect, test } from 'bun:test'
import { sanitizeTimezoneHeader } from '../../utils/timezone'

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
