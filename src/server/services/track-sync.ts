// =============================================================================
// MODULE 13 — Track Sync Service
// =============================================================================
//
// Synchronizes Pillar T (Track/BMF) data to the CompetitorSnapshot and
// OpportunityCalendar tables. Runs fire-and-forget after T generation.
//
// SYNC MAPPING :
//   13.1  competitiveBenchmark[]        → upsert CompetitorSnapshot (one per competitor)
//   13.2  marketReality.macroTrends     → OpportunityCalendar (PREDICTIVE, HIGH)
//   13.3  marketReality.weakSignals     → OpportunityCalendar (COMPETITIVE, MEDIUM)
//   13.4  marketReality.emergingPatterns → OpportunityCalendar (INTERNAL, LOW)
//
// PUBLIC API :
//   13.0  syncTrackToMarketContext() — Main sync function (fire-and-forget safe)
//
// DEPENDENCIES :
//   - lib/types/pillar-schemas → TrackAuditResult
//   - Prisma: CompetitorSnapshot, OpportunityCalendar
//
// CALLED BY :
//   - API Route POST /api/ai/generate (after Pillar T completes)
//   - Module 10 (fiche-upgrade.ts) → regenerateAllPillars() after T
//
// =============================================================================

import { db } from "~/server/db";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";

export async function syncTrackToMarketContext(
  strategyId: string,
  track: TrackAuditResult,
): Promise<void> {
  try {
    // -----------------------------------------------------------------------
    // 1. Upsert CompetitorSnapshot for each competitiveBenchmark entry
    // -----------------------------------------------------------------------
    for (const bench of track.competitiveBenchmark) {
      if (!bench.competitor.trim()) continue; // skip empty entries

      await db.competitorSnapshot.upsert({
        where: {
          strategyId_name: {
            strategyId,
            name: bench.competitor.trim(),
          },
        },
        create: {
          strategyId,
          name: bench.competitor.trim(),
          positioning: bench.marketShare || null,
          strengths: bench.strengths,
          weaknesses: bench.weaknesses,
          lastUpdated: new Date(),
        },
        update: {
          positioning: bench.marketShare || null,
          strengths: bench.strengths,
          weaknesses: bench.weaknesses,
          lastUpdated: new Date(),
        },
      });
    }

    // -----------------------------------------------------------------------
    // 2. Clear existing auto-generated OpportunityCalendar entries
    //    (source = "track_sync") before re-creating them
    // -----------------------------------------------------------------------
    // We use notes field to tag auto-generated entries so manual ones aren't deleted
    await db.opportunityCalendar.deleteMany({
      where: {
        strategyId,
        notes: "auto:track_sync",
      },
    });

    // -----------------------------------------------------------------------
    // 3. Create OpportunityCalendar from marketReality
    // -----------------------------------------------------------------------
    const now = new Date();
    const entries: Array<{
      strategyId: string;
      title: string;
      type: string;
      impact: string;
      startDate: Date;
      notes: string;
    }> = [];

    // Macro trends → PREDICTIVE, HIGH impact
    for (const trend of track.marketReality.macroTrends) {
      if (!trend.trim()) continue;
      entries.push({
        strategyId,
        title: trend.trim(),
        type: "PREDICTIVE",
        impact: "HIGH",
        startDate: now,
        notes: "auto:track_sync",
      });
    }

    // Weak signals → COMPETITIVE, MEDIUM impact
    for (const signal of track.marketReality.weakSignals) {
      if (!signal.trim()) continue;
      entries.push({
        strategyId,
        title: signal.trim(),
        type: "COMPETITIVE",
        impact: "MEDIUM",
        startDate: now,
        notes: "auto:track_sync",
      });
    }

    // Emerging patterns → INTERNAL, LOW impact (emerging, not yet impactful)
    for (const pattern of track.marketReality.emergingPatterns) {
      if (!pattern.trim()) continue;
      entries.push({
        strategyId,
        title: pattern.trim(),
        type: "INTERNAL",
        impact: "LOW",
        startDate: now,
        notes: "auto:track_sync",
      });
    }

    if (entries.length > 0) {
      await db.opportunityCalendar.createMany({ data: entries });
    }

    console.log(
      `[Track Sync] Synced ${track.competitiveBenchmark.length} competitors + ${entries.length} opportunities for strategy ${strategyId}`,
    );
  } catch (error) {
    // Non-blocking: log but don't throw (fire-and-forget)
    console.error("[Track Sync] Error syncing track data:", error);
  }
}
