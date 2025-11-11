import { createErrorResponse } from './response.ts'
import { z } from 'zod'

export const handleValidationError = (error: any): Response | undefined => {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
    const response = createErrorResponse(`Validation error: ${formattedErrors}`, 400)
    return Response.json(response, { status: 400 })
  }

  if (
    error?.message?.includes('Invalid field') ||
    error?.message?.includes('must be') ||
    error?.message?.includes('is required') ||
    error?.message?.includes('Invalid task status')
  ) {
    const response = createErrorResponse('Validation error: ' + error.message, 400)
    return Response.json(response, { status: 400 })
  }

  return undefined
}
