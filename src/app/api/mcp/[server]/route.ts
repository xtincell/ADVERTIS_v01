// =============================================================================
// API Route — /api/mcp/[server]
// =============================================================================
// Dynamic catch-all for all 4 MCP servers (intelligence, operations, creative, pulse).
// Handles POST (tool calls & resource reads), GET (SSE), DELETE (session cleanup).
// =============================================================================

import { type NextRequest } from "next/server";
import { handleMcpRequest } from "~/server/mcp/create-server";
import { McpAuthError, hashApiKey } from "~/server/mcp/auth";

// P0-07: Simple in-memory rate limiter for MCP endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    }
  }, 300_000);
}

export const maxDuration = 120; // Vercel function timeout

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ server: string }> },
) {
  // Rate limit by Authorization header (or IP as fallback)
  const authHeader = request.headers.get("authorization") ?? "anonymous";
  const rateLimitKey = hashApiKey(authHeader.slice(0, 20)); // Don't store raw key
  if (!checkRateLimit(rateLimitKey)) {
    return Response.json(
      { error: { code: -32000, message: "Rate limit exceeded" } },
      { status: 429 },
    );
  }

  try {
    const { server } = await params;
    return await handleMcpRequest(server, request);
  } catch (error) {
    console.error("[MCP Route] Unhandled error:", error);
    // P0-06: Never leak internal error details to client
    const message = error instanceof McpAuthError
      ? error.message
      : "Internal server error";
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message },
        id: null,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ server: string }> },
) {
  // GET is used for SSE streams in stateful mode.
  // In stateless mode, return method not allowed.
  const { server } = await params;
  void server;
  return Response.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "SSE not supported in stateless mode. Use POST.",
      },
      id: null,
    },
    { status: 405 },
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ server: string }> },
) {
  // DELETE is used for session cleanup in stateful mode.
  // In stateless mode, return method not allowed.
  const { server } = await params;
  void server;
  return Response.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Session management not supported in stateless mode.",
      },
      id: null,
    },
    { status: 405 },
  );
}
