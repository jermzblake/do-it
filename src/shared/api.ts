export interface Pagination {
  page: number
  pageSize: number
  totalCount?: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
  direction?: 'asc' | 'desc'
  sortBy?: string
}

export interface ResponseMetaData {
  message: string
  status: string
  timestamp: string
  responseCode?: number
  pagination?: Pagination
  requestId?: string
  traceId?: string
}

export interface ApiResponse<T> {
  data: T | null
  metaData: ResponseMetaData
  error?: {
    code: number
    details: string
    message: string
  }
}

export const isApiResponse = (payload: any): payload is ApiResponse<unknown | null> => {
  if (!payload || typeof payload !== 'object') return false
  if (!('data' in payload)) return false
  const meta = (payload as any).metaData
  if (!meta || typeof meta !== 'object') return false
  return 'message' in meta && 'status' in meta && 'timestamp' in meta
}
