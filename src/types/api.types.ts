export interface PagingParams<T = unknown> {
  page: number
  pageSize: number
  totalCount?: number
  direction?: 'asc' | 'desc'
  sortBy?: string
  data?: T[]
}

export interface ApiResponse<T> {
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
