// =============================================================================
// SERVICE S.GLORY.2 — Glory Context Builder
// =============================================================================
// Extracts and formats ADVERTIS strategy data for use in GLORY tool prompts.
// Loads strategy + required pillars and builds a structured text context.
// Called by: glory/generation.ts
// Dependencies: ~/server/db, ~/lib/types/pillar-parsers
// =============================================================================

import { db } from "~/server/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyMeta {
  brandName: string;
  sector: string | null;
  tagline: string | null;
  vertical: string | null;
  maturityProfile: string | null;
  currency: string;
}

interface ContextResult {
  context: string;
  strategy: StrategyMeta;
}

// ---------------------------------------------------------------------------
// Pillar label map
// ---------------------------------------------------------------------------

const PILLAR_LABELS: Record<string, string> = {
  A: "AUTHENTICITÉ",
  D: "DIFFÉRENCIATION",
  V: "VALEUR",
  E: "EXPÉRIENCE",
  R: "RISQUES",
  T: "TRACTION",
  I: "IMPLÉMENTATION",
  S: "SYNTHÈSE",
};

// ---------------------------------------------------------------------------
// Safe JSON content accessor
// ---------------------------------------------------------------------------

function safeGet(content: unknown, key: string): unknown {
  if (content && typeof content === "object" && key in (content as Record<string, unknown>)) {
    return (content as Record<string, unknown>)[key];
  }
  return undefined;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function formatSection(label: string, value: unknown): string {
  if (value === null || value === undefined) return "";
  return `${label} : ${formatValue(value)}\n`;
}

// ---------------------------------------------------------------------------
// Pillar-specific extractors
// ---------------------------------------------------------------------------

function extractPillarA(content: unknown): string {
  const lines: string[] = [];
  const identite = safeGet(content, "identite");
  const archetype = safeGet(content, "archetype");
  const noyau = safeGet(content, "noyauIdentitaire");
  const heros = safeGet(content, "herosJourney");
  const ikigai = safeGet(content, "ikigai");

  if (archetype) lines.push(formatSection("Archétype", archetype));
  if (identite) lines.push(formatSection("Identité", identite));
  if (noyau) lines.push(formatSection("Noyau identitaire", noyau));
  if (heros) lines.push(formatSection("Parcours du héros", heros));
  if (ikigai) lines.push(formatSection("Ikigai", ikigai));

  return lines.join("");
}

function extractPillarD(content: unknown): string {
  const lines: string[] = [];
  const positionnement = safeGet(content, "positionnement");
  const personas = safeGet(content, "personas");
  const concurrents = safeGet(content, "concurrents");

  if (positionnement) lines.push(formatSection("Positionnement", positionnement));
  if (personas) lines.push(formatSection("Personas", personas));
  if (concurrents) lines.push(formatSection("Concurrents", concurrents));

  return lines.join("");
}

function extractPillarV(content: unknown): string {
  const lines: string[] = [];
  const proposition = safeGet(content, "propositionValeur");
  const unitEconomics = safeGet(content, "unitEconomics");
  const pricing = safeGet(content, "pricing");

  if (proposition) lines.push(formatSection("Proposition de valeur", proposition));
  if (unitEconomics) lines.push(formatSection("Unit Economics", unitEconomics));
  if (pricing) lines.push(formatSection("Pricing", pricing));

  return lines.join("");
}

function extractPillarE(content: unknown): string {
  const lines: string[] = [];
  const touchpoints = safeGet(content, "touchpoints");
  const rituels = safeGet(content, "rituels");
  const aarrr = safeGet(content, "aarrr");
  const community = safeGet(content, "communityModel");

  if (touchpoints) lines.push(formatSection("Touchpoints", touchpoints));
  if (rituels) lines.push(formatSection("Rituels", rituels));
  if (aarrr) lines.push(formatSection("AARRR", aarrr));
  if (community) lines.push(formatSection("Modèle communautaire", community));

  return lines.join("");
}

function extractPillarR(content: unknown): string {
  const lines: string[] = [];
  const riskScore = safeGet(content, "riskScore");
  const globalSwot = safeGet(content, "globalSwot");
  const microSwots = safeGet(content, "microSwots");

  if (riskScore) lines.push(formatSection("Score de risque", riskScore));
  if (globalSwot) lines.push(formatSection("SWOT global", globalSwot));
  if (microSwots) lines.push(formatSection("Micro-SWOTs", microSwots));

  return lines.join("");
}

function extractPillarT(content: unknown): string {
  const lines: string[] = [];
  const bmf = safeGet(content, "brandMarketFitScore");
  const tam = safeGet(content, "tamSamSom");
  const market = safeGet(content, "marketReality");

  if (bmf) lines.push(formatSection("Brand-Market Fit Score", bmf));
  if (tam) lines.push(formatSection("TAM / SAM / SOM", tam));
  if (market) lines.push(formatSection("Réalité marché", market));

  return lines.join("");
}

function extractPillarI(content: unknown): string {
  const lines: string[] = [];
  const roadmap = safeGet(content, "roadmap");
  const budget = safeGet(content, "budget");
  const equipe = safeGet(content, "equipe");

  if (roadmap) lines.push(formatSection("Roadmap", roadmap));
  if (budget) lines.push(formatSection("Budget", budget));
  if (equipe) lines.push(formatSection("Équipe", equipe));

  return lines.join("");
}

function extractPillarS(content: unknown): string {
  const lines: string[] = [];
  const synthese = safeGet(content, "syntheseExecutive");
  const axes = safeGet(content, "axesStrategiques");

  if (synthese) lines.push(formatSection("Synthèse exécutive", synthese));
  if (axes) lines.push(formatSection("Axes stratégiques", axes));

  return lines.join("");
}

const PILLAR_EXTRACTORS: Record<string, (content: unknown) => string> = {
  A: extractPillarA,
  D: extractPillarD,
  V: extractPillarV,
  E: extractPillarE,
  R: extractPillarR,
  T: extractPillarT,
  I: extractPillarI,
  S: extractPillarS,
};

// ---------------------------------------------------------------------------
// 2.1  Main export — buildStrategyContext
// ---------------------------------------------------------------------------

export async function buildStrategyContext(
  strategyId: string,
  requiredPillars: string[],
): Promise<ContextResult> {
  // Load strategy + only the pillars we need (complete status)
  const strategy = await db.strategy.findUnique({
    where: { id: strategyId },
    include: {
      pillars: {
        where: {
          type: { in: requiredPillars },
          status: "complete",
        },
        select: {
          type: true,
          content: true,
        },
      },
    },
  });

  if (!strategy) {
    throw new Error(
      `Stratégie introuvable (id: ${strategyId}). Impossible de construire le contexte GLORY.`,
    );
  }

  // --- Build the structured text context ---

  const sections: string[] = [];

  // Header
  sections.push(`# CONTEXTE STRATÉGIQUE — ${strategy.brandName}`);
  sections.push(`Secteur : ${strategy.sector ?? "Non défini"}`);
  sections.push(`Signature : ${strategy.tagline ?? "—"}`);
  if (strategy.vertical) sections.push(`Vertical : ${strategy.vertical}`);
  if (strategy.maturityProfile) sections.push(`Profil de maturité : ${strategy.maturityProfile}`);
  sections.push(`Devise : ${strategy.currency}`);
  sections.push(""); // blank line separator

  // Pillar sections
  for (const pillar of strategy.pillars) {
    const label = PILLAR_LABELS[pillar.type] ?? pillar.type;
    const extractor = PILLAR_EXTRACTORS[pillar.type];

    sections.push(`## PILIER ${pillar.type} — ${label}`);

    if (extractor) {
      const extracted = extractor(pillar.content);
      if (extracted.trim()) {
        sections.push(extracted.trimEnd());
      } else {
        // Fallback: dump the whole content as JSON if extractor found nothing
        sections.push(formatValue(pillar.content));
      }
    } else {
      // Unknown pillar type — dump raw JSON
      sections.push(formatValue(pillar.content));
    }

    sections.push(""); // blank line separator between pillars
  }

  const context = sections.join("\n").trimEnd();

  const strategyMeta: StrategyMeta = {
    brandName: strategy.brandName,
    sector: strategy.sector,
    tagline: strategy.tagline,
    vertical: strategy.vertical,
    maturityProfile: strategy.maturityProfile,
    currency: strategy.currency,
  };

  return { context, strategy: strategyMeta };
}
