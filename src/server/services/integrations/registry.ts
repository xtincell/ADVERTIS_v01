// =============================================================================
// MODULE 24 — Integration Registry
// =============================================================================
// Central Map-based registry for third-party integration adapters (Notion,
// Google Sheets, Airtable, etc.). Same singleton-Map pattern as Module
// Registry (23) and Widget Registry (14R).
//
// Public API:
//   registerIntegration(adapter)             — Register an IntegrationAdapter
//   getIntegration(providerId)               — Retrieve by provider ID
//   getAllIntegrations()                      — List all registered adapters
//   getIntegrationsByCategory(category)      — Filter by category
//
// Dependencies:
//   ~/lib/types/integration          — IntegrationAdapter type
//
// Called by:
//   integration implementations (registerIntegration at import-time)
//   integrations/sync-orchestrator.ts (getIntegration)
//   tRPC integration router (getAllIntegrations, getIntegration)
// =============================================================================

import type { IntegrationAdapter } from "~/lib/types/integration";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const INTEGRATION_REGISTRY = new Map<string, IntegrationAdapter>();

/** Register an integration adapter. */
export function registerIntegration(adapter: IntegrationAdapter): void {
  if (INTEGRATION_REGISTRY.has(adapter.descriptor.id)) {
    console.warn(
      `[IntegrationRegistry] Overwriting integration: ${adapter.descriptor.id}`,
    );
  }
  INTEGRATION_REGISTRY.set(adapter.descriptor.id, adapter);
}

/** Get a single integration adapter by provider ID. */
export function getIntegration(
  providerId: string,
): IntegrationAdapter | undefined {
  return INTEGRATION_REGISTRY.get(providerId);
}

/** Get all registered integration adapters. */
export function getAllIntegrations(): IntegrationAdapter[] {
  return Array.from(INTEGRATION_REGISTRY.values());
}

/** Get integrations by category. */
export function getIntegrationsByCategory(
  category: IntegrationAdapter["descriptor"]["category"],
): IntegrationAdapter[] {
  return getAllIntegrations().filter(
    (a) => a.descriptor.category === category,
  );
}
