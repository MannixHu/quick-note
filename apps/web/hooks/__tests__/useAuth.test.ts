import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('always returns a userId (demo or real)', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.userId).toBe('demo-user-123')
  })

  it('login sets user and returns true on success', async () => {
    const { result } = renderHook(() => useAuth())

    let success = false
    await act(async () => {
      success = await result.current.login('test@example.com', 'password')
    })

    expect(success).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('register sets user and returns true on success', async () => {
    const { result } = renderHook(() => useAuth())

    let success = false
    await act(async () => {
      success = await result.current.register('new@example.com', 'password', 'New User')
    })

    expect(success).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('new@example.com')
    expect(result.current.user?.name).toBe('New User')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logout clears user state', async () => {
    const { result } = renderHook(() => useAuth())

    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('extracts name from email if not provided', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.register('john.doe@example.com', 'password')
    })

    expect(result.current.user?.name).toBe('john.doe')
  })
})
