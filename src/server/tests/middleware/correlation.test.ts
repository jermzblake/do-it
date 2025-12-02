import { describe, test, expect } from 'bun:test'
import { withCorrelation } from '../../middleware/correlation'

describe('withCorrelation middleware', () => {
  test('generates requestId and traceId when not provided', async () => {
    const handler = withCorrelation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const req = new Request('http://localhost/api/test') as Bun.BunRequest
    const res = await handler(req)

    expect(res.headers.get('X-Request-ID')).toBeTruthy()
    expect(res.headers.get('X-Trace-ID')).toBeTruthy()
    expect(typeof res.headers.get('X-Request-ID')).toBe('string')
    expect(typeof res.headers.get('X-Trace-ID')).toBe('string')
  })

  test('preserves incoming X-Request-ID header', async () => {
    const incomingRequestId = 'test-request-123'
    const handler = withCorrelation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const req = new Request('http://localhost/api/test', {
      headers: { 'X-Request-ID': incomingRequestId },
    }) as Bun.BunRequest
    const res = await handler(req)

    expect(res.headers.get('X-Request-ID')).toBe(incomingRequestId)
  })

  test('extracts traceId from W3C traceparent header', async () => {
    const traceId = '0af7651916cd43dd8448eb211c80319c'
    const traceparent = `00-${traceId}-00f067aa0ba902b7-01`
    const handler = withCorrelation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const req = new Request('http://localhost/api/test', {
      headers: { traceparent },
    }) as Bun.BunRequest
    const res = await handler(req)

    expect(res.headers.get('X-Trace-ID')).toBe(traceId)
  })

  test('preserves incoming X-Trace-ID header when traceparent not present', async () => {
    const incomingTraceId = 'trace-xyz-789'
    const handler = withCorrelation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const req = new Request('http://localhost/api/test', {
      headers: { 'X-Trace-ID': incomingTraceId },
    }) as Bun.BunRequest
    const res = await handler(req)

    expect(res.headers.get('X-Trace-ID')).toBe(incomingTraceId)
  })

  test('sets both X-Request-ID and X-Trace-ID in response', async () => {
    const handler = withCorrelation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const req = new Request('http://localhost/api/test') as Bun.BunRequest
    const res = await handler(req)

    expect(res.headers.has('X-Request-ID')).toBe(true)
    expect(res.headers.has('X-Trace-ID')).toBe(true)
  })
})
