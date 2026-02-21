// =============================================================================
// LIB L.10 — Integration Types
// =============================================================================
// Standardized interface for connecting ADVERTIS to external business tools
// (Zoho CRM, HubSpot, Monday.com, etc.).
// Exports: IntegrationProviderDescriptor, IntegrationCredentialField,
//   IntegrationCapability, IntegrationSyncPayload, IntegrationSyncResult,
//   IntegrationWebhookResult, IntegrationWebhookAction, IntegrationAdapter.
// Used by: integration registry, sync pipeline, settings UI.
// =============================================================================

// ---------------------------------------------------------------------------
// Integration Provider Descriptor — what an integration IS
// ---------------------------------------------------------------------------

export interface IntegrationProviderDescriptor {
  /** Unique provider identifier, e.g. "zoho_crm", "hubspot" */
  id: string;
  /** Human-readable name, e.g. "Zoho CRM" */
  name: string;
  /** What this integration does */
  description: string;
  /** Lucide icon name for UI */
  icon: string;
  /** Provider category */
  category: "crm" | "project" | "analytics" | "communication" | "other";

  /** What credentials the user must provide to connect */
  credentialFields: IntegrationCredentialField[];
  /** What this integration can do */
  capabilities: IntegrationCapability[];
}

export interface IntegrationCredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  required: boolean;
  placeholder?: string;
}

export type IntegrationCapability =
  | "push_strategy"
  | "pull_contacts"
  | "push_pillar_data"
  | "receive_webhook"
  | "sync_tasks";

// ---------------------------------------------------------------------------
// Sync Payload & Result
// ---------------------------------------------------------------------------

/** Data sent to external tool during push */
export interface IntegrationSyncPayload {
  strategyId: string;
  brandName: string;
  sector: string | null;
  pillars: Array<{ type: string; content: unknown }>;
}

/** Result of a push or pull operation */
export interface IntegrationSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// Webhook Result
// ---------------------------------------------------------------------------

/** What the adapter returns after processing an incoming webhook */
export interface IntegrationWebhookResult {
  acknowledged: boolean;
  actions: IntegrationWebhookAction[];
}

export interface IntegrationWebhookAction {
  type: "update_pillar" | "trigger_module" | "sync_data";
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Integration Adapter — the full interface an integration must implement
// ---------------------------------------------------------------------------

export interface IntegrationAdapter {
  descriptor: IntegrationProviderDescriptor;

  /** Verify credentials are valid (test the connection) */
  testConnection(
    credentials: Record<string, string>,
  ): Promise<{ success: boolean; error?: string }>;

  /** Push strategy/pillar data to external tool */
  pushData(
    credentials: Record<string, string>,
    config: Record<string, unknown>,
    data: IntegrationSyncPayload,
  ): Promise<IntegrationSyncResult>;

  /** Pull data from external tool */
  pullData(
    credentials: Record<string, string>,
    config: Record<string, unknown>,
    entityType: string,
  ): Promise<IntegrationSyncResult>;

  /** Process incoming webhook payload (optional — only if receive_webhook capability) */
  handleWebhook?(
    payload: unknown,
    headers: Record<string, string>,
    webhookSecret: string,
  ): Promise<IntegrationWebhookResult>;
}

// ---------------------------------------------------------------------------
// Integration Status (mirrors Prisma Integration.status)
// ---------------------------------------------------------------------------

export type IntegrationStatus = "inactive" | "active" | "error";
export type SyncDirection = "push" | "pull";
export type SyncStatus = "success" | "error" | "partial";
