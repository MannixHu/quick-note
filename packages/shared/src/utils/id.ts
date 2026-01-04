import { nanoid } from 'nanoid'

/**
 * Generate a unique ID
 */
export function generateId(size = 21) {
  return nanoid(size)
}

/**
 * Generate a short unique ID
 */
export function generateShortId() {
  return nanoid(10)
}
