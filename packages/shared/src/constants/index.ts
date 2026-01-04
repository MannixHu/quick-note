export const APP_NAME = 'Universal App'
export const APP_VERSION = '0.1.0'

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  TRPC: '/api/trpc',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const
