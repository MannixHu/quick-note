// Utility hooks
export { useLocalStorage } from './useLocalStorage'
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  breakpoints,
} from './useMediaQuery'
export { useDebounce, useDebouncedCallback, useDebounceWithImmediate } from './useDebounce'

// Domain hooks
export { useAuth, type User, type AuthState, type UseAuthReturn } from './useAuth'
export {
  useQuestion,
  type AnswerHistory,
  type AIConfig,
  type UseQuestionOptions,
  type UseQuestionReturn,
} from './useQuestion'
