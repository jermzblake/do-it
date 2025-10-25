import { db } from '../../db/db.js'
import { UserTable } from '../../db/schema.js'
import type { NewUser, User } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

export const createUser = async (name: string, email: string) => {
  const result = await db.insert(UserTable).values({ name, email }).returning()
  return result[0]
}

export const getUserById = async (id: string) => {
  const user = await db.select().from(UserTable).where(eq(UserTable.id, id)).limit(1)
  return user[0] || null
}

export const updateUserById = async (id: string, name?: string, email?: string) => {
  const updateData: Partial<{ name: string; email: string }> = {}
  if (name !== undefined) updateData.name = name
  if (email !== undefined) updateData.email = email

  const result = await db.update(UserTable).set(updateData).where(eq(UserTable.id, id)).returning()

  return result[0]
}

export const deleteUserById = async (id: string) => {
  await db.delete(UserTable).where(eq(UserTable.id, id))
}
