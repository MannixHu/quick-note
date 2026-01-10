'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Hook for managing state that persists to localStorage
 * Supports SSR by initializing with null and syncing after mount
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize with initialValue for SSR, will sync from localStorage after mount
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      if (item !== null && item !== 'undefined') {
        setStoredValue(JSON.parse(item) as T)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
    setIsInitialized(true)
  }, [key])

  // Persist to localStorage when value changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, isInitialized])

  // Setter function that handles both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value
      return newValue
    })
  }, [])

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
