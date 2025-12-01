import { createProblem } from '../../shared/problem'
import { RateLimitExceededError } from '../errors/RateLimitExceededError'
import { handleValidationError } from '../utils/validation-error-handler'
import { HttpError } from '../errors/HttpError'

type Handler = (req: Bun.BunRequest) => Promise<Response> | Response

interface ProblemOptions {
  mapValidation?: boolean
  includeStackInDev?: boolean
}

const isDev = process.env.NODE_ENV !== 'production'

export const withProblemDetails = (handler: Handler, options: ProblemOptions = {}) => {
  const { mapValidation = true, includeStackInDev = false } = options
  return async (req: Bun.BunRequest): Promise<Response> => {
    try {
      return await handler(req)
    } catch (err: any) {
      // Allow existing validation handler to produce envelope; then convert to Problem Details
      if (mapValidation) {
        const validationEnvelope = handleValidationError(err)
        if (validationEnvelope) {
          const json = await validationEnvelope.json()
          const problem = createProblem('Request validation failed', 400, {
            detail: json.error?.message,
            type: 'about:blank',
            code: 'VALIDATION_ERROR',
            instance: req.url,
          })
          return new Response(JSON.stringify(problem), {
            status: 400,
            headers: { 'Content-Type': 'application/problem+json' },
          })
        }
        // Fallback: generic shape detection (e.g. Zod-like object with issues array)
        if (err && Array.isArray((err as any).issues)) {
          const issues = (err as any).issues as Array<{ path: Array<string | number>; message: string }>
          const invalidParams = issues.map((i) => ({
            name: i.path.join('.'),
            reason: i.message,
          }))
          const problem = createProblem('Request validation failed', 400, {
            detail: issues.map((i) => i.message).join(', '),
            type: 'about:blank',
            code: 'VALIDATION_ERROR',
            instance: req.url,
            extensions: { invalidParams },
          })
          return new Response(JSON.stringify(problem), {
            status: 400,
            headers: { 'Content-Type': 'application/problem+json' },
          })
        }
      }

      if (err instanceof HttpError) {
        const problem = createProblem(err.message, err.status, {
          type: err.type || 'about:blank',
          code: err.code,
          instance: req.url,
        })
        return new Response(JSON.stringify(problem), {
          status: err.status,
          headers: { 'Content-Type': 'application/problem+json' },
        })
      }

      if (err instanceof RateLimitExceededError) {
        const problem = createProblem('Rate limit exceeded', 429, {
          detail: err.message,
          type: 'about:blank',
          code: 'RATE_LIMIT_EXCEEDED',
          instance: req.url,
        })
        return new Response(JSON.stringify(problem), {
          status: 429,
          headers: { 'Content-Type': 'application/problem+json' },
        })
      }

      const problem = createProblem(err?.message || 'An unexpected error occurred', 500, {
        type: 'about:blank',
        code: 'INTERNAL_ERROR',
        instance: req.url,
        extensions: includeStackInDev && isDev && err?.stack ? { stack: err.stack } : undefined,
      })
      return new Response(JSON.stringify(problem), {
        status: 500,
        headers: { 'Content-Type': 'application/problem+json' },
      })
    }
  }
}

// Convenience demo handler that always throws
export const demoProblemHandler = withProblemDetails(async () => {
  throw new Error('Sample failure triggered for demo')
})
