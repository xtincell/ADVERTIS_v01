// =============================================================================
// MODULE 12 — Parametric Budget Formula Engine
// =============================================================================
//
// Implements the parametric budget formula:
//   Budget_poste_i = CA_visé × αᵢ(secteur) × βⱼ(maturité) × γₖ(environnement)
//   Budget_total   = Σ Budget_poste_i
//   Marge_nette    = CA_visé - Budget_total
//
// Where:
//   CA_visé  = Target annual revenue (user-provided)
//   αᵢ       = Sector cost coefficient for budget post i
//   βⱼ       = Maturity stage multiplier for budget post j
//   γₖ       = Environmental corrector for budget post k
//
// PUBLIC API :
//   12.1  calculateParametricBudget()  — Full budget breakdown
//   12.2  getCommBudgetBenchmark()     — Communication budget only
//   12.3  validateCommBudget()         — Check user budget vs formula
//   12.4  FormulaResult                — Result interface
//
// DEPENDENCIES :
//   - lib/constants → SECTOR_ALPHA, MATURITY_BETA, ENVIRONMENT_GAMMA, etc.
//
// CALLED BY :
//   - Module 6D (investment-calculator.ts)
//   - Module 5 (implementation-generation.ts) — prompt enrichment
//   - Module 11 (budget-tier-generator.ts) — tier calibration
//
// =============================================================================

import {
  BUDGET_POSTS,
  type BudgetPost,
  BUDGET_POST_LABELS,
  getSectorAlpha,
  getMaturityBeta,
  ENVIRONMENT_GAMMA,
  DEFAULT_GAMMA_PROFILE,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PosteBudget {
  poste: BudgetPost;
  label: string;
  alpha: number;
  beta: number;
  gamma: number;
  montant: number;
  pourcentageCA: number;
}

export interface FormulaResult {
  caVise: number;
  sector: string;
  maturity: string;
  budgetTotal: number;
  margeNette: number;
  margePourcentage: number;
  viable: boolean;        // margeNette > 0
  fragile: boolean;       // margePourcentage < 10%
  postes: PosteBudget[];
  commBudget: number;     // Communication post specifically
  commPourcentageCA: number;
}

// ---------------------------------------------------------------------------
// 12.1  Full parametric budget calculation
// ---------------------------------------------------------------------------

export function calculateParametricBudget(
  caVise: number,
  sector: string | null | undefined,
  maturity: string | null | undefined,
  gammaProfile: readonly string[] = DEFAULT_GAMMA_PROFILE,
): FormulaResult {
  const effectiveSector = sector ?? "other";
  const effectiveMaturity = maturity ?? "DEFAULT";
  const alpha = getSectorAlpha(effectiveSector);
  const beta = getMaturityBeta(effectiveMaturity);

  // Pre-compute γ per post: multiply all applicable gamma factors
  const gammaPerPost: Record<BudgetPost, number> = {} as Record<BudgetPost, number>;
  for (const post of BUDGET_POSTS) {
    gammaPerPost[post] = 1.0;
  }
  for (const gammaKey of gammaProfile) {
    const corrector = ENVIRONMENT_GAMMA[gammaKey];
    if (!corrector) continue;
    for (const post of corrector.posts) {
      gammaPerPost[post] *= corrector.factor;
    }
  }

  const postes: PosteBudget[] = BUDGET_POSTS.map((post) => {
    const a = alpha[post];
    const b = beta[post];
    const g = gammaPerPost[post];
    const montant = Math.round(caVise * a * b * g);
    return {
      poste: post,
      label: BUDGET_POST_LABELS[post],
      alpha: a,
      beta: b,
      gamma: g,
      montant,
      pourcentageCA: caVise > 0 ? Math.round((montant / caVise) * 10000) / 100 : 0,
    };
  });

  const budgetTotal = postes.reduce((sum, p) => sum + p.montant, 0);
  const margeNette = caVise - budgetTotal;
  const margePourcentage = caVise > 0 ? Math.round((margeNette / caVise) * 10000) / 100 : 0;
  const commBudget = postes.find((p) => p.poste === "comm")?.montant ?? 0;

  return {
    caVise,
    sector: effectiveSector,
    maturity: effectiveMaturity,
    budgetTotal,
    margeNette,
    margePourcentage,
    viable: margeNette > 0,
    fragile: margePourcentage < 10 && margePourcentage >= 0,
    postes,
    commBudget,
    commPourcentageCA: caVise > 0 ? Math.round((commBudget / caVise) * 10000) / 100 : 0,
  };
}

// ---------------------------------------------------------------------------
// 12.2  Communication budget benchmark only
// ---------------------------------------------------------------------------

/**
 * Quick calculation of the parametric communication budget
 * for a given CA, sector, maturity, and environment.
 */
export function getCommBudgetBenchmark(
  caVise: number,
  sector: string | null | undefined,
  maturity: string | null | undefined,
): number {
  const result = calculateParametricBudget(caVise, sector, maturity);
  return result.commBudget;
}

// ---------------------------------------------------------------------------
// 12.3  Validate user-provided comm budget against formula
// ---------------------------------------------------------------------------

export interface BudgetValidation {
  userBudget: number;
  formulaBudget: number;
  deviationPct: number;      // (user - formula) / formula × 100
  status: "optimal" | "acceptable" | "sous-investissement" | "sur-investissement" | "no-data";
  message: string;
}

/**
 * Compare user-provided annual comm budget against the parametric formula.
 * Returns a status and human-readable message.
 */
export function validateCommBudget(
  userBudget: number | null,
  caVise: number | null,
  sector: string | null | undefined,
  maturity: string | null | undefined,
): BudgetValidation {
  if (!userBudget || userBudget <= 0 || !caVise || caVise <= 0) {
    return {
      userBudget: userBudget ?? 0,
      formulaBudget: 0,
      deviationPct: 0,
      status: "no-data",
      message: "Données insuffisantes : CA visé et budget communication requis pour la validation.",
    };
  }

  const formulaBudget = getCommBudgetBenchmark(caVise, sector, maturity);
  if (formulaBudget <= 0) {
    return {
      userBudget,
      formulaBudget: 0,
      deviationPct: 0,
      status: "no-data",
      message: "Coefficient sectoriel communication = 0.",
    };
  }

  const deviationPct = Math.round(((userBudget - formulaBudget) / formulaBudget) * 100);

  let status: BudgetValidation["status"];
  let message: string;

  if (Math.abs(deviationPct) <= 15) {
    status = "optimal";
    message = `Budget cohérent avec la formule paramétrique (écart ${deviationPct > 0 ? "+" : ""}${deviationPct}%).`;
  } else if (deviationPct > 15 && deviationPct <= 50) {
    status = "acceptable";
    message = `Budget légèrement au-dessus de la référence paramétrique (+${deviationPct}%). Acceptable si la stratégie l'exige.`;
  } else if (deviationPct < -15 && deviationPct >= -40) {
    status = "acceptable";
    message = `Budget légèrement en-dessous de la référence paramétrique (${deviationPct}%). Risque de sous-performance.`;
  } else if (deviationPct > 50) {
    status = "sur-investissement";
    message = `Budget significativement au-dessus de la référence (+${deviationPct}%). Vérifier le ROI attendu et la capacité d'absorption.`;
  } else {
    status = "sous-investissement";
    message = `Budget très en-dessous de la référence (${deviationPct}%). Impact probable sur la notoriété et les résultats.`;
  }

  return { userBudget, formulaBudget, deviationPct, status, message };
}

// ---------------------------------------------------------------------------
// 12.4  Format formula result for AI prompt injection
// ---------------------------------------------------------------------------

/**
 * Generate a text summary of the parametric budget for injection into AI prompts.
 */
export function formatFormulaForPrompt(result: FormulaResult, currency: string = "FCFA"): string {
  const lines = [
    `FORMULE PARAMÉTRIQUE — Budget_poste = CA × α(secteur) × β(maturité) × γ(environnement)`,
    `CA visé : ${result.caVise.toLocaleString("fr-FR")} ${currency}`,
    `Secteur : ${result.sector} | Maturité : ${result.maturity}`,
    ``,
    `VENTILATION PAR POSTE :`,
  ];

  for (const p of result.postes) {
    lines.push(`  ${p.label}: ${p.montant.toLocaleString("fr-FR")} ${currency} (${p.pourcentageCA}% du CA) [α=${p.alpha} × β=${p.beta} × γ=${Math.round(p.gamma * 100) / 100}]`);
  }

  lines.push(``);
  lines.push(`TOTAL CHARGES : ${result.budgetTotal.toLocaleString("fr-FR")} ${currency}`);
  lines.push(`MARGE NETTE : ${result.margeNette.toLocaleString("fr-FR")} ${currency} (${result.margePourcentage}%)`);
  lines.push(`VIABILITÉ : ${result.viable ? "OUI" : "NON"} ${result.fragile ? "⚠ FRAGILE (marge < 10%)" : ""}`);
  lines.push(``);
  lines.push(`BUDGET COMMUNICATION PARAMÉTRIQUE : ${result.commBudget.toLocaleString("fr-FR")} ${currency} (${result.commPourcentageCA}% du CA)`);

  return lines.join("\n");
}
