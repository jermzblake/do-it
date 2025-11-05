import * as SessionRepository from '../../repositories/auth/sessions.repository'
import type { NewSession, Session } from '../../db/schema'

export const createSession = async (sessionPayload: NewSession): Promise<Session> => {
  try {
    const newSession = await SessionRepository.createSession(sessionPayload)
    if (!newSession) {
      throw new Error('Failed to create session')
    }
    return newSession
  } catch (error: any) {
    throw new Error('Error creating session: ' + error.message)
  }
}

export const getSessionByToken = async (token: string): Promise<Session | null> => {
  try {
    const session = await SessionRepository.getSessionByToken(token)
    return session
  } catch (error: any) {
    throw new Error('Error retrieving session: ' + error.message)
  }
}

export const deleteSessionByToken = async (token: string): Promise<void> => {
  try {
    await SessionRepository.deleteSessionByToken(token)
  } catch (error: any) {
    throw new Error('Error deleting session: ' + error.message)
  }
}

export const getUserIdBySessionToken = async (token: string): Promise<string | null> => {
  try {
    const userId = await SessionRepository.getUserIdBySessionToken(token)
    return userId
  } catch (error: any) {
    throw new Error('Error retrieving user ID from session token: ' + error.message)
  }
}
