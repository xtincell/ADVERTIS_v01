// =============================================================================
// LIB L.7 — Market Study Types
// =============================================================================
// Type definitions for the market study module that collects real market data
// to enrich Pillar T (Track) generation.
// Exports: MarketStudySynthesis, ConfidenceAnnotated<T>, DataPoint,
//   DataSourceName, SourceStatusMap, ManualDataEntry, BraveSearchData,
//   GoogleTrendsData, CrunchbaseData, SimilarWebData, AIWebSearchData,
//   CompetitorProfile, TrendItem, WeakSignal, CollectionParams,
//   DataSourceAdapter, CONFIDENCE_LABELS, SOURCE_DISPLAY.
// Used by: market-study router, data-source adapters, Track generator UI.
// =============================================================================

// ---------------------------------------------------------------------------
// Confidence & Data Points
// ---------------------------------------------------------------------------

/** Confidence level for each data point */
export type DataConfidence = "high" | "medium" | "low" | "ai_estimated";

/** A single data point with source attribution and confidence */
export interface DataPoint {
  value: string;
  source: DataSourceName;
  confidence: DataConfidence;
  retrievedAt: string; // ISO date
  query?: string; // The query/search that produced this data point
  url?: string; // Source URL if applicable
}

/** Available data source names */
export type DataSourceName =
  | "brave_search"
  | "google_trends"
  | "crunchbase"
  | "similarweb"
  | "ai_web_search"
  | "manual_internal"
  | "manual_external"
  | "manual_interview"
  | "ai_synthesis";

/** Status for each data source */
export type SourceStatus =
  | "pending"
  | "collecting"
  | "complete"
  | "partial"
  | "error"
  | "not_configured"
  | "skipped";

/** Per-source status record stored in MarketStudy.sourceStatuses */
export type SourceStatusMap = Partial<Record<DataSourceName, SourceStatus>>;

// ---------------------------------------------------------------------------
// Manual Data Entry
// ---------------------------------------------------------------------------

/** Category of manual data */
export type ManualDataCategory = "internal" | "external" | "interview";

/** Source type labels per category */
export const MANUAL_SOURCE_TYPES: Record<ManualDataCategory, string[]> = {
  internal: [
    "Données ventes",
    "CRM / Base clients",
    "Enquête satisfaction",
    "Données financières",
    "Analytics web/app",
    "Autre (interne)",
  ],
  external: [
    "Rapport sectoriel",
    "Étude de marché existante",
    "Article de presse",
    "Publication académique",
    "Données publiques (INSEE, Eurostat…)",
    "Autre (externe)",
  ],
  interview: [
    "Entretien client",
    "Entretien prospect",
    "Entretien expert métier",
    "Focus group",
    "Autre (entretien)",
  ],
};

/** A manually added data entry */
export interface ManualDataEntry {
  id: string;
  title: string;
  content: string;
  category: ManualDataCategory;
  sourceType: string;
  addedAt: string; // ISO date
}

/** Structure for manual data stored in MarketStudy.manualData */
export interface ManualDataStore {
  entries: ManualDataEntry[];
}

/** An uploaded file with extracted text */
export interface UploadedFileEntry {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // pdf, docx, xlsx, etc.
  extractedText: string;
  uploadedAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// Brave Search Results
// ---------------------------------------------------------------------------

export interface BraveSearchQuery {
  query: string;
  category: "market_size" | "trends" | "competitors" | "tam_sam" | "general";
  resultCount: number;
}

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string; // e.g. "2 days ago"
}

export interface BraveSearchData {
  queries: BraveSearchQuery[];
  results: Record<string, BraveSearchResult[]>; // keyed by query string
  collectedAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// Google Trends Data
// ---------------------------------------------------------------------------

export interface GoogleTrendsKeyword {
  keyword: string;
  category: "brand" | "sector" | "competitor";
}

export interface GoogleTrendsTimeline {
  keyword: string;
  data: Array<{ date: string; value: number }>; // 0-100 interest
}

export interface GoogleTrendsData {
  keywords: GoogleTrendsKeyword[];
  timelines: GoogleTrendsTimeline[];
  relatedQueries: Array<{ query: string; value: number }>;
  collectedAt: string;
}

// ---------------------------------------------------------------------------
// Crunchbase Data
// ---------------------------------------------------------------------------

export interface CrunchbaseCompany {
  name: string;
  description: string;
  foundedDate?: string;
  employeeCount?: string; // range like "51-100"
  totalFunding?: string; // formatted like "$5.2M"
  lastFundingRound?: string;
  lastFundingDate?: string;
  headquartersLocation?: string;
  categories?: string[];
  url?: string;
}

export interface CrunchbaseData {
  competitors: CrunchbaseCompany[];
  collectedAt: string;
}

// ---------------------------------------------------------------------------
// SimilarWeb Data
// ---------------------------------------------------------------------------

export interface SimilarWebSiteData {
  domain: string;
  globalRank?: number;
  countryRank?: number;
  monthlyVisits?: number;
  bounceRate?: number; // 0-1
  avgVisitDuration?: number; // seconds
  pagesPerVisit?: number;
  trafficSources?: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    mail: number;
    display: number;
  };
}

export interface SimilarWebData {
  sites: SimilarWebSiteData[];
  collectedAt: string;
}

// ---------------------------------------------------------------------------
// AI Web Search Results
// ---------------------------------------------------------------------------

export interface AIWebSearchQuery {
  query: string;
  purpose: string; // why this query was run
}

export interface AIWebSearchResult {
  query: string;
  synthesis: string; // AI-synthesized answer
  sources: Array<{ title: string; url: string }>;
  confidence: DataConfidence;
}

export interface AIWebSearchData {
  queries: AIWebSearchQuery[];
  results: AIWebSearchResult[];
  collectedAt: string;
}

// ---------------------------------------------------------------------------
// Market Study Synthesis (AI-generated from all sources)
// ---------------------------------------------------------------------------

export interface ConfidenceAnnotated<T = string> {
  data: T;
  sources: string[];
  confidence: DataConfidence;
}

export interface CompetitorProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
  source: string;
  confidence: DataConfidence;
  funding?: string;
  traffic?: string;
}

export interface TrendItem {
  trend: string;
  source: string;
  confidence: DataConfidence;
  timeframe?: string;
}

export interface WeakSignal {
  signal: string;
  source: string;
  confidence: DataConfidence;
  implication?: string;
}

export interface MarketDimension {
  value: string;
  description: string;
  source: string;
  confidence: DataConfidence;
  methodology?: string;
}

export interface MarketStudySynthesis {
  /** Total addressable market size */
  marketSize: ConfidenceAnnotated;

  /** Competitive landscape analysis */
  competitiveLandscape: {
    competitors: CompetitorProfile[];
    competitiveIntensity: ConfidenceAnnotated;
  };

  /** Macro trends affecting the market */
  macroTrends: {
    trends: TrendItem[];
  };

  /** Weak signals and emerging patterns */
  weakSignals: {
    signals: WeakSignal[];
  };

  /** Customer insights from collected data */
  customerInsights: ConfidenceAnnotated;

  /** TAM / SAM / SOM dimensioning */
  tamSamSom: {
    tam: MarketDimension;
    sam: MarketDimension;
    som: MarketDimension;
    methodology: string;
  };

  /** Identified data gaps that couldn't be filled */
  gaps: string[];

  /** Overall confidence score (0-100) across all data */
  overallConfidence: number;

  /** Summary of sources used */
  sourceSummary: {
    totalDataPoints: number;
    bySource: Record<string, number>;
    byConfidence: Record<DataConfidence, number>;
  };
}

// ---------------------------------------------------------------------------
// Collection Orchestrator Types
// ---------------------------------------------------------------------------

export interface CollectionParams {
  brandName: string;
  sector: string;
  competitors: string[]; // From D2 (competitive landscape)
  keywords: string[]; // Brand + sector keywords
  country?: string;
  language?: string;
}

export interface CollectionResult {
  success: boolean;
  data: unknown;
  dataPointCount: number;
  error?: string;
  duration?: number; // ms
}

export interface DataSourceAdapter {
  /** Human-readable name */
  name: string;
  /** Source identifier */
  sourceId: DataSourceName;
  /** Check if this adapter is configured (env vars present) */
  isConfigured(): boolean;
  /** Run data collection */
  collect(params: CollectionParams): Promise<CollectionResult>;
}

// ---------------------------------------------------------------------------
// UI Display Helpers
// ---------------------------------------------------------------------------

export const CONFIDENCE_LABELS: Record<DataConfidence, string> = {
  high: "Confiance élevée",
  medium: "Confiance moyenne",
  low: "Confiance faible",
  ai_estimated: "Estimation IA",
};

export const CONFIDENCE_COLORS: Record<
  DataConfidence,
  { bg: string; text: string; border: string }
> = {
  high: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  medium: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  low: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  ai_estimated: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200 border-dashed",
  },
};

export const SOURCE_DISPLAY: Record<
  DataSourceName,
  { label: string; icon: string; description: string }
> = {
  brave_search: {
    label: "Brave Search",
    icon: "Search",
    description: "Recherche web multi-requêtes (marché, concurrents, tendances)",
  },
  google_trends: {
    label: "Google Trends",
    icon: "TrendingUp",
    description: "Tendances de recherche pour mots-clés marque/secteur",
  },
  crunchbase: {
    label: "Crunchbase",
    icon: "Building2",
    description: "Données concurrents (funding, taille, description)",
  },
  similarweb: {
    label: "SimilarWeb",
    icon: "Globe",
    description: "Trafic web concurrents (visites, bounce, sources)",
  },
  ai_web_search: {
    label: "AI Web Search",
    icon: "Bot",
    description: "Recherche IA augmentée — comble les lacunes des autres sources",
  },
  manual_internal: {
    label: "Données internes",
    icon: "Database",
    description: "CRM, ventes, analytics, enquêtes",
  },
  manual_external: {
    label: "Données externes",
    icon: "FileText",
    description: "Rapports sectoriels, études existantes, presse",
  },
  manual_interview: {
    label: "Entretiens",
    icon: "Users",
    description: "Clients, prospects, experts métier",
  },
  ai_synthesis: {
    label: "Synthèse IA",
    icon: "Sparkles",
    description: "Synthèse et estimation par intelligence artificielle",
  },
};
