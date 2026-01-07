import type { AppRouter } from '@app/api'
import { createTRPCReact } from '@trpc/react-query'

// @ts-expect-error - tRPC v11 RC type compatibility
export const trpc = createTRPCReact<AppRouter>()
