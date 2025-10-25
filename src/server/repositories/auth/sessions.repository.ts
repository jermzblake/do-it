import { db } from '../../db/db'
import { SessionTable } from '../../db/schema'
import type { NewSession, Session } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const createSession = async (sessionData: NewSession) => {
  const result = await db.insert(SessionTable).values(sessionData).returning()
  return result[0]
}
