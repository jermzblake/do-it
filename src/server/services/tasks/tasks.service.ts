import * as TasksRepository from '../../repositories/tasks/tasks.repository'
import { enforceTaskCreationLimit } from '../../utils/task-rate-limit'
import type { NewTask, Task, TaskStatus } from '../../db/schema'
import type { Pagination } from '../../../shared/api'
import { insertTaskSchema, updateTaskSchema } from '../../validators/task.validator'
import { RateLimitExceededError } from '../../errors/RateLimitExceededError'

export const createTask = async (taskPayload: NewTask): Promise<Task> => {
  if (!taskPayload.userId) {
    throw new Error('User ID is required to create a task')
  }

  const validatedData = insertTaskSchema.parse(taskPayload)

  await enforceTaskCreationLimit({ userId: validatedData.userId })

  try {
    const newTask = await TasksRepository.createTask(validatedData)
    if (!newTask) {
      throw new Error('Failed to create task')
    }
    return newTask
  } catch (error: unknown) {
    if (error instanceof RateLimitExceededError) throw error
    throw new Error('Error creating task: ' + (error as Error).message)
  }
}

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const task = await TasksRepository.getTaskById(id)
    return task
  } catch (error) {
    throw new Error('Error retrieving task: ' + (error as Error).message)
  }
}

export const getAllTasksByUserId = async (
  userId: string,
  pagination?: { page: number; pageSize: number },
): Promise<{ tasks: Task[]; pagination?: Pagination }> => {
  try {
    return await TasksRepository.getAllTasksByUserId(userId, pagination)
  } catch (error) {
    throw new Error('Error retrieving tasks: ' + (error as Error).message)
  }
}

export const getTasksByStatus = async (
  userId: string,
  status: TaskStatus,
  pagination: { page: number; pageSize: number },
): Promise<{ tasks: Task[]; pagination: Pagination }> => {
  try {
    return await TasksRepository.getTasksByStatus(userId, status, pagination)
  } catch (error) {
    throw new Error('Error retrieving tasks by status: ' + (error as Error).message)
  }
}

export const updateTaskById = async (id: string, taskPayload: Partial<NewTask>): Promise<Task> => {
  const validatedData = updateTaskSchema.parse(taskPayload)

  try {
    const updatedTask = await TasksRepository.updateTaskById(id, validatedData)
    if (!updatedTask) {
      throw new Error('No task found to update with the provided ID')
    }
    return updatedTask
  } catch (error) {
    throw new Error('Error updating task: ' + (error as Error).message)
  }
}

export const deleteTaskById = async (id: string): Promise<void> => {
  try {
    await TasksRepository.deleteTaskById(id)
  } catch (error) {
    throw new Error('Error deleting task: ' + (error as Error).message)
  }
}
