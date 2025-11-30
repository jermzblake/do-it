import * as UsersController from '../../controllers/users/users.controller.ts'
import { withProblemDetails } from '../../middleware/problem-details.ts'

export const usersRoutes = {
  '/api/users': {
    POST: withProblemDetails(async (req: Bun.BunRequest) => {
      return UsersController.createUser(req)
    }),
  },
}

export const meRoutes = {
  '/api/users/me': {
    GET: withProblemDetails(async (req: Bun.BunRequest) => {
      return UsersController.getMe(req)
    }),
  },
}
