export interface ProblemDetails {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  code?: string | number
  traceId?: string
  requestId?: string
  [key: string]: unknown
}

export const isProblemDetails = (payload: any): payload is ProblemDetails => {
  return (
    payload &&
    typeof payload === 'object' &&
    'title' in payload &&
    'status' in payload &&
    typeof (payload as any).status === 'number'
  )
}

/**
 * Factory function to create RFC 9457 Problem Details objects.
 *
 * @remarks
 * This factory is primarily intended for server-side use in error handling middleware.
 * Client code should typically work with ProblemDetails via type guards.
 *
 * @param title - A short, human-readable summary of the problem
 * @param status - HTTP status code
 * @param options - Optional fields including type URI, detail, instance, code, traceId, requestId, and custom extensions
 * @returns A ProblemDetails object conforming to RFC 9457
 */
export const createProblem = (
  title: string,
  status: number,
  options: {
    type?: string
    detail?: string
    instance?: string
    code?: string | number
    traceId?: string
    requestId?: string
    extensions?: Record<string, unknown>
  } = {},
): ProblemDetails => {
  const problem: ProblemDetails = {
    title,
    status,
  }
  if (options.type !== undefined) problem.type = options.type
  if (options.detail !== undefined) problem.detail = options.detail
  if (options.instance !== undefined) problem.instance = options.instance
  if (options.code !== undefined) problem.code = options.code
  if (options.traceId !== undefined) problem.traceId = options.traceId
  if (options.requestId !== undefined) problem.requestId = options.requestId
  return { ...problem, ...(options.extensions ?? {}) }
}
