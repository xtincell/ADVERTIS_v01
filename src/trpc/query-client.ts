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
