import { describe, test, expect } from 'bun:test'
import { withProblemDetails } from '../../middleware/problem-details'
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../../errors/HttpError'
import { RateLimitExceededError } from '../../errors/RateLimitExceededError'
import { withCorrelation } from '../../middleware/correlation'

describe('withProblemDetails middleware', () => {
  test('wraps thrown error into Problem Details response (RFC 9457)', async () => {
    const handler = withProblemDetails(async () => {
      throw new Error('Boom')
    })
    const res = await handler(new Request('http://localhost/api/problem-demo') as any)
    expect(res.status).toBe(500)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Boom')
    expect(body).toHaveProperty('status', 500)
    expect(body).toHaveProperty('code', 'INTERNAL_ERROR')
    expect(body).toHaveProperty('instance', 'http://localhost/api/problem-demo')
  })

  test('maps validation error when enabled', async () => {
    // Fake a validation error structure similar to Zod for mapping demonstration
    const validationError: any = {
      issues: [{ path: ['name'], message: 'Required' }],
      name: 'ZodError',
    }
    const handler = withProblemDetails(async () => {
      throw validationError
    })
    const res = await handler(new Request('http://localhost/api/problem-demo') as any)
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Request validation failed')
    expect(body).toHaveProperty('status', 400)
    expect(body).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(body).toHaveProperty('instance')
    const invalidParams = (body as { invalidParams?: unknown }).invalidParams
    expect(Array.isArray(invalidParams) || invalidParams === undefined).toBe(true)
  })

  test('returns internal error when validation mapping is disabled', async () => {
    const validationError: any = {
      issues: [{ path: ['name'], message: 'Required' }],
      name: 'ZodError',
    }
    const handler = withProblemDetails(
      async () => {
        throw validationError
      },
      { mapValidation: false },
    )
    const res = await handler(new Request('http://localhost/api/problem-demo') as any)
    expect(res.status).toBe(500)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'An unexpected error occurred')
    expect(body).toHaveProperty('status', 500)
    expect(body).toHaveProperty('code', 'INTERNAL_ERROR')
  })

  test('maps RateLimitExceededError to 429 problem response', async () => {
    const handler = withProblemDetails(async () => {
      throw new RateLimitExceededError('Too many requests from this client')
    })

    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)

    expect(res.status).toBe(429)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Rate limit exceeded')
    expect(body).toHaveProperty('status', 429)
    expect(body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED')
    expect(body).toHaveProperty('instance', req.url)
    expect(body).toHaveProperty('detail', 'Too many requests from this client')
  })

  test('maps BadRequestError to 400 problem response', async () => {
    const handler = withCorrelation(
      withProblemDetails(async () => {
        throw new BadRequestError('Invalid input')
      }),
    )
    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Invalid input')
    expect(body).toHaveProperty('status', 400)
    expect(body).toHaveProperty('code', 'BAD_REQUEST')
    expect(body).toHaveProperty('instance', req.url)
    expect(body).toHaveProperty('requestId')
    expect(body).toHaveProperty('traceId')
    expect(typeof body.requestId).toBe('string')
    expect(typeof body.traceId).toBe('string')
  })

  test('maps NotFoundError to 404 problem response', async () => {
    const handler = withProblemDetails(async () => {
      throw new NotFoundError('Task not found')
    })
    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)
    expect(res.status).toBe(404)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Task not found')
    expect(body).toHaveProperty('status', 404)
    expect(body).toHaveProperty('code', 'NOT_FOUND')
    expect(body).toHaveProperty('instance', req.url)
  })

  test('maps UnauthorizedError to 401 problem response', async () => {
    const handler = withProblemDetails(async () => {
      throw new UnauthorizedError('Authentication required')
    })
    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)
    expect(res.status).toBe(401)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Authentication required')
    expect(body).toHaveProperty('status', 401)
    expect(body).toHaveProperty('code', 'UNAUTHORIZED')
    expect(body).toHaveProperty('instance', req.url)
  })

  test('maps ForbiddenError to 403 problem response', async () => {
    const handler = withProblemDetails(async () => {
      throw new ForbiddenError('Access denied')
    })
    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)
    expect(res.status).toBe(403)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Access denied')
    expect(body).toHaveProperty('status', 403)
    expect(body).toHaveProperty('code', 'FORBIDDEN')
    expect(body).toHaveProperty('instance', req.url)
  })
})
