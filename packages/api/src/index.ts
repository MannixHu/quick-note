import { postRouter } from './routers/post'
import { userRouter } from './routers/user'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
})

export type AppRouter = typeof appRouter

export { createTRPCContext, createCallerFactory } from './trpc'
