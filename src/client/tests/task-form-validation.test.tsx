import { describe, it, expect } from 'bun:test'
import { TaskFormSchema } from '@/client/types/form.types'

describe('TaskForm validation (business rules)', () => {
  it('requires blockedReason when status is blocked', () => {
    const result = TaskFormSchema.safeParse({
      name: 'Test Task',
      description: '',
      status: 'blocked',
      priority: 2,
      effort: 3,
      blockedReason: '', // Empty - should fail
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const blockedReasonError = result.error.issues.find((issue) => issue.path[0] === 'blockedReason')
      expect(blockedReasonError).toBeTruthy()
      expect(blockedReasonError?.message).toContain('required')
    }
  })

  it('allows empty blockedReason when status is not blocked', () => {
    const result = TaskFormSchema.safeParse({
      name: 'Test Task',
      description: '',
      status: 'todo',
      priority: 2,
      effort: 3,
      blockedReason: '', // Empty but status is todo - should pass
    })

    expect(result.success).toBe(true)
  })

  it('enforces name min length of 3 characters', () => {
    const result = TaskFormSchema.safeParse({
      name: 'ab', // Too short
      description: '',
      status: 'todo',
      priority: 2,
      effort: 3,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find((issue) => issue.path[0] === 'name')
      expect(nameError).toBeTruthy()
    }
  })

  it('enforces name max length of 512 characters', () => {
    const result = TaskFormSchema.safeParse({
      name: 'a'.repeat(513), // Too long
      description: '',
      status: 'todo',
      priority: 2,
      effort: 3,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find((issue) => issue.path[0] === 'name')
      expect(nameError).toBeTruthy()
    }
  })
})
