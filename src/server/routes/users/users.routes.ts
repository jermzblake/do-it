import * as UsersController from '../../controllers/users/users.controller.ts'

export const usersRoutes = {
  '/api/users': {
    async POST(req: Request) {
      return UsersController.createUser(req)
    },
  },
}
