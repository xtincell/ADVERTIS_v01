// =============================================================================
// MCP Utils — Shared helpers for MCP tool/resource handlers
// =============================================================================

// ---------------------------------------------------------------------------
// Tool result formatters
// ---------------------------------------------------------------------------

export function formatResult(data: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function formatError(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const message =
    error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

// ---------------------------------------------------------------------------
// Tool wrapper — wraps an async function into MCP tool callback shape
// ---------------------------------------------------------------------------

export function wrapTool<TArgs>(
  fn: (args: TArgs) => Promise<unknown>,
): (args: TArgs) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}> {
  return async (args: TArgs) => {
    try {
      const result = await fn(args);
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  };
}

// ---------------------------------------------------------------------------
// Resource result formatter
// ---------------------------------------------------------------------------

export function formatResource(
  uri: string,
  data: unknown,
  mimeType = "application/json",
): {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
} {
  return {
    contents: [
      {
        uri,
        mimeType,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
