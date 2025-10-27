import * as TasksRepository from '../../repositories/tasks/tasks.repository'
import type { NewTask, Task } from '../../db/schema.js'
import type { PagingParams } from '../../../types/index'

export const createTask = async (taskPayload: NewTask): Promise<Task> => {
  if (!taskPayload.userId) {
    throw new Error('User ID is required to create a task')
  }
  try {
    console.log('Creating task with payload:', taskPayload)
    const newTask = await TasksRepository.createTask(taskPayload)
    console.log('Task created successfully:', newTask)
    if (!newTask) {
      throw new Error('Failed to create task')
    }
    return newTask
  } catch (error: any) {
    throw new Error('Error creating task: ' + error.message)
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

export const getAllTasksByUserId = async (userId: string): Promise<Task[]> => {
  try {
    const db_response = await TasksRepository.getAllTasksByUserId(userId)
    return db_response
  } catch (error) {
    throw new Error('Error retrieving tasks: ' + (error as Error).message)
  }
}

export const getTasksByStatus = async (
  userId: string,
  isDone: boolean,
  params: PagingParams,
): Promise<PagingParams> => {
  try {
    const tasks = await TasksRepository.getTasksByStatus(userId, isDone, params)
    return tasks
  } catch (error) {
    throw new Error('Error retrieving tasks by status: ' + (error as Error).message)
  }
}

export const updateTaskById = async (id: string, taskPayload: Partial<NewTask>): Promise<Task> => {
  try {
    const updatedTask = await TasksRepository.updateTaskById(id, taskPayload)
    if (!updatedTask) {
      throw new Error('Failed to update task')
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
