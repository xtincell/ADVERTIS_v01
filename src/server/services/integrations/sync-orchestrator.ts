// Sync Orchestrator — Handles push/pull operations with external tools.
// Creates SyncLog records, manages credentials decryption, and delegates to adapters.

import { db } from "~/server/db";
import { getIntegration } from "./registry";
import { decryptCredentials } from "./crypto";
import type { IntegrationSyncPayload } from "~/lib/types/integration";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

// ---------------------------------------------------------------------------
// Push strategy data to an external tool
// ---------------------------------------------------------------------------

export async function pushToIntegration(
  integrationId: string,
  strategyId: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Fetch integration record
  const integration = await db.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    return { success: false, error: "Integration not found" };
  }

  const adapter = getIntegration(integration.providerId);
  if (!adapter) {
    return { success: false, error: `Adapter not found: ${integration.providerId}` };
  }

  // 2. Decrypt credentials
  let credentials: Record<string, string>;
  try {
    credentials = decryptCredentials(
      (integration.credentials as { encrypted: string })?.encrypted ?? "",
    );
  } catch {
    return { success: false, error: "Failed to decrypt credentials" };
  }

  // 3. Fetch strategy + pillars
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: { pillars: true },
  });

  if (!strategy) {
    return { success: false, error: "Strategy not found" };
  }

  // 4. Build sync payload
  const payload: IntegrationSyncPayload = {
    strategyId: strategy.id,
    brandName: strategy.brandName,
    sector: strategy.sector,
    pillars: strategy.pillars
      .filter((p) => p.status === "complete")
      .map((p) => ({
        type: p.type,
        content: parsePillarContent(p.type, p.content).data,
      })),
  };

  // 5. Execute push
  try {
    const config = (integration.config ?? {}) as Record<string, unknown>;
    const result = await adapter.pushData(credentials, config, payload);

    // 6. Create sync log
    await db.syncLog.create({
      data: {
        direction: "push",
        status: result.success ? "success" : "error",
        entityType: "strategy",
        entityId: strategyId,
        recordsProcessed: result.recordsProcessed,
        recordsFailed: result.recordsFailed,
        errorMessage: result.error,
        integrationId: integration.id,
        strategyId,
      },
    });

    // 7. Update integration sync status
    await db.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: result.success ? "success" : "error",
        lastSyncError: result.error ?? null,
      },
    });

    return { success: result.success, error: result.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await db.syncLog.create({
      data: {
        direction: "push",
        status: "error",
        entityType: "strategy",
        entityId: strategyId,
        errorMessage: message,
        integrationId: integration.id,
        strategyId,
      },
    });

    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Pull data from an external tool
// ---------------------------------------------------------------------------

export async function pullFromIntegration(
  integrationId: string,
  entityType: string,
  strategyId?: string,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const integration = await db.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    return { success: false, error: "Integration not found" };
  }

  const adapter = getIntegration(integration.providerId);
  if (!adapter) {
    return { success: false, error: `Adapter not found: ${integration.providerId}` };
  }

  let credentials: Record<string, string>;
  try {
    credentials = decryptCredentials(
      (integration.credentials as { encrypted: string })?.encrypted ?? "",
    );
  } catch {
    return { success: false, error: "Failed to decrypt credentials" };
  }

  try {
    const config = (integration.config ?? {}) as Record<string, unknown>;
    const result = await adapter.pullData(credentials, config, entityType);

    await db.syncLog.create({
      data: {
        direction: "pull",
        status: result.success ? "success" : "error",
        entityType,
        recordsProcessed: result.recordsProcessed,
        recordsFailed: result.recordsFailed,
        errorMessage: result.error,
        integrationId: integration.id,
        strategyId,
      },
    });

    await db.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: result.success ? "success" : "error",
        lastSyncError: result.error ?? null,
      },
    });

    return { success: result.success, data: result.details, error: result.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await db.syncLog.create({
      data: {
        direction: "pull",
        status: "error",
        entityType,
        errorMessage: message,
        integrationId: integration.id,
        strategyId,
      },
    });

    return { success: false, error: message };
  }
}
