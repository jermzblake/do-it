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
    GET: async (req: Request) => {
      return AuthController.handleAuthCallback(req)
    },
  },
}
