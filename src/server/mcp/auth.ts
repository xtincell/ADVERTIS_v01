// =============================================================================
// MCP Auth — API Key validation for MCP server endpoints
// =============================================================================
// Validates Bearer token from Authorization header, resolves to userId +
// optional strategyId scope. Keys are SHA-256 hashed before storage.
//
// Public API:
//   validateApiKey(authHeader) → McpAuthContext
//   hashApiKey(rawKey) → string
//   generateApiKey() → { raw, hashed, prefix }
// =============================================================================

import { createHash, randomBytes } from "crypto";
import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface McpAuthContext {
  userId: string;
  strategyId: string | null;
  servers: string[];
}

// ---------------------------------------------------------------------------
// Key utilities
// ---------------------------------------------------------------------------

const API_KEY_PREFIX = "adv_";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): {
  raw: string;
  hashed: string;
  prefix: string;
} {
  const bytes = randomBytes(32).toString("hex");
  const raw = `${API_KEY_PREFIX}${bytes}`;
  return {
    raw,
    hashed: hashApiKey(raw),
    prefix: raw.slice(0, 12),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export async function validateApiKey(
  authHeader: string | null,
): Promise<McpAuthContext> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new McpAuthError("Missing or invalid Authorization header");
  }

  const rawKey = authHeader.slice(7);

  // P0-05: Always compute hash to prevent timing attacks — even if format is wrong
  const hashed = hashApiKey(rawKey);
  const apiKey = await db.mcpApiKey.findUnique({
    where: { hashedKey: hashed },
  });

  // Use generic error for all auth failures to prevent enumeration
  if (!rawKey.startsWith(API_KEY_PREFIX) || !apiKey) {
    throw new McpAuthError("Invalid or expired API key");
  }

  if (apiKey.revokedAt) {
    throw new McpAuthError("Invalid or expired API key");
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new McpAuthError("Invalid or expired API key");
  }

  // Update lastUsedAt (fire-and-forget, don't block the request)
  db.mcpApiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => {
      console.warn("[MCP Auth] Failed to update lastUsedAt:", err);
    });

  return {
    userId: apiKey.userId,
    strategyId: apiKey.strategyId,
    servers: apiKey.servers,
  };
}

// ---------------------------------------------------------------------------
// Strategy ownership verification (mirrors strategyProcedure from trpc.ts)
// ---------------------------------------------------------------------------

export async function verifyStrategyAccess(
  userId: string,
  strategyId: string,
): Promise<void> {
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
  });

  if (!strategy || strategy.userId !== userId) {
    throw new McpAuthError("Strategy not found or access denied");
  }
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class McpAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "McpAuthError";
  }
}
