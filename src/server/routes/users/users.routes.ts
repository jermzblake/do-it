import * as UsersController from '../../controllers/users/users.controller.ts'

export const usersRoutes = {
  '/api/users': {
    async POST(req: Request) {
      return UsersController.createUser(req)
    },
  },
}

export const meRoutes = {
  '/api/users/me': {
    async GET(req: Request) {
      return UsersController.getMe(req)
    },
  },
}
