import { authRouter } from './routers/auth'
import { dailyQuestionRouter } from './routers/dailyQuestion'
import { postRouter } from './routers/post'
import { timeBlockRouter } from './routers/timeBlock'
import { userRouter } from './routers/user'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  auth: authRouter,
  timeBlock: timeBlockRouter,
  dailyQuestion: dailyQuestionRouter,
})

export type AppRouter = typeof appRouter

export { createTRPCContext, createCallerFactory } from './trpc'
