// =============================================================================
// INFRA I.0 — Database Client
// =============================================================================
// Prisma singleton. Creates a single PrismaClient instance and caches it on
// globalThis to prevent multiple instances during hot-reload in development.
//
// Exports:
//   db — PrismaClient singleton instance
//
// Dependencies:
//   ~/env              — Environment variables (NODE_ENV)
//   generated/prisma   — PrismaClient (generated from schema)
// =============================================================================

import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
