// this file could be used as small bootstrap for server related code
// will need to point bun here in package.json if we want to use it

import 'dotenv/config'
import { serve } from 'bun'
import index from '../index.html'
import { usersRoutes } from './routes/users/users.routes.ts'
import { authRoutes } from './routes/auth/auth.routes.ts'
import { tasksRoutes } from './routes/tasks/tasks.routes.ts'

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

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

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
