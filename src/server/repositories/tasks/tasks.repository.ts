import { db } from '../../db/db'
import { TaskTable } from '../../db/schema'
import type { NewTask, Task, TaskStatus } from '../../db/schema'
import { eq, and, sql, count, isNull, gte, lte } from 'drizzle-orm'
import type { Pagination } from '../../../shared/api'

const returnColumns = {
  id: TaskTable.id,
  userId: TaskTable.userId,
  name: TaskTable.name,
  description: TaskTable.description,
  notes: TaskTable.notes,
  status: TaskTable.status,
  blockedReason: TaskTable.blockedReason,
  priority: TaskTable.priority,
  effort: TaskTable.effort,
  dueDate: TaskTable.dueDate,
  startedAt: TaskTable.startedAt,
  completedAt: TaskTable.completedAt,
  startBy: TaskTable.startBy,
  createdAt: TaskTable.createdAt,
  updatedAt: TaskTable.updatedAt,
  deletedAt: TaskTable.deletedAt,
}

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

export const getAllTasksByUserId = async (
  userId: string,
  pagination?: { page: number; pageSize: number },
): Promise<{ tasks: Task[]; pagination?: Pagination }> => {
  if (!pagination) {
    const tasks = await db
      .select()
      .from(TaskTable)
      .where(and(eq(TaskTable.userId, userId), isNull(TaskTable.deletedAt)))
      .orderBy(
        sql`${TaskTable.dueDate} ASC NULLS LAST,
          ${TaskTable.priority} DESC,
          ${TaskTable.effort} ASC`,
      )
    return { tasks }
  }
  const page = pagination.page < 1 ? 1 : pagination.page
  const offSet = (page - 1) * pagination.pageSize
  const limit = pagination.pageSize
  const tasks = await db
    .select()
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), isNull(TaskTable.deletedAt)))
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
    .where(and(eq(TaskTable.userId, userId), isNull(TaskTable.deletedAt)))
  const total = Number(totalCount[0]?.value || 0)
  const totalPages = Math.ceil(total / pagination.pageSize) || 1
  return {
    tasks,
    pagination: {
      page,
      pageSize: pagination.pageSize,
      totalCount: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export const getTasksByStatus = async (
  userId: string,
  status: TaskStatus,
  pagination: { page: number; pageSize: number },
): Promise<{ tasks: Task[]; pagination: Pagination }> => {
  const page = pagination.page < 1 ? 1 : pagination.page
  const offSet = (page - 1) * pagination.pageSize
  const limit = pagination.pageSize
  const tasks = await db
    .select()
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), eq(TaskTable.status, status), isNull(TaskTable.deletedAt)))
    .orderBy(
      sql`${TaskTable.completedAt} DESC NULLS LAST,
          ${TaskTable.dueDate} ASC NULLS LAST,
          ${TaskTable.priority} DESC,
          ${TaskTable.effort} ASC`,
    )
    .offset(offSet)
    .limit(limit)
  const totalCount = await db
    .select({ value: count(TaskTable.id) })
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), eq(TaskTable.status, status), isNull(TaskTable.deletedAt)))
  const total = Number(totalCount[0]?.value || 0)
  const totalPages = Math.ceil(total / pagination.pageSize) || 1
  return {
    tasks,
    pagination: {
      page,
      pageSize: pagination.pageSize,
      totalCount: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export const updateTaskById = async (id: string, taskData: Partial<NewTask>) => {
  // Coerce ISO date strings to Date instances so drizzle's timestamp column mapper works
  if (taskData.dueDate && typeof taskData.dueDate === 'string') {
    // mutate safe copy if you want to avoid changing caller object:
    taskData = { ...taskData, dueDate: new Date(taskData.dueDate) } as NewTask
  }
  try {
    const result = await db
      .update(TaskTable)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(TaskTable.id, id))
      .returning(returnColumns)

    return result[0]
  } catch (error) {
    console.error('Error updating task in database:', error)
    throw new Error('Error updating task: ' + (error as Error).message)
  }
}

export const deleteTaskById = async (id: string) => {
  await db.update(TaskTable).set({ deletedAt: new Date() }).where(eq(TaskTable.id, id))
}

export const countActiveTasksByUserId = async (userId: string): Promise<number> => {
  const result = await db
    .select({ value: count(TaskTable.id) })
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), isNull(TaskTable.deletedAt)))
  return Number(result[0]?.value || 0)
}

export const countTasksCreatedByUserBetween = async (userId: string, start: Date, end: Date): Promise<number> => {
  const result = await db
    .select({ value: count(TaskTable.id) })
    .from(TaskTable)
    .where(and(eq(TaskTable.userId, userId), gte(TaskTable.createdAt, start), lte(TaskTable.createdAt, end)))
  return Number(result[0]?.value || 0)
}
