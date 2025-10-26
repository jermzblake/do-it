import { createResponse, createErrorResponse, ResponseCode, StatusCode } from '../../utils/response.ts'
import * as UsersService from '../../services/users/users.service.ts'
import * as AuthUtils from '../../utils/auth.ts'
export const createUser = async (req: Request) => {
  const userPayload = await req.json()
  if (!userPayload.name || !userPayload.email) {
    const response = createErrorResponse(
      'Invalid user payload',
      ResponseCode.BAD_REQUEST,
      'Name and email are required',
    )
    return Response.json(response, { status: 400 })
  }
  try {
    const newUser = await UsersService.createUser(userPayload)
    const response = createResponse(newUser, 'User created successfully', StatusCode.CREATED, ResponseCode.CREATED)
    return Response.json(response, { status: 201 })
  } catch (error) {
    const response = createErrorResponse(
      'Error creating user',
      ResponseCode.INTERNAL_SERVER_ERROR,
      (error as Error).message,
    )
    return Response.json(response, { status: 500 })
  }
}

export const getMe = async (req: Request) => {
  // use centralized auth helper
  const maybeUser = await AuthUtils.requireAuth(req)
  // if it's a Response (error), return it directly
  if (maybeUser instanceof Response) return maybeUser

  const user = maybeUser as Awaited<ReturnType<typeof UsersService.getUserBySessionToken>>
  const response = createResponse(user, 'User retrieved successfully', StatusCode.SUCCESS, ResponseCode.SUCCESS)
  return Response.json(response, { status: 200 })
}
