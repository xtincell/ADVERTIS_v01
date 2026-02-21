// =============================================================================
// MODULE 11 — Budget Tier Generator
// =============================================================================
//
// AI-powered contextualised budget tier generation from Pillar I data.
// Extracts brand-specific channels, KPIs, and budget context from
// ImplementationData, then asks Claude to distribute across 5 progressive
// tiers: MICRO → STARTER → IMPACT → CAMPAIGN → DOMINATION.
// Falls back to static BUDGET_TIER_CONFIG if AI fails or no data available.
//
// PUBLIC API :
//   11.1  generateBudgetTiers()  — Main entry → BudgetTierRow[]
//   11.0  BudgetTierRow          — Interface for a single tier
//
// INTERNAL :
//   11.H1  buildBudgetContext()  — Condenses Pillar I data for AI prompt
//   11.H2  parseResponse()      — JSON extraction + validation (5 tiers expected)
//   11.H3  staticFallback()     — Returns BUDGET_TIER_CONFIG as BudgetTierRow[]
//
// DEPENDENCIES :
//   - Module 5 (anthropic-client) → resilientGenerateText, anthropic, DEFAULT_MODEL
//   - lib/constants → BUDGET_TIER_CONFIG
//   - lib/types/implementation-data → ImplementationData
//
// CALLED BY :
//   - API Route POST /api/ai/generate (after Pillar I completes)
//   - Module 10 (fiche-upgrade.ts) → regenerateAllPillars() after Pillar I
//
// =============================================================================

import {
  anthropic,
  DEFAULT_MODEL,
  resilientGenerateText,
} from "./anthropic-client";
import { BUDGET_TIER_CONFIG } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BudgetTierRow {
  tier: string;
  minBudget: number;
  maxBudget: number;
  channels: Array<{ channel: string; allocation: number }>;
  kpis: Array<{ kpi: string; target: string }>;
  description: string | null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate 5 contextualised budget tiers from Pillar I data.
 * Uses a single lightweight AI call (~1500 output tokens).
 * Falls back to static BUDGET_TIER_CONFIG if AI fails.
 */
export async function generateBudgetTiers(
  implData: ImplementationData,
  brandName: string,
  sector: string,
): Promise<BudgetTierRow[]> {
  const context = buildBudgetContext(implData);

  // If we have almost no data to work with, fall back to static tiers
  if (!context.enveloppe && context.channels.length === 0) {
    console.log("[Budget Tiers] No budget data available — using static defaults");
    return staticFallback();
  }

  try {
    const { text } = await resilientGenerateText({
      label: "budget-tiers",
      model: anthropic(DEFAULT_MODEL),
      system: `Tu es un expert en stratégie média et allocation budgétaire utilisant la méthodologie ADVERTIS.
Ta tâche : générer 5 paliers budgétaires (MICRO, STARTER, IMPACT, CAMPAIGN, DOMINATION) adaptés au profil spécifique de la marque.

PROFIL DE LA MARQUE :
- Marque : ${brandName}
- Secteur : ${sector || "Non spécifié"}
- Enveloppe budgétaire de référence : ${context.enveloppe || "Non spécifiée"}

POSTES BUDGÉTAIRES IDENTIFIÉS :
${context.postes || "Aucun poste identifié"}

CANAUX DISPONIBLES (issus de la stratégie de la marque) :
${context.channels.join(", ") || "Non identifiés"}

KPIs DE LA MARQUE :
${context.kpis || "Non identifiés"}

INSTRUCTIONS :
1. Génère 5 paliers budgétaires progressifs (MICRO → DOMINATION)
2. Les ranges budgétaires doivent être RÉALISTES pour le secteur "${sector || "général"}" — pas des ranges génériques
3. Pour chaque palier, distribue les canaux de la marque avec des % d'allocation adaptés au niveau de budget
4. MICRO : focus organique/low-cost, 2-3 canaux max
5. STARTER : ajout paid social, 3-4 canaux
6. IMPACT : mix média enrichi, 4-6 canaux
7. CAMPAIGN : couverture large, 5-8 canaux incluant TV/radio si pertinent
8. DOMINATION : always-on 360°, tous les canaux avec allocations optimisées
9. KPIs : adapte les cibles au budget (MICRO = notoriété locale, DOMINATION = leadership marché)
10. Description : 1-2 phrases décrivant la stratégie du palier pour cette marque spécifique

FORMAT : Réponds UNIQUEMENT avec un tableau JSON valide de 5 objets :
[
  {
    "tier": "MICRO",
    "minBudget": 0,
    "maxBudget": 2000000,
    "channels": [{ "channel": "Instagram", "allocation": 50 }, { "channel": "TikTok", "allocation": 30 }, { "channel": "Email", "allocation": 20 }],
    "kpis": [{ "kpi": "Notoriété", "target": "500 abonnés/mois" }, { "kpi": "Engagement", "target": "3% taux engagement" }],
    "description": "Stratégie organique centrée sur..."
  },
  ...4 autres paliers
]

RÈGLES CRITIQUES :
- minBudget et maxBudget sont des ENTIERS (pas de strings)
- Les allocations de chaque palier doivent totaliser 100%
- Les KPIs doivent avoir des cibles CHIFFRÉES et réalistes
- Pas de champs vides — chaque palier a au minimum 2 canaux et 2 KPIs`,
      prompt: `Génère les 5 paliers budgétaires personnalisés pour "${brandName}" (secteur: ${sector || "Non spécifié"}).`,
      maxOutputTokens: 3000,
      temperature: 0.3,
    });

    const tiers = parseResponse(text);

    // Validate we got exactly 5 valid tiers
    if (tiers.length !== 5) {
      console.warn(`[Budget Tiers] AI returned ${tiers.length} tiers instead of 5 — using static fallback`);
      return staticFallback();
    }

    return tiers;
  } catch (err) {
    console.error("[Budget Tiers] AI generation failed, using static fallback:", err);
    return staticFallback();
  }
}

// ---------------------------------------------------------------------------
// Context builder — condenses Pillar I data for the prompt
// ---------------------------------------------------------------------------

interface BudgetContext {
  enveloppe: string;
  postes: string;
  channels: string[];
  kpis: string;
}

function buildBudgetContext(implData: ImplementationData): BudgetContext {
  // 1. Budget envelope
  const enveloppe = implData.budgetAllocation?.enveloppeGlobale ?? "";

  // 2. Budget posts (top 5)
  const postes = (implData.budgetAllocation?.parPoste ?? [])
    .slice(0, 5)
    .map((p) => `- ${p.poste}: ${p.montant} (${p.pourcentage}%)`)
    .join("\n");

  // 3. Extract unique channels from multiple sources
  const channelSet = new Set<string>();

  // From activation dispositif (POEM)
  const dispositif = implData.activationDispositif;
  if (dispositif) {
    for (const item of [...(dispositif.owned ?? []), ...(dispositif.earned ?? []), ...(dispositif.paid ?? []), ...(dispositif.shared ?? [])]) {
      if (item.canal?.trim()) channelSet.add(item.canal.trim());
    }
  }

  // From annual campaign calendar
  for (const campaign of implData.campaigns?.annualCalendar ?? []) {
    for (const canal of campaign.canaux ?? []) {
      if (canal?.trim()) channelSet.add(canal.trim());
    }
  }

  // From engagement touchpoints
  for (const tp of implData.engagementStrategy?.touchpoints ?? []) {
    if (tp.channel?.trim()) channelSet.add(tp.channel.trim());
  }

  // 4. KPIs from engagement + campaigns
  const kpiLines: string[] = [];
  for (const kpi of implData.engagementStrategy?.kpis ?? []) {
    if (kpi.name?.trim()) {
      kpiLines.push(`- ${kpi.name}: ${kpi.target} (${kpi.frequency})`);
    }
  }
  // Add unique KPI targets from campaigns
  const seenKpiCibles = new Set<string>();
  for (const campaign of implData.campaigns?.annualCalendar ?? []) {
    if (campaign.kpiCible?.trim() && !seenKpiCibles.has(campaign.kpiCible)) {
      seenKpiCibles.add(campaign.kpiCible);
      kpiLines.push(`- Campagne ${campaign.mois}: ${campaign.kpiCible}`);
    }
    if (kpiLines.length >= 8) break; // Limit context size
  }

  return {
    enveloppe,
    postes,
    channels: Array.from(channelSet),
    kpis: kpiLines.join("\n") || "Non identifiés",
  };
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

const VALID_TIERS = new Set(["MICRO", "STARTER", "IMPACT", "CAMPAIGN", "DOMINATION"]);

function parseResponse(responseText: string): BudgetTierRow[] {
  let jsonString = responseText.trim();

  // Remove markdown code block if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonString = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonString) as unknown[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => {
        if (typeof item !== "object" || item === null) return false;
        const obj = item as Record<string, unknown>;
        return typeof obj.tier === "string" && VALID_TIERS.has(obj.tier as string);
      })
      .map((item) => ({
        tier: item.tier as string,
        minBudget: typeof item.minBudget === "number" ? Math.round(item.minBudget) : 0,
        maxBudget: typeof item.maxBudget === "number" ? Math.round(item.maxBudget) : 0,
        channels: Array.isArray(item.channels)
          ? (item.channels as Array<Record<string, unknown>>)
              .filter((ch) => typeof ch.channel === "string" && typeof ch.allocation === "number")
              .map((ch) => ({
                channel: ch.channel as string,
                allocation: Math.round(ch.allocation as number),
              }))
          : [],
        kpis: Array.isArray(item.kpis)
          ? (item.kpis as Array<Record<string, unknown>>)
              .filter((kpi) => typeof kpi.kpi === "string" && typeof kpi.target === "string")
              .map((kpi) => ({
                kpi: kpi.kpi as string,
                target: kpi.target as string,
              }))
          : [],
        description: typeof item.description === "string" ? item.description : null,
      }));
  } catch (err) {
    console.error("[Budget Tiers] JSON parse error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Static fallback (same as previous behavior)
// ---------------------------------------------------------------------------

function staticFallback(): BudgetTierRow[] {
  return Object.entries(BUDGET_TIER_CONFIG).map(([tier, config]) => ({
    tier,
    minBudget: config.minBudget,
    maxBudget: config.maxBudget,
    channels: [],
    kpis: [],
    description: config.description,
  }));
}
