import * as AuthController from '../../controllers/auth/auth.controller.ts'
import { withProblemDetails } from '../../middleware/problem-details.ts'
import { withCorrelation } from '../../middleware/correlation'

export const authRoutes = {
  '/api/auth/google': {
    GET: withCorrelation(
      withProblemDetails(async () => {
        return AuthController.handleAuthStart()
      }),
    ),
  },

  '/api/auth/callback': {
    GET: withCorrelation(
      withProblemDetails(async (req: Bun.BunRequest) => {
        return AuthController.handleAuthCallback(req)
      }),
    ),
  },

  '/api/auth/logout': {
    GET: withCorrelation(
      withProblemDetails(async (req: Bun.BunRequest) => {
        return AuthController.handleLogout(req)
      }),
    ),
  },
  '/api/auth/me': {
    GET: withCorrelation(
      withProblemDetails(async (req: Bun.BunRequest) => {
        return AuthController.handleAuthStatus(req)
      }),
    ),
  },
}
