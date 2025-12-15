import { describe, test, expect } from 'bun:test'
import { insertTaskSchema, updateTaskSchema } from '../../validators/task.validator'

// Use a valid UUID for testing
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

describe('insertTaskSchema', () => {
  test('should validate valid task data', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test Task',
      description: 'Test description',
      priority: 2,
      effort: 3,
      status: 'todo' as const,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should require name field', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find((issue) => issue.path.includes('name'))
      expect(nameError).toBeDefined()
    }
  })

  test('should reject empty name', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: '',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Task name is required')
    }
  })

  test('should reject name longer than 512 characters', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'a'.repeat(513),
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Task name must be 512 characters or less')
    }
  })

  test('should accept name with exactly 512 characters', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'a'.repeat(512),
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should reject priority less than 1', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 0,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Priority must be at least 1')
    }
  })

  test('should reject priority greater than 3', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 4,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Priority must be at most 3')
    }
  })

  test('should accept priority values 1, 2, and 3', () => {
    for (const priority of [1, 2, 3]) {
      const validTask = {
        userId: TEST_USER_ID,
        name: 'Test',
        priority,
        effort: 3,
      }

      const result = insertTaskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    }
  })

  test('should reject effort less than 1', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 0,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Effort must be at least 1')
    }
  })

  test('should reject effort greater than 5', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 6,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Effort must be at most 5')
    }
  })

  test('should accept effort values 1-5', () => {
    for (const effort of [1, 2, 3, 4, 5]) {
      const validTask = {
        userId: TEST_USER_ID,
        name: 'Test',
        priority: 2,
        effort,
      }

      const result = insertTaskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    }
  })

  test('should reject invalid status enum', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
      status: 'invalid_status',
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })

  test('should accept all valid status enums', () => {
    const validStatuses = ['todo', 'in_progress', 'completed', 'blocked', 'cancelled'] as const

    for (const status of validStatuses) {
      const validTask = {
        userId: TEST_USER_ID,
        name: 'Test',
        priority: 2,
        effort: 3,
        status,
      }

      const result = insertTaskSchema.safeParse(validTask)
      expect(result.success).toBe(true)
    }
  })

  test('should make description optional', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should make notes optional', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should make status optional', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should make blockedReason optional', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should coerce string dates to Date objects', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
      dueDate: '2025-12-31',
      startedAt: '2025-11-20T10:00:00Z',
      completedAt: '2025-11-21T15:30:00Z',
      startBy: '2025-12-01T09:00:00Z',
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
      expect(result.data.startedAt).toBeInstanceOf(Date)
      expect(result.data.completedAt).toBeInstanceOf(Date)
      expect(result.data.startBy).toBeInstanceOf(Date)
    }
  })

  test('should accept Date objects for date fields', () => {
    const validTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3,
      dueDate: new Date('2025-12-31'),
    }

    const result = insertTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  test('should reject non-integer priority', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2.5,
      effort: 3,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })

  test('should reject non-integer effort', () => {
    const invalidTask = {
      userId: TEST_USER_ID,
      name: 'Test',
      priority: 2,
      effort: 3.7,
    }

    const result = insertTaskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })
})

describe('updateTaskSchema', () => {
  test('should allow partial updates', () => {
    const partialUpdate = {
      name: 'Updated name',
    }

    const result = updateTaskSchema.safeParse(partialUpdate)
    expect(result.success).toBe(true)
  })

  test('should allow updating priority only', () => {
    const partialUpdate = {
      priority: 1,
    }

    const result = updateTaskSchema.safeParse(partialUpdate)
    expect(result.success).toBe(true)
  })

  test('should allow updating multiple fields', () => {
    const partialUpdate = {
      name: 'Updated',
      priority: 3,
      effort: 5,
      status: 'in_progress' as const,
    }

    const result = updateTaskSchema.safeParse(partialUpdate)
    expect(result.success).toBe(true)
  })

  test('should omit userId field', () => {
    const updateWithUserId = {
      userId: 'new-user-id',
      name: 'Updated',
    }

    const result = updateTaskSchema.safeParse(updateWithUserId)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('userId')
    }
  })

  test('should omit id field', () => {
    const updateWithId = {
      id: 'new-id',
      name: 'Updated',
    }

    const result = updateTaskSchema.safeParse(updateWithId)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('id')
    }
  })

  test('should validate priority constraints in updates', () => {
    const invalidUpdate = {
      priority: 10,
    }

    const result = updateTaskSchema.safeParse(invalidUpdate)
    expect(result.success).toBe(false)
  })

  test('should validate effort constraints in updates', () => {
    const invalidUpdate = {
      effort: 0,
    }

    const result = updateTaskSchema.safeParse(invalidUpdate)
    expect(result.success).toBe(false)
  })

  test('should validate name length in updates', () => {
    const invalidUpdate = {
      name: 'a'.repeat(513),
    }

    const result = updateTaskSchema.safeParse(invalidUpdate)
    expect(result.success).toBe(false)
  })

  test('should coerce date strings in updates', () => {
    const validUpdate = {
      dueDate: '2025-12-31',
      startBy: '2025-12-01T09:00:00Z',
    }

    const result = updateTaskSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
      expect(result.data.startBy).toBeInstanceOf(Date)
    }
  })

  test('should accept empty object (no updates)', () => {
    const result = updateTaskSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('should validate status enum in updates', () => {
    const invalidUpdate = {
      status: 'invalid',
    }

    const result = updateTaskSchema.safeParse(invalidUpdate)
    expect(result.success).toBe(false)
  })

  test('should allow updating blockedReason', () => {
    const validUpdate = {
      status: 'blocked' as const,
      blockedReason: 'Waiting for API access',
    }

    const result = updateTaskSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
  })

  test('should allow clearing optional fields', () => {
    const validUpdate = {
      description: undefined,
      notes: undefined,
      blockedReason: undefined,
    }

    const result = updateTaskSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
  })
})
