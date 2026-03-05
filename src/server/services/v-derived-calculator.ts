// =============================================================================
// V Derived Calculator — Auto-computed unit economics fields
// =============================================================================
// Computes margeNette, roiEstime, paybackPeriod from base V pillar data.
// Called after every V pillar save to keep derived fields in sync.
// =============================================================================

import type { ValeurPillarDataV2 } from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a numeric value from a string that may contain currency symbols, spaces, etc. */
function parseNumeric(val: string | undefined): number | null {
  if (!val || val.trim().length === 0) return null;
  const cleaned = val
    .replace(/[^\d.,-]/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ---------------------------------------------------------------------------
// Main computation
// ---------------------------------------------------------------------------

export interface VDerivedFields {
  margeNette: string;
  roiEstime: string;
  paybackPeriod: string;
}

/**
 * Compute derived unit economics fields from base V pillar data.
 *
 * - margeNette    = LTV - CAC
 * - roiEstime     = ((LTV - CAC) / CAC) * 100  (percentage)
 * - paybackPeriod = CAC / (LTV / dureeLTV)      (months)
 */
export function computeVDerivedFields(data: ValeurPillarDataV2): VDerivedFields {
  const cacNum = parseNumeric(data.cac);
  const ltvNum = parseNumeric(data.ltv);
  const dureeLTV = data.dureeLTV > 0 ? data.dureeLTV : 24;

  let margeNette = "";
  let roiEstime = "";
  let paybackPeriod = "";

  if (cacNum !== null && ltvNum !== null) {
    // Marge nette = LTV - CAC
    const marge = ltvNum - cacNum;
    margeNette = marge.toFixed(2);

    // ROI estime = ((LTV - CAC) / CAC) * 100
    if (cacNum > 0) {
      const roi = ((ltvNum - cacNum) / cacNum) * 100;
      roiEstime = roi.toFixed(1) + "%";
    }

    // Payback period = CAC / monthly revenue, where monthly = LTV / dureeLTV
    if (ltvNum > 0) {
      const monthlyRevenue = ltvNum / dureeLTV;
      if (monthlyRevenue > 0) {
        const payback = cacNum / monthlyRevenue;
        paybackPeriod = payback.toFixed(1) + " mois";
      }
    }
  }

  return { margeNette, roiEstime, paybackPeriod };
}

/**
 * Apply derived fields to V pillar data, returning a new object.
 * Does not mutate the input.
 */
export function applyVDerivedFields(
  data: ValeurPillarDataV2,
): ValeurPillarDataV2 {
  const derived = computeVDerivedFields(data);
  return {
    ...data,
    margeNette: derived.margeNette,
    roiEstime: derived.roiEstime,
    paybackPeriod: derived.paybackPeriod,
  };
}
