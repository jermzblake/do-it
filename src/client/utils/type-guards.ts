import type { ApiResponse } from '@/shared/api'

/**
 * Type guard to check if an unknown error is an ApiResponse from the server.
 * The axios interceptor transforms server errors into ApiResponse format.
 */
export const isApiResponseError = (error: unknown): error is ApiResponse<any> => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'metaData' in error &&
    typeof (error as any).metaData === 'object' &&
    'message' in (error as any).metaData
  )
}

/**
 * Type guard to check if an ApiResponse contains a specific error detail code.
 * Useful for intercepting specific server-side error conditions like rate limiting.
 */
export const hasErrorDetail = (error: ApiResponse<any>, detailCode: string): boolean => {
  return error.error?.details === detailCode
}
