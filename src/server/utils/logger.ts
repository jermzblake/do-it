import pino from 'pino'
import { getCorrelation } from './request-context'

// Base logger instance
const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

/**
 * Creates a logger instance that automatically injects correlation IDs
 * (requestId, traceId) from the request context into all log entries.
 *
 * Usage in controllers/services:
 *   const logger = createLogger(req)
 *   logger.info('Processing task', { taskId: '123' })
 *   Output includes: { requestId: '...', traceId: '...', taskId: '123', ... }
 */
export const createLogger = (req?: Bun.BunRequest) => {
  if (!req) {
    return baseLogger
  }

  const correlationIds = getCorrelation(req)
  if (!correlationIds) {
    return baseLogger
  }

  // Return a child logger with correlation IDs bound
  return baseLogger.child({
    requestId: correlationIds.requestId,
    traceId: correlationIds.traceId,
  })
}

/**
 * Default logger instance without correlation context.
 * Use this for startup, shutdown, or non-request related logs.
 */
export const logger = baseLogger
