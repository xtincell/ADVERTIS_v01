// =============================================================================
// MCP Server Factory — Creates and connects McpServer instances
// =============================================================================
// Stateless design: each request creates a fresh McpServer + transport.
// Uses WebStandardStreamableHTTPServerTransport for native Web Request/Response
// compatibility — no Node.js bridge needed in Next.js API routes.
//
// Public API:
//   handleMcpRequest(serverName, request) → Response
// =============================================================================

// TODO P0-12: Database mutations inside MCP tool handlers should use Prisma
// interactive transactions (db.$transaction) to ensure atomicity. Currently,
// multi-step mutations (e.g. campaign creation + budget line + team assignment)
// can leave partial state on failure. This requires updating the service layer
// to accept a transaction client (`Prisma.TransactionClient`) as a parameter.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { validateApiKey, verifyStrategyAccess, McpAuthError } from "./auth";
import type { McpAuthContext } from "./auth";

// Lazy-load server registrars to keep cold starts fast
type ServerRegistrar = (
  server: McpServer,
  ctx: McpAuthContext,
) => void;

const SERVER_REGISTRARS: Record<string, () => Promise<ServerRegistrar>> = {
  intelligence: () =>
    import("./servers/intelligence").then((m) => m.registerIntelligenceServer),
  operations: () =>
    import("./servers/operations").then((m) => m.registerOperationsServer),
  creative: () =>
    import("./servers/creative").then((m) => m.registerCreativeServer),
  pulse: () =>
    import("./servers/pulse").then((m) => m.registerPulseServer),
};

const VALID_SERVERS = Object.keys(SERVER_REGISTRARS);

const SERVER_VERSIONS: Record<string, string> = {
  intelligence: "1.0.0",
  operations: "1.0.0",
  creative: "1.0.0",
  pulse: "1.0.0",
};

// ---------------------------------------------------------------------------
// Main request handler
// ---------------------------------------------------------------------------

export async function handleMcpRequest(
  serverName: string,
  request: Request,
): Promise<Response> {
  // 1. Validate server name
  if (!VALID_SERVERS.includes(serverName)) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: `Unknown server: ${serverName}` },
        id: null,
      },
      { status: 404 },
    );
  }

  // 2. Authenticate
  let authCtx: McpAuthContext;
  try {
    authCtx = await validateApiKey(request.headers.get("authorization"));
  } catch (error) {
    if (error instanceof McpAuthError) {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: { code: -32001, message: error.message },
          id: null,
        },
        { status: 401 },
      );
    }
    throw error;
  }

  // 3. Check server access
  if (!authCtx.servers.includes(serverName)) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: `API key does not have access to ${serverName} server`,
        },
        id: null,
      },
      { status: 403 },
    );
  }

  // 4. Create McpServer
  const server = new McpServer(
    {
      name: `advertis-${serverName}`,
      version: SERVER_VERSIONS[serverName] ?? "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  // 5. Register tools and resources
  const loadRegistrar = SERVER_REGISTRARS[serverName]!;
  const registrar = await loadRegistrar();
  registrar(server, authCtx);

  // 6. Create stateless Web Standard transport (native Request/Response)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  // 7. Connect
  await server.connect(transport);

  // 8. Handle the request natively — returns a Web Standard Response
  try {
    const body = await request.json();
    const response = await transport.handleRequest(request, { parsedBody: body });

    // Clean up transport and server
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/event-stream")) {
      // For SSE, schedule cleanup when the stream ends
      const originalBody = response.body;
      if (originalBody) {
        const cleanup = async () => {
          await transport.close().catch(() => {});
          await server.close().catch(() => {});
        };
        // Use a TransformStream to detect stream end
        const { readable, writable } = new TransformStream();
        // P1-15: Guard against double-close race condition
        let cleaned = false;
        const safeCleanup = () => {
          if (cleaned) return;
          cleaned = true;
          cleanup();
        };
        originalBody.pipeTo(writable).then(safeCleanup, safeCleanup);
        return new Response(readable, {
          status: response.status,
          headers: response.headers,
        });
      }
    }

    await transport.close().catch(() => {});
    await server.close().catch(() => {});
    return response;
  } catch (err) {
    console.error("[MCP] Request handling error:", err);
    await transport.close().catch(() => {});
    await server.close().catch(() => {});
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      },
      { status: 400 },
    );
  }
}

// ---------------------------------------------------------------------------
// Strategy resolution helper (used by server registrars)
// ---------------------------------------------------------------------------

export async function resolveStrategyId(
  argsStrategyId: string | undefined,
  authCtx: McpAuthContext,
): Promise<string> {
  const strategyId = argsStrategyId ?? authCtx.strategyId;
  if (!strategyId) {
    throw new Error(
      "strategyId is required (not scoped in API key and not provided in args)",
    );
  }
  await verifyStrategyAccess(authCtx.userId, strategyId);
  return strategyId;
}
