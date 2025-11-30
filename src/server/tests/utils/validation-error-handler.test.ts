import { describe, test, expect } from 'bun:test'
import { z } from 'zod'
import { handleValidationError } from '../../utils/validation-error-handler'
import { StatusCode } from '../../utils/response'

describe('handleValidationError', () => {
  test('should handle Zod validation error with single issue', async () => {
    const schema = z.object({
      name: z.string().min(1),
    })

    try {
      schema.parse({ name: '' })
    } catch (error) {
      const response = handleValidationError(error)
      expect(response).toBeDefined()

      const json = await response!.json()
      expect(json.metaData.responseCode).toBe(400)
      expect(json.error.message).toContain('Validation error')
      expect(json.error.message).toContain('name')
    }
  })

  test('should handle Zod validation error with multiple issues', async () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0),
    })

    try {
      schema.parse({ name: '', email: 'invalid', age: -5 })
    } catch (error) {
      const response = handleValidationError(error)
      expect(response).toBeDefined()

      const json = await response!.json()
      expect(json.error.message).toContain('name')
      expect(json.error.message).toContain('email')
      expect(json.error.message).toContain('age')
    }
  })

  test('should format Zod error with nested paths', async () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string().min(1),
        }),
      }),
    })

    try {
      schema.parse({ user: { profile: { name: '' } } })
    } catch (error) {
      const response = handleValidationError(error)
      expect(response).toBeDefined()

      const json = await response!.json()
      expect(json.error.message).toContain('user.profile.name')
    }
  })

  test('should handle custom validation error with "Invalid field" message', async () => {
    const error = new Error('Invalid field: priority must be between 1 and 3')

    const response = handleValidationError(error)
    expect(response).toBeDefined()

    const json = await response!.json()
    expect(json.metaData.responseCode).toBe(400)
    expect(json.error.message).toContain('Validation error')
    expect(json.error.message).toContain('Invalid field')
  })

  test('should handle custom validation error with "must be" message', async () => {
    const error = new Error('Priority must be between 1 and 3')

    const response = handleValidationError(error)
    expect(response).toBeDefined()

    const json = await response!.json()
    expect(json.error.message).toContain('must be')
  })

  test('should handle custom validation error with "is required" message', async () => {
    const error = new Error('Name is required')

    const response = handleValidationError(error)
    expect(response).toBeDefined()

    const json = await response!.json()
    expect(json.error.message).toContain('is required')
  })

  test('should handle custom validation error with "Invalid task status" message', async () => {
    const error = new Error('Invalid task status: must be one of todo, in_progress, completed')

    const response = handleValidationError(error)
    expect(response).toBeDefined()

    const json = await response!.json()
    expect(json.error.message).toContain('Invalid task status')
  })

  test('should return undefined for non-validation errors', () => {
    const error = new Error('Database connection failed')

    const response = handleValidationError(error)
    expect(response).toBeUndefined()
  })

  test('should return undefined for generic errors', () => {
    const error = new Error('Something went wrong')

    const response = handleValidationError(error)
    expect(response).toBeUndefined()
  })

  test('should return undefined for null error', () => {
    const response = handleValidationError(null)
    expect(response).toBeUndefined()
  })

  test('should return undefined for undefined error', () => {
    const response = handleValidationError(undefined)
    expect(response).toBeUndefined()
  })

  test('should set correct status code for validation errors', async () => {
    const schema = z.object({ name: z.string() })

    try {
      schema.parse({ name: 123 })
    } catch (error) {
      const response = handleValidationError(error)
      expect(response?.status).toBe(400)
    }
  })

  test('should return JSON response with correct structure', async () => {
    const schema = z.object({ name: z.string() })

    try {
      schema.parse({})
    } catch (error) {
      const response = handleValidationError(error)
      const json = await response!.json()

      expect(json).toHaveProperty('data')
      expect(json).toHaveProperty('metaData')
      expect(json).toHaveProperty('error')
      expect(json.data).toBeNull()
      expect(json.metaData.status).toBe(StatusCode.INTERNAL_SERVER_ERROR)
    }
  })
})
