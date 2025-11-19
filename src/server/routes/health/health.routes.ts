import { db } from '../../db/db'
import { sql } from 'drizzle-orm'

export const healthRoutes = {
  '/healthz': {
    GET: () =>
      Response.json({
        status: 'ok',
        uptimeSeconds: process.uptime(),
        timestamp: new Date().toISOString(),
        commit: process.env.COMMIT_SHA ?? null,
        nodeEnv: process.env.NODE_ENV,
      }),
  },

  '/readyz': {
    GET: async () => {
      const start = performance.now()
      try {
        // Execute a minimal query to verify DB connectivity
        await db.execute(sql`SELECT 1`)

        const durationMs = Math.round(performance.now() - start)
        return Response.json({
          status: 'ready',
          db: true,
          durationMs,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        const durationMs = Math.round(performance.now() - start)
        return Response.json(
          {
            status: 'degraded',
            db: false,
            error: (err as Error).message,
            durationMs,
            timestamp: new Date().toISOString(),
          },
          { status: 503 },
        )
      }
    },
  },
}
