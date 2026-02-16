// ADVERTIS AI Generation Engine
// Generates strategic content for each of the 8 ADVERTIS pillars sequentially,
// using the Vercel AI SDK with Anthropic Claude.

import { generateText } from "ai";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { getInterviewSchema } from "~/lib/interview-schema";
import { anthropic, DEFAULT_MODEL } from "./anthropic-client";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates the strategic content for one ADVERTIS pillar.
 *
 * @param pillarType  - The pillar letter (A, D, V, E, R, T, I, or S)
 * @param interviewData - All interview answers keyed by variable id (e.g. { A1: "...", D3: "..." })
 * @param previousPillars - Already generated pillars for cascade context
 * @param brandName - Name of the brand
 * @param sector - Industry sector label
 */
export async function generatePillarContent(
  pillarType: string,
  interviewData: Record<string, string>,
  previousPillars: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): Promise<string> {
  const systemPrompt = getSystemPrompt(pillarType);
  const userPrompt = buildUserPrompt(
    pillarType,
    interviewData,
    previousPillars,
    brandName,
    sector,
  );

  const result = await generateText({
    model: anthropic(DEFAULT_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 4000,
  });

  return result.text;
}

// ---------------------------------------------------------------------------
// System prompts — one per pillar
// ---------------------------------------------------------------------------

const SYSTEM_PROMPTS: Record<string, string> = {
  A: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier A — Authenticite.

Ton role est de definir l'ADN profond de la marque : son identite, ses valeurs fondatrices, sa raison d'etre (Ikigai), son archetype, et l'histoire de la marque (Hero's Journey).

Genere un document structure en markdown avec les sections suivantes :
1. **Identite de Marque** — Archetype, citation fondatrice, noyau identitaire
2. **Hero's Journey** — L'histoire de la marque en 5 actes
3. **Ikigai** — Raison d'etre (Aimer, Competence, Besoin, Remuneration)
4. **Valeurs** — 3-5 valeurs Schwartz hierarchisees avec justification
5. **Hierarchie Communautaire** — 6 niveaux de fans
6. **Timeline Narrative** — Chronologie en 4 actes

Sois precis, actionnable et ancre dans le secteur d'activite. Utilise un ton professionnel en francais. Si des donnees manquent, propose des recommandations basees sur le secteur et le positionnement de la marque.`,

  D: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier D — Distinction.

Ton role est de definir comment la marque se differencie : personas, positionnement, promesses, identite visuelle et vocale.

Genere un document structure en markdown avec les sections suivantes :
1. **Personas** — Portraits detailles des clients cibles (demographie, psychographie, motivations, freins)
2. **Paysage Concurrentiel** — Cartographie des concurrents et avantages competitifs
3. **Promesses de Marque** — Promesse maitre + sous-promesses
4. **Positionnement** — Statement unique (Pour [cible], [marque] est...)
5. **Ton de Voix** — Personnalite vocale, ce qu'on dit / ne dit pas
6. **Identite Visuelle** — Direction artistique, couleurs, mood
7. **Assets Linguistiques** — Mantras, vocabulaire proprietaire

Appuie-toi sur les insights du Pilier A (Authenticite) pour garantir la coherence. Sois strategique et concret.`,

  V: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier V — Valeur.

Ton role est de definir la proposition de valeur, l'architecture de l'offre, et les metriques economiques.

Genere un document structure en markdown avec les sections suivantes :
1. **Product Ladder** — Architecture de l'offre en tiers (entree, coeur, premium)
2. **Valeur pour la Marque** — Actifs tangibles et intangibles
3. **Valeur pour le Client** — Gains fonctionnels, emotionnels, sociaux
4. **Cout pour la Marque** — CAPEX, OPEX, couts caches
5. **Cout pour le Client** — Frictions identifiees et solutions
6. **Unit Economics** — CAC, LTV, marges, point mort, ratio LTV/CAC

Relie la valeur au positionnement defini dans les piliers precedents. Propose des chiffres realistes pour le secteur si les donnees ne sont pas fournies.`,

  E: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier E — Engagement.

Ton role est de definir les mecanismes d'engagement : touchpoints, rituels, communaute, gamification et metriques AARRR.

Genere un document structure en markdown avec les sections suivantes :
1. **Touchpoints** — Points de contact physiques, digitaux, humains
2. **Rituels** — Comportements Always-On et Cycliques
3. **Principes Communautaires** — 5-10 principes + tabous
4. **Gamification** — Systeme de progression 3-5 niveaux
5. **AARRR Funnel** — Metriques pour Acquisition, Activation, Retention, Revenue, Referral
6. **KPIs Dashboard** — 1-3 KPIs par variable ADVERTIS

Aligne les touchpoints sur les personas (D) et la proposition de valeur (V). Sois concret avec des actions implementables.`,

  R: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier R — Risk.

Ton role est d'evaluer les risques strategiques en analysant les forces, faiblesses, opportunites et menaces identifiees dans les piliers A a E.

Genere un document structure en markdown avec les sections suivantes :
1. **SWOTs Individuels** — Analyse SWOT pour chaque variable cle des piliers A a E
2. **SWOT Global** — Agregation et patterns transversaux
3. **Score de Risque** — Score global 0-100 avec justification
4. **Matrice Probabilite x Impact** — Classement des risques majeurs
5. **Priorites de Mitigation** — Actions correctives classees par urgence et impact

Sois objectif et critique. Identifie les failles strategiques reelles. Propose des actions de mitigation concretes et priorisees.`,

  T: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier T — Track.

Ton role est de valider la strategie par confrontation aux donnees de marche et de definir la taille du marche adressable.

Genere un document structure en markdown avec les sections suivantes :
1. **Croisement 3 Sources** — Triangulation des donnees (internes, marche, clients)
2. **Validation des Hypotheses** — Confrontation A-E aux donnees reelles (valide / invalide / a tester)
3. **Rapport Realite Marche** — Tendances macro et signaux faibles
4. **TAM/SAM/SOM** — Taille de marche avec estimations chiffrees

Base tes analyses sur les donnees fournies et les tendances connues du secteur. Sois factuel et cite tes sources de raisonnement.`,

  I: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier I — Implementation.

Ton role est de transformer la strategie en plan d'action concret avec roadmap, budget, equipe et quick wins.

Genere un document structure en markdown avec les sections suivantes :
1. **Roadmap Strategique** — Jalons sur 12-36 mois
2. **Phases de Lancement** — Quick Wins, Fondations, Deploiement
3. **Quick Wins** — 3-5 actions realisables en < 2 semaines
4. **Budget** — Enveloppe globale + allocation Phase 1
5. **ROI et Payback** — Objectifs de retour sur investissement
6. **Structure d'Equipe** — Roles, responsabilites, profils cles
7. **Partenaires Externes** — Agences et freelancers necessaires

Sois extremement concret et actionnable. Chaque action doit avoir un responsable, un delai et un livrable mesurable.`,

  S: `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS.
Tu generes le contenu du Pilier S — Strategie.

Ce pilier est la synthese finale de toute la strategie ADVERTIS. Il compile les insights des 7 piliers precedents en une bible strategique coherente.

Genere un document structure en markdown avec les sections suivantes :
1. **Synthese Executive** — Resume de la strategie en 1 page (contexte, positionnement, proposition de valeur, plan d'action)
2. **Vision Strategique** — Direction a 3-5 ans
3. **Coherence des Piliers** — Comment les 7 piliers s'articulent ensemble
4. **Facteurs Cles de Succes** — 5-7 conditions necessaires
5. **Recommandations Prioritaires** — Top 10 actions a mener
6. **Score de Coherence** — Evaluation 0-100 de la coherence globale de la strategie

Ce document doit etre la reference strategique definitive. Sois synthetique mais complet. Chaque recommandation doit etre ancree dans les analyses precedentes.`,
};

function getSystemPrompt(pillarType: string): string {
  return (
    SYSTEM_PROMPTS[pillarType] ??
    `Tu es un expert en strategie de marque utilisant la methodologie ADVERTIS. Genere le contenu strategique pour le pilier ${pillarType} en markdown structure.`
  );
}

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(
  pillarType: string,
  interviewData: Record<string, string>,
  previousPillars: Array<{ type: string; content: string }>,
  brandName: string,
  sector: string,
): string {
  const pillarConfig = PILLAR_CONFIG[pillarType as PillarType];
  const schema = getInterviewSchema();
  const pillarSection = schema.find((s) => s.pillarType === pillarType);

  // Header
  const lines: string[] = [
    `# Marque : ${brandName}`,
    `# Secteur : ${sector || "Non specifie"}`,
    `# Pilier : ${pillarType} — ${pillarConfig?.title ?? pillarType}`,
    "",
  ];

  // Interview data for this pillar
  if (pillarSection && pillarSection.variables.length > 0) {
    lines.push("## Donnees d'entretien pour ce pilier");
    lines.push("");

    for (const variable of pillarSection.variables) {
      const raw = interviewData[variable.id];
      const value = typeof raw === "string" ? raw : (raw != null ? JSON.stringify(raw) : "");
      if (value.trim()) {
        lines.push(`### ${variable.id} — ${variable.label}`);
        lines.push(value.trim());
        lines.push("");
      } else {
        lines.push(
          `### ${variable.id} — ${variable.label} : *Non renseigne — genere une proposition basee sur le contexte.*`,
        );
        lines.push("");
      }
    }
  }

  // For Pillar S, also include interview data from ALL pillars
  if (pillarType === "S") {
    lines.push("## Donnees d'entretien globales");
    lines.push("");
    for (const section of schema) {
      for (const variable of section.variables) {
        const raw = interviewData[variable.id];
        const value = typeof raw === "string" ? raw : (raw != null ? JSON.stringify(raw) : "");
        if (value.trim()) {
          lines.push(`- **${variable.id} (${variable.label})** : ${value.trim()}`);
        }
      }
    }
    lines.push("");
  }

  // Context from previously generated pillars
  if (previousPillars.length > 0) {
    lines.push("## Contexte des piliers precedents");
    lines.push(
      "Utilise les insights suivants pour assurer la coherence avec les piliers deja generes :",
    );
    lines.push("");

    for (const prev of previousPillars) {
      const prevConfig = PILLAR_CONFIG[prev.type as PillarType];
      lines.push(
        `### Pilier ${prev.type} — ${prevConfig?.title ?? prev.type}`,
      );
      // Include a truncated version to stay within token limits
      const truncated =
        prev.content.length > 2000
          ? prev.content.substring(0, 2000) + "\n\n[... contenu tronque ...]"
          : prev.content;
      lines.push(truncated);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(
    `Genere maintenant le contenu strategique complet pour le Pilier ${pillarType} — ${pillarConfig?.title ?? pillarType}.`,
  );
  lines.push(
    "Utilise le format markdown structure avec des titres, sous-titres, listes et tableaux le cas echeant.",
  );

  return lines.join("\n");
}
