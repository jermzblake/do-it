import * as UsersRepository from '../../repositories/users/users.repository'
import type { NewUser, User } from '../../db/schema.js'
import type { UserResponse } from '../../../shared/user'

export const createUser = async (userPayload: NewUser): Promise<User> => {
  let { ssoId, ssoType } = userPayload
  const { name, email } = userPayload
  if (!ssoType) {
    ssoType = 'none'
    ssoId = `${email}-none`
  }
  try {
    const newUser = await UsersRepository.upsertUser({ name, email, ssoId, ssoType })
    if (!newUser) {
      throw new Error('Failed to create user')
    }
    return newUser
  } catch (error) {
    throw new Error('Error creating user: ' + (error as Error).message)
  }
}

export const getUserById = async (id: string): Promise<UserResponse | null> => {
  try {
    const user = await UsersRepository.getUserById(id)
    return user
  } catch (error) {
    throw new Error('Error retrieving user: ' + (error as Error).message)
  }
}

export const getUserBySessionToken = async (sessionToken: string): Promise<UserResponse | null> => {
  try {
    const user = await UsersRepository.getUserBySessionToken(sessionToken)
    return user
  } catch (error) {
    throw new Error('Error retrieving user by session token: ' + (error as Error).message)
  }
}
