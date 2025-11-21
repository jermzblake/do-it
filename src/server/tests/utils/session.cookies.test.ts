import { describe, test, expect, spyOn } from 'bun:test'
import { getUserFromSessionCookie } from '../../utils/session.cookies'
import * as cookiesModule from '../../utils/cookies'
import * as sessionsService from '../../services/auth/sessions.service'

describe('getUserFromSessionCookie', () => {
  test('should return userId when session token is valid', async () => {
    const mockReq = new Request('http://localhost') as any
    const mockUserId = 'user-123'
    const mockSessionToken = 'valid-session-token'

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(mockSessionToken)
    const getUserIdSpy = spyOn(sessionsService, 'getUserIdBySessionToken').mockResolvedValue(mockUserId)

    const result = await getUserFromSessionCookie(mockReq)

    expect(result).toBe(mockUserId)
    expect(getCookieSpy).toHaveBeenCalledWith(mockReq, 'session_token')
    expect(getUserIdSpy).toHaveBeenCalledWith(mockSessionToken)

    getCookieSpy.mockRestore()
    getUserIdSpy.mockRestore()
  })

  test('should throw error when session token is missing', async () => {
    const mockReq = new Request('http://localhost') as any

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(null)

    await expect(getUserFromSessionCookie(mockReq)).rejects.toThrow('No session token found in cookies')

    getCookieSpy.mockRestore()
  })

  test('should throw error when session token is invalid', async () => {
    const mockReq = new Request('http://localhost') as any
    const mockSessionToken = 'invalid-token'

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(mockSessionToken)
    const getUserIdSpy = spyOn(sessionsService, 'getUserIdBySessionToken').mockResolvedValue(null)

    await expect(getUserFromSessionCookie(mockReq)).rejects.toThrow('Invalid session token')

    getCookieSpy.mockRestore()
    getUserIdSpy.mockRestore()
  })

  test('should propagate errors from getCookie', async () => {
    const mockReq = new Request('http://localhost') as any
    const mockError = new Error('Cookie parsing failed')

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockImplementation(() => {
      throw mockError
    })

    await expect(getUserFromSessionCookie(mockReq)).rejects.toThrow('Cookie parsing failed')

    getCookieSpy.mockRestore()
  })

  test('should propagate errors from getUserIdBySessionToken', async () => {
    const mockReq = new Request('http://localhost') as any
    const mockSessionToken = 'valid-token'
    const mockError = new Error('Database connection failed')

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(mockSessionToken)
    const getUserIdSpy = spyOn(sessionsService, 'getUserIdBySessionToken').mockRejectedValue(mockError)

    await expect(getUserFromSessionCookie(mockReq)).rejects.toThrow('Database connection failed')

    getCookieSpy.mockRestore()
    getUserIdSpy.mockRestore()
  })

  test('should call getCookie with correct cookie name', async () => {
    const mockReq = new Request('http://localhost') as any

    const getCookieSpy = spyOn(cookiesModule, 'getCookie').mockReturnValue(null)

    try {
      await getUserFromSessionCookie(mockReq)
    } catch (e) {
      // Expected to throw
    }

    expect(getCookieSpy).toHaveBeenCalledWith(mockReq, 'session_token')

    getCookieSpy.mockRestore()
  })
})
