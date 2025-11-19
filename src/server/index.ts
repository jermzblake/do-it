import 'dotenv/config'
import { serve } from 'bun'
import { usersRoutes } from './routes/users/users.routes.ts'
import { authRoutes } from './routes/auth/auth.routes.ts'
import { tasksRoutes } from './routes/tasks/tasks.routes.ts'

const isDevEnvironment = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT || 3000)

// Import the correct HTML file based on environment
const indexHtml = isDevEnvironment ? await import('../index.html') : await import('../../dist/index.html')

const server = serve({
  port: PORT,
  routes: {
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
