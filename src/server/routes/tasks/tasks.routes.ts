import * as TasksController from '../../controllers/tasks/tasks.controller'
import { withProblemDetails } from '../../middleware/problem-details'
import { withCorrelation } from '../../middleware/correlation'

export const tasksRoutes = {
  '/api/tasks': {
    POST: withCorrelation(withProblemDetails(TasksController.createTask)),
    GET: withCorrelation(withProblemDetails(TasksController.getTasks)),
  },
  '/api/tasks/:id': {
    GET: withCorrelation(withProblemDetails(TasksController.getTaskById)),
    PUT: withCorrelation(withProblemDetails(TasksController.updateTaskById)),
    DELETE: withCorrelation(withProblemDetails(TasksController.deleteTaskById)),
  },
}
