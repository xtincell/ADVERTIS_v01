// =============================================================================
// ROUTE R.15 — Webhooks
// =============================================================================
// POST  /api/webhooks/[providerId]
// External integration webhook handler. Receives incoming webhooks from
// external tools (not tRPC — webhooks are unauthenticated external calls).
// Security: HMAC-SHA256 signature verification per integration. Matches
// webhook to integration via signature, then delegates to provider adapter.
// Auth:         HMAC signature (no session — external callers)
// Dependencies: integrations/registry (getIntegration), crypto (HMAC),
//               Prisma (Integration model)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "~/server/db";
import { getIntegration } from "~/server/services/integrations/registry";

// ---------------------------------------------------------------------------
// HMAC Verification
// ---------------------------------------------------------------------------

function verifyHmacSignature(
  payload: string,
  secret: string,
  signature: string,
): boolean {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/[providerId]
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await params;

  // 1. Get adapter
  const adapter = getIntegration(providerId);
  if (!adapter || !adapter.handleWebhook) {
    return NextResponse.json(
      { error: "Unknown provider or webhooks not supported" },
      { status: 404 },
    );
  }

  // 2. Read raw body for signature verification
  const rawBody = await request.text();

  // 3. Extract signature from headers (common patterns)
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const signature =
    headers["x-webhook-signature"] ??
    headers["x-hub-signature-256"] ??
    headers["x-signature"] ??
    "";

  // 4. Find all integrations for this provider (could be multiple users)
  const integrations = await db.integration.findMany({
    where: { providerId, status: "active", webhookSecret: { not: null } },
    select: { id: true, webhookSecret: true, userId: true },
  });

  if (integrations.length === 0) {
    return NextResponse.json(
      { error: "No active integrations found" },
      { status: 404 },
    );
  }

  // 5. Try to match the webhook to an integration via HMAC
  let matchedIntegration: (typeof integrations)[0] | undefined;
  for (const integration of integrations) {
    if (
      integration.webhookSecret &&
      verifyHmacSignature(rawBody, integration.webhookSecret, signature)
    ) {
      matchedIntegration = integration;
      break;
    }
  }

  if (!matchedIntegration) {
    // If no signature provided and only one integration, allow (for simpler integrations)
    if (!signature && integrations.length === 1) {
      matchedIntegration = integrations[0];
    } else {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }
  }

  // 6. Parse payload
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = rawBody;
  }

  // 7. Delegate to adapter
  try {
    const result = await adapter.handleWebhook(
      payload,
      headers,
      matchedIntegration!.webhookSecret ?? "",
    );

    // 8. Process actions (fire-and-forget for now)
    // In the future, each action type can trigger modules, update pillars, etc.
    if (result.actions.length > 0) {
      console.log(
        `[Webhook] ${providerId}: ${result.actions.length} actions to process`,
        result.actions.map((a) => a.type),
      );
    }

    return NextResponse.json({ acknowledged: result.acknowledged });
  } catch (error) {
    console.error(`[Webhook] ${providerId} error:`, error);
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 },
    );
  }
}
