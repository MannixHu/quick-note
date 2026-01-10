'use client'

import { useCallback, useEffect, useState } from 'react'

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
  logout: () => void
  userId: string | null // Returns null if not authenticated
}

/**
 * Hook for managing authentication state
 * Reads from localStorage where login page stores user data
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Read user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Listen for storage changes (e.g., login in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user')
    document.cookie = 'auth-token=; path=/; max-age=0'
    setUser(null)
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    logout,
    userId: user?.id ?? null,
  }
}

export default useAuth
