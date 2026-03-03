// =============================================================================
// MODULE 6D — Investment Score Calculator
// =============================================================================
//
// Deterministic mathematical formula for the Investment quality score.
// Consumes structured data from ImplementationData (Pillar I), the
// user-provided annualBudget + targetRevenue, and the parametric
// budget formula (Module 12) for sector/maturity validation.
//
// FORMULA (5 components, max 100) :
//   6D.1  budgetRealism       (30) — Budget vs parametric formula (CA × α × β × γ)
//   6D.2  allocationQuality   (25) — Budget distributed across ≥4 postes? No >40%?
//   6D.3  roiProjections      (20) — ROI projections present and reasonable?
//   6D.4  channelCoverage     (15) — Campaign channels diverse and appropriate?
//   6D.5  phaseBalance        (10) — Budget spread across ≥3 phases?
//
// PUBLIC API :
//   6D.0  InvestBreakdown              — Interface with component breakdown
//   6D.1  calculateInvestmentScore()   — Pure function → InvestBreakdown
//
// DEPENDENCIES :
//   - lib/types/pillar-schemas → ImplementationData
//   - Module 12 (budget-formula.ts) → validateCommBudget
//
// CALLED BY :
//   - Module 6 (score-engine.ts)
//
// =============================================================================

import type { ImplementationData } from "~/lib/types/pillar-schemas";
import { validateCommBudget } from "./budget-formula";

// ---------------------------------------------------------------------------
// 6D.0  Breakdown interface
// ---------------------------------------------------------------------------

export interface InvestBreakdown {
  /** 0-30 — budget vs parametric formula (CA × α × β × γ) */
  budgetRealism: number;
  /** 0-25 — poste distribution quality */
  allocationQuality: number;
  /** 0-20 — ROI projections completeness */
  roiProjections: number;
  /** 0-15 — campaign channel diversity */
  channelCoverage: number;
  /** 0-10 — budget spread across phases */
  phaseBalance: number;
  /** 0-100 — total investment score */
  total: number;
  /** Parametric validation result */
  formulaValidation: {
    userBudget: number;
    formulaBudget: number;
    deviationPct: number;
    status: string;
  } | null;
}

// ---------------------------------------------------------------------------
// 6D.1  Calculator (pure function — no DB, no side effects)
// ---------------------------------------------------------------------------

export function calculateInvestmentScore(
  implData: ImplementationData,
  annualBudget: number | null,
  targetRevenue: number | null,
  sector: string | null | undefined,
  maturity: string | null | undefined,
): InvestBreakdown {
  // --- 1. budgetRealism (max 30) — validated against parametric formula ---
  let budgetRealism = 0;
  let formulaValidation: InvestBreakdown["formulaValidation"] = null;

  if (annualBudget && annualBudget > 0) {
    const validation = validateCommBudget(annualBudget, targetRevenue, sector, maturity);
    formulaValidation = {
      userBudget: validation.userBudget,
      formulaBudget: validation.formulaBudget,
      deviationPct: validation.deviationPct,
      status: validation.status,
    };

    switch (validation.status) {
      case "optimal":
        budgetRealism = 30; // Perfect alignment with parametric formula
        break;
      case "acceptable":
        budgetRealism = 20; // Within tolerance but not optimal
        break;
      case "sur-investissement":
        budgetRealism = 12; // Over-spending — possible but risky
        break;
      case "sous-investissement":
        budgetRealism = 8;  // Under-spending — high risk of underperformance
        break;
      case "no-data":
        // CA visé missing — partial credit for having a budget at all
        budgetRealism = 10;
        break;
    }
  }
  // annualBudget absent → budgetRealism stays 0

  // --- 2. allocationQuality (max 25) ---
  let allocationQuality = 0;
  const postes = implData.budgetAllocation?.parPoste ?? [];
  const postesWithAmount = postes.filter(
    (p) => p.poste && (p.pourcentage > 0 || /\d/.test(p.montant)),
  );

  // Diversity: ≥4 postes = 12pts, ≥2 = 6pts
  if (postesWithAmount.length >= 4) {
    allocationQuality += 12;
  } else if (postesWithAmount.length >= 2) {
    allocationQuality += 6;
  }

  // Concentration: no single poste > 40%
  const maxPercentage = Math.max(0, ...postesWithAmount.map((p) => p.pourcentage));
  if (maxPercentage > 0 && maxPercentage <= 40) {
    allocationQuality += 8;
  } else if (maxPercentage > 40 && maxPercentage <= 60) {
    allocationQuality += 4;
  }

  // Consistency: percentages sum to ~100
  const totalPct = postesWithAmount.reduce((s, p) => s + p.pourcentage, 0);
  if (totalPct >= 90 && totalPct <= 110) {
    allocationQuality += 5;
  }

  // --- 3. roiProjections (max 20) ---
  let roiProjectionsScore = 0;
  const roi = implData.budgetAllocation?.roiProjections;
  if (roi) {
    if (roi.mois6 && roi.mois6.trim().length > 0) roiProjectionsScore += 5;
    if (roi.mois12 && roi.mois12.trim().length > 0) roiProjectionsScore += 5;
    if (roi.mois24 && roi.mois24.trim().length > 0) roiProjectionsScore += 5;
    if (roi.hypotheses && roi.hypotheses.trim().length > 0) roiProjectionsScore += 5;
  }

  // --- 4. channelCoverage (max 15) ---
  let channelCoverage = 0;
  const channelSet = new Set<string>();
  for (const campaign of implData.campaigns?.annualCalendar ?? []) {
    for (const canal of campaign.canaux ?? []) {
      if (canal?.trim()) channelSet.add(canal.trim().toLowerCase());
    }
  }
  const uniqueChannels = channelSet.size;
  if (uniqueChannels >= 6) channelCoverage = 15;
  else if (uniqueChannels >= 4) channelCoverage = 10;
  else if (uniqueChannels >= 2) channelCoverage = 5;

  // --- 5. phaseBalance (max 10) ---
  let phaseBalance = 0;
  const phases = implData.budgetAllocation?.parPhase ?? [];
  const phasesWithAmount = phases.filter(
    (p) => p.phase && /\d/.test(p.montant),
  );
  if (phasesWithAmount.length >= 3) phaseBalance = 10;
  else if (phasesWithAmount.length >= 2) phaseBalance = 6;
  else if (phasesWithAmount.length >= 1) phaseBalance = 3;

  const total = Math.min(
    100,
    budgetRealism + allocationQuality + roiProjectionsScore + channelCoverage + phaseBalance,
  );

  return {
    budgetRealism,
    allocationQuality,
    roiProjections: roiProjectionsScore,
    channelCoverage,
    phaseBalance,
    total,
    formulaValidation,
  };
}
