import { db } from '../../db/db'
import { TaskTable } from '../../db/schema'
import type { NewTask, Task } from '../../db/schema'
import { eq, and, sql, count } from 'drizzle-orm'
import type { PagingParams } from '../../../types'

export const createTask = async (taskData: NewTask) => {
  try {
    // Coerce ISO date strings to Date instances so drizzle's timestamp column mapper works
    if (taskData.dueDate && typeof taskData.dueDate === 'string') {
      // mutate safe copy if you want to avoid changing caller object:
      taskData = { ...taskData, dueDate: new Date(taskData.dueDate) } as NewTask
    }
    //TODO: validate date is valid before inserting?
    const result = await db.insert(TaskTable).values(taskData).returning()
    return result[0]
  } catch (error) {
    console.error('Error inserting task into database:', error)
    throw error
  }
}

export const getTaskById = async (id: string) => {
  const task = await db.select().from(TaskTable).where(eq(TaskTable.id, id)).limit(1)
  return task[0] || null
}

export const getAllTasksByUserId = async (userId: string) => {
  const tasks = await db.select().from(TaskTable).where(eq(TaskTable.userId, userId))
  return tasks
}

export const getTasksByStatus = async (
  userId: string,
  isDone: boolean,
  params: PagingParams,
): Promise<PagingParams> => {
  const offSet = (((params.page as number) < 1 ? 1 : params.page) - 1) * params.pageSize
  const limit = params.pageSize
  const tasks = await db
    .select()
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), eq(TaskTable.isDone, isDone)))
    .orderBy(
      sql`${TaskTable.dueDate} ASC NULLS LAST,
          ${TaskTable.priority} DESC,
          ${TaskTable.effort} ASC`,
    )
    .offset(offSet)
    .limit(limit)
  const totalCount = await db
    .select({ value: count(TaskTable.id) })
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), eq(TaskTable.isDone, isDone)))
  params.totalCount = Number(totalCount[0]?.value || 0)
  params.data = tasks
  return params
}

export const updateTaskById = async (id: string, taskData: Partial<NewTask>) => {
  // Coerce ISO date strings to Date instances so drizzle's timestamp column mapper works
  if (taskData.dueDate && typeof taskData.dueDate === 'string') {
    // mutate safe copy if you want to avoid changing caller object:
    taskData = { ...taskData, dueDate: new Date(taskData.dueDate) } as NewTask
  }
  const result = await db
    .update(TaskTable)
    .set({ ...taskData, updatedAt: new Date() })
    .where(eq(TaskTable.id, id))
    .returning()

  return result[0]
}

export const deleteTaskById = async (id: string) => {
  await db.update(TaskTable).set({ deletedAt: new Date() }).where(eq(TaskTable.id, id))
}
