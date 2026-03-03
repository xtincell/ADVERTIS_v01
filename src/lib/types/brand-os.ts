// =============================================================================
// TYPES — Brand OS (Retainer Portal)
// Type definitions for the living brand operating system.
// =============================================================================

// ---------------------------------------------------------------------------
// Cult Index
// ---------------------------------------------------------------------------

export interface CultIndexWeights {
  engagementDepth: number;    // default 0.25
  superfanVelocity: number;   // default 0.20
  communityCohesion: number;  // default 0.15
  brandDefenseRate: number;   // default 0.15
  ugcGenerationRate: number;  // default 0.10
  ritualAdoption: number;     // default 0.10
  evangelismScore: number;    // default 0.05
}

export const DEFAULT_CULT_WEIGHTS: CultIndexWeights = {
  engagementDepth: 0.25,
  superfanVelocity: 0.20,
  communityCohesion: 0.15,
  brandDefenseRate: 0.15,
  ugcGenerationRate: 0.10,
  ritualAdoption: 0.10,
  evangelismScore: 0.05,
};

export interface CultIndexBreakdown {
  cultIndex: number;
  engagementDepth: number;
  superfanVelocity: number;
  communityCohesion: number;
  brandDefenseRate: number;
  ugcGenerationRate: number;
  ritualAdoption: number;
  evangelismScore: number;
  superfanCount: number;
  totalCommunity: number;
}

export type CultTier =
  | "GHOST"      // 0-20
  | "FUNCTIONAL" // 21-40
  | "LOVED"      // 41-60
  | "EMERGING"   // 61-80
  | "CULT";      // 81-100

export const CULT_TIERS: Record<CultTier, { label: string; labelFr: string; min: number; max: number; color: string; description: string }> = {
  GHOST:      { label: "Ghost Brand",      labelFr: "Marque fantôme",         min: 0,  max: 20,  color: "#6b7280", description: "Existe mais personne ne s'en soucie" },
  FUNCTIONAL: { label: "Functional Brand", labelFr: "Marque fonctionnelle",   min: 21, max: 40,  color: "#ef4444", description: "On achète par habitude" },
  LOVED:      { label: "Loved Brand",      labelFr: "Marque aimée",           min: 41, max: 60,  color: "#f59e0b", description: "Préférence active" },
  EMERGING:   { label: "Emerging Cult",    labelFr: "Culte émergent",         min: 61, max: 80,  color: "#22c55e", description: "Les fans commencent à évangéliser" },
  CULT:       { label: "Cult Brand",       labelFr: "Marque culte",           min: 81, max: 100, color: "#10b981", description: "La communauté vit pour la marque" },
};

export function getCultTier(score: number): CultTier {
  if (score <= 20) return "GHOST";
  if (score <= 40) return "FUNCTIONAL";
  if (score <= 60) return "LOVED";
  if (score <= 80) return "EMERGING";
  return "CULT";
}

// ---------------------------------------------------------------------------
// Superfan Segments
// ---------------------------------------------------------------------------

export type SuperfanSegment = "AUDIENCE" | "FOLLOWER" | "ENGAGED" | "FAN" | "SUPERFAN" | "EVANGELIST";

export const SUPERFAN_SEGMENTS: Record<SuperfanSegment, { label: string; labelFr: string; color: string; icon: string; description: string }> = {
  AUDIENCE:   { label: "Audience",    labelFr: "Audience",       color: "#94a3b8", icon: "Eye",          description: "A vu la marque" },
  FOLLOWER:   { label: "Follower",    labelFr: "Abonné",        color: "#60a5fa", icon: "UserPlus",     description: "Suit la marque" },
  ENGAGED:    { label: "Engaged",     labelFr: "Engagé",        color: "#a78bfa", icon: "Heart",        description: "Interagit régulièrement" },
  FAN:        { label: "Fan",         labelFr: "Fan",           color: "#f472b6", icon: "Star",         description: "Achète et recommande" },
  SUPERFAN:   { label: "Superfan",    labelFr: "Superfan",      color: "#fb923c", icon: "Flame",        description: "Défend et évangélise" },
  EVANGELIST: { label: "Evangelist",  labelFr: "Évangéliste",   color: "#fbbf24", icon: "Crown",        description: "Crée du contenu et recrute" },
};

export const FUNNEL_ORDER: SuperfanSegment[] = ["AUDIENCE", "FOLLOWER", "ENGAGED", "FAN", "SUPERFAN", "EVANGELIST"];

// ---------------------------------------------------------------------------
// Social Channels
// ---------------------------------------------------------------------------

export type SocialPlatform = "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "TWITTER" | "YOUTUBE" | "LINKEDIN";

export type ChannelCategory = "SOCIAL" | "OWNED" | "EARNED" | "PAID";

export type ChannelHealthStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "DORMANT" | "UNKNOWN";

export const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; color: string; icon: string }> = {
  INSTAGRAM: { label: "Instagram", color: "#E4405F", icon: "Instagram" },
  FACEBOOK:  { label: "Facebook",  color: "#1877F2", icon: "Facebook" },
  TIKTOK:    { label: "TikTok",    color: "#000000", icon: "Music2" },
  TWITTER:   { label: "X (Twitter)", color: "#1DA1F2", icon: "Twitter" },
  YOUTUBE:   { label: "YouTube",   color: "#FF0000", icon: "Youtube" },
  LINKEDIN:  { label: "LinkedIn",  color: "#0A66C2", icon: "Linkedin" },
};

export const CHANNEL_HEALTH_CONFIG: Record<ChannelHealthStatus, { label: string; color: string; bgClass: string }> = {
  HEALTHY:  { label: "En forme",    color: "#22c55e", bgClass: "bg-green-500/10" },
  WARNING:  { label: "Attention",   color: "#f59e0b", bgClass: "bg-amber-500/10" },
  CRITICAL: { label: "Critique",    color: "#ef4444", bgClass: "bg-red-500/10" },
  DORMANT:  { label: "Dormant",     color: "#6b7280", bgClass: "bg-zinc-500/10" },
  UNKNOWN:  { label: "Inconnu",     color: "#94a3b8", bgClass: "bg-zinc-500/10" },
};

// ---------------------------------------------------------------------------
// Action Items
// ---------------------------------------------------------------------------

export type ActionCategory = "CONTENT" | "COMMUNITY" | "PAID" | "CRISIS" | "OPTIMIZATION" | "PARTNERSHIP";

export const ACTION_CATEGORIES: Record<ActionCategory, { label: string; color: string; icon: string }> = {
  CONTENT:      { label: "Contenu",       color: "#8B5CF6", icon: "PenTool" },
  COMMUNITY:    { label: "Communauté",    color: "#3B82F6", icon: "Users" },
  PAID:         { label: "Paid Media",    color: "#F59E0B", icon: "DollarSign" },
  CRISIS:       { label: "Crise",         color: "#EF4444", icon: "AlertTriangle" },
  OPTIMIZATION: { label: "Optimisation",  color: "#22C55E", icon: "TrendingUp" },
  PARTNERSHIP:  { label: "Partenariat",   color: "#EC4899", icon: "Handshake" },
};

// ---------------------------------------------------------------------------
// Opportunity Types
// ---------------------------------------------------------------------------

export type OpportunityType = "TRENDING_TOPIC" | "COMPETITOR_GAP" | "CULTURAL_MOMENT" | "PARTNERSHIP" | "MEDIA_WINDOW" | "UGC_TRIGGER";

export const OPPORTUNITY_TYPES: Record<OpportunityType, { label: string; labelFr: string; color: string; icon: string }> = {
  TRENDING_TOPIC:  { label: "Trending Topic",   labelFr: "Sujet tendance",        color: "#8B5CF6", icon: "TrendingUp" },
  COMPETITOR_GAP:  { label: "Competitor Gap",    labelFr: "Brèche concurrentielle", color: "#EF4444", icon: "Target" },
  CULTURAL_MOMENT: { label: "Cultural Moment",  labelFr: "Moment culturel",        color: "#F59E0B", icon: "Calendar" },
  PARTNERSHIP:     { label: "Partnership",       labelFr: "Partenariat",            color: "#EC4899", icon: "Handshake" },
  MEDIA_WINDOW:    { label: "Media Window",      labelFr: "Fenêtre média",          color: "#3B82F6", icon: "Megaphone" },
  UGC_TRIGGER:     { label: "UGC Trigger",       labelFr: "Déclencheur UGC",        color: "#22C55E", icon: "Camera" },
};

// ---------------------------------------------------------------------------
// Brand OS Views
// ---------------------------------------------------------------------------

export type BrandOSView = "nucleus" | "pulse" | "touchpoints" | "actions" | "opportunities" | "strategy-lab" | "glory-feed" | "risk-radar" | "bridge";

export const BRAND_OS_VIEWS: Record<BrandOSView, { label: string; description: string; icon: string; color: string }> = {
  nucleus:        { label: "Nucleus",        description: "Superfans & Cult Index",         icon: "Atom",          color: "#F59E0B" },
  pulse:          { label: "Pulse",          description: "Santé communauté",               icon: "Activity",      color: "#EF4444" },
  touchpoints:    { label: "Touchpoints",    description: "Points de contact",              icon: "Radio",         color: "#3B82F6" },
  actions:        { label: "Actions",        description: "Centre de commande",             icon: "Zap",           color: "#8B5CF6" },
  opportunities:  { label: "Opportunités",   description: "Radar d'opportunités",           icon: "Radar",         color: "#22C55E" },
  "strategy-lab": { label: "Strategy Lab",   description: "Simulateur budget",              icon: "FlaskConical",  color: "#EC4899" },
  "glory-feed":   { label: "Glory Feed",     description: "Production créative",            icon: "Sparkles",      color: "#F97316" },
  "risk-radar":   { label: "Risk Radar",     description: "Veille & protection",            icon: "ShieldAlert",   color: "#DC2626" },
  bridge:         { label: "Bridge",         description: "Vue Executive",                  icon: "LayoutDashboard", color: "#6366F1" },
};
