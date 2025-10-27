import { createResponse, createErrorResponse, ResponseMessage, StatusCode, ResponseCode } from '../../utils/response.ts'
import * as TasksService from '../../services/tasks/tasks.service.ts'

export const createTask = async (req: Request): Promise<Response> => {
  try {
    const taskData = await req.json()
    const newTask = await TasksService.createTask(taskData)
    const response = createResponse(newTask, ResponseMessage.CREATED, StatusCode.CREATED, ResponseCode.CREATED)
    return Response.json(response, { status: 201 })
  } catch (error: any) {
    const response = createErrorResponse('Failed to create task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const updateTaskById = async (req: Request): Promise<Response> => {
  console.log('Update task request received:', req.url)
  //TODO introduce middleware to parse URL params (elysia)?
  const url = new URL(req.url)
  // example pathname: /api/tasks/123
  const match = url.pathname.match(/\/api\/tasks\/([^\/]+)$/)
  const taskId = match ? match[1] : ''

  if (!taskId) {
    const response = createErrorResponse('Missing task id in URL', 400)
    return Response.json(response, { status: 400 })
  }

  try {
    const taskData = await req.json()
    const updatedTask = await TasksService.updateTaskById(taskId, taskData)
    const response = createResponse(updatedTask, ResponseMessage.SUCCESS, StatusCode.SUCCESS, ResponseCode.SUCCESS)
    return Response.json(response, { status: 200 })
  } catch (error: any) {
    const response = createErrorResponse('Failed to update task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const deleteTaskById = async (req: Request): Promise<Response> => {
  //TODO introduce middleware to parse URL params (elysia)?
  const url = new URL(req.url)
  // example pathname: /api/tasks/123
  const match = url.pathname.match(/\/api\/tasks\/([^\/]+)$/)
  const taskId = match ? match[1] : ''

  if (!taskId) {
    const response = createErrorResponse('Missing task id in URL', 400)
    return Response.json(response, { status: 400 })
  }

  try {
    await TasksService.deleteTaskById(taskId)
    const response = createResponse(null, ResponseMessage.SUCCESS, StatusCode.SUCCESS, ResponseCode.NO_CONTENT)
    return Response.json(response, { status: 204 })
  } catch (error: any) {
    const response = createErrorResponse('Failed to delete task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const getTaskById = async (req: Request): Promise<Response> => {
  //TODO introduce middleware to parse URL params (elysia)?
  const url = new URL(req.url)
  // example pathname: /api/tasks/123
  const match = url.pathname.match(/\/api\/tasks\/([^\/]+)$/)
  const taskId = match ? match[1] : ''

  if (!taskId) {
    const response = createErrorResponse('Missing task id in URL', 400)
    return Response.json(response, { status: 400 })
  }

  try {
    const task = await TasksService.getTaskById(taskId)
    const response = createResponse(task, ResponseMessage.SUCCESS, StatusCode.SUCCESS, ResponseCode.SUCCESS)
    return Response.json(response, { status: 200 })
  } catch (error: any) {
    const response = createErrorResponse('Failed to get task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const getTasksByStatus = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId') || ''
  const isDoneParam = url.searchParams.get('isDone')
  const pageParam = url.searchParams.get('page')
  const pageSizeParam = url.searchParams.get('pageSize')

  if (!userId || isDoneParam === null) {
    const response = createErrorResponse('Missing required query parameters: userId and isDone', 400)
    return Response.json(response, { status: 400 })
  }

  const isDone = isDoneParam.toLowerCase() === 'true'
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10
  const params = { page, pageSize }

  try {
    const result = await TasksService.getTasksByStatus(userId, isDone, params)
    const { data, ...pagination } = result
    const response = createResponse(data, ResponseMessage.SUCCESS, StatusCode.SUCCESS, ResponseCode.SUCCESS, pagination)
    return Response.json(response, { status: 200 })
  } catch (error: any) {
    const response = createErrorResponse('Failed to retrieve tasks: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}
