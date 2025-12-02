import { setCorrelation } from '../utils/request-context'
import { randomUUID } from 'crypto'
import { logger } from '../utils/logger'

type Handler = (req: Bun.BunRequest) => Promise<Response> | Response

/**
 * Middleware that extracts or generates correlation IDs (requestId, traceId)
 * and attaches them to the request context and response headers.
 *
 * Headers read (incoming):
 * - X-Request-ID → requestId
 * - traceparent (W3C Trace Context) or X-Trace-ID → traceId
 *
 * Headers set (outgoing):
 * - X-Request-ID
 * - X-Trace-ID
 */
export const withCorrelation = (handler: Handler) => {
  return async (req: Bun.BunRequest): Promise<Response> => {
    const incomingRequestId = req.headers.get('X-Request-ID') || req.headers.get('x-request-id')
    const requestId = incomingRequestId || randomUUID()

    // Prefer W3C traceparent format: "00-<trace-id>-<span-id>-<flags>"
    const traceparent = req.headers.get('traceparent')
    let traceId: string
    if (traceparent) {
      const parts = traceparent.split('-')
      // Extract trace-id (32 hex chars) from traceparent
      traceId = parts[1] || randomUUID().replace(/-/g, '')
    } else {
      const incomingTraceId = req.headers.get('X-Trace-ID') || req.headers.get('x-trace-id')
      traceId = incomingTraceId || randomUUID().replace(/-/g, '')
    }

    setCorrelation(req, { requestId, traceId })
    if (logger.isLevelEnabled('debug')) {
      logger.debug({ method: req.method, url: req.url, requestId, traceId }, 'request:start')
    }

    const response = await handler(req)

    response.headers.set('X-Request-ID', requestId)
    response.headers.set('X-Trace-ID', traceId)

    if (logger.isLevelEnabled('debug')) {
      logger.debug({ status: response.status, requestId, traceId }, 'request:end')
    }

    return response
  }
}
