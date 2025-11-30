import { demoProblemHandler } from '../../middleware/problem-details'

export const demoRoutes = {
  '/api/problem-demo': {
    GET: demoProblemHandler,
  },
}
