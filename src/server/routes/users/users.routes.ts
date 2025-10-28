import * as UsersController from '../../controllers/users/users.controller.ts'

export const usersRoutes = {
  '/api/users': {
    async POST(req: Bun.BunRequest) {
      return UsersController.createUser(req)
    },
  },
}

export const meRoutes = {
  '/api/users/me': {
    async GET(req: Bun.BunRequest) {
      return UsersController.getMe(req)
    },
  },
}
