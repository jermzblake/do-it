import { getCookie } from './cookies'
import { getUserIdBySessionToken } from '../services/auth/sessions.service'
import { UnauthorizedError } from '../errors/HttpError'

export const getUserFromSessionCookie = async (req: Bun.BunRequest): Promise<string> => {
  const sessionToken = getCookie(req, 'session_token')
  if (!sessionToken) {
    throw new UnauthorizedError('No session token found in cookies', 'NO_SESSION_TOKEN')
  }
  const userId = await getUserIdBySessionToken(sessionToken)
  if (!userId) {
    throw new UnauthorizedError('Invalid session token', 'INVALID_SESSION')
  }
  return userId
}
