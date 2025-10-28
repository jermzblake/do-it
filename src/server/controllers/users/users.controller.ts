import { createResponse, createErrorResponse, ResponseCode, StatusCode } from '../../utils/response.ts'
import * as UsersService from '../../services/users/users.service.ts'

export const createUser = async (req: Bun.BunRequest) => {
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

export const getMe = async (req: Bun.BunRequest) => {
  const cookies = req.headers.get('cookie') || ''
  const sessionToken = cookies.match(/session=([^;]+)/)?.[1]
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
    const response = createResponse(user, 'User retrieved successfully', StatusCode.SUCCESS, ResponseCode.SUCCESS)
    return Response.json(response, { status: 200 })
  } catch (error) {
    const response = createErrorResponse(
      'Error retrieving user',
      ResponseCode.INTERNAL_SERVER_ERROR,
      (error as Error).message,
    )
    return Response.json(response, { status: 500 })
  }
}
