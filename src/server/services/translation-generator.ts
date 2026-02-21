// =============================================================================
// MODULE 20 — Translation Generator
// =============================================================================
// Couche 2 core service: generates strategic briefs from pillar intelligence.
// Supports multiple brief types (Creative Playbook, Production Kit, Media Mix,
// Social Brief, Packaging Brief, etc.). Each assertion carries a sourceRef
// linking to the source pillar variable with "why" justification for full
// traceability. Supports vertical dictionaries and maturity profiles.
//
// Public API:
//   1. generateBrief()        — Generate a single brief document
//   2. generateFromPreset()   — Generate all briefs from a preset (sequential)
//   3. bulkGenerate()         — Generate multiple briefs in parallel
//   4. regenerateBrief()      — Regenerate an existing brief (new version)
//   5. buildSourceRef()       — Build a conformant sourceRef object
//
// Dependencies:
//   - ai (generateText)
//   - anthropic-client (anthropic, DEFAULT_MODEL)
//   - ~/server/db (Prisma — TranslationDocument, BriefPreset)
//   - ~/lib/constants (BRIEF_SOURCE_PILLARS, BRIEF_TYPE_LABELS, VERTICAL_DICTIONARY, MATURITY_CONFIG)
//   - ~/lib/types/pillar-parsers (parsePillarContent)
//
// Called by:
//   - tRPC translation router (translation.generate, translation.regenerate)
//   - Mission Manager (Module 18) — debrief feedback loop
// =============================================================================

import { generateText } from "ai";

import { db } from "~/server/db";
import {
  BRIEF_SOURCE_PILLARS,
  BRIEF_TYPE_LABELS,
  VERTICAL_DICTIONARY,
  MATURITY_CONFIG,
  type BriefType,
} from "~/lib/constants";
import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SourceRef {
  pillar: string;
  variableKey: string;
  variableValue: string;
  why: string;
  updatedAt: string;
  source: "generation" | "manual" | "market_study";
}

export interface BriefBlock {
  assertion: string;
  sourceRef: SourceRef;
  type: "rule" | "recommendation" | "insight" | "warning";
}

export interface BriefSection {
  heading: string;
  blocks: BriefBlock[];
}

export interface BriefContent {
  title: string;
  briefType: string;
  sections: BriefSection[];
  metadata?: Record<string, unknown>;
}

interface GenerationResult {
  document: {
    id: string;
    type: string;
    version: number;
    status: string;
    content: BriefContent;
  };
}

// ---------------------------------------------------------------------------
// Core: Generate a single brief
// ---------------------------------------------------------------------------

/**
 * Generates a single brief document for a strategy.
 * 1. Loads source pillars (via BRIEF_SOURCE_PILLARS)
 * 2. Loads vertical/maturity context
 * 3. Calls Claude with structured prompt
 * 4. Returns content with sourceRef traceability
 * 5. Creates TranslationDocument in DB
 */
export async function generateBrief(
  strategyId: string,
  briefType: BriefType,
  generatedBy: string,
  metadata?: Record<string, unknown>,
): Promise<GenerationResult> {
  // 1. Load strategy context
  const strategy = await db.strategy.findUniqueOrThrow({
    where: { id: strategyId },
    select: {
      id: true,
      brandName: true,
      tagline: true,
      sector: true,
      vertical: true,
      maturityProfile: true,
      nodeType: true,
    },
  });

  // 2. Load source pillar data
  const sourcePillarTypes = BRIEF_SOURCE_PILLARS[briefType] ?? ["A", "D"];
  const pillars = await db.pillar.findMany({
    where: {
      strategyId,
      type: { in: sourcePillarTypes },
      status: "complete",
    },
    select: {
      type: true,
      content: true,
      summary: true,
      generatedAt: true,
      updatedAt: true,
    },
  });

  // 3. Parse pillar content
  const pillarData = pillars.map((p) => {
    const { data } = parsePillarContent(p.type, p.content);
    return {
      type: p.type,
      content: data,
      summary: p.summary,
      updatedAt: (p.generatedAt ?? p.updatedAt).toISOString(),
    };
  });

  // 4. Build prompt and generate
  const systemPrompt = getBriefSystemPrompt(briefType, strategy);
  const userPrompt = buildBriefUserPrompt(briefType, pillarData, strategy, metadata);

  const result = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 8000,
  });

  // 5. Parse AI response
  let briefContent: BriefContent;
  try {
    briefContent = JSON.parse(result.text) as BriefContent;
  } catch {
    // Attempt to extract JSON from response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      briefContent = JSON.parse(jsonMatch[0]) as BriefContent;
    } else {
      throw new Error(`Failed to parse brief content for ${briefType}`);
    }
  }

  // Ensure briefType is set
  briefContent.briefType = briefType;
  briefContent.title = briefContent.title || BRIEF_TYPE_LABELS[briefType] || briefType;

  // 6. Create TranslationDocument in DB
  const doc = await db.translationDocument.create({
    data: {
      strategyId,
      type: briefType,
      version: 1,
      content: JSON.parse(JSON.stringify(briefContent)),
      status: "DRAFT",
      sourcePillars: sourcePillarTypes,
      generatedBy,
      generatedAt: new Date(),
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
    },
  });

  return {
    document: {
      id: doc.id,
      type: doc.type,
      version: doc.version,
      status: doc.status,
      content: briefContent,
    },
  };
}

// ---------------------------------------------------------------------------
// Bulk & Preset generation
// ---------------------------------------------------------------------------

/**
 * Generate all briefs from a preset (sequential to avoid API rate limits).
 */
export async function generateFromPreset(
  strategyId: string,
  presetId: string,
  generatedBy: string,
): Promise<GenerationResult[]> {
  const preset = await db.briefPreset.findUniqueOrThrow({
    where: { id: presetId },
  });

  const briefTypes = (preset.briefTypes as string[]) ?? [];
  const results: GenerationResult[] = [];

  for (const type of briefTypes) {
    try {
      const result = await generateBrief(
        strategyId,
        type as BriefType,
        generatedBy,
      );
      results.push(result);
    } catch (err) {
      console.error(`[TranslationGenerator] Failed to generate ${type}:`, err);
    }
  }

  return results;
}

/**
 * Generate multiple briefs in parallel (with concurrency limit).
 */
export async function bulkGenerate(
  strategyId: string,
  briefTypes: BriefType[],
  generatedBy: string,
): Promise<Array<{ type: string; result?: GenerationResult; error?: string }>> {
  const results = await Promise.allSettled(
    briefTypes.map((type) => generateBrief(strategyId, type, generatedBy)),
  );

  return results.map((r, i) => ({
    type: briefTypes[i]!,
    result: r.status === "fulfilled" ? r.value : undefined,
    error: r.status === "rejected" ? String(r.reason) : undefined,
  }));
}

/**
 * Regenerate an existing brief — increments version, archives old one.
 */
export async function regenerateBrief(
  documentId: string,
  regeneratedBy: string,
): Promise<GenerationResult> {
  const existing = await db.translationDocument.findUniqueOrThrow({
    where: { id: documentId },
    select: {
      strategyId: true,
      type: true,
      version: true,
      metadata: true,
    },
  });

  // Archive old version
  await db.translationDocument.update({
    where: { id: documentId },
    data: { status: "ARCHIVED" },
  });

  // Generate new version
  const result = await generateBrief(
    existing.strategyId,
    existing.type as BriefType,
    regeneratedBy,
    existing.metadata as Record<string, unknown> | undefined,
  );

  // Update version number
  await db.translationDocument.update({
    where: { id: result.document.id },
    data: { version: existing.version + 1 },
  });

  result.document.version = existing.version + 1;
  return result;
}

// ---------------------------------------------------------------------------
// SourceRef helper
// ---------------------------------------------------------------------------

/**
 * Build a conformant sourceRef object.
 */
export function buildSourceRef(
  pillar: string,
  variableKey: string,
  variableValue: string,
  why: string,
  updatedAt?: string,
): SourceRef {
  return {
    pillar,
    variableKey,
    variableValue,
    why,
    updatedAt: updatedAt ?? new Date().toISOString(),
    source: "generation",
  };
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function getBriefSystemPrompt(
  briefType: BriefType,
  strategy: { vertical?: string | null; maturityProfile?: string | null },
): string {
  const typeName = BRIEF_TYPE_LABELS[briefType] ?? briefType;

  // Vertical dictionary injection
  let verticalContext = "";
  if (strategy.vertical && VERTICAL_DICTIONARY[strategy.vertical]) {
    const dict = VERTICAL_DICTIONARY[strategy.vertical]!;
    const mappings = Object.entries(dict)
      .map(([key, val]) => `  "${key}" → "${val}"`)
      .join("\n");
    verticalContext = `\n\nDICTIONNAIRE VERTICAL (${strategy.vertical}) — Utilise ces termes au lieu des termes standards :\n${mappings}`;
  }

  // Maturity mode injection
  let maturityContext = "";
  if (strategy.maturityProfile) {
    const config = MATURITY_CONFIG[strategy.maturityProfile as keyof typeof MATURITY_CONFIG];
    if (config) {
      maturityContext = `\n\nPROFIL DE MATURITÉ : ${strategy.maturityProfile}\nMode de génération : ${config.generationMode}\nCouverture variables attendues : ${config.expectedCoverage}`;
    }
  }

  return `Tu es un expert en stratégie de marque utilisant la méthodologie ADVERTIS.
Tu génères un brief de type "${typeName}" — un document opérationnel structuré destiné aux exécutants (freelances, agences).

RÈGLES CRITIQUES :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de commentaires, pas de markdown, pas de texte avant/après le JSON
- Chaque assertion DOIT avoir un sourceRef qui trace la règle jusqu'au pilier source
- Le champ "why" dans sourceRef explique POURQUOI cette règle découle de la variable source
- Sois concret, spécifique à la marque, opérationnel (pas de généralités)
- Les recommandations doivent être actionnables immédiatement

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
  "title": "Titre du brief",
  "briefType": "${briefType}",
  "sections": [
    {
      "heading": "Nom de la section",
      "blocks": [
        {
          "assertion": "La règle ou recommandation concrète",
          "sourceRef": {
            "pillar": "A",
            "variableKey": "identite.archetype",
            "variableValue": "Caregiver",
            "why": "L'archétype Caregiver protège et nourrit — justification de la règle",
            "updatedAt": "2026-01-15T10:30:00Z",
            "source": "generation"
          },
          "type": "rule"
        }
      ]
    }
  ]
}

Les types de blocks possibles : "rule" (règle impérative), "recommendation" (suggestion), "insight" (insight stratégique), "warning" (mise en garde).${verticalContext}${maturityContext}`;
}

function buildBriefUserPrompt(
  briefType: BriefType,
  pillarData: Array<{
    type: string;
    content: unknown;
    summary: string | null;
    updatedAt: string;
  }>,
  strategy: {
    brandName: string;
    tagline?: string | null;
    sector?: string | null;
    nodeType?: string;
  },
  metadata?: Record<string, unknown>,
): string {
  const typeName = BRIEF_TYPE_LABELS[briefType] ?? briefType;

  let prompt = `Génère un brief "${typeName}" pour la marque "${strategy.brandName}"`;
  if (strategy.tagline) prompt += ` (accroche : "${strategy.tagline}")`;
  if (strategy.sector) prompt += ` (secteur : ${strategy.sector})`;
  if (strategy.nodeType && strategy.nodeType !== "BRAND") {
    prompt += ` [type de nœud : ${strategy.nodeType}]`;
  }
  prompt += ".\n\n";

  // Inject pillar data
  prompt += "=== DONNÉES DES PILIERS SOURCE ===\n\n";
  for (const p of pillarData) {
    prompt += `--- PILIER ${p.type} (mis à jour : ${p.updatedAt}) ---\n`;
    if (p.summary) {
      prompt += `Résumé : ${p.summary}\n`;
    }
    prompt += `Contenu : ${JSON.stringify(p.content, null, 2)}\n\n`;
  }

  // Brief-specific instructions
  prompt += getBriefSpecificInstructions(briefType);

  // Metadata context
  if (metadata && Object.keys(metadata).length > 0) {
    prompt += `\n=== CONTEXTE ADDITIONNEL ===\n${JSON.stringify(metadata, null, 2)}\n`;
  }

  prompt += `\nGénère le brief complet en JSON avec sourceRef pour chaque assertion. Chaque sourceRef.why doit expliquer le raisonnement stratégique.`;

  return prompt;
}

/**
 * Brief-specific prompt instructions for each type.
 */
function getBriefSpecificInstructions(briefType: BriefType): string {
  const instructions: Record<string, string> = {
    CREATIVE_PLAYBOOK: `=== INSTRUCTIONS SPÉCIFIQUES ===
Ce Creative Playbook doit contenir :
1. Territoire créatif (ton, style, codes visuels issus de A+D)
2. Axes créatifs (3-4 directions créatives avec justification stratégique)
3. Pistes créatives (concepts déclinables par axe)
4. Do's & Don'ts (règles impératives issues de l'archétype et du positionnement)
5. Références visuelles (directions esthétiques, pas de liens)
6. Guidelines de ton de voix (registre, vocabulaire, expressions)`,

    PRODUCTION_KIT: `=== INSTRUCTIONS SPÉCIFIQUES ===
Ce Kit de Production doit contenir :
1. Spécifications techniques (formats, résolutions, durées)
2. Direction artistique (style visuel, colorimétrie, typographie)
3. Casting guidelines (profils, attitude, représentation)
4. Guidelines de mise en scène (éclairage, décors, ambiance)
5. Son & musique (direction sonore, BPM, genres)
6. Post-production (retouche, étalonnage, montage)`,

    MEDIA_MIX: `=== INSTRUCTIONS SPÉCIFIQUES ===
Ce Media Mix doit contenir :
1. Objectifs média (reach, fréquence, couverture)
2. Allocation par canal (% du budget par canal avec justification)
3. Planning de diffusion (phases, pics, continu)
4. KPIs par canal (CPM, CTR, engagement attendu)
5. Formats recommandés par plateforme
6. Budget estimatif par canal`,

    SOCIAL_BRIEF: `=== INSTRUCTIONS SPÉCIFIQUES ===
Ce Brief Social Media doit contenir :
1. Stratégie éditoriale (rubriques, fréquence, ton)
2. Contenus par plateforme (Instagram, TikTok, Facebook, X, LinkedIn)
3. Calendrier type hebdomadaire
4. Guidelines de community management (réponses, modération)
5. KPIs et benchmarks
6. Paid social (budget, ciblage, formats)`,

    PACKAGING_BRIEF: `=== INSTRUCTIONS SPÉCIFIQUES ===
Ce Brief Packaging doit contenir :
1. Stratégie de packaging (rôle dans le parcours d'achat)
2. Hiérarchie de l'information (face avant, arrière, côtés)
3. Direction visuelle (couleurs, typo, illustrations)
4. Contraintes réglementaires (mentions obligatoires)
5. Matériaux et finitions recommandés
6. Déclinaisons (gamme, formats, éditions spéciales)`,
  };

  return instructions[briefType] ?? `=== INSTRUCTIONS SPÉCIFIQUES ===
Génère un brief complet et opérationnel de type ${BRIEF_TYPE_LABELS[briefType] ?? briefType}.
Inclus 4-8 sections pertinentes avec des assertions concrètes et traçables.
Chaque assertion doit avoir un sourceRef valide liant la règle au pilier source.`;
}
