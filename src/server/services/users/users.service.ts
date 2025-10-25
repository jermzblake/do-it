import * as UsersRepository from '../../repositories/users/users.repository'
import type { NewUser, User } from '../../db/schema.js'

export const createUser = async (userPayload: NewUser): Promise<User> => {
  const { name, email } = userPayload
  try {
    const newUser = await UsersRepository.createUser(name, email)
    if (!newUser) {
      throw new Error('Failed to create user')
    }
    return newUser
  } catch (error) {
    throw new Error('Error creating user: ' + (error as Error).message)
  }
}

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await UsersRepository.getUserById(id)
    return user
  } catch (error) {
    throw new Error('Error retrieving user: ' + (error as Error).message)
  }
}
