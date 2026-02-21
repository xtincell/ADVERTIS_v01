// =============================================================================
// MODULE 15 — Report Generation Service
// =============================================================================
// Generates 6 comprehensive reports (Rapport A through Rapport T), each 15-80
// pages. Uses chunked section-by-section AI generation to handle the large
// output (~384K tokens total). Each report has 7-9 predefined sections from
// REPORT_CONFIG. Saves progress incrementally after each section.
//
// Public API:
//   1. generateReport()      — Generate a single report, section by section
//   2. generateAllReports()  — Generate all 6 reports sequentially
//
// Dependencies:
//   - ai (generateText)
//   - anthropic-client (anthropic, DEFAULT_MODEL)
//   - ~/lib/constants (REPORT_CONFIG, PILLAR_CONFIG)
//
// Called by:
//   - tRPC report router (report.generate, report.generateAll)
// =============================================================================

import { generateText } from "ai";

import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
import { REPORT_CONFIG, PILLAR_CONFIG } from "~/lib/constants";
import type { ReportType, PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportSection {
  title: string;
  content: string;
  order: number;
  wordCount: number;
}

export interface ReportResult {
  type: ReportType;
  title: string;
  sections: ReportSection[];
  totalWordCount: number;
  pageCount: number; // wordCount / 250
  status: "complete" | "error";
  errorMessage?: string;
}

export interface GenerationProgress {
  reportType: ReportType;
  sectionIndex: number;
  totalSections: number;
  sectionTitle: string;
  overallReport: number; // 1-6
  totalReports: number; // 6
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a single report, section by section.
 *
 * @param reportType - Which report to generate (rapport_a through rapport_t)
 * @param context - All strategy data needed for generation
 * @param onSectionComplete - Callback after each section is generated (for progress tracking)
 */
export async function generateReport(
  reportType: ReportType,
  context: ReportContext,
  onSectionComplete?: (progress: GenerationProgress) => Promise<void>,
): Promise<ReportResult> {
  const config = REPORT_CONFIG[reportType];
  const sections: ReportSection[] = [];
  let totalWordCount = 0;

  for (let i = 0; i < config.sections.length; i++) {
    const sectionTitle = config.sections[i]!;

    try {
      // Build context with previous sections for continuity
      const previousSectionsSummary = sections
        .map((s) => {
          const truncated =
            s.content.length > 2000
              ? s.content.substring(0, 2000) + "\n[... suite tronquée ...]"
              : s.content;
          return `### ${s.title}\n${truncated}`;
        })
        .join("\n\n");

      const { text } = await generateText({
        model: anthropic(DEFAULT_MODEL),
        system: buildReportSystemPrompt(reportType, sectionTitle, context),
        prompt: buildReportSectionPrompt(
          reportType,
          sectionTitle,
          i,
          config.sections.length,
          previousSectionsSummary,
          context,
        ),
        maxOutputTokens: 8000,
        temperature: 0.4,
      });

      const wordCount = text.split(/\s+/).length;
      totalWordCount += wordCount;

      sections.push({
        title: sectionTitle,
        content: text,
        order: i + 1,
        wordCount,
      });

      // Notify progress
      if (onSectionComplete) {
        await onSectionComplete({
          reportType,
          sectionIndex: i,
          totalSections: config.sections.length,
          sectionTitle,
          overallReport: 0, // Set by caller
          totalReports: 6,
        });
      }
    } catch (error) {
      console.error(
        `[Report] Error generating section "${sectionTitle}" for ${reportType}:`,
        error,
      );

      // Add error section and continue
      sections.push({
        title: sectionTitle,
        content: `[Erreur de génération : ${error instanceof Error ? error.message : "Erreur inconnue"}]`,
        order: i + 1,
        wordCount: 0,
      });
    }
  }

  return {
    type: reportType,
    title: config.title,
    sections,
    totalWordCount,
    pageCount: Math.ceil(totalWordCount / 250),
    status: "complete",
  };
}

/**
 * Generates all 6 reports sequentially.
 *
 * @param context - All strategy data
 * @param onProgress - Progress callback after each section
 * @returns Array of 6 report results
 */
export async function generateAllReports(
  context: ReportContext,
  onProgress?: (progress: GenerationProgress) => Promise<void>,
): Promise<ReportResult[]> {
  const reportTypes: ReportType[] = [
    "rapport_a",
    "rapport_d",
    "rapport_v",
    "rapport_e",
    "rapport_r",
    "rapport_t",
  ];

  const results: ReportResult[] = [];

  for (let r = 0; r < reportTypes.length; r++) {
    const reportType = reportTypes[r]!;

    const result = await generateReport(
      reportType,
      context,
      onProgress
        ? async (progress) => {
            await onProgress({
              ...progress,
              overallReport: r + 1,
              totalReports: 6,
            });
          }
        : undefined,
    );

    results.push(result);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface ReportContext {
  brandName: string;
  sector: string;
  interviewData: Record<string, string>;
  pillarContents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildReportSystemPrompt(
  reportType: ReportType,
  sectionTitle: string,
  context: ReportContext,
): string {
  const config = REPORT_CONFIG[reportType];
  const pillarConfig = PILLAR_CONFIG[config.pillarSource];

  return `Tu es un consultant stratégique senior rédigeant un rapport professionnel pour la méthodologie ADVERTIS.

RAPPORT : ${config.title}
SECTION EN COURS : ${sectionTitle}
PILIER SOURCE : ${config.pillarSource} — ${pillarConfig.title}
MARQUE : ${context.brandName}
SECTEUR : ${context.sector || "Non spécifié"}

OBJECTIF DU RAPPORT :
Ce rapport fait partie d'un ensemble de 6 rapports stratégiques couvrant la totalité de la stratégie ADVERTIS.
Le rapport ${config.pillarSource} se concentre sur : ${pillarConfig.description}.
Il doit faire entre ${config.estimatedPages[0]} et ${config.estimatedPages[1]} pages au total.

INSTRUCTIONS DE RÉDACTION :
1. Rédige en français professionnel, style cabinet de conseil premium
2. Utilise des titres et sous-titres structurés (## et ###)
3. Inclus des tableaux markdown quand pertinent
4. Utilise des listes à puces pour les recommandations
5. Sois concret et actionnable — chaque insight doit mener à une action
6. Cette section doit faire ~4-6 pages (~1000-1500 mots)
7. NE RÉPÈTE PAS les informations des sections précédentes
8. Ancre tes analyses dans les données réelles fournies
9. Si des données manquent, signale-le et propose des hypothèses réalistes pour le secteur
10. Termine chaque section avec un encadré "Points clés à retenir"`;
}

function buildReportSectionPrompt(
  reportType: ReportType,
  sectionTitle: string,
  sectionIndex: number,
  totalSections: number,
  previousSectionsSummary: string,
  context: ReportContext,
): string {
  const config = REPORT_CONFIG[reportType];
  const lines: string[] = [];

  lines.push(`# ${config.title}`);
  lines.push(`## Section ${sectionIndex + 1}/${totalSections} : ${sectionTitle}`);
  lines.push("");

  // Add all relevant pillar data
  lines.push("## Données stratégiques disponibles");
  lines.push("");

  for (const pillar of context.pillarContents) {
    const truncated =
      typeof pillar.content === "string"
        ? pillar.content.length > 3000
          ? pillar.content.substring(0, 3000) + "\n[... tronqué ...]"
          : pillar.content
        : JSON.stringify(pillar.content).substring(0, 3000);

    lines.push(`### Pilier ${pillar.type} — ${pillar.title}`);
    lines.push(truncated);
    lines.push("");
  }

  // Add interview data highlights
  const filledVars = Object.entries(context.interviewData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- **${k}** : ${v.trim().substring(0, 200)}`);

  if (filledVars.length > 0) {
    lines.push("## Données d'entretien (résumé)");
    lines.push(filledVars.join("\n"));
    lines.push("");
  }

  // Add previous sections context for continuity
  if (previousSectionsSummary) {
    lines.push("## Sections déjà rédigées (pour continuité)");
    lines.push(previousSectionsSummary);
    lines.push("");
  }

  // Table of contents for context
  lines.push("## Plan complet du rapport");
  for (let i = 0; i < config.sections.length; i++) {
    const marker = i === sectionIndex ? "→ " : "  ";
    const status = i < sectionIndex ? "✓" : i === sectionIndex ? "📝" : "○";
    lines.push(`${marker}${status} ${i + 1}. ${config.sections[i]}`);
  }
  lines.push("");

  lines.push("---");
  lines.push(
    `Rédige maintenant la section "${sectionTitle}" (~1000-1500 mots, ~4-6 pages).`,
  );
  lines.push(
    "Utilise le format markdown avec titres, sous-titres, tableaux et listes. Termine avec un encadré 'Points clés à retenir'.",
  );

  return lines.join("\n");
}
