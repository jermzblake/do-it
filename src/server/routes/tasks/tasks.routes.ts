import * as TasksController from '../../controllers/tasks/tasks.controller'

export const tasksRoutes = {
  '/api/tasks': {
    async POST(req: Request) {
      return TasksController.createTask(req)
    },
  },
  '/api/tasks/status': {
    async GET(req: Request) {
      return TasksController.getTasksByStatus(req)
    },
  },
  '/api/tasks/:id': {
    async GET(req: Request) {
      return TasksController.getTaskById(req)
    },
    async PUT(req: Request) {
      return TasksController.updateTaskById(req)
    },
    async DELETE(req: Request) {
      return TasksController.deleteTaskById(req)
    },
  },
}
