import 'dotenv/config'
import { serve } from 'bun'
import index from './index.html'
import { usersRoutes } from './server/routes/users/users.routes.ts'
import { authRoutes } from './server/routes/auth/auth.routes.ts'

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    // Register API routes
    ...authRoutes,
    ...usersRoutes,
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
