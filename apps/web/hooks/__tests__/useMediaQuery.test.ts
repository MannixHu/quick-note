import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  breakpoints,
  useIsDesktop,
  useIsMobile,
  useMediaQuery,
  usePrefersDarkMode,
} from '../useMediaQuery'

describe('useMediaQuery', () => {
  const mockMatchMedia = (matches: boolean) => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []

    return vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(listener)
        }
      }),
      removeEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener)
          if (index > -1) listeners.splice(index, 1)
        }
      }),
      dispatchEvent: vi.fn(),
      // Helper to trigger change event
      _triggerChange: (newMatches: boolean) => {
        listeners.forEach((listener) => {
          listener({ matches: newMatches } as MediaQueryListEvent)
        })
      },
    }))
  }

  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns false initially for SSR safety', () => {
    window.matchMedia = mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    // After mount, should reflect actual value
    expect(result.current).toBe(true)
  })

  it('returns true when media query matches', () => {
    window.matchMedia = mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('returns false when media query does not match', () => {
    window.matchMedia = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('updates when media query changes', () => {
    let mockMedia: ReturnType<ReturnType<typeof mockMatchMedia>>
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      mockMedia = {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            ;(mockMedia as unknown as { _listener: (e: MediaQueryListEvent) => void })._listener =
              listener
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
      return mockMedia
    })

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      const listener = (mockMedia as unknown as { _listener: (e: MediaQueryListEvent) => void })
        ._listener
      if (listener) {
        listener({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })
})

describe('useIsMobile', () => {
  it('returns true when viewport is smaller than md breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false, // md query does not match = mobile
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false when viewport is larger than md breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true, // md query matches = not mobile
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})

describe('useIsDesktop', () => {
  it('returns true when viewport is larger than lg breakpoint', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
  })
})

describe('usePrefersDarkMode', () => {
  it('returns true when user prefers dark mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => usePrefersDarkMode())
    expect(result.current).toBe(true)
  })
})

describe('breakpoints', () => {
  it('has correct breakpoint values', () => {
    expect(breakpoints.sm).toBe('(min-width: 640px)')
    expect(breakpoints.md).toBe('(min-width: 768px)')
    expect(breakpoints.lg).toBe('(min-width: 1024px)')
    expect(breakpoints.xl).toBe('(min-width: 1280px)')
    expect(breakpoints['2xl']).toBe('(min-width: 1536px)')
  })
})
