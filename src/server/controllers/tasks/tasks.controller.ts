import { createResponse, ResponseMessage, StatusCode, ResponseCode } from '../../utils/response.ts'
import * as TasksService from '../../services/tasks/tasks.service.ts'
import type { TaskStatus } from '../../db/schema'
import { TaskStatus as TaskStatusEnum } from '../../db/schema'
import { getUserFromSessionCookie } from '../../utils/session.cookies.ts'
import { BadRequestError } from '../../errors/HttpError'
import { getCorrelation } from '../../utils/request-context'
import { createLogger } from '../../utils/logger'

export const createTask = async (req: Bun.BunRequest): Promise<Response> => {
  const log = createLogger(req)
  const userId = await getUserFromSessionCookie(req)
  const taskData = await req.json()
  taskData.userId = userId
  const newTask = await TasksService.createTask(taskData)
  const correlationIds = getCorrelation(req)
  log.info({ userId }, 'task:create completed')
  const response = createResponse(
    newTask,
    ResponseMessage.CREATED,
    StatusCode.CREATED,
    ResponseCode.CREATED,
    undefined,
    correlationIds?.requestId,
    correlationIds?.traceId,
  )
  return Response.json(response, { status: 201 })
}

export const updateTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const log = createLogger(req)
  const { id: taskId } = req.params
  if (!taskId) {
    throw new BadRequestError('Missing task id in URL')
  }
  const taskData = await req.json()
  const updatedTask = await TasksService.updateTaskById(taskId, taskData)
  const correlationIds = getCorrelation(req)
  log.info({ taskId }, 'task:update completed')
  const response = createResponse(
    updatedTask,
    ResponseMessage.UPDATED,
    StatusCode.SUCCESS,
    ResponseCode.SUCCESS,
    undefined,
    correlationIds?.requestId,
    correlationIds?.traceId,
  )
  return Response.json(response, { status: 200 })
}

export const deleteTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const log = createLogger(req)
  const { id: taskId } = req.params
  if (!taskId) {
    throw new BadRequestError('Missing task id in URL')
  }
  await TasksService.deleteTaskById(taskId)
  const correlationIds = getCorrelation(req)
  log.info({ taskId }, 'task:delete completed')
  const response = createResponse(
    null,
    ResponseMessage.DELETED,
    StatusCode.SUCCESS,
    ResponseCode.NO_CONTENT,
    undefined,
    correlationIds?.requestId,
    correlationIds?.traceId,
  )
  return Response.json(response)
}

export const getTaskById = async (req: Bun.BunRequest<'/api/tasks/:id'>): Promise<Response> => {
  const log = createLogger(req)
  const { id: taskId } = req.params
  if (!taskId) {
    throw new BadRequestError('Missing task id in URL')
  }
  const task = await TasksService.getTaskById(taskId)
  const correlationIds = getCorrelation(req)
  log.info({ taskId }, 'task:getById completed')
  const response = createResponse(
    task,
    ResponseMessage.SUCCESS,
    StatusCode.SUCCESS,
    ResponseCode.SUCCESS,
    undefined,
    correlationIds?.requestId,
    correlationIds?.traceId,
  )
  return Response.json(response, { status: 200 })
}

export const getTasks = async (req: Bun.BunRequest): Promise<Response> => {
  const log = createLogger(req)
  const url = new URL(req.url)
  const userId = await getUserFromSessionCookie(req)
  const statusParam = url.searchParams.get('status')
  const pageParam = url.searchParams.get('page')
  const pageSizeParam = url.searchParams.get('pageSize')
  if (!userId) {
    throw new BadRequestError('Missing required query parameters: userId')
  }
  const pagination =
    pageParam && pageSizeParam
      ? {
          page: parseInt(pageParam, 10),
          pageSize: parseInt(pageSizeParam, 10),
        }
      : undefined
  const correlationIds = getCorrelation(req)
  if (statusParam) {
    if (!(Object.values(TaskStatusEnum) as TaskStatus[]).includes(statusParam as TaskStatus)) {
      const validValues = Object.values(TaskStatusEnum).join(', ')
      throw new BadRequestError('Invalid status value. Allowed values are: ' + validValues)
    }
    const effectivePagination = pagination ?? { page: 1, pageSize: 10 }
    const status = statusParam as TaskStatus
    const { tasks, pagination: pageMeta } = await TasksService.getTasksByStatus(userId, status, effectivePagination)
    log.info({ userId, status, count: tasks.length }, 'tasks:list by status')
    const response = createResponse(
      tasks,
      ResponseMessage.SUCCESS,
      StatusCode.SUCCESS,
      ResponseCode.SUCCESS,
      pageMeta,
      correlationIds?.requestId,
      correlationIds?.traceId,
    )
    return Response.json(response, { status: 200 })
  } else {
    const { tasks, pagination: pageMeta } = await TasksService.getAllTasksByUserId(userId, pagination)
    log.info({ userId, count: tasks.length }, 'tasks:list all')
    const response = createResponse(
      tasks,
      ResponseMessage.SUCCESS,
      StatusCode.SUCCESS,
      ResponseCode.SUCCESS,
      pageMeta,
      correlationIds?.requestId,
      correlationIds?.traceId,
    )
    return Response.json(response, { status: 200 })
  }
}
