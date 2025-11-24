import { RateLimitExceededError } from '../errors/RateLimitExceededError'
import * as TasksRepository from '../repositories/tasks/tasks.repository'
import * as UsersRepository from '../repositories/users/users.repository'

const getWhitelist = (): ReadonlySet<string> => {
  const rawList = (process.env.TASK_CREATION_WHITELIST || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return new Set(rawList)
}

const getLimit = (): number => {
  const parsedLimit = parseInt(process.env.TASK_CREATION_LIMIT || '100', 10)
  return Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 100
}

interface RateLimitContext {
  userId: string
}

// Week calculation (ISO week start Monday 00:00:00 UTC -> Sunday 23:59:59.999 UTC)
const getCurrentWeekWindow = (): { start: Date; end: Date } => {
  const now = new Date()
  // Get day index (Sun=0 ... Sat=6). We want Monday start.
  const day = now.getUTCDay() // 0-6
  // Calculate days since Monday: (day + 6) % 7 converts Sunday(0)->6, Monday(1)->0, etc.
  const daysSinceMonday = (day + 6) % 7
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * Enforces the per-user task creation limit unless the user is whitelisted by email.
 * Throws RateLimitExceededError when limit exceeded.
 */
let overrides: {
  getUserById?: (id: string) => Promise<{ id: string; email: string; name: string } | null>
  countTasksCreatedByUserBetween?: (userId: string, start: Date, end: Date) => Promise<number>
} = {}

// Test helper (not documented externally)
export const setRateLimitTestOverrides = (o: typeof overrides) => {
  overrides = o
}

// Production safety guard: if overrides are set in production, emit a warning.
// This helps catch accidental leakage of test override configuration.
export const assertNoOverridesInProduction = () => {
  if (process.env.NODE_ENV === 'production' && Object.values(overrides).some((fn) => typeof fn === 'function')) {
    console.warn('[rate-limit] Overrides detected in production environment. This should not happen.')
  }
}

export const enforceTaskCreationLimit = async ({ userId }: RateLimitContext): Promise<void> => {
  const getUserById = overrides.getUserById || UsersRepository.getUserById
  const countFn = overrides.countTasksCreatedByUserBetween || TasksRepository.countTasksCreatedByUserBetween

  const user = await getUserById(userId)
  if (!user) throw new Error('User not found for rate limit evaluation')

  const email = user.email?.toLowerCase()
  const whitelist = getWhitelist()
  if (email && whitelist.has(email)) return

  const { start, end } = getCurrentWeekWindow()
  const tasksCreatedThisWeek = await countFn(userId, start, end)
  const limit = getLimit()
  if (tasksCreatedThisWeek >= limit) {
    throw new RateLimitExceededError(
      `Weekly task creation limit reached (${limit}). You created ${tasksCreatedThisWeek} tasks this week. Contact an administrator to request a higher limit.`,
    )
  }
}
