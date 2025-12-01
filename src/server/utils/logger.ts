import pino from 'pino'
import { getCorrelation } from './request-context'

// Redaction list to avoid logging PII / secrets.
// Fields are dot-paths; wildcard * supported.
const REDACT_PATHS = ['user.email', 'user.name', 'user.ssoId', 'sessionToken', 'headers.authorization', 'cookie']

// Base logger instance
const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
    remove: false,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
})

/**
 * createLogger
 * - Without `req`: returns the base application logger.
 * - With `req`: returns a child logger bound to correlation IDs (requestId, traceId)
 *   extracted from the request context, automatically injected into all log entries.
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
