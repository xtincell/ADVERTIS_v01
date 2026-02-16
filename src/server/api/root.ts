import { authRouter } from "~/server/api/routers/auth";
import { strategyRouter } from "~/server/api/routers/strategy";
import { pillarRouter } from "~/server/api/routers/pillar";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { documentRouter } from "~/server/api/routers/document";
import { cockpitRouter } from "~/server/api/routers/cockpit";
import { marketStudyRouter } from "~/server/api/routers/market-study";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  strategy: strategyRouter,
  pillar: pillarRouter,
  analytics: analyticsRouter,
  document: documentRouter,
  cockpit: cockpitRouter,
  marketStudy: marketStudyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.auth.getProfile();
 *       ^? User
 */
export const createCaller = createCallerFactory(appRouter);
