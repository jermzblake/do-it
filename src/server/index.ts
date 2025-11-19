import 'dotenv/config'
import { serve } from 'bun'
import { usersRoutes } from './routes/users/users.routes'
import { authRoutes } from './routes/auth/auth.routes'
import { tasksRoutes } from './routes/tasks/tasks.routes'
import { healthRoutes } from './routes/health/health.routes'

const isDevEnvironment = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT || 3000)

// Import the correct HTML file based on environment
const indexHtml = isDevEnvironment ? await import('../index.html') : await import('../../dist/index.html')

const server = serve({
  port: PORT,
  hostname: '0.0.0.0', //  In Docker/Fly.io, you must listen on 0.0.0.0 to accept external connections
  routes: {
    ...healthRoutes,
    // Serve index.html for all unmatched routes.
    '/*': indexHtml.default,

    // Register API routes
    ...authRoutes,
    ...usersRoutes,
    ...tasksRoutes,

    //fallback route
    '/api/*': () => {
      return new Response(
        JSON.stringify({
          message: 'API route not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    },
  },

  development: isDevEnvironment && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
