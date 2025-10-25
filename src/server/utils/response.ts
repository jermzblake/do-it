export interface PagingParams {
  page: number
  pageSize: number
  totalCount: number
  direction?: 'asc' | 'desc'
  sortBy?: string
}

export interface ResponseSchema<T> {
  data: T | null
  metaData: {
    message: string
    status: string
    timestamp: string
    responseCode?: number
    pagination?: PagingParams
  }
  error?: {
    code: number
    details: string
    message: string
  }
}

export const createResponse = <T>(
  data: T | null,
  message = 'Success',
  status = 'OK',
  responseCode = data === null ? 204 : 200,
  pagination?: PagingParams,
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
