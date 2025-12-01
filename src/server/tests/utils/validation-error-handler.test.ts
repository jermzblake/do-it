import { describe, test, expect } from 'bun:test'
import { z } from 'zod'
import { extractValidationError } from '../../utils/validation-error-handler'

describe('extractValidationError', () => {
  test('should handle Zod validation error with single issue', () => {
    const schema = z.object({
      name: z.string().min(1),
    })

    try {
      schema.parse({ name: '' })
    } catch (error) {
      const result = extractValidationError(error)
      expect(result).toBeDefined()
      expect(result!.message).toContain('Validation error')
      expect(result!.message).toContain('name')
      expect(result!.formattedErrors).toContain('name')
      expect(result!.issues).toBeDefined()
      expect(result!.issues!.length).toBe(1)
      expect(result!.issues![0]?.path).toBe('name')
    }
  })

  test('should handle Zod validation error with multiple issues', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0),
    })

    try {
      schema.parse({ name: '', email: 'invalid', age: -5 })
    } catch (error) {
      const result = extractValidationError(error)
      expect(result).toBeDefined()
      expect(result!.message).toContain('name')
      expect(result!.message).toContain('email')
      expect(result!.message).toContain('age')
      expect(result!.issues).toBeDefined()
      expect(result!.issues!.length).toBe(3)
    }
  })

  test('should format Zod error with nested paths', () => {
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
      const result = extractValidationError(error)
      expect(result).toBeDefined()
      expect(result!.message).toContain('user.profile.name')
      expect(result!.issues).toBeDefined()
      expect(result!.issues![0]?.path).toBe('user.profile.name')
    }
  })

  test('should handle custom validation error with "Invalid field" message', () => {
    const error = new Error('Invalid field: priority must be between 1 and 3')

    const result = extractValidationError(error)
    expect(result).toBeDefined()
    expect(result!.message).toContain('Validation error')
    expect(result!.message).toContain('Invalid field')
    expect(result!.formattedErrors).toBe('Invalid field: priority must be between 1 and 3')
  })

  test('should handle custom validation error with "must be" message', () => {
    const error = new Error('Priority must be between 1 and 3')

    const result = extractValidationError(error)
    expect(result).toBeDefined()
    expect(result!.message).toContain('must be')
  })

  test('should handle custom validation error with "is required" message', () => {
    const error = new Error('Name is required')

    const result = extractValidationError(error)
    expect(result).toBeDefined()
    expect(result!.message).toContain('is required')
  })

  test('should handle custom validation error with "Invalid task status" message', () => {
    const error = new Error('Invalid task status: must be one of todo, in_progress, completed')

    const result = extractValidationError(error)
    expect(result).toBeDefined()
    expect(result!.message).toContain('Invalid task status')
  })

  test('should return undefined for non-validation errors', () => {
    const error = new Error('Database connection failed')

    const result = extractValidationError(error)
    expect(result).toBeUndefined()
  })

  test('should return undefined for generic errors', () => {
    const error = new Error('Something went wrong')

    const result = extractValidationError(error)
    expect(result).toBeUndefined()
  })

  test('should return undefined for null error', () => {
    const result = extractValidationError(null)
    expect(result).toBeUndefined()
  })

  test('should return undefined for undefined error', () => {
    const result = extractValidationError(undefined)
    expect(result).toBeUndefined()
  })

  test('should extract issues array for Zod errors', () => {
    const schema = z.object({ name: z.string() })

    try {
      schema.parse({ name: 123 })
    } catch (error) {
      const result = extractValidationError(error)
      expect(result).toBeDefined()
      expect(result!.issues).toBeDefined()
      expect(Array.isArray(result!.issues)).toBe(true)
      expect(result!.issues!.length).toBeGreaterThan(0)
    }
  })

  test('should return structured data with message and formattedErrors', () => {
    const schema = z.object({ name: z.string() })

    try {
      schema.parse({})
    } catch (error) {
      const result = extractValidationError(error)
      expect(result).toBeDefined()
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('formattedErrors')
      expect(result).toHaveProperty('issues')
      expect(typeof result!.message).toBe('string')
      expect(typeof result!.formattedErrors).toBe('string')
    }
  })

  test('should not include issues for custom validation errors', () => {
    const error = new Error('Name is required')

    const result = extractValidationError(error)
    expect(result).toBeDefined()
    expect(result!.issues).toBeUndefined()
    expect(result!.formattedErrors).toBe('Name is required')
  })
})
