import { createProblem } from '../../shared/problem'
import { RateLimitExceededError } from '../errors/RateLimitExceededError'
import { extractValidationError } from '../utils/validation-error-handler'
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
    } catch (err: unknown) {
      // Extract validation error details directly
      if (mapValidation) {
        const validationDetails = extractValidationError(err)
        if (validationDetails) {
          const problem = createProblem('Request validation failed', 400, {
            detail: validationDetails.formattedErrors,
            type: 'about:blank',
            code: 'VALIDATION_ERROR',
            instance: req.url,
            extensions: validationDetails.issues
              ? { invalidParams: validationDetails.issues.map((i) => ({ name: i.path, reason: i.message })) }
              : undefined,
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

      const errorMessage =
        err && typeof err === 'object' && 'message' in err ? String(err.message) : 'An unexpected error occurred'
      const errorStack = err && typeof err === 'object' && 'stack' in err ? String(err.stack) : undefined
      const problem = createProblem(errorMessage, 500, {
        type: 'about:blank',
        code: 'INTERNAL_ERROR',
        instance: req.url,
        extensions: includeStackInDev && isDev && errorStack ? { stack: errorStack } : undefined,
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
