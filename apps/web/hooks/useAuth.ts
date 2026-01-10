'use client'

import { useCallback, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Demo user ID - in production this would come from auth context
const DEMO_USER_ID = 'demo-user-123'

export interface User {
  id: string
  email?: string
  phone?: string
  name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name?: string) => Promise<boolean>
  userId: string // Always returns a user ID (demo or real)
}

/**
 * Hook for managing authentication state
 * Currently uses demo user, will integrate with real auth in production
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useLocalStorage<User | null>('auth-user', null)
  const [isLoading, setIsLoading] = useState(false)

  // For now, always return demo user ID
  // In production, this would return the actual authenticated user ID
  const userId = user?.id ?? DEMO_USER_ID

  const login = useCallback(
    async (email: string, _password: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        // TODO: Integrate with tRPC auth.login mutation
        // For now, simulate login with demo user
        console.log('Login attempt:', { email, password: '***' })

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo: Always succeed and set demo user
        setUser({
          id: DEMO_USER_ID,
          email,
          name: email.split('@')[0],
        })

        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [setUser]
  )

  const logout = useCallback(() => {
    setUser(null)
  }, [setUser])

  const register = useCallback(
    async (email: string, _password: string, name?: string): Promise<boolean> => {
      setIsLoading(true)
      try {
        // TODO: Integrate with tRPC auth.register mutation
        console.log('Register attempt:', { email, password: '***', name })

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo: Always succeed and set demo user
        setUser({
          id: DEMO_USER_ID,
          email,
          name: name ?? email.split('@')[0],
        })

        return true
      } catch (error) {
        console.error('Register error:', error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [setUser]
  )

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    register,
    userId,
  }
}

export default useAuth
