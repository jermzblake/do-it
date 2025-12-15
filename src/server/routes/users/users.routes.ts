import * as UsersController from '../../controllers/users/users.controller.ts'
import { withProblemDetails } from '../../middleware/problem-details.ts'
import { withCorrelation } from '../../middleware/correlation'

export const usersRoutes = {
  '/api/users': {
    POST: withCorrelation(
      withProblemDetails(async (req: Bun.BunRequest) => {
        return UsersController.createUser(req)
      }),
    ),
  },
}

export const meRoutes = {
  '/api/users/me': {
    GET: withCorrelation(
      withProblemDetails(async (req: Bun.BunRequest) => {
        return UsersController.getMe(req)
      }),
    ),
  },
}
