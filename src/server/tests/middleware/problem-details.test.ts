import { describe, test, expect } from 'bun:test'
import { withProblemDetails } from '../../middleware/problem-details'
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../../errors/HttpError'

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
    expect(Array.isArray(body.invalidParams) || (body as any).invalidParams === undefined).toBe(true)
  })

  test('maps BadRequestError to 400 problem response', async () => {
    const handler = withProblemDetails(async () => {
      throw new BadRequestError('Invalid input')
    })
    const req = new Request('http://localhost/api/test') as any
    const res = await handler(req)
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const body = await res.json()
    expect(body).toHaveProperty('title', 'Invalid input')
    expect(body).toHaveProperty('status', 400)
    expect(body).toHaveProperty('code', 'BAD_REQUEST')
    expect(body).toHaveProperty('instance', req.url)
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
