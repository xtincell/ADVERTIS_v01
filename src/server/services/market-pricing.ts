// =============================================================================
// MODULE 19 — Market Pricing
// =============================================================================
// Manages pricing models and market rate calculations for African markets
// (CM, CI, SN, GH, NG). Covers production, media, event, talent, and digital
// costs by market. Enriched mission-by-mission via debrief insights with
// weighted averaging. Provides mission cost estimation from assignments and
// market rates. Includes seed data for initial benchmarks.
//
// Public API:
//   1. upsertPricing()          — Create or update a pricing entry
//   2. deletePricing()          — Delete a pricing entry
//   3. getPricingByMarket()     — Get all pricing for a market
//   4. getPricingByCategory()   — Get pricing filtered by market + category
//   5. searchPricing()          — Search pricing by label or subcategory
//   6. calculateMissionCost()   — Estimate mission cost from assignments
//   7. enrichFromDebrief()      — Enrich pricing from debrief insights
//   8. seedDefaultPricing()     — Seed default reference pricing for a market
//
// Dependencies:
//   - ~/server/db (Prisma — MarketPricing)
//   - ~/lib/types/phase3-schemas (UpsertMarketPricingInput)
//
// Called by:
//   - tRPC pricing router (pricing.upsert, pricing.list, pricing.search)
//   - Mission Manager (Module 18) — debrief enrichment
// =============================================================================

import { db } from "~/server/db";
import type { UpsertMarketPricingInput } from "~/lib/types/phase3-schemas";

// ============================================
// CRUD
// ============================================

/**
 * Upsert a pricing entry (create or update by unique constraint).
 */
export async function upsertPricing(
  data: UpsertMarketPricingInput,
  updatedBy: string,
) {
  return db.marketPricing.upsert({
    where: {
      market_category_subcategory: {
        market: data.market,
        category: data.category,
        subcategory: data.subcategory,
      },
    },
    create: {
      market: data.market,
      category: data.category,
      subcategory: data.subcategory,
      label: data.label,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      avgPrice: data.avgPrice ?? (data.minPrice + data.maxPrice) / 2,
      currency: data.currency ?? "XAF",
      unit: data.unit,
      source: data.source,
      confidence: data.confidence ?? "MEDIUM",
      updatedBy,
      lastUpdated: new Date(),
    },
    update: {
      label: data.label,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      avgPrice: data.avgPrice ?? (data.minPrice + data.maxPrice) / 2,
      currency: data.currency ?? "XAF",
      unit: data.unit,
      source: data.source,
      confidence: data.confidence ?? "MEDIUM",
      updatedBy,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Delete a pricing entry.
 */
export async function deletePricing(id: string) {
  return db.marketPricing.delete({ where: { id } });
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all pricing entries for a market.
 */
export async function getPricingByMarket(market: string) {
  return db.marketPricing.findMany({
    where: { market },
    orderBy: [{ category: "asc" }, { subcategory: "asc" }],
  });
}

/**
 * Get pricing entries filtered by market and category.
 */
export async function getPricingByCategory(market: string, category: string) {
  return db.marketPricing.findMany({
    where: { market, category },
    orderBy: { subcategory: "asc" },
  });
}

/**
 * Search pricing entries by label or subcategory.
 */
export async function searchPricing(query: string) {
  return db.marketPricing.findMany({
    where: {
      OR: [
        { label: { contains: query, mode: "insensitive" } },
        { subcategory: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { market: "asc" },
  });
}

// ============================================
// COST ESTIMATION
// ============================================

interface AssignmentCostInput {
  role: string;
  estimatedDays: number;
  dayRate?: number;
}

/**
 * Calculate estimated mission cost based on assignments and market rates.
 * If assignments have explicit dayRates, uses those; otherwise looks up MarketPricing.
 */
export async function calculateMissionCost(
  assignments: AssignmentCostInput[],
  market: string,
) {
  let totalCost = 0;
  const details: Array<{
    role: string;
    days: number;
    rate: number;
    subtotal: number;
    source: string;
  }> = [];

  // Load talent pricing for this market
  const talentPricing = await db.marketPricing.findMany({
    where: { market, category: "TALENT" },
  });

  for (const assignment of assignments) {
    let rate = assignment.dayRate ?? 0;
    let source = "explicit";

    if (!assignment.dayRate) {
      // Look up from MarketPricing
      const roleMapping: Record<string, string> = {
        DA: "da_day_rate",
        CR: "cr_day_rate",
        STRAT: "strat_day_rate",
        PROD: "prod_day_rate",
        DEV: "dev_day_rate",
        MEDIA: "media_day_rate",
        SOCIAL: "social_day_rate",
        RP: "rp_day_rate",
        EVENT: "event_day_rate",
      };
      const subcategory = roleMapping[assignment.role];
      const pricingEntry = talentPricing.find(
        (p) => p.subcategory === subcategory,
      );
      if (pricingEntry) {
        rate = pricingEntry.avgPrice ?? (pricingEntry.minPrice + pricingEntry.maxPrice) / 2;
        source = "market_pricing";
      }
    }

    const subtotal = rate * assignment.estimatedDays;
    totalCost += subtotal;
    details.push({
      role: assignment.role,
      days: assignment.estimatedDays,
      rate,
      subtotal,
      source,
    });
  }

  return { totalCost, currency: "XAF", details };
}

// ============================================
// DEBRIEF ENRICHMENT
// ============================================

/**
 * Enrich pricing data from a mission debrief's pricing insights.
 * Called after completing a mission debrief that includes cost data.
 */
export async function enrichFromDebrief(
  _missionId: string,
  pricingInsights: Array<{
    market: string;
    category: string;
    subcategory: string;
    label: string;
    actualPrice: number;
    unit: string;
  }>,
  updatedBy: string,
) {
  const results = [];

  for (const insight of pricingInsights) {
    // Check existing pricing
    const existing = await db.marketPricing.findUnique({
      where: {
        market_category_subcategory: {
          market: insight.market,
          category: insight.category,
          subcategory: insight.subcategory,
        },
      },
    });

    if (existing) {
      // Update with weighted average (existing data has more weight)
      const newMin = Math.min(existing.minPrice, insight.actualPrice);
      const newMax = Math.max(existing.maxPrice, insight.actualPrice);
      const newAvg = existing.avgPrice
        ? (existing.avgPrice * 0.7 + insight.actualPrice * 0.3) // 70-30 weighted
        : insight.actualPrice;

      const updated = await db.marketPricing.update({
        where: { id: existing.id },
        data: {
          minPrice: newMin,
          maxPrice: newMax,
          avgPrice: Math.round(newAvg),
          source: "mission_debrief",
          confidence: "HIGH", // Real data increases confidence
          updatedBy,
          lastUpdated: new Date(),
        },
      });
      results.push(updated);
    } else {
      // Create new entry from debrief data
      const created = await db.marketPricing.create({
        data: {
          market: insight.market,
          category: insight.category,
          subcategory: insight.subcategory,
          label: insight.label,
          minPrice: insight.actualPrice * 0.8, // ±20% range
          maxPrice: insight.actualPrice * 1.2,
          avgPrice: insight.actualPrice,
          currency: "XAF",
          unit: insight.unit,
          source: "mission_debrief",
          confidence: "HIGH",
          updatedBy,
          lastUpdated: new Date(),
        },
      });
      results.push(created);
    }
  }

  return results;
}

// ============================================
// SEED DEFAULT PRICING
// ============================================

/**
 * Seed default reference pricing for a market.
 * Provides initial cost benchmarks for common items.
 */
export async function seedDefaultPricing(market: string, updatedBy: string) {
  const defaults = getDefaultPricing(market);
  const results = [];

  for (const entry of defaults) {
    const result = await db.marketPricing.upsert({
      where: {
        market_category_subcategory: {
          market: entry.market,
          category: entry.category,
          subcategory: entry.subcategory,
        },
      },
      create: { ...entry, updatedBy, lastUpdated: new Date() },
      update: {}, // Don't overwrite existing data
    });
    results.push(result);
  }

  return results;
}

function getDefaultPricing(market: string) {
  // XAF-based defaults for Cameroon, adjustable per market
  const multiplier = market === "CI" ? 1.1 : market === "SN" ? 0.95 : market === "GH" ? 0.8 : market === "NG" ? 0.9 : 1;

  return [
    // TALENT
    { market, category: "TALENT", subcategory: "da_day_rate", label: "Directeur Artistique (jour)", minPrice: 150000 * multiplier, maxPrice: 350000 * multiplier, avgPrice: 250000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "cr_day_rate", label: "Concepteur-Rédacteur (jour)", minPrice: 120000 * multiplier, maxPrice: 280000 * multiplier, avgPrice: 200000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "strat_day_rate", label: "Stratège (jour)", minPrice: 200000 * multiplier, maxPrice: 450000 * multiplier, avgPrice: 325000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "prod_day_rate", label: "Producteur (jour)", minPrice: 180000 * multiplier, maxPrice: 400000 * multiplier, avgPrice: 290000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "dev_day_rate", label: "Développeur (jour)", minPrice: 100000 * multiplier, maxPrice: 300000 * multiplier, avgPrice: 200000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "media_day_rate", label: "Media Planner (jour)", minPrice: 130000 * multiplier, maxPrice: 300000 * multiplier, avgPrice: 215000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "TALENT", subcategory: "social_day_rate", label: "Community Manager (jour)", minPrice: 80000 * multiplier, maxPrice: 200000 * multiplier, avgPrice: 140000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    // PRODUCTION
    { market, category: "PRODUCTION", subcategory: "spot_tv_30s", label: "Spot TV 30s", minPrice: 5000000 * multiplier, maxPrice: 25000000 * multiplier, avgPrice: 12000000 * multiplier, currency: "XAF", unit: "per_unit", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "PRODUCTION", subcategory: "spot_radio_30s", label: "Spot Radio 30s", minPrice: 500000 * multiplier, maxPrice: 3000000 * multiplier, avgPrice: 1500000 * multiplier, currency: "XAF", unit: "per_unit", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "PRODUCTION", subcategory: "photo_shoot_day", label: "Shooting Photo (jour)", minPrice: 1000000 * multiplier, maxPrice: 5000000 * multiplier, avgPrice: 2500000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "MEDIUM" },
    // MEDIA
    { market, category: "MEDIA", subcategory: "billboard_4x3_month", label: "Panneau 4x3 (mois)", minPrice: 300000 * multiplier, maxPrice: 1500000 * multiplier, avgPrice: 700000 * multiplier, currency: "XAF", unit: "per_month", source: "agency_data", confidence: "MEDIUM" },
    { market, category: "MEDIA", subcategory: "facebook_cpm", label: "Facebook CPM", minPrice: 500 * multiplier, maxPrice: 3000 * multiplier, avgPrice: 1500 * multiplier, currency: "XAF", unit: "per_unit", source: "agency_data", confidence: "LOW" },
    // EVENT
    { market, category: "EVENT", subcategory: "venue_rental_day", label: "Location salle (jour)", minPrice: 500000 * multiplier, maxPrice: 5000000 * multiplier, avgPrice: 2000000 * multiplier, currency: "XAF", unit: "per_day", source: "agency_data", confidence: "LOW" },
  ];
}
