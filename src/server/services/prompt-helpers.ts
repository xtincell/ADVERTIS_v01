// =============================================================================
// MODULE 5B — Prompt Helpers
// =============================================================================
//
// Reusable functions for injecting vertical vocabulary and maturity profile
// context into AI generation prompts.
//
// PUBLIC API :
//   5B.1  SpecializationOptions   — Interface { vertical?, maturityProfile? }
//   5B.2  buildVerticalContext()   — Builds sector-specific vocabulary lines
//   5B.3  buildMaturityContext()   — Builds maturity profile context string
//   5B.4  injectSpecialization()   — Injects both vertical + maturity into prompt
//
// DEPENDENCIES :
//   - lib/constants (VERTICAL_DICTIONARY, MATURITY_CONFIG)
//
// CALLED BY :
//   - Module 7  (ai-generation.ts) via options parameter
//   - Module 8  (audit-generation.ts) via injectSpecialization()
//   - Module 9  (implementation-generation.ts) via injectSpecialization()
//
// =============================================================================

import {
  VERTICAL_DICTIONARY,
  MATURITY_CONFIG,
} from "~/lib/constants";
import type { MaturityProfile } from "~/lib/constants";

// 5B.1  Types

export interface SpecializationOptions {
  vertical?: string | null;
  maturityProfile?: string | null;
}

// 5B.2  buildVerticalContext

/**
 * Build vertical vocabulary context lines for injection into prompts.
 */
export function buildVerticalContext(vertical?: string | null): string {
  if (!vertical || !VERTICAL_DICTIONARY[vertical]) return "";
  const dict = VERTICAL_DICTIONARY[vertical]!;
  const vocab = Object.entries(dict)
    .map(([k, v]) => `${k}="${v}"`)
    .join(", ");
  return [
    "",
    `# Vertical : ${vertical}`,
    `# Vocabulaire sectoriel : ${vocab}`,
    "IMPORTANT : Utilise le vocabulaire sectoriel ci-dessus au lieu des termes génériques.",
  ].join("\n");
}

// 5B.3  buildMaturityContext

/**
 * Build maturity profile context for appending to system prompts.
 */
export function buildMaturityContext(maturity?: string | null): string {
  if (!maturity) return "";
  const config = MATURITY_CONFIG[maturity as MaturityProfile];
  if (!config) return "";
  return [
    "",
    "",
    `PROFIL DE MATURITÉ : ${maturity} (${config.ratio} descriptif/projectif)`,
    `- Mode de génération : ${config.generationMode}`,
    `- Focus cockpit : ${config.cockpitFocus}`,
    "- Si le profil est STARTUP ou LAUNCH, privilégie les recommandations et hypothèses plutôt que les descriptions factuelles.",
    "- Si le profil est MATURE, base-toi uniquement sur les données fournies, pas de projections.",
  ].join("\n");
}

// 5B.4  injectSpecialization

/**
 * Inject both vertical and maturity specialization into a system prompt.
 * Returns the enriched prompt string.
 */
export function injectSpecialization(
  systemPrompt: string,
  options?: SpecializationOptions | null,
): string {
  if (!options) return systemPrompt;
  let prompt = systemPrompt;
  if (options.maturityProfile) {
    prompt += buildMaturityContext(options.maturityProfile);
  }
  if (options.vertical) {
    prompt += buildVerticalContext(options.vertical);
  }
  return prompt;
}
