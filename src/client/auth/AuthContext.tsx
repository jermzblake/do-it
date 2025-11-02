import { createContext, useContext, useEffect, useState } from 'react'
import type { UserResponse } from '@/types'
import { apiClient } from '../lib/axios'

type AuthContextType = {
  isAuthenticated: boolean
  login: (sso?: string) => void
  logout: () => Promise<void>
  user: UserResponse | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = (sso?: string) => {
    if (sso && sso === 'google') {
      window.location.href = '/api/auth/google'
      return
    }
    // Implement login logic here
    setIsAuthenticated(true)
    // Fetch and set user data
  }

  const logout = async () => {
    try {
      await apiClient.get('/auth/logout')
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .get<{
        authenticated: boolean
        userId: string
        name: string
        email: string
      }>('/auth/me')
      .then((response) => {
        if (response.data?.authenticated) {
          const data = response.data
          setUser({ id: data.userId, name: data.name, email: data.email })
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      })
      .catch((error) => {
        console.error('Authentication check failed:', error)
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, isLoading }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
