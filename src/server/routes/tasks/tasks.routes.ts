import * as TasksController from '../../controllers/tasks/tasks.controller'

export const tasksRoutes = {
  '/api/tasks': {
    async POST(req: Bun.BunRequest) {
      return TasksController.createTask(req)
    },
    async GET(req: Bun.BunRequest) {
      return TasksController.getTasks(req)
    },
  },
  '/api/tasks/:id': {
    async GET(req: Bun.BunRequest) {
      return TasksController.getTaskById(req)
    },
    async PUT(req: Bun.BunRequest) {
      return TasksController.updateTaskById(req)
    },
    async DELETE(req: Bun.BunRequest) {
      return TasksController.deleteTaskById(req)
    },
  },
}
