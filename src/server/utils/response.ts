import type { Pagination } from '../../shared/api'

export interface ResponseSchema<T> {
  data: T | null
  metaData: {
    message: string
    status: StatusUnion
    timestamp: string
    responseCode?: number
    pagination?: Pagination
    requestId?: string
    traceId?: string
  }
  error?: {
    code: number
    details: string
    message: string
  }
}

export const ResponseMessage = {
  SUCCESS: 'Request Successful.',
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  NOT_FOUND: 'Resource not found.',
  BAD_REQUEST: 'Invalid request parameters.',
  UNAUTHORIZED: 'Authentication required.',
  FORBIDDEN: 'Access denied.',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred.',
  SERVICE_UNAVAILABLE: 'Service unavailable.',
  NOT_IMPLEMENTED: 'Not implemented.',
  NO_CONTENT: 'Request successful but no content to return.',
  ACCEPTED: 'Request accepted but not processed.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded.',
} as const

export const ResponseCode = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 500,
} as const

export const StatusCode = {
  SUCCESS: 'S1000_SUCCESS',
  CREATED: 'S1001_CREATED',
  ACCEPTED: 'S1002_ACCEPTED',
  NO_CONTENT: 'S1003_NO_CONTENT',
  NOT_FOUND: 'C4004_NOT_FOUND',
  BAD_REQUEST: 'C4000_BAD_REQUEST',
  UNAUTHORIZED: 'C4001_UNAUTHORIZED',
  FORBIDDEN: 'C4002_FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'C4005_RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'E5000_INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'E5003_SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'E5001_NOT_IMPLEMENTED',
  DATABASE_ERROR: 'E5005_DATABASE_ERROR',
} as const

export type StatusUnion = (typeof StatusCode)[keyof typeof StatusCode]
export type ResponseCodeUnion = (typeof ResponseCode)[keyof typeof ResponseCode]

const getDefaultMessage = (responseCode: ResponseCodeUnion): string => {
  const codeToMessage: Record<number, string> = {
    [ResponseCode.SUCCESS]: ResponseMessage.SUCCESS,
    [ResponseCode.CREATED]: ResponseMessage.CREATED,
    [ResponseCode.ACCEPTED]: ResponseMessage.ACCEPTED,
    [ResponseCode.NO_CONTENT]: ResponseMessage.NO_CONTENT,
    [ResponseCode.BAD_REQUEST]: ResponseMessage.BAD_REQUEST,
    [ResponseCode.UNAUTHORIZED]: ResponseMessage.UNAUTHORIZED,
    [ResponseCode.FORBIDDEN]: ResponseMessage.FORBIDDEN,
    [ResponseCode.NOT_FOUND]: ResponseMessage.NOT_FOUND,
    [ResponseCode.TOO_MANY_REQUESTS]: ResponseMessage.RATE_LIMIT_EXCEEDED,
    [ResponseCode.INTERNAL_SERVER_ERROR]: ResponseMessage.INTERNAL_SERVER_ERROR,
    [ResponseCode.NOT_IMPLEMENTED]: ResponseMessage.NOT_IMPLEMENTED,
    [ResponseCode.SERVICE_UNAVAILABLE]: ResponseMessage.SERVICE_UNAVAILABLE,
  }
  return codeToMessage[responseCode] ?? ResponseMessage.SUCCESS
}

export const createResponse = <T>(
  data: T | null,
  message?: (typeof ResponseMessage)[keyof typeof ResponseMessage],
  status: StatusUnion = StatusCode.SUCCESS,
  responseCode: ResponseCodeUnion = ResponseCode.SUCCESS,
  pagination?: Pagination,
  requestId?: string,
  traceId?: string,
): ResponseSchema<T> => ({
  data,
  metaData: {
    message: message ?? getDefaultMessage(responseCode),
    status,
    timestamp: new Date().toISOString(),
    responseCode,
    pagination,
    requestId,
    traceId,
  },
})

export const createErrorResponse = (
  message: string,
  code: ResponseCodeUnion = ResponseCode.INTERNAL_SERVER_ERROR,
  details = '',
  status: StatusUnion = StatusCode.INTERNAL_SERVER_ERROR,
  requestId?: string,
  traceId?: string,
): ResponseSchema<null> => ({
  data: null,
  metaData: {
    message,
    status,
    timestamp: new Date().toISOString(),
    responseCode: code,
    requestId,
    traceId,
  },
  error: {
    code,
    message,
    details,
  },
})
