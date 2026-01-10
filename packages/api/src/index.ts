import { authRouter } from './routers/auth'
import { dailyQuestionRouter } from './routers/dailyQuestion'
import { userRouter } from './routers/user'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  dailyQuestion: dailyQuestionRouter,
})

export type AppRouter = typeof appRouter

export { createTRPCContext, createCallerFactory } from './trpc'
