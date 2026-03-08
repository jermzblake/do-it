import { describe, test, expect } from 'bun:test'
import { createProblem, isProblemDetails } from '../../../shared/problem'

describe('createProblem', () => {
  test('creates minimal RFC 9457 problem payload', () => {
    const problem = createProblem('Something failed', 500)

    expect(problem).toEqual({
      title: 'Something failed',
      status: 500,
    })
  })

  test('includes optional standard fields and extensions', () => {
    const problem = createProblem('Validation failed', 400, {
      type: 'about:blank',
      detail: 'name is required',
      instance: '/api/tasks',
      code: 'VALIDATION_ERROR',
      requestId: 'req_123',
      traceId: 'trace_123',
      extensions: {
        invalidParams: [{ name: 'name', reason: 'Required' }],
      },
    })

    expect(problem).toMatchObject({
      type: 'about:blank',
      title: 'Validation failed',
      status: 400,
      detail: 'name is required',
      instance: '/api/tasks',
      code: 'VALIDATION_ERROR',
      requestId: 'req_123',
      traceId: 'trace_123',
      invalidParams: [{ name: 'name', reason: 'Required' }],
    })
  })
})

describe('isProblemDetails', () => {
  test('returns true for valid problem payload', () => {
    expect(isProblemDetails({ title: 'Bad Request', status: 400 })).toBe(true)
  })

  test('returns false for non-problem payloads', () => {
    expect(isProblemDetails({ data: null, metaData: {} })).toBe(false)
    expect(isProblemDetails({ title: 'Missing status' })).toBe(false)
    expect(isProblemDetails(null)).toBe(false)
  })
})
