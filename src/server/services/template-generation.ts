// Template Generation Service — 3 UPGRADERS Deliverables
// Generates structured templates (Protocole Stratégique, Reco Campagne, Mandat 360)
// Uses the same section-by-section pattern as report-generation.ts.
// Context = Pillar I (complet) + A-D-V-E + R-T.

import { generateText } from "ai";

import { anthropic, DEFAULT_MODEL } from "./anthropic-client";
import { TEMPLATE_CONFIG, PILLAR_CONFIG } from "~/lib/constants";
import type { TemplateType, PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemplateSection {
  title: string;
  content: string; // Structured slide-by-slide markdown
  order: number;
  wordCount: number;
  estimatedSlides: number;
}

export interface TemplateResult {
  type: TemplateType;
  title: string;
  sections: TemplateSection[];
  totalWordCount: number;
  totalSlides: number;
  status: "complete" | "error";
  errorMessage?: string;
}

export interface TemplateProgress {
  templateType: TemplateType;
  sectionIndex: number;
  totalSections: number;
  sectionTitle: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface TemplateContext {
  brandName: string;
  sector: string;
  interviewData: Record<string, string>;
  pillarContents: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  implementationData?: string; // JSON stringified Pillar I content
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a single template, section by section.
 */
export async function generateTemplate(
  templateType: TemplateType,
  context: TemplateContext,
  onSectionComplete?: (progress: TemplateProgress) => Promise<void>,
): Promise<TemplateResult> {
  const config = TEMPLATE_CONFIG[templateType];
  const sections: TemplateSection[] = [];
  let totalWordCount = 0;
  let totalSlides = 0;

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
        system: buildTemplateSystemPrompt(templateType, sectionTitle, context),
        prompt: buildTemplateSectionPrompt(
          templateType,
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

      // Estimate slides: ~100 words per slide for presentations, ~250 for pages
      const wordsPerUnit = config.unit === "slides" ? 100 : 250;
      const estimatedSlides = Math.max(1, Math.ceil(wordCount / wordsPerUnit));
      totalSlides += estimatedSlides;

      sections.push({
        title: sectionTitle,
        content: text,
        order: i + 1,
        wordCount,
        estimatedSlides,
      });

      // Notify progress
      if (onSectionComplete) {
        await onSectionComplete({
          templateType,
          sectionIndex: i,
          totalSections: config.sections.length,
          sectionTitle,
        });
      }
    } catch (error) {
      console.error(
        `[Template] Error generating section "${sectionTitle}" for ${templateType}:`,
        error,
      );

      sections.push({
        title: sectionTitle,
        content: `[Erreur de génération : ${error instanceof Error ? error.message : "Erreur inconnue"}]`,
        order: i + 1,
        wordCount: 0,
        estimatedSlides: 0,
      });
    }
  }

  return {
    type: templateType,
    title: config.title,
    sections,
    totalWordCount,
    totalSlides,
    status: "complete",
  };
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildTemplateSystemPrompt(
  templateType: TemplateType,
  sectionTitle: string,
  context: TemplateContext,
): string {
  const config = TEMPLATE_CONFIG[templateType];

  const unitLabel = config.unit === "slides" ? "slides" : "pages";
  const formatInstructions =
    config.unit === "slides"
      ? `Structure le contenu SLIDE PAR SLIDE :
- Chaque slide commence par "---\\n## Slide X : Titre de la slide"
- 1 slide = 1 idée clé (règle d'or UPGRADERS)
- Maximum 6 bullet points par slide
- Chaque slide doit pouvoir être lue en 30 secondes
- Alterne entre slides de contenu, slides visuelles (schémas textuels) et slides de synthèse
- Cette section doit produire 2-8 slides`
      : `Structure le contenu PAGE PAR PAGE :
- Utilise des titres et sous-titres clairs (## et ###)
- Inclus des tableaux markdown pour les matrices et comparatifs
- Cette section doit faire 2-5 pages (~500-1250 mots)`;

  return `Tu es un directeur de stratégie senior dans une agence de conseil UPGRADERS.
Tu rédiges un livrable professionnel de type "${config.title}" (${config.estimatedSlides[0]}-${config.estimatedSlides[1]} ${unitLabel}).

LIVRABLE : ${config.title}
SECTION EN COURS : ${sectionTitle}
MARQUE : ${context.brandName}
SECTEUR : ${context.sector || "Non spécifié"}

DESCRIPTION : ${config.subtitle}
Format total estimé : ${config.estimatedSlides[0]}-${config.estimatedSlides[1]} ${unitLabel}

RÈGLES D'OR UPGRADERS :
1. "Investissement", jamais "coût" — chaque dépense est un investissement stratégique
2. 1 slide = 1 idée — clarté et impact maximum
3. Chaque recommandation doit être ancrée dans les données de l'audit
4. Le ton est celui d'un cabinet de conseil premium — assertif, structuré, inspirant
5. Les chiffres et KPIs doivent être spécifiques et réalistes
6. Chaque section doit apporter une valeur ajoutée unique — pas de redondance
7. Les visuels sont suggérés sous forme de descriptions (schémas, graphiques, matrices)

${formatInstructions}

INSTRUCTIONS DE RÉDACTION :
1. Rédige en français professionnel, style cabinet de conseil premium
2. Sois concret et actionnable — chaque insight mène à une recommandation
3. NE RÉPÈTE PAS les informations des sections précédentes
4. Ancre tes analyses dans les données réelles fournies (piliers A-D-V-E-R-T-I)
5. Si des données manquent, signale-le et propose des hypothèses réalistes pour le secteur
6. Chaque section se termine par une transition vers la section suivante`;
}

function buildTemplateSectionPrompt(
  templateType: TemplateType,
  sectionTitle: string,
  sectionIndex: number,
  totalSections: number,
  previousSectionsSummary: string,
  context: TemplateContext,
): string {
  const config = TEMPLATE_CONFIG[templateType];
  const lines: string[] = [];

  lines.push(`# ${config.title}`);
  lines.push(
    `## Section ${sectionIndex + 1}/${totalSections} : ${sectionTitle}`,
  );
  lines.push("");

  // Add Implementation Data (Pillar I) — primary source
  if (context.implementationData) {
    const truncatedImpl =
      context.implementationData.length > 6000
        ? context.implementationData.substring(0, 6000) +
          "\n[... tronqué ...]"
        : context.implementationData;
    lines.push("## Données Pilier I — Intelligence de Marque (source principale)");
    lines.push(truncatedImpl);
    lines.push("");
  }

  // Add all relevant pillar data
  lines.push("## Données stratégiques des piliers A-D-V-E-R-T");
  lines.push("");

  for (const pillar of context.pillarContents) {
    // Skip I since we already included it above
    if (pillar.type === "I") continue;

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
  lines.push("## Plan complet du livrable");
  for (let i = 0; i < config.sections.length; i++) {
    const marker = i === sectionIndex ? "→ " : "  ";
    const status =
      i < sectionIndex ? "✓" : i === sectionIndex ? "📝" : "○";
    lines.push(`${marker}${status} ${i + 1}. ${config.sections[i]}`);
  }
  lines.push("");

  lines.push("---");

  const unitLabel = config.unit === "slides" ? "slides" : "pages";
  lines.push(
    `Rédige maintenant la section "${sectionTitle}" (2-8 ${unitLabel}).`,
  );

  if (config.unit === "slides") {
    lines.push(
      'Structure le contenu slide par slide. Chaque slide commence par "---\\n## Slide X : Titre".',
    );
  } else {
    lines.push(
      "Utilise le format markdown avec titres, sous-titres, tableaux et listes.",
    );
  }

  return lines.join("\n");
}
