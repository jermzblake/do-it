import { z } from 'zod'

export interface ValidationErrorDetails {
  message: string
  formattedErrors?: string
  issues?: Array<{ path: string; message: string }>
}

/**
 * Extracts validation error details from various error types without creating Response objects.
 * This allows consumers to work with structured error data directly without serialization overhead.
 */
export const extractValidationError = (error: unknown): ValidationErrorDetails | undefined => {
  // Handle Zod errors (or Zod-like objects with issues array)
  if (
    error instanceof z.ZodError ||
    (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues))
  ) {
    const errorObj = error as { issues: Array<{ path: Array<string | number>; message: string }> }
    const issues = errorObj.issues.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }))
    const formattedErrors = issues.map((i) => `${i.path}: ${i.message}`).join(', ')
    return {
      message: `Validation error: ${formattedErrors}`,
      formattedErrors,
      issues,
    }
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    (error.message.includes('Invalid field') ||
      error.message.includes('must be') ||
      error.message.includes('is required') ||
      error.message.includes('Invalid task status'))
  ) {
    return {
      message: 'Validation error: ' + error.message,
      formattedErrors: error.message,
    }
  }

  return undefined
}
