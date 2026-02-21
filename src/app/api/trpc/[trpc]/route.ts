// =============================================================================
// ROUTE R.T — tRPC Handler
// =============================================================================
// GET, POST  /api/trpc/[trpc]
// Next.js tRPC route handler. Wraps the tRPC fetch adapter to serve all
// tRPC procedures (queries, mutations, subscriptions) via the appRouter.
// Provides request context (headers) to each procedure via createTRPCContext.
// Auth:         Per-procedure (handled by tRPC middleware in each router)
// Dependencies: @trpc/server (fetchRequestHandler), appRouter, createTRPCContext,
//               env (NODE_ENV for dev error logging)
// =============================================================================

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
