export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string | null
  published: boolean
  authorId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor?: string
  hasMore: boolean
}
