import { db } from '../../db/db'
import { UserTable, SessionTable } from '../../db/schema'
import type { NewUser, User } from '../../db/schema'
import { eq, isNull, gt, and } from 'drizzle-orm'
import type { UserResponse } from '../../../shared/user'

export const upsertUser = async (userPayload: NewUser) => {
  const result = await db
    .insert(UserTable)
    .values(userPayload)
    .onConflictDoUpdate({
      target: UserTable.email,
      set: {
        ssoId: userPayload.ssoId,
        ssoType: userPayload.ssoType,
      },
    })
    .returning()
  return result[0]
}

export const getUserById = async (id: string): Promise<UserResponse | null> => {
  const user = await db
    .select({ id: UserTable.id, email: UserTable.email, name: UserTable.name })
    .from(UserTable)
    .where(eq(UserTable.id, id))
    .limit(1)
  return user[0] || null
}

export const getUserBySessionToken = async (sessionToken: string): Promise<UserResponse | null> => {
  const user = await db
    .select({ id: UserTable.id, email: UserTable.email, name: UserTable.name })
    .from(UserTable)
    .innerJoin(SessionTable, eq(UserTable.id, SessionTable.userId))
    .where(
      and(
        eq(SessionTable.sessionToken, sessionToken),
        isNull(SessionTable.deletedAt),
        gt(SessionTable.expiresAt, new Date()),
      ),
    )
    .limit(1)
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
