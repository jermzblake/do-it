import { randomUUID } from 'crypto'
import * as AuthController from '../../controllers/auth/auth.controller.ts'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'

export const authRoutes = {
  '/api/auth/google': {
    GET: async () => {
      return AuthController.handleAuthStart()
    },
  },

  '/api/auth/callback': {
    GET: async (req: Bun.BunRequest) => {
      return AuthController.handleAuthCallback(req)
    },
  },

  '/api/auth/logout': {
    GET: async (req: Bun.BunRequest) => {
      return AuthController.handleLogout(req)
    },
  },
  '/api/auth/me': {
    GET: async (req: Bun.BunRequest) => {
      return AuthController.handleAuthStatus(req)
    },
  },
}
