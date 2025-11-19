import 'dotenv/config'
import { serve } from 'bun'
import { usersRoutes } from './routes/users/users.routes'
import { authRoutes } from './routes/auth/auth.routes'
import { tasksRoutes } from './routes/tasks/tasks.routes'
import { healthRoutes } from './routes/health/health.routes'

const isDevEnvironment = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT || 3000)

// Import the correct HTML file based on environment
let indexHtml
try {
  const htmlPath = isDevEnvironment ? '../index.html' : '../../dist/index.html'
  console.log(`Attempting to load HTML from: ${htmlPath}`)
  indexHtml = await import(htmlPath)
  console.log('HTML file loaded successfully')
} catch (error) {
  console.error('Failed to load HTML file:', error)
  process.exit(1)
}

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

// Explicitly keep the event loop alive
const keepAlive = setInterval(() => {
  // Empty interval to keep process running
}, 1 << 30)

// Prevent the process from exiting - keep event loop alive
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...')
  server.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  server.stop()
  process.exit(0)
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  clearInterval(keepAlive)
  server.stop()
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  clearInterval(keepAlive)
  server.stop()
  process.exit(1)
})
