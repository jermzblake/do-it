/**
 * Request context for storing correlation IDs per request.
 * Uses WeakMap keyed by Request object to avoid memory leaks.
 */

interface CorrelationIds {
  requestId: string
  traceId: string
}

const contextMap = new WeakMap<Request, CorrelationIds>()

export const setCorrelation = (req: Request, ids: CorrelationIds): void => {
  contextMap.set(req, ids)
}

export const getCorrelation = (req: Request): CorrelationIds | undefined => {
  return contextMap.get(req)
}
