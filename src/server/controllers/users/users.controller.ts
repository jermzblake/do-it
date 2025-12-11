import { createResponse, ResponseMessage, ResponseCode, StatusCode } from '../../utils/response.ts'
import { BadRequestError, UnauthorizedError, NotFoundError, InternalServerError } from '../../errors/HttpError.ts'
import * as UsersService from '../../services/users/users.service.ts'
import { getCorrelation } from '../../utils/request-context'
import { createLogger } from '../../utils/logger'

export const createUser = async (req: Bun.BunRequest) => {
  const log = createLogger(req)
  const userPayload = await req.json()
  if (!userPayload.name || !userPayload.email) {
    throw new BadRequestError('Name and email are required', 'MISSING_REQUIRED_FIELDS')
  }
  try {
    const newUser = await UsersService.createUser(userPayload)
    const correlationIds = getCorrelation(req)
    log.info({ ssoType: newUser.ssoType, hasEmail: !!newUser.email }, 'user:create completed')
    const response = createResponse(
      newUser,
      ResponseMessage.CREATED,
      StatusCode.CREATED,
      ResponseCode.CREATED,
      undefined,
      correlationIds?.requestId,
      correlationIds?.traceId,
    )
    return Response.json(response, { status: 201 })
  } catch (error) {
    throw new InternalServerError((error as Error).message, 'USER_CREATE_FAILED')
  }
}

export const getMe = async (req: Bun.BunRequest) => {
  const log = createLogger(req)
  const cookies = req.headers.get('cookie') || ''
  const sessionToken = cookies.match(/session=([^;]+)/)?.[1]
  if (!sessionToken) {
    throw new UnauthorizedError('No session token provided', 'NO_SESSION_TOKEN')
  }
  try {
    const user = await UsersService.getUserBySessionToken(sessionToken)
    if (!user) {
      throw new NotFoundError('No user associated with the provided session token', 'USER_NOT_FOUND')
    }
    const correlationIds = getCorrelation(req)
    log.info({ userId: user.id }, 'user:getMe completed')
    const response = createResponse(
      user,
      ResponseMessage.SUCCESS,
      StatusCode.SUCCESS,
      ResponseCode.SUCCESS,
      undefined,
      correlationIds?.requestId,
      correlationIds?.traceId,
    )
    return Response.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) throw error
    throw new InternalServerError((error as Error).message, 'USER_RETRIEVAL_FAILED')
  }
}
