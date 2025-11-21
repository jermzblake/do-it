import { describe, test, expect } from 'bun:test'
import { setCookie, getCookie, deleteCookie } from '../../utils/cookies'

describe('setCookie', () => {
  test('should create cookie with default options', () => {
    const cookie = setCookie('test', 'value', {})

    expect(cookie).toContain('test=value')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('Max-Age=2592000') // 30 days
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).not.toContain('Secure')
  })

  test('should create cookie with custom maxAge', () => {
    const cookie = setCookie('test', 'value', { maxAge: 3600 })

    expect(cookie).toContain('Max-Age=3600')
  })

  test('should create cookie with Secure flag when specified', () => {
    const cookie = setCookie('test', 'value', { secure: true })

    expect(cookie).toContain('Secure')
  })

  test('should create cookie without HttpOnly when explicitly disabled', () => {
    const cookie = setCookie('test', 'value', { httpOnly: false })

    expect(cookie).not.toContain('HttpOnly')
  })

  test('should create cookie with custom SameSite value', () => {
    const cookie = setCookie('test', 'value', { sameSite: 'Strict' })

    expect(cookie).toContain('SameSite=Strict')
  })

  test('should create cookie with custom path', () => {
    const cookie = setCookie('test', 'value', { path: '/api' })

    expect(cookie).toContain('Path=/api')
  })

  test('should merge custom options with defaults', () => {
    const cookie = setCookie('session', 'abc123', {
      maxAge: 7200,
      secure: true,
      sameSite: 'None',
    })

    expect(cookie).toContain('session=abc123')
    expect(cookie).toContain('Max-Age=7200')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=None')
    expect(cookie).toContain('HttpOnly') // default
  })
})

describe('getCookie', () => {
  test('should return cookie value when it exists', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'session_token=abc123; other=value' },
    })

    const value = getCookie(req as any, 'session_token')
    expect(value).toBe('abc123')
  })

  test('should return null when cookie header is missing', () => {
    const req = new Request('http://localhost')

    const value = getCookie(req as any, 'session_token')
    expect(value).toBeNull()
  })

  test('should return null when cookie is not found', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'other=value' },
    })

    const value = getCookie(req as any, 'session_token')
    expect(value).toBeNull()
  })

  test('should decode URL-encoded cookie values', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'data=hello%20world' },
    })

    const value = getCookie(req as any, 'data')
    expect(value).toBe('hello world')
  })

  test('should handle cookie at start of string', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'first=1; second=2' },
    })

    const value = getCookie(req as any, 'first')
    expect(value).toBe('1')
  })

  test('should handle cookie at end of string', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'first=1; last=2' },
    })

    const value = getCookie(req as any, 'last')
    expect(value).toBe('2')
  })

  test('should handle empty cookie value', () => {
    const req = new Request('http://localhost', {
      headers: { Cookie: 'empty=; other=value' },
    })

    const value = getCookie(req as any, 'empty')
    expect(value).toBe('')
  })
})

describe('deleteCookie', () => {
  test('should return cookie deletion string', () => {
    const cookie = deleteCookie('session_token')

    expect(cookie).toBe('session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  })

  test('should create deletion cookie with Max-Age=0', () => {
    const cookie = deleteCookie('test')

    expect(cookie).toContain('Max-Age=0')
  })

  test('should include security flags in deletion cookie', () => {
    const cookie = deleteCookie('test')

    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
  })
})
