import { appRouter, createTRPCContext } from '@app/api'
import type { AnyRouter } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter as unknown as AnyRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  })

export { handler as GET, handler as POST }
