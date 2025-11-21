export const routes = {
  landing: '/',
  dashboard: '/dashboard',
  taskDetails: (taskId: string) => `/tasks/${taskId}`,
  taskDetailsPattern: '/tasks/$taskId',
  createTask: '/tasks/create',
} as const
