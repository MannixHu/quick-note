'use client'

import { useEffect, useState } from 'react'

/**
 * Hook for responsive design using CSS media queries
 * Returns true if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Use addEventListener for modern browsers
    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}

// Preset breakpoints matching Tailwind CSS defaults
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const

/**
 * Convenient hooks for common breakpoints
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.md)
}

export function useIsTablet(): boolean {
  const isMd = useMediaQuery(breakpoints.md)
  const isLg = useMediaQuery(breakpoints.lg)
  return isMd && !isLg
}

export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg)
}

/**
 * Hook for detecting user's preferred color scheme
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/**
 * Hook for detecting reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export default useMediaQuery
