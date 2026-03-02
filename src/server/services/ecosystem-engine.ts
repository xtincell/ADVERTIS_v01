// =============================================================================
// MODULE 21 — Ecosystem Engine (Dashboard Flywheel)
// =============================================================================
// Read-only aggregation service for the UPGRADERS ecosystem dashboard.
// Pulls cross-system metrics to visualize flywheel health.
//
// Public API:
//   1. getFlywheelMetrics()    — Global flywheel health
//   2. getMissionsPipeline()   — Missions by status with totals
//   3. getTalentPoolHealth()   — Distribution by level/availability/category
//   4. getRevenuePipeline()    — Revenue pipeline (pending vs collected)
//   5. getClientJourney()      — Client distribution by stage
//   6. getRecentActivity()     — Cross-system activity feed
//   7. getEcosystemKPIs()      — Synthetic KPIs
//
// Dependencies:
//   - ~/server/db (Prisma — Mission, TalentProfile, Invoice, Strategy, etc.)
//   - ~/lib/constants (MISSION_STATUSES, TALENT_LEVELS, etc.)
// =============================================================================

import { db } from "~/server/db";

// ── 1. Flywheel Metrics ─────────────────────────────────────────────────────

export async function getFlywheelMetrics() {
  const [
    strategiesCount,
    missionsActive,
    talentsActive,
    invoicesPaid,
    signalsCount,
  ] = await Promise.all([
    db.strategy.count({ where: { status: { not: "ARCHIVED" } } }),
    db.mission.count({ where: { status: { notIn: ["CLOSED", "MAINTENANCE"] } } }),
    db.talentProfile.count({ where: { availability: { in: ["AVAILABLE", "PARTIAL"] } } }),
    db.invoice.aggregate({
      _sum: { total: true },
      where: { status: "PAID", type: "FACTURE" },
    }),
    db.signal.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    pillars: [
      {
        id: "impulsion",
        name: "Impulsion™",
        metric: strategiesCount,
        label: "Stratégies actives",
        health: strategiesCount > 0 ? "healthy" : "warning",
      },
      {
        id: "pilotis",
        name: "Pilotis™",
        metric: missionsActive,
        label: "Missions en cours",
        health: missionsActive > 0 ? "healthy" : "warning",
      },
      {
        id: "guilde",
        name: "La Guilde™",
        metric: talentsActive,
        label: "Talents disponibles",
        health: talentsActive >= 5 ? "healthy" : talentsActive > 0 ? "warning" : "critical",
      },
      {
        id: "serenite",
        name: "Sérénité™",
        metric: invoicesPaid._sum.total ?? 0,
        label: "Revenus encaissés (XAF)",
        health: (invoicesPaid._sum.total ?? 0) > 0 ? "healthy" : "idle",
      },
      {
        id: "source",
        name: "Source Insights™",
        metric: signalsCount,
        label: "Signaux actifs",
        health: signalsCount > 5 ? "healthy" : signalsCount > 0 ? "warning" : "idle",
      },
    ],
  };
}

// ── 2. Missions Pipeline ────────────────────────────────────────────────────

export async function getMissionsPipeline() {
  const groups = await db.mission.groupBy({
    by: ["status"],
    _count: true,
  });

  const total = groups.reduce((s, g) => s + g._count, 0);

  return {
    stages: groups.map((g) => ({
      status: g.status,
      count: g._count,
      percentage: total > 0 ? Math.round((g._count / total) * 100) : 0,
    })),
    total,
  };
}

// ── 3. Talent Pool Health ───────────────────────────────────────────────────

export async function getTalentPoolHealth() {
  const [byLevel, byAvailability, byCategory, total] = await Promise.all([
    db.talentProfile.groupBy({
      by: ["level"],
      _count: true,
    }),
    db.talentProfile.groupBy({
      by: ["availability"],
      _count: true,
    }),
    db.talentProfile.groupBy({
      by: ["category"],
      _count: true,
    }),
    db.talentProfile.count(),
  ]);

  return {
    byLevel: byLevel.map((g) => ({ level: g.level, count: g._count })),
    byAvailability: byAvailability.map((g) => ({
      availability: g.availability,
      count: g._count,
    })),
    byCategory: byCategory.map((g) => ({
      category: g.category,
      count: g._count,
    })),
    total,
  };
}

// ── 4. Revenue Pipeline ─────────────────────────────────────────────────────

export async function getRevenuePipeline() {
  const groups = await db.invoice.groupBy({
    by: ["status"],
    _count: true,
    _sum: { total: true },
    where: { type: "FACTURE" },
  });

  const paid = groups.find((g) => g.status === "PAID");
  const pending = groups.filter((g) =>
    ["SENT", "ACCEPTED", "OVERDUE"].includes(g.status),
  );
  const drafts = groups.find((g) => g.status === "DRAFT");

  return {
    collected: paid?._sum.total ?? 0,
    collectedCount: paid?._count ?? 0,
    pending: pending.reduce((s, g) => s + (g._sum.total ?? 0), 0),
    pendingCount: pending.reduce((s, g) => s + g._count, 0),
    draft: drafts?._sum.total ?? 0,
    draftCount: drafts?._count ?? 0,
    breakdown: groups.map((g) => ({
      status: g.status,
      count: g._count,
      total: g._sum.total ?? 0,
    })),
  };
}

// ── 5. Client Journey ───────────────────────────────────────────────────────

export async function getClientJourney() {
  // Group strategies by phase to track client journey
  const phases = await db.strategy.groupBy({
    by: ["phase"],
    _count: true,
    where: { status: { not: "ARCHIVED" } },
  });

  // Count unique clients (users with CLIENT roles)
  const clientCount = await db.user.count({
    where: { role: { in: ["CLIENT_RETAINER", "CLIENT_STATIC"] } },
  });

  return {
    phases: phases.map((p) => ({
      phase: p.phase,
      count: p._count,
    })),
    totalClients: clientCount,
  };
}

// ── 6. Recent Activity ──────────────────────────────────────────────────────

export async function getRecentActivity(limit = 10) {
  // Pull latest items from different tables and merge
  const [missions, reviews, invoices, signals] = await Promise.all([
    db.mission.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    db.talentReview.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        qualityScore: true,
        createdAt: true,
        talentProfile: { select: { displayName: true } },
      },
    }),
    db.invoice.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, refNumber: true, status: true, total: true, updatedAt: true },
    }),
    db.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, pillar: true, layer: true, createdAt: true },
    }),
  ]);

  type ActivityItem = {
    type: string;
    id: string;
    title: string;
    detail: string;
    timestamp: Date;
  };

  const items: ActivityItem[] = [
    ...missions.map((m) => ({
      type: "mission" as const,
      id: m.id,
      title: m.title,
      detail: `Status: ${m.status}`,
      timestamp: m.updatedAt,
    })),
    ...reviews.map((r) => ({
      type: "review" as const,
      id: r.id,
      title: `Review: ${r.talentProfile.displayName ?? "Talent"}`,
      detail: `Score: ${r.qualityScore}/5`,
      timestamp: r.createdAt,
    })),
    ...invoices.map((i) => ({
      type: "invoice" as const,
      id: i.id,
      title: i.refNumber,
      detail: `${i.status} — ${i.total.toLocaleString()} XAF`,
      timestamp: i.updatedAt,
    })),
    ...signals.map((s) => ({
      type: "signal" as const,
      id: s.id,
      title: s.title,
      detail: `${s.pillar} / ${s.layer}`,
      timestamp: s.createdAt,
    })),
  ];

  // Sort by timestamp and take the most recent
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return items.slice(0, limit);
}

// ── 7. Ecosystem KPIs ───────────────────────────────────────────────────────

export async function getEcosystemKPIs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalRevenue,
    monthlyMissions,
    activeTalents,
    avgReviewScore,
    totalClients,
    avgMissionValue,
  ] = await Promise.all([
    db.invoice.aggregate({
      _sum: { total: true },
      where: { status: "PAID", type: "FACTURE" },
    }),
    db.mission.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    db.talentProfile.count({
      where: { availability: { in: ["AVAILABLE", "PARTIAL"] } },
    }),
    db.talentReview.aggregate({ _avg: { qualityScore: true } }),
    db.user.count({
      where: { role: { in: ["CLIENT_RETAINER", "CLIENT_STATIC"] } },
    }),
    db.invoice.aggregate({
      _avg: { total: true },
      where: { type: "FACTURE", status: { not: "CANCELLED" } },
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    monthlyMissions,
    activeTalents,
    avgNPS: avgReviewScore._avg.qualityScore
      ? Math.round(avgReviewScore._avg.qualityScore * 20) // Scale 1-5 → 20-100
      : null,
    totalClients,
    avgMissionValue: avgMissionValue._avg.total ?? 0,
  };
}
