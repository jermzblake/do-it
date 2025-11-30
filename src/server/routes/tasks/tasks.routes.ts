import * as TasksController from '../../controllers/tasks/tasks.controller'
import { withProblemDetails } from '../../middleware/problem-details'

export const tasksRoutes = {
  '/api/tasks': {
    POST: withProblemDetails(TasksController.createTask),
    GET: withProblemDetails(TasksController.getTasks),
  },
  '/api/tasks/:id': {
    GET: withProblemDetails(TasksController.getTaskById),
    PUT: withProblemDetails(TasksController.updateTaskById),
    DELETE: withProblemDetails(TasksController.deleteTaskById),
  },
}
