import * as AuthController from '../../controllers/auth/auth.controller.ts'

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
