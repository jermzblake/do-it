import { getCookie } from './cookies'
import { getUserIdBySessionToken } from '../services/auth/sessions.service'

export const getUserFromSessionCookie = async (req: Bun.BunRequest): Promise<string | null> => {
  const sessionToken = getCookie(req, 'session_token')
  if (!sessionToken) {
    throw new Error('No session token found in cookies')
  }
  const userId = await getUserIdBySessionToken(sessionToken)
  if (!userId) {
    throw new Error('Invalid session token')
  }
  return userId
}
