import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { enforceTaskCreationLimit, setRateLimitTestOverrides } from '../../utils/task-rate-limit'
import { RateLimitExceededError } from '../../errors/RateLimitExceededError'

describe('task creation rate limiter', () => {
  beforeEach(() => {
    process.env.TASK_CREATION_WHITELIST = 'whitelisted@example.com'
    process.env.TASK_CREATION_LIMIT = '5'
  })

  afterEach(() => {
    // Reset overrides to avoid leakage between tests
    setRateLimitTestOverrides({})
  })

  test('allows whitelisted user regardless of weekly count', async () => {
    setRateLimitTestOverrides({
      getUserById: async () => ({ id: 'u1', email: 'whitelisted@example.com', name: 'W' }),
      countTasksCreatedByUserBetween: async () => 999,
    })
    await expect(enforceTaskCreationLimit({ userId: 'u1' })).resolves.toBeUndefined()
  })

  test('allows non-whitelisted user below weekly limit', async () => {
    setRateLimitTestOverrides({
      getUserById: async () => ({ id: 'u2', email: 'regular@example.com', name: 'R' }),
      countTasksCreatedByUserBetween: async () => 4,
    })
    await expect(enforceTaskCreationLimit({ userId: 'u2' })).resolves.toBeUndefined()
  })

  test('blocks non-whitelisted user at weekly limit', async () => {
    setRateLimitTestOverrides({
      getUserById: async () => ({ id: 'u3', email: 'regular2@example.com', name: 'R2' }),
      countTasksCreatedByUserBetween: async () => 5,
    })
    await expect(enforceTaskCreationLimit({ userId: 'u3' })).rejects.toBeInstanceOf(RateLimitExceededError)
  })
})
