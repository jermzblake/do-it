import { db } from '../../db/db'
import { SessionTable } from '../../db/schema'
import type { NewSession, Session } from '../../db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export const createSession = async (sessionData: NewSession) => {
  const result = await db.insert(SessionTable).values(sessionData).returning()
  return result[0]
}

export const getSessionByToken = async (token: string): Promise<Session | null> => {
  const session = await db
    .select()
    .from(SessionTable)
    .where(and(eq(SessionTable.sessionToken, token), isNull(SessionTable.deletedAt)))
    .limit(1)
  return session.length > 0 && session[0] ? session[0] : null
}

export const deleteSessionByToken = async (token: string): Promise<void> => {
  await db.update(SessionTable).set({ deletedAt: new Date() }).where(eq(SessionTable.sessionToken, token))
}

export const getUserIdBySessionToken = async (token: string): Promise<string | null> => {
  const session = await db
    .select({ userId: SessionTable.userId })
    .from(SessionTable)
    .where(and(eq(SessionTable.sessionToken, token), isNull(SessionTable.deletedAt)))
    .limit(1)
  if (session.length > 0 && session[0]) {
    return session[0].userId
  }
  return null
}
