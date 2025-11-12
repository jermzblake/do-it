import {
  createResponse,
  createErrorResponse,
  ResponseMessage,
  StatusCode,
  ResponseCode,
  type PagingParams,
} from '../../utils/response.ts'
import * as TasksService from '../../services/tasks/tasks.service.ts'
import type { TaskStatus } from '../../db/schema'
import { TaskStatus as TaskStatusEnum } from '../../db/schema'
import { getUserFromSessionCookie } from '../../utils/session.cookies.ts'
import { z } from 'zod'
import { handleValidationError } from '../../utils/validation-error-handler.ts'

export const createTask = async (req: Bun.BunRequest): Promise<Response> => {
  try {
    const userId = await getUserFromSessionCookie(req)
    const taskData = await req.json()
    taskData.userId = userId
    const newTask = await TasksService.createTask(taskData)
    const response = createResponse(newTask, ResponseMessage.CREATED, StatusCode.CREATED, ResponseCode.CREATED)
    return Response.json(response, { status: 201 })
  } catch (error: any) {
    const validation = handleValidationError(error)
    if (validation) return validation

    const response = createErrorResponse('Failed to create task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const updateTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const { id: taskId } = req.params

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
    const validation = handleValidationError(error)
    if (validation) return validation

    const response = createErrorResponse('Failed to update task: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}

export const deleteTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const { id: taskId } = req.params

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

export const getTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const { id: taskId } = req.params

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

export const getTasks = async (req: Bun.BunRequest): Promise<Response> => {
  const url = new URL(req.url)
  const userId = await getUserFromSessionCookie(req)
  const statusParam = url.searchParams.get('status')
  const pageParam = url.searchParams.get('page')
  const pageSizeParam = url.searchParams.get('pageSize')

  if (!userId) {
    const response = createErrorResponse('Missing required query parameters: userId', 400)
    return Response.json(response, { status: 400 })
  }

  let params: PagingParams | undefined =
    pageParam && pageSizeParam
      ? {
          page: parseInt(pageParam, 10),
          pageSize: parseInt(pageSizeParam, 10),
        }
      : undefined

  try {
    if (statusParam) {
      if (!(Object.values(TaskStatusEnum) as TaskStatus[]).includes(statusParam as TaskStatus)) {
        const validValues = Object.values(TaskStatusEnum).join(', ')
        const response = createErrorResponse('Invalid status value. Allowed values are: ' + validValues, 400)
        return Response.json(response, { status: 400 })
      }
      if (params === undefined) {
        params = { page: 1, pageSize: 10 }
      }
      const status = statusParam as TaskStatus
      const result = await TasksService.getTasksByStatus(userId, status, params)
      const { data, ...pagination } = result
      const response = createResponse(
        data,
        ResponseMessage.SUCCESS,
        StatusCode.SUCCESS,
        ResponseCode.SUCCESS,
        pagination,
      )
      return Response.json(response, { status: 200 })
    } else {
      const result = await TasksService.getAllTasksByUserId(userId, params)
      const response = createResponse(result, ResponseMessage.SUCCESS, StatusCode.SUCCESS, ResponseCode.SUCCESS)
      return Response.json(response, { status: 200 })
    }
  } catch (error: any) {
    const response = createErrorResponse('Failed to retrieve tasks: ' + error.message, 500)
    return Response.json(response, { status: 500 })
  }
}
