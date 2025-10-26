import { createErrorResponse, ResponseCode } from './response.ts'
import * as UsersService from '../services/users/users.service.ts'

export const parseSessionToken = (req: Request): string | null => {
  const cookies = req.headers.get('cookie') || ''
  return cookies.match(/session=([^;]+)/)?.[1] ?? null
}

export const getUserFromRequest = async (req: Request) => {
  const sessionToken = parseSessionToken(req)
  if (!sessionToken) return null
  return UsersService.getUserBySessionToken(sessionToken)
}

// helper that mirrors the project's controller patterns: return Response if unauthorized
export const requireAuth = async (req: Request) => {
  const sessionToken = parseSessionToken(req)
  if (!sessionToken) {
    const response = createErrorResponse('Unauthorized', ResponseCode.UNAUTHORIZED, 'No session token provided')
    return Response.json(response, { status: 401 })
  }

  try {
    const user = await UsersService.getUserBySessionToken(sessionToken)
    if (!user) {
      const response = createErrorResponse(
        'User not found',
        ResponseCode.NOT_FOUND,
        'No user associated with the provided session token',
      )
      return Response.json(response, { status: 404 })
    }
    return user
  } catch (error) {
    const response = createErrorResponse(
      'Error retrieving user',
      ResponseCode.INTERNAL_SERVER_ERROR,
      (error as Error).message,
    )
    return Response.json(response, { status: 500 })
  }
}

export default {
  parseSessionToken,
  getUserFromRequest,
  requireAuth,
}
