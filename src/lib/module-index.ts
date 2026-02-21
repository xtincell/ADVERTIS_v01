// LIB L.14 — Module Index
// Pure data export: complete registry of all ADVERTIS modules.
// Auto-generated from codebase scan of standardized header comments.
// No runtime dependencies.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModuleEntry {
  /** Unique module identifier (e.g. "MODULE 5", "ROUTE R.3", "COMPONENT C.K1") */
  id: string;
  /** Short human-readable name */
  name: string;
  /** Longer description (usually matches the header comment after the dash) */
  description: string;
  /** Top-level category */
  category: ModuleCategory;
  /** File path relative to src/ */
  path: string;
}

// ---------------------------------------------------------------------------
// Category constants
// ---------------------------------------------------------------------------

export const MODULE_CATEGORIES = {
  SERVICE: "SERVICE",
  ROUTE: "ROUTE",
  ROUTER: "ROUTER",
  INFRA: "INFRA",
  LIB: "LIB",
  COMPONENT: "COMPONENT",
  PAGE: "PAGE",
} as const;

export type ModuleCategory = (typeof MODULE_CATEGORIES)[keyof typeof MODULE_CATEGORIES];

// ---------------------------------------------------------------------------
// Module Index  (sorted by category, then by ID)
// ---------------------------------------------------------------------------

export const MODULE_INDEX: readonly ModuleEntry[] = [

  // =========================================================================
  // COMPONENT  (C.K0..C.K19, C.S1..C.S11, C.A1..C.A7, C.AR1..C.AR5,
  //             C.B1, C.D0..C.D5, C.E0..C.E5, C.E.H1..C.E.H2,
  //             C.IM1..C.IM2, C.L1..C.L2, C.MS1..C.MS4, C.O1..C.O9,
  //             C.P1, C.U1..C.U2)
  // =========================================================================
  {
    id: "C.K0",
    name: "Cockpit Content",
    description: "Cockpit Content",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/cockpit-content.tsx",
  },
  {
    id: "C.K1",
    name: "Cockpit Share Dialog",
    description: "Cockpit Share Dialog",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/cockpit-share-dialog.tsx",
  },
  {
    id: "C.K2",
    name: "Section Authenticite",
    description: "Section Authenticite",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-authenticite.tsx",
  },
  {
    id: "C.K3",
    name: "Section Distinction",
    description: "Section Distinction",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-distinction.tsx",
  },
  {
    id: "C.K4",
    name: "Section Valeur",
    description: "Section Valeur",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-valeur.tsx",
  },
  {
    id: "C.K5",
    name: "Section Engagement",
    description: "Section Engagement",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-engagement.tsx",
  },
  {
    id: "C.K6",
    name: "Section Risk",
    description: "Section Risk",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-risk.tsx",
  },
  {
    id: "C.K7",
    name: "Section Track",
    description: "Section Track",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-track.tsx",
  },
  {
    id: "C.K8",
    name: "Section Implementation",
    description: "Section Implementation",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-implementation.tsx",
  },
  {
    id: "C.K9",
    name: "Section Synthese",
    description: "Section Synthese",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-synthese.tsx",
  },
  {
    id: "C.K10",
    name: "Section Widgets",
    description: "Section Widgets",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-widgets.tsx",
  },
  {
    id: "C.K11",
    name: "Section Competitors",
    description: "Section Competitors",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-competitors.tsx",
  },
  {
    id: "C.K12",
    name: "Section Briefs",
    description: "Section Briefs",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-briefs.tsx",
  },
  {
    id: "C.K13",
    name: "Section Brief Detail",
    description: "Section Brief Detail",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-brief-detail.tsx",
  },
  {
    id: "C.K14",
    name: "Section Budget",
    description: "Section Budget",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-budget.tsx",
  },
  {
    id: "C.K15",
    name: "Section Veille",
    description: "Section Veille",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-veille.tsx",
  },
  {
    id: "C.K16",
    name: "Section Signals",
    description: "Section Signals",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-signals.tsx",
  },
  {
    id: "C.K17",
    name: "Section Decisions",
    description: "Section Decisions",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-decisions.tsx",
  },
  {
    id: "C.K18",
    name: "Section Opportunities",
    description: "Section Opportunities",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/sections/section-opportunities.tsx",
  },
  {
    id: "C.K19",
    name: "Widget Container",
    description: "Widget Container",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/cockpit/widgets/widget-container.tsx",
  },
  {
    id: "C.S1",
    name: "Strategy Tree",
    description: "Strategy Tree",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/strategy-tree.tsx",
  },
  {
    id: "C.S2",
    name: "Strategy Sub Nav",
    description: "Strategy Sub Nav",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/strategy-sub-nav.tsx",
  },
  {
    id: "C.S3",
    name: "Pillar Sub Nav",
    description: "Pillar Sub Nav",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/pillar-sub-nav.tsx",
  },
  {
    id: "C.S4",
    name: "Pillar Content Preview",
    description: "Pillar Content Preview",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/pillar-content-preview.tsx",
  },
  {
    id: "C.S5",
    name: "Phase Timeline",
    description: "Phase Timeline",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/phase-timeline.tsx",
  },
  {
    id: "C.S6",
    name: "Report Card",
    description: "Report Card",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/report-card.tsx",
  },
  {
    id: "C.S7",
    name: "Template Card",
    description: "Template Card",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/template-card.tsx",
  },
  {
    id: "C.S8",
    name: "Version History Panel",
    description: "Version History Panel",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/version-history-panel.tsx",
  },
  {
    id: "C.S9",
    name: "Export Dialog",
    description: "Export Dialog",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/export-dialog.tsx",
  },
  {
    id: "C.S10",
    name: "Fiche Upgrade Button",
    description: "Fiche Upgrade Button",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/fiche-upgrade-button.tsx",
  },
  {
    id: "C.S11",
    name: "Fiche Review Form",
    description: "Fiche Review Form",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/fiche-review/fiche-review-form.tsx",
  },

  // — Analytics (C.A1 .. C.A7) —
  {
    id: "C.A1",
    name: "Coherence Gauge",
    description: "Animated score gauge visualization",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/coherence-gauge.tsx",
  },
  {
    id: "C.A2",
    name: "Pillar Radar",
    description: "Radar chart for pillar scores",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/pillar-radar.tsx",
  },
  {
    id: "C.A3",
    name: "Strategy Stats",
    description: "Strategy statistics cards",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/strategy-stats.tsx",
  },
  {
    id: "C.A4",
    name: "Sector Donut",
    description: "Sector distribution donut chart",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/sector-donut.tsx",
  },
  {
    id: "C.A5",
    name: "Phase Pipeline",
    description: "Phase distribution pipeline chart",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/phase-pipeline.tsx",
  },
  {
    id: "C.A6",
    name: "Health Heatmap",
    description: "Strategy health heatmap grid",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/health-heatmap.tsx",
  },
  {
    id: "C.A7",
    name: "Activity Timeline",
    description: "Recent activity timeline",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/analytics/activity-timeline.tsx",
  },
  // — Audit Review (C.AR1 .. C.AR5) —
  {
    id: "C.AR1",
    name: "Audit Review Form",
    description: "Combined R+T audit review form",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/audit-review/audit-review-form.tsx",
  },
  {
    id: "C.AR2",
    name: "Risk Audit Editor",
    description: "Risk audit (R) inline editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/audit-review/risk-audit-editor.tsx",
  },
  {
    id: "C.AR3",
    name: "Track Audit Editor",
    description: "Track audit (T) inline editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/audit-review/track-audit-editor.tsx",
  },
  {
    id: "C.AR4",
    name: "Editable String List",
    description: "Shared editable string list helper",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/audit-review/editable-string-list.tsx",
  },
  {
    id: "C.AR5",
    name: "Audit Suggestions Panel",
    description: "AI audit suggestion acceptance panel",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/audit-review/audit-suggestions-panel.tsx",
  },
  // — Brand (C.B1) —
  {
    id: "C.B1",
    name: "Advertis Logo",
    description: "SVG brand logo component",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/brand/advertis-logo.tsx",
  },
  // — Dashboard (C.D0 .. C.D5) —
  {
    id: "C.D0",
    name: "Dashboard Shared",
    description: "Shared dashboard types and utilities",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/shared.tsx",
  },
  {
    id: "C.D1",
    name: "Brand Table",
    description: "Brand strategy table view",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/brand-table.tsx",
  },
  {
    id: "C.D2",
    name: "Brand Card Grid",
    description: "Brand strategy card grid view",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/brand-card-grid.tsx",
  },
  {
    id: "C.D3",
    name: "Brand Detail Panel",
    description: "Brand detail slide-out panel",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/brand-detail-panel.tsx",
  },
  {
    id: "C.D4",
    name: "Alert Panel",
    description: "Dashboard alert notifications panel",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/alert-panel.tsx",
  },
  {
    id: "C.D5",
    name: "Agency KPI Bar",
    description: "Agency-wide KPI summary bar",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/dashboard/agency-kpi-bar.tsx",
  },
  // — Pillar Editors (C.E0 .. C.E5, C.E.H1 .. C.E.H2) —
  {
    id: "C.E0",
    name: "Pillar Editors Index",
    description: "Pillar editor registry/dispatcher",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/index.tsx",
  },
  {
    id: "C.E1",
    name: "Authenticite Editor",
    description: "Pillar A (Authenticité) editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/authenticite-editor.tsx",
  },
  {
    id: "C.E2",
    name: "Distinction Editor",
    description: "Pillar D (Distinction) editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/distinction-editor.tsx",
  },
  {
    id: "C.E3",
    name: "Valeur Editor",
    description: "Pillar V (Valeur) editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/valeur-editor.tsx",
  },
  {
    id: "C.E4",
    name: "Engagement Editor",
    description: "Pillar E (Engagement) editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/engagement-editor.tsx",
  },
  {
    id: "C.E5",
    name: "Track Editor",
    description: "Pillar T (Track) editor",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/track-editor.tsx",
  },
  {
    id: "C.E.H1",
    name: "Field Input",
    description: "Shared field input helper component",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/shared/field-input.tsx",
  },
  {
    id: "C.E.H2",
    name: "Field Array",
    description: "Shared dynamic array field component",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/pillar-editors/shared/field-array.tsx",
  },
  // — Import (C.IM1 .. C.IM2) —
  {
    id: "C.IM1",
    name: "File Upload Zone",
    description: "Drag-and-drop file upload zone",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/import/file-upload-zone.tsx",
  },
  {
    id: "C.IM2",
    name: "Variable Mapping Preview",
    description: "Imported variable mapping preview",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/import/variable-mapping-preview.tsx",
  },
  // — Layout (C.L1 .. C.L2) —
  {
    id: "C.L1",
    name: "Sidebar",
    description: "Main application sidebar navigation",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/layout/sidebar.tsx",
  },
  {
    id: "C.L2",
    name: "Mobile Nav",
    description: "Mobile navigation drawer",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/layout/mobile-nav.tsx",
  },
  // — Market Study (C.MS1 .. C.MS4) —
  {
    id: "C.MS1",
    name: "Market Study Dashboard",
    description: "Market study collection dashboard",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/market-study/market-study-dashboard.tsx",
  },
  {
    id: "C.MS2",
    name: "Source Status Card",
    description: "Data source status card",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/market-study/source-status-card.tsx",
  },
  {
    id: "C.MS3",
    name: "Manual Data Form",
    description: "Manual data entry form",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/market-study/manual-data-form.tsx",
  },
  {
    id: "C.MS4",
    name: "Synthesis Viewer",
    description: "Market study synthesis viewer",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/strategy/market-study/synthesis-viewer.tsx",
  },
  // — Ops (C.O1 .. C.O9) —
  {
    id: "C.O1",
    name: "Mission Board",
    description: "Mission management board",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/mission-board.tsx",
  },
  {
    id: "C.O2",
    name: "Mission Detail",
    description: "Mission detail view",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/mission-detail.tsx",
  },
  {
    id: "C.O3",
    name: "Freelance Portal",
    description: "Freelancer portal view",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/freelance-portal.tsx",
  },
  {
    id: "C.O4",
    name: "Client Portal",
    description: "Client portal view",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/client-portal.tsx",
  },
  {
    id: "C.O5",
    name: "Intervention Panel",
    description: "Freelance intervention panel",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/intervention-panel.tsx",
  },
  {
    id: "C.O6",
    name: "Cost Dashboard",
    description: "AI cost tracking dashboard",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/cost-dashboard.tsx",
  },
  {
    id: "C.O7",
    name: "Market Pricing Admin",
    description: "Market pricing administration",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/market-pricing-admin.tsx",
  },
  {
    id: "C.O8",
    name: "Debrief Form",
    description: "Mission debrief form",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/debrief-form.tsx",
  },
  {
    id: "C.O9",
    name: "Preset Manager",
    description: "Strategy preset configuration",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ops/preset-manager.tsx",
  },
  // — Providers (C.P1) —
  {
    id: "C.P1",
    name: "Session Provider",
    description: "NextAuth session provider wrapper",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/providers/session-provider.tsx",
  },
  // — UI (C.U1 .. C.U2) —
  {
    id: "C.U1",
    name: "Freshness Badge",
    description: "Data freshness indicator badge",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ui/freshness-badge.tsx",
  },
  {
    id: "C.U2",
    name: "Source Ref Tooltip",
    description: "Data source reference tooltip",
    category: MODULE_CATEGORIES.COMPONENT,
    path: "components/ui/source-ref-tooltip.tsx",
  },

  // =========================================================================
  // INFRA  (I.0 .. I.6)
  // =========================================================================
  {
    id: "I.0",
    name: "Database Client",
    description: "Database Client",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/db.ts",
  },
  {
    id: "I.1",
    name: "tRPC Root Router",
    description: "tRPC Root Router",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/api/root.ts",
  },
  {
    id: "I.2",
    name: "tRPC Configuration",
    description: "tRPC Configuration",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/api/trpc.ts",
  },
  {
    id: "I.3",
    name: "Role Guard Middleware",
    description: "Role Guard Middleware",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/api/middleware/role-guard.ts",
  },
  {
    id: "I.4",
    name: "White Label Middleware",
    description: "White Label Middleware",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/api/middleware/white-label.ts",
  },
  {
    id: "I.5",
    name: "Auth Index",
    description: "Auth Index",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/auth/index.ts",
  },
  {
    id: "I.6",
    name: "Auth Config",
    description: "Auth Config",
    category: MODULE_CATEGORIES.INFRA,
    path: "server/auth/config.ts",
  },

  // =========================================================================
  // LIB  (L.0 .. L.13, L.T1, L.T2)
  // =========================================================================
  {
    id: "L.0",
    name: "Utilities",
    description: "Utilities",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/utils.ts",
  },
  {
    id: "L.1",
    name: "Constants",
    description: "Constants",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/constants.ts",
  },
  {
    id: "L.2",
    name: "Interview Schema",
    description: "Interview Schema",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/interview-schema.ts",
  },
  {
    id: "L.3",
    name: "Pillar Schemas",
    description: "Pillar Schemas (Zod)",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/pillar-schemas.ts",
  },
  {
    id: "L.4",
    name: "Pillar Parsers",
    description: "Pillar Parsers",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/pillar-parsers.ts",
  },
  {
    id: "L.5",
    name: "Pillar Data Types",
    description: "Pillar Data Types",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/pillar-data.ts",
  },
  {
    id: "L.6",
    name: "Implementation Data",
    description: "Implementation Data",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/implementation-data.ts",
  },
  {
    id: "L.7",
    name: "Market Study Types",
    description: "Market Study Types",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/market-study.ts",
  },
  {
    id: "L.8",
    name: "Cockpit Widget Types",
    description: "Cockpit Widget Types",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/cockpit-widgets.ts",
  },
  {
    id: "L.9",
    name: "Module System Types",
    description: "Module System Types",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/module-system.ts",
  },
  {
    id: "L.10",
    name: "Integration Types",
    description: "Integration Types",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/integration.ts",
  },
  {
    id: "L.11",
    name: "Phase 1 Schemas",
    description: "Phase 1 Schemas",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/phase1-schemas.ts",
  },
  {
    id: "L.12",
    name: "Phase 2 Schemas",
    description: "Phase 2 Schemas",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/phase2-schemas.ts",
  },
  {
    id: "L.13",
    name: "Phase 3 Schemas",
    description: "Phase 3 Schemas",
    category: MODULE_CATEGORIES.LIB,
    path: "lib/types/phase3-schemas.ts",
  },
  {
    id: "L.T1",
    name: "tRPC Query Client",
    description: "tRPC Query Client",
    category: MODULE_CATEGORIES.LIB,
    path: "trpc/query-client.ts",
  },
  {
    id: "L.T2",
    name: "tRPC Server Client",
    description: "tRPC Server Client",
    category: MODULE_CATEGORIES.LIB,
    path: "trpc/server.ts",
  },

  // =========================================================================
  // PAGE  (P.0 .. P.20)
  // =========================================================================
  {
    id: "P.0",
    name: "Auth Layout",
    description: "Auth Layout",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/layout.tsx",
  },
  {
    id: "P.1",
    name: "Dashboard",
    description: "Dashboard",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/dashboard/page.tsx",
  },
  {
    id: "P.2",
    name: "Strategies List",
    description: "Strategies List",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategies/page.tsx",
  },
  {
    id: "P.3",
    name: "New Strategy",
    description: "New Strategy",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/new/page.tsx",
  },
  {
    id: "P.4",
    name: "Strategy Detail",
    description: "Strategy Detail",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/page.tsx",
  },
  {
    id: "P.5",
    name: "Cockpit",
    description: "Cockpit",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/cockpit/page.tsx",
  },
  {
    id: "P.6",
    name: "Generate",
    description: "Generate",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/generate/page.tsx",
  },
  {
    id: "P.7",
    name: "Presentation",
    description: "Presentation",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/presentation/page.tsx",
  },
  {
    id: "P.8",
    name: "Market Study",
    description: "Market Study",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/market-study/page.tsx",
  },
  {
    id: "P.9",
    name: "Pillar Edit",
    description: "Pillar Edit",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/pillar/[type]/edit/page.tsx",
  },
  {
    id: "P.10",
    name: "Document Detail",
    description: "Document Detail",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/strategy/[id]/document/[documentId]/page.tsx",
  },
  {
    id: "P.11",
    name: "Settings",
    description: "Settings",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/settings/page.tsx",
  },
  {
    id: "P.12",
    name: "Missions",
    description: "Missions",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/missions/page.tsx",
  },
  {
    id: "P.13",
    name: "Mission Detail",
    description: "Mission Detail",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/missions/[id]/page.tsx",
  },
  {
    id: "P.14",
    name: "Pricing",
    description: "Pricing",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/pricing/page.tsx",
  },
  {
    id: "P.15",
    name: "Costs",
    description: "Costs",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/costs/page.tsx",
  },
  {
    id: "P.16",
    name: "Market Intelligence",
    description: "Market Intelligence",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/market-intelligence/page.tsx",
  },
  {
    id: "P.17",
    name: "Presets",
    description: "Presets",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/presets/page.tsx",
  },
  {
    id: "P.18",
    name: "Freelance",
    description: "Freelance",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/freelance/page.tsx",
  },
  {
    id: "P.19",
    name: "Client",
    description: "Client",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/client/page.tsx",
  },
  {
    id: "P.20",
    name: "Admin",
    description: "Admin",
    category: MODULE_CATEGORIES.PAGE,
    path: "app/(auth)/admin/page.tsx",
  },

  // =========================================================================
  // ROUTE  (R.0 .. R.15, R.T)
  // =========================================================================
  {
    id: "R.0",
    name: "Auth",
    description: "Auth",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/auth/[...nextauth]/route.ts",
  },
  {
    id: "R.1",
    name: "AI Generation",
    description: "AI Generation",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/generate/route.ts",
  },
  {
    id: "R.2",
    name: "AI Fill Interview",
    description: "AI Fill Interview",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/fill-interview/route.ts",
  },
  {
    id: "R.3",
    name: "Fiche Upgrade",
    description: "Fiche Upgrade",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/upgrade-fiche/route.ts",
  },
  {
    id: "R.4",
    name: "AI Reports",
    description: "AI Reports",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/reports/route.ts",
  },
  {
    id: "R.5",
    name: "AI Templates",
    description: "AI Templates",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/templates/route.ts",
  },
  {
    id: "R.6",
    name: "Audit Apply",
    description: "Audit Apply",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/ai/audit-apply/route.ts",
  },
  {
    id: "R.7",
    name: "Market Study Collect",
    description: "Market Study Collect",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/market-study/collect/route.ts",
  },
  {
    id: "R.8",
    name: "Market Study Upload",
    description: "Market Study Upload",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/market-study/upload/route.ts",
  },
  {
    id: "R.9",
    name: "Export PDF",
    description: "Export PDF",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/export/pdf/route.ts",
  },
  {
    id: "R.10",
    name: "Export HTML",
    description: "Export HTML",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/export/html/route.ts",
  },
  {
    id: "R.10B",
    name: "Export HTML Preview",
    description: "Export HTML Preview",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/export/html/preview/route.ts",
  },
  {
    id: "R.11",
    name: "Export Excel",
    description: "Export Excel",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/export/excel/route.ts",
  },
  {
    id: "R.12",
    name: "Freetext",
    description: "Freetext",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/freetext/route.ts",
  },
  {
    id: "R.13",
    name: "Template",
    description: "Template",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/template/route.ts",
  },
  {
    id: "R.14",
    name: "Import",
    description: "Import",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/import/route.ts",
  },
  {
    id: "R.15",
    name: "Webhooks",
    description: "Webhooks",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/webhooks/[providerId]/route.ts",
  },
  {
    id: "R.T",
    name: "tRPC Handler",
    description: "tRPC Handler",
    category: MODULE_CATEGORIES.ROUTE,
    path: "app/api/trpc/[trpc]/route.ts",
  },

  // =========================================================================
  // ROUTER  (T.0 .. T.16)
  // =========================================================================
  {
    id: "T.0",
    name: "Auth Router",
    description: "Auth Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/auth.ts",
  },
  {
    id: "T.1",
    name: "Strategy Router",
    description: "Strategy Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/strategy.ts",
  },
  {
    id: "T.2",
    name: "Pillar Router",
    description: "Pillar Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/pillar.ts",
  },
  {
    id: "T.3",
    name: "Market Context Router",
    description: "Market Context Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/market-context.ts",
  },
  {
    id: "T.4",
    name: "Cockpit Router",
    description: "Cockpit Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/cockpit.ts",
  },
  {
    id: "T.5",
    name: "Widget Router",
    description: "Widget Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/widget.ts",
  },
  {
    id: "T.6",
    name: "Module Router",
    description: "Module Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/module.ts",
  },
  {
    id: "T.7",
    name: "Signal Router",
    description: "Signal Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/signal.ts",
  },
  {
    id: "T.8",
    name: "Decision Router",
    description: "Decision Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/decision.ts",
  },
  {
    id: "T.9",
    name: "Document Router",
    description: "Document Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/document.ts",
  },
  {
    id: "T.10",
    name: "Translation Router",
    description: "Translation Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/translation.ts",
  },
  {
    id: "T.11",
    name: "Mission Router",
    description: "Mission Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/mission.ts",
  },
  {
    id: "T.12",
    name: "Intervention Router",
    description: "Intervention Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/intervention.ts",
  },
  {
    id: "T.13",
    name: "Market Pricing Router",
    description: "Market Pricing Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/market-pricing-router.ts",
  },
  {
    id: "T.14",
    name: "Integration Router",
    description: "Integration Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/integration.ts",
  },
  {
    id: "T.15",
    name: "Analytics Router",
    description: "Analytics Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/analytics.ts",
  },
  {
    id: "T.16",
    name: "Market Study Router",
    description: "Market Study Router",
    category: MODULE_CATEGORIES.ROUTER,
    path: "server/api/routers/market-study.ts",
  },

  // =========================================================================
  // SERVICE  (MODULE 5 .. MODULE 25G)
  // =========================================================================
  {
    id: "MODULE 5",
    name: "Anthropic Client",
    description: "Anthropic Client",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/anthropic-client.ts",
  },
  {
    id: "MODULE 5B",
    name: "Prompt Helpers",
    description: "Prompt Helpers",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/prompt-helpers.ts",
  },
  {
    id: "MODULE 6",
    name: "Score Engine",
    description: "Score Engine (Unified Score Recalculation)",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/score-engine.ts",
  },
  {
    id: "MODULE 6A",
    name: "Coherence Calculator",
    description: "Coherence Score Calculator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/coherence-calculator.ts",
  },
  {
    id: "MODULE 6B",
    name: "Risk Calculator",
    description: "Risk Score Calculator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/risk-calculator.ts",
  },
  {
    id: "MODULE 6C",
    name: "BMF Calculator",
    description: "Brand-Market Fit (BMF) Score Calculator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/bmf-calculator.ts",
  },
  {
    id: "MODULE 6D",
    name: "Media Mix Calculator",
    description: "Media Mix Calculator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/media-mix-calculator.ts",
  },
  {
    id: "MODULE 7",
    name: "AI Generation",
    description: "AI Generation Engine (Pillars A-D-V-E + Synthese S)",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/ai-generation.ts",
  },
  {
    id: "MODULE 8",
    name: "Audit Generation",
    description: "Audit Generation Service (Pillars R + T)",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/audit-generation.ts",
  },
  {
    id: "MODULE 9",
    name: "Implementation Generation",
    description: "Implementation Generation (Pillar I)",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/implementation-generation.ts",
  },
  {
    id: "MODULE 10",
    name: "Fiche Upgrade",
    description: "Fiche Upgrade Service",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/fiche-upgrade.ts",
  },
  {
    id: "MODULE 11",
    name: "Budget Tier Generator",
    description: "Budget Tier Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/budget-tier-generator.ts",
  },
  {
    id: "MODULE 12",
    name: "Stale Detector",
    description: "Stale Detector",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/stale-detector.ts",
  },
  {
    id: "MODULE 13",
    name: "Track Sync",
    description: "Track Sync Service",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/track-sync.ts",
  },
  {
    id: "MODULE 14",
    name: "Widget Compute Engine",
    description: "Widget Compute Engine",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/compute-engine.ts",
  },
  {
    id: "MODULE 14R",
    name: "Widget Registry",
    description: "Widget Registry",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/registry.ts",
  },
  {
    id: "MODULE 14W1",
    name: "Superfan Tracker Widget",
    description: "Superfan Tracker Widget",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/implementations/superfan-tracker.ts",
  },
  {
    id: "MODULE 14W2",
    name: "Campaign Tracker Widget",
    description: "Campaign Tracker Widget",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/implementations/campaign-tracker.ts",
  },
  {
    id: "MODULE 14W3",
    name: "DA Visual Identity Widget",
    description: "DA Visual Identity Widget",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/implementations/da-visual-identity.ts",
  },
  {
    id: "MODULE 14W4",
    name: "Cost of Doing Business Widget",
    description: "Cost of Doing Business Widget",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/widgets/implementations/codb-calculator.ts",
  },
  {
    id: "MODULE 15",
    name: "Report Generation",
    description: "Report Generation Service",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/report-generation.ts",
  },
  {
    id: "MODULE 15A",
    name: "PDF Generator",
    description: "PDF Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/pdf-generator.ts",
  },
  {
    id: "MODULE 15B",
    name: "Excel Generator",
    description: "Excel Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/excel-generator.ts",
  },
  {
    id: "MODULE 15C",
    name: "HTML Presentation Generator",
    description: "HTML Presentation Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/html-presentation-generator.ts",
  },
  {
    id: "MODULE 15D",
    name: "Template Generation",
    description: "Template Generation Service",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/template-generation.ts",
  },
  {
    id: "MODULE 16",
    name: "File Parser",
    description: "File Parser",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/file-parser.ts",
  },
  {
    id: "MODULE 16B",
    name: "Variable Mapper",
    description: "Variable Mapper",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/variable-mapper.ts",
  },
  {
    id: "MODULE 17",
    name: "Signal Engine",
    description: "Signal Engine",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/signal-engine.ts",
  },
  {
    id: "MODULE 17B",
    name: "Intel Report Generator",
    description: "Intel Report Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/intel-report-generator.ts",
  },
  {
    id: "MODULE 18",
    name: "Mission Manager",
    description: "Mission Manager",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/mission-manager.ts",
  },
  {
    id: "MODULE 18B",
    name: "Intervention Handler",
    description: "Intervention Handler",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/intervention-handler.ts",
  },
  {
    id: "MODULE 19",
    name: "Market Pricing",
    description: "Market Pricing",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-pricing.ts",
  },
  {
    id: "MODULE 20",
    name: "Translation Generator",
    description: "Translation Generator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/translation-generator.ts",
  },
  {
    id: "MODULE 21",
    name: "Metric Monitor",
    description: "Metric Monitor",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/metric-monitor.ts",
  },
  {
    id: "MODULE 21B",
    name: "Freshness Checker",
    description: "Freshness Checker",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/freshness-checker.ts",
  },
  {
    id: "MODULE 22",
    name: "AI Cost Tracker",
    description: "AI Cost Tracker",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/ai-cost-tracker.ts",
  },
  {
    id: "MODULE 23",
    name: "Module Registry",
    description: "Module Registry",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/registry.ts",
  },
  {
    id: "MODULE 23.0",
    name: "Module System Index",
    description: "Module System Index",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/index.ts",
  },
  {
    id: "MODULE 23A",
    name: "Module Executor",
    description: "Module Executor",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/executor.ts",
  },
  {
    id: "MODULE 23B",
    name: "Module Input Resolver",
    description: "Module Input Resolver",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/input-resolver.ts",
  },
  {
    id: "MODULE 23C",
    name: "Module Output Applier",
    description: "Module Output Applier",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/output-applier.ts",
  },
  {
    id: "MODULE 23D",
    name: "Data Quality Scorer",
    description: "Data Quality Scorer",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/modules/implementations/data-quality-scorer.ts",
  },
  {
    id: "MODULE 24",
    name: "Integration Registry",
    description: "Integration Registry",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/integrations/registry.ts",
  },
  {
    id: "MODULE 24A",
    name: "Integration Crypto",
    description: "Integration Crypto",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/integrations/crypto.ts",
  },
  {
    id: "MODULE 24B",
    name: "Sync Orchestrator",
    description: "Sync Orchestrator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/integrations/sync-orchestrator.ts",
  },
  {
    id: "MODULE 25",
    name: "Market Study Collection",
    description: "Market Study Collection Orchestrator",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/collection-orchestrator.ts",
  },
  {
    id: "MODULE 25A",
    name: "Market Study Synthesis",
    description: "Market Study Synthesis",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/synthesis.ts",
  },
  {
    id: "MODULE 25B",
    name: "Base Market Data Adapter",
    description: "Base Market Data Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/base-adapter.ts",
  },
  {
    id: "MODULE 25C",
    name: "Brave Search Adapter",
    description: "Brave Search Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/brave-search.ts",
  },
  {
    id: "MODULE 25D",
    name: "AI Web Search Adapter",
    description: "AI Web Search Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/ai-web-search.ts",
  },
  {
    id: "MODULE 25E",
    name: "Google Trends Adapter",
    description: "Google Trends Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/google-trends.ts",
  },
  {
    id: "MODULE 25F",
    name: "Crunchbase Adapter",
    description: "Crunchbase Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/crunchbase.ts",
  },
  {
    id: "MODULE 25G",
    name: "SimilarWeb Adapter",
    description: "SimilarWeb Adapter",
    category: MODULE_CATEGORIES.SERVICE,
    path: "server/services/market-study/adapters/similarweb.ts",
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Look up a single module by its unique ID.
 * Returns `undefined` when no match is found.
 *
 * @example
 *   getModuleById("MODULE 7")   // => AI Generation entry
 *   getModuleById("C.K1")       // => Cockpit Share Dialog entry
 */
export function getModuleById(id: string): ModuleEntry | undefined {
  return MODULE_INDEX.find((m) => m.id === id);
}

/**
 * Return every module that belongs to the given category.
 *
 * @example
 *   getModulesByCategory("SERVICE")   // => all MODULE entries
 *   getModulesByCategory("COMPONENT") // => all C.* entries
 */
export function getModulesByCategory(category: string): ModuleEntry[] {
  return MODULE_INDEX.filter((m) => m.category === category);
}

// ---------------------------------------------------------------------------
// Summary stats (handy for tooling / dashboards)
// ---------------------------------------------------------------------------

export const MODULE_COUNTS = {
  TOTAL: MODULE_INDEX.length,
  SERVICE: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.SERVICE).length,
  ROUTE: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.ROUTE).length,
  ROUTER: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.ROUTER).length,
  INFRA: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.INFRA).length,
  LIB: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.LIB).length,
  COMPONENT: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.COMPONENT).length,
  PAGE: MODULE_INDEX.filter((m) => m.category === MODULE_CATEGORIES.PAGE).length,
} as const;
