// =============================================================================
// LIB L.T1 — tRPC Query Client
// =============================================================================
// React Query client configuration with SuperJSON serialization for SSR.
// Sets default staleTime, dehydration and hydration with SuperJSON.
// Exports: createQueryClient().
// Used by: tRPC provider (client-side), server.ts (server-side RSC).
// =============================================================================

import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        // Don't retry on deterministic errors (NOT_FOUND, UNAUTHORIZED, etc.)
        // These will never succeed on retry and just spam console + network.
        retry(failureCount, error) {
          // tRPC errors carry a data.code field
          const trpcCode = (error as Error & { data?: { code?: string } })?.data
            ?.code;
          if (
            trpcCode === "NOT_FOUND" ||
            trpcCode === "UNAUTHORIZED" ||
            trpcCode === "FORBIDDEN" ||
            trpcCode === "BAD_REQUEST"
          ) {
            return false;
          }
          // For transient errors (network, 500), allow up to 2 retries
          return failureCount < 2;
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
