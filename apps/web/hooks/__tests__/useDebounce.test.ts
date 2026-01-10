import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce, useDebouncedCallback } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    })

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated' })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('resets timer on rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    })

    // Multiple rapid updates
    rerender({ value: 'update1' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'update2' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'final' })

    // Still showing initial
    expect(result.current).toBe('initial')

    // Fast forward past debounce time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should show final value, not intermediate ones
    expect(result.current).toBe('final')
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces callback execution', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    // Call debounced function multiple times
    result.current('arg1')
    result.current('arg2')
    result.current('arg3')

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled()

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should be called once with last args
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg3')
  })

  it('cleans up timer on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500))

    result.current('test')

    // Unmount before timer fires
    unmount()

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled()
  })
})
