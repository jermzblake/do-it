export interface PagingParams<T = unknown> {
  page: number
  pageSize: number
  totalCount?: number
  direction?: 'asc' | 'desc'
  sortBy?: string
  data?: T[]
}

export interface ResponseSchema<T> {
  data: T | null
  metaData: {
    message: string
    status: string
    timestamp: string
    responseCode?: number
    pagination?: PagingParams<T>
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
}

export const ResponseCode = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 500,
}

export const StatusCode = {
  SUCCESS: 'S1000_SUCCESS',
  CREATED: 'S1001_CREATED',
  ACCEPTED: 'S1002_ACCEPTED',
  NO_CONTENT: 'S1003_NO_CONTENT',
  NOT_FOUND: 'C4004_NOT_FOUND',
  BAD_REQUEST: 'C4000_BAD_REQUEST',
  UNAUTHORIZED: 'C4001_UNAUTHORIZED',
  FORBIDDEN: 'C4002_FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'E5000_INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'E5003_SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'E5001_NOT_IMPLEMENTED',
  DATABASE_ERROR: 'E5005_DATABASE_ERROR',
}

export const createResponse = <T>(
  data: T | null,
  message = ResponseMessage.SUCCESS,
  status = StatusCode.SUCCESS,
  responseCode = ResponseCode.SUCCESS,
  pagination?: PagingParams<T>,
): ResponseSchema<T> => ({
  data,
  metaData: {
    message,
    status,
    timestamp: new Date().toISOString(),
    responseCode,
    pagination,
  },
})

export const createErrorResponse = (message: string, code = 500, details = ''): ResponseSchema<null> => ({
  data: null,
  metaData: {
    message,
    status: 'ERROR',
    timestamp: new Date().toISOString(),
    responseCode: code,
  },
  error: {
    code,
    message,
    details,
  },
})
