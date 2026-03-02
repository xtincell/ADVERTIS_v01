// =============================================================================
// LIB L.14 — Deliverable Schemas (Zod)
// =============================================================================
// Zod validation schemas for UPGRADERS deliverables (Phase 5).
// Covers: BigIdeaKit, CreativeStrategy, OperationalBudget, ChronoTask,
// Partner, MarketAdaptation, FunnelMapping, QualityChecklist.
// Used by: deliverables tRPC router, cockpit section components, AI generator.
// =============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const PRIORITIES = ["P0", "P1", "P2"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PARTNER_TYPES = ["INFLUENCER", "TERRAIN", "INSTITUTIONAL", "MEDIA"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  INFLUENCER: "Influenceur",
  TERRAIN: "Terrain / Activation",
  INSTITUTIONAL: "Institutionnel / ONG",
  MEDIA: "Média",
};

export const CHRONO_PHASES = ["Préparation", "Lancement", "Activation", "Bilan"] as const;
export type ChronoPhase = (typeof CHRONO_PHASES)[number];

export const TASK_STATUSES = ["pending", "in_progress", "done", "blocked"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const FUNNEL_STAGES = ["awareness", "consideration", "conversion", "loyalty"] as const;
export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  awareness: "Notoriété",
  consideration: "Considération",
  conversion: "Conversion",
  loyalty: "Fidélisation",
};

// ---------------------------------------------------------------------------
// T04 — Big Idea Kit
// ---------------------------------------------------------------------------

export const BigIdeaItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  concept: z.string(),
  copy: z.string().optional(),
  visual: z.string().optional(),
  priority: z.enum(PRIORITIES).default("P1"),
  funnelStage: z.enum(FUNNEL_STAGES).optional(),
});
export type BigIdeaItem = z.infer<typeof BigIdeaItemSchema>;

export const BigIdeaFunnelMappingSchema = z.object({
  awareness: z.array(z.string()).default([]),
  consideration: z.array(z.string()).default([]),
  conversion: z.array(z.string()).default([]),
  loyalty: z.array(z.string()).default([]),
});

export const CreateBigIdeaKitSchema = z.object({
  strategyId: z.string().min(1),
  occasion: z.string().min(1).max(200),
  insight: z.string().optional(),
  ideas: z.array(BigIdeaItemSchema).default([]),
  funnelMapping: BigIdeaFunnelMappingSchema.optional(),
  status: z.enum(["draft", "review", "approved"]).default("draft"),
  generatedBy: z.enum(["manual", "ai"]).default("manual"),
});
export type CreateBigIdeaKitInput = z.infer<typeof CreateBigIdeaKitSchema>;

export const UpdateBigIdeaKitSchema = z.object({
  id: z.string().min(1),
  occasion: z.string().min(1).max(200).optional(),
  insight: z.string().optional(),
  ideas: z.array(BigIdeaItemSchema).optional(),
  funnelMapping: BigIdeaFunnelMappingSchema.optional(),
  status: z.enum(["draft", "review", "approved"]).optional(),
});
export type UpdateBigIdeaKitInput = z.infer<typeof UpdateBigIdeaKitSchema>;

// ---------------------------------------------------------------------------
// T06 — Creative Strategy
// ---------------------------------------------------------------------------

export const CreativeStrategyDataSchema = z.object({
  moodboard: z.array(z.object({
    url: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  })).default([]),
  keyVisual: z.object({
    description: z.string().default(""),
    elements: z.array(z.string()).default([]),
    colorPalette: z.array(z.string()).default([]),
  }).default({}),
  graphicSystem: z.object({
    typography: z.string().default(""),
    colorCodes: z.array(z.object({
      name: z.string(),
      hex: z.string(),
      usage: z.string().optional(),
    })).default([]),
    guidelines: z.array(z.string()).default([]),
  }).default({}),
  manifesto: z.string().default(""),
  copiesByChannel: z.array(z.object({
    channel: z.string(),
    headline: z.string(),
    body: z.string().optional(),
    cta: z.string().optional(),
    format: z.string().optional(),
  })).default([]),
  tonalGuidelines: z.object({
    tone: z.string().default(""),
    doList: z.array(z.string()).default([]),
    dontList: z.array(z.string()).default([]),
  }).default({}),
});
export type CreativeStrategyData = z.infer<typeof CreativeStrategyDataSchema>;

export const UpsertCreativeStrategySchema = z.object({
  strategyId: z.string().min(1),
  content: CreativeStrategyDataSchema,
  status: z.enum(["draft", "review", "approved"]).default("draft"),
});
export type UpsertCreativeStrategyInput = z.infer<typeof UpsertCreativeStrategySchema>;

// ---------------------------------------------------------------------------
// M1 — Operational Budget (3 layers)
// ---------------------------------------------------------------------------

export const BudgetLayer1Schema = z.object({
  phases: z.array(z.object({
    name: z.string(),
    allocation: z.number(),
    percentage: z.number(),
  })).default([]),
  totalBudget: z.number().default(0),
  decisionView: z.string().default(""),
});

export const BudgetLayer2Schema = z.object({
  activations: z.array(z.object({
    name: z.string(),
    category: z.string(),
    unitCost: z.number(),
    quantity: z.number(),
    subtotal: z.number(),
    supplier: z.string().optional(),
    market: z.string().optional(),
  })).default([]),
});

export const BudgetLayer3Schema = z.object({
  P0: z.object({
    items: z.array(z.object({ name: z.string(), cost: z.number() })).default([]),
    total: z.number().default(0),
  }).default({}),
  P1: z.object({
    items: z.array(z.object({ name: z.string(), cost: z.number() })).default([]),
    total: z.number().default(0),
  }).default({}),
  P2: z.object({
    items: z.array(z.object({ name: z.string(), cost: z.number() })).default([]),
    total: z.number().default(0),
  }).default({}),
  grandTotal: z.number().default(0),
});

export const UpsertOperationalBudgetSchema = z.object({
  strategyId: z.string().min(1),
  layer1Vision: BudgetLayer1Schema,
  layer2Detail: BudgetLayer2Schema,
  layer3Scenarios: BudgetLayer3Schema,
  currency: z.string().default("XAF"),
});
export type UpsertOperationalBudgetInput = z.infer<typeof UpsertOperationalBudgetSchema>;

// ---------------------------------------------------------------------------
// M2 — Chrono-Architecture (tasks)
// ---------------------------------------------------------------------------

export const CreateChronoTaskSchema = z.object({
  strategyId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  week: z.number().int().min(1),
  phase: z.enum(CHRONO_PHASES),
  owner: z.string().optional(),
  status: z.enum(TASK_STATUSES).default("pending"),
  priority: z.enum(PRIORITIES).default("P1"),
  dependencies: z.array(z.string()).default([]),
  isValidationMilestone: z.boolean().default(false),
});
export type CreateChronoTaskInput = z.infer<typeof CreateChronoTaskSchema>;

export const UpdateChronoTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  week: z.number().int().min(1).optional(),
  phase: z.enum(CHRONO_PHASES).optional(),
  owner: z.string().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  dependencies: z.array(z.string()).optional(),
  isValidationMilestone: z.boolean().optional(),
});
export type UpdateChronoTaskInput = z.infer<typeof UpdateChronoTaskSchema>;

// ---------------------------------------------------------------------------
// M3 — Partner Directory
// ---------------------------------------------------------------------------

export const CreatePartnerSchema = z.object({
  strategyId: z.string().min(1),
  name: z.string().min(1).max(200),
  type: z.enum(PARTNER_TYPES),
  category: z.string().optional(),
  metrics: z.object({
    followers: z.number().optional(),
    engagementRate: z.number().optional(),
    reach: z.number().optional(),
    pastCollabs: z.number().optional(),
    audienceDemo: z.string().optional(),
  }).optional(),
  costEstimate: z.number().optional(),
  currency: z.string().default("XAF"),
  market: z.string().optional(),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    social: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(["prospect", "contacted", "confirmed", "active"]).default("prospect"),
});
export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;

export const UpdatePartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  type: z.enum(PARTNER_TYPES).optional(),
  category: z.string().optional(),
  metrics: z.object({
    followers: z.number().optional(),
    engagementRate: z.number().optional(),
    reach: z.number().optional(),
    pastCollabs: z.number().optional(),
    audienceDemo: z.string().optional(),
  }).optional(),
  costEstimate: z.number().optional(),
  currency: z.string().optional(),
  market: z.string().optional(),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    social: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(["prospect", "contacted", "confirmed", "active"]).optional(),
});
export type UpdatePartnerInput = z.infer<typeof UpdatePartnerSchema>;

// ---------------------------------------------------------------------------
// M5 — Market Adaptation
// ---------------------------------------------------------------------------

export const MarketAdaptationDimensionSchema = z.object({
  language: z.string().optional(),
  dialect: z.string().optional(),
  adaptations: z.array(z.string()).default([]),
  translations: z.array(z.object({
    original: z.string(),
    adapted: z.string(),
    note: z.string().optional(),
  })).default([]),
});

export const CulturalDimensionSchema = z.object({
  taboos: z.array(z.string()).default([]),
  celebrations: z.array(z.string()).default([]),
  localInsights: z.array(z.string()).default([]),
  colorMeaning: z.array(z.object({
    color: z.string(),
    meaning: z.string(),
  })).default([]),
});

export const DistributionDimensionSchema = z.object({
  channels: z.array(z.string()).default([]),
  partnerships: z.array(z.string()).default([]),
  logistics: z.string().default(""),
});

export const MediaDimensionSchema = z.object({
  topChannels: z.array(z.string()).default([]),
  mediaHabits: z.string().default(""),
  digitalPenetration: z.number().optional(),
  costs: z.array(z.object({
    channel: z.string(),
    cost: z.number(),
    unit: z.string(),
  })).default([]),
});

export const RegulatoryDimensionSchema = z.object({
  restrictions: z.array(z.string()).default([]),
  requiredMentions: z.array(z.string()).default([]),
  approvalProcess: z.string().default(""),
});

export const UpsertMarketAdaptationSchema = z.object({
  strategyId: z.string().min(1),
  country: z.string().min(1).max(5),
  linguistic: MarketAdaptationDimensionSchema,
  cultural: CulturalDimensionSchema,
  distribution: DistributionDimensionSchema,
  media: MediaDimensionSchema,
  regulatory: RegulatoryDimensionSchema,
});
export type UpsertMarketAdaptationInput = z.infer<typeof UpsertMarketAdaptationSchema>;

// ---------------------------------------------------------------------------
// M7 — Funnel Mapping
// ---------------------------------------------------------------------------

export const FunnelStageDataSchema = z.object({
  objectives: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  kpis: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    source: z.string().optional(),
  })).default([]),
  bigIdeas: z.array(z.string()).default([]),
});

export const FunnelMappingContentSchema = z.object({
  stages: z.object({
    awareness: FunnelStageDataSchema.default({}),
    consideration: FunnelStageDataSchema.default({}),
    conversion: FunnelStageDataSchema.default({}),
    loyalty: FunnelStageDataSchema.default({}),
  }).default({}),
  bigIdeaMatrix: z.array(z.object({
    ideaId: z.string(),
    ideaTitle: z.string(),
    stages: z.array(z.enum(FUNNEL_STAGES)),
    priority: z.enum(PRIORITIES).optional(),
  })).default([]),
  decisionMatrix: z.array(z.object({
    activation: z.string(),
    cost: z.number().optional(),
    impact: z.string().optional(),
    priority: z.enum(PRIORITIES).optional(),
    stage: z.enum(FUNNEL_STAGES),
  })).default([]),
});
export type FunnelMappingContent = z.infer<typeof FunnelMappingContentSchema>;

export const UpsertFunnelMappingSchema = z.object({
  strategyId: z.string().min(1),
  content: FunnelMappingContentSchema,
});
export type UpsertFunnelMappingInput = z.infer<typeof UpsertFunnelMappingSchema>;

// ---------------------------------------------------------------------------
// Quality Checklist
// ---------------------------------------------------------------------------

export const QualityChecklistItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  label: z.string(),
  checked: z.boolean().default(false),
  comment: z.string().optional(),
  checkedBy: z.string().optional(),
  checkedAt: z.string().optional(),
});
export type QualityChecklistItem = z.infer<typeof QualityChecklistItemSchema>;

export const UpsertQualityChecklistSchema = z.object({
  strategyId: z.string().min(1),
  items: z.array(QualityChecklistItemSchema),
  overallScore: z.number().min(0).max(100).optional(),
});
export type UpsertQualityChecklistInput = z.infer<typeof UpsertQualityChecklistSchema>;

// ---------------------------------------------------------------------------
// Default checklist categories (for seeding)
// ---------------------------------------------------------------------------

export const DEFAULT_CHECKLIST_CATEGORIES = [
  {
    category: "Stratégie",
    items: [
      "Objectifs SMART définis",
      "Cibles identifiées avec personas",
      "Positionnement différenciant validé",
      "Messages clés par pilier ADVE",
      "KPIs par étape funnel définis",
    ],
  },
  {
    category: "Créatif",
    items: [
      "Key Visual validé",
      "Système graphique documenté",
      "Copies adaptées par canal",
      "Déclinaisons multi-formats prêtes",
      "Charte tonale respectée",
    ],
  },
  {
    category: "Média & Distribution",
    items: [
      "Plan média chiffré (CPM/CPC)",
      "Mix paid/owned/earned défini",
      "Planning de diffusion calé",
      "Budgets par canal alloués",
      "Tracking & UTM configurés",
    ],
  },
  {
    category: "Production",
    items: [
      "Livrables listés avec deadlines",
      "Partenaires/prestataires confirmés",
      "Brief technique validé",
      "BAT / preuves approuvés",
      "Stock matériel vérifié",
    ],
  },
  {
    category: "Opérationnel",
    items: [
      "Chronogramme validé par équipe",
      "Budget 3 couches bouclé",
      "Jalons de validation positionnés",
      "Plan B identifié (risques)",
      "Reporting post-campagne planifié",
    ],
  },
] as const;
