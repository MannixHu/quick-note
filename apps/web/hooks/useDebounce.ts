'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hook that debounces a value
 * Returns the debounced value that only updates after the specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that returns a debounced callback function
 * The callback will only be executed after the specified delay since the last call
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }

  return debouncedCallback as T
}

/**
 * Hook that returns both the debounced value and a function to immediately update it
 * Useful when you need to bypass debounce in certain cases
 */
export function useDebounceWithImmediate<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  // Immediately set the debounced value (bypass debounce)
  const [immediateValue, setImmediateValue] = useState<T>(initialValue)

  const setValueDebounced = (newValue: T) => {
    setValue(newValue)
  }

  const setValueImmediate = (newValue: T) => {
    setValue(newValue)
    setImmediateValue(newValue)
  }

  // Sync immediate value when debounced value changes
  useEffect(() => {
    setImmediateValue(debouncedValue)
  }, [debouncedValue])

  return [value, immediateValue, setValueDebounced, setValueImmediate]
}

export default useDebounce
