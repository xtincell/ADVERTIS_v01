// =============================================================================
// MODULE 19 — Talent Engine (La Guilde)
// =============================================================================
// Talent lifecycle: profiles, levels, reviews, certifications, search & matching.
// Feeds the flywheel: completed missions → reviews → level progression → better
// matching → higher-value missions.
//
// Public API:
//   1.  upsertProfile()        — Create/update talent profile
//   2.  getProfile()           — Get full profile with relations
//   3.  searchTalents()        — Paginated multi-criteria search
//   4.  matchTalents()         — Weighted matching for a mission
//   5.  computeLevel()         — Recalculate talent level from missions + scores
//   6.  createReview()         — Post-mission review
//   7.  getReviews()           — List reviews for a talent
//   8.  getTalentStats()       — Aggregates (missions, earnings, scores)
//   9.  createCertification()  — Award a certification
//  10.  getCertifications()    — List certifications
//  11.  getProgressionPath()   — Progress toward next level
//  12.  getDirectory()         — Full paginated directory
//
// Dependencies:
//   - ~/server/db (Prisma — TalentProfile, TalentReview, TalentCertification,
//                   MissionAssignment, User)
//   - ~/lib/constants (TALENT_LEVELS, TALENT_LEVEL_CONFIG, COMMISSION_RATES)
// =============================================================================

import { db } from "~/server/db";
import {
  TALENT_LEVELS,
  TALENT_LEVEL_CONFIG,
  type TalentLevel,
} from "~/lib/constants";
import type {
  UpsertTalentProfileInput,
  SearchTalentsInput,
  MatchTalentsInput,
  CreateTalentReviewInput,
  CreateCertificationInput,
} from "~/lib/types/guilde-schemas";

// ── 1. Upsert Profile ──────────────────────────────────────────────────────

export async function upsertProfile(
  userId: string,
  data: UpsertTalentProfileInput,
) {
  return db.talentProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName: data.displayName,
      bio: data.bio,
      headline: data.headline,
      experienceYears: data.experienceYears,
      location: data.location,
      country: data.country,
      languages: data.languages ?? [],
      specializations: data.specializations ?? [],
      skills: data.skills ?? [],
      tools: data.tools ?? [],
      sectors: data.sectors ?? [],
      portfolioUrls: data.portfolioUrls ?? [],
      linkedinUrl: data.linkedinUrl ?? null,
      showreel: data.showreel ?? null,
      tjmMin: data.tjmMin,
      tjmMax: data.tjmMax,
      currency: data.currency ?? "XAF",
      availability: data.availability ?? "AVAILABLE",
    },
    update: {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.headline !== undefined && { headline: data.headline }),
      ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.languages !== undefined && { languages: data.languages }),
      ...(data.specializations !== undefined && { specializations: data.specializations }),
      ...(data.skills !== undefined && { skills: data.skills }),
      ...(data.tools !== undefined && { tools: data.tools }),
      ...(data.sectors !== undefined && { sectors: data.sectors }),
      ...(data.portfolioUrls !== undefined && { portfolioUrls: data.portfolioUrls }),
      ...(data.linkedinUrl !== undefined && { linkedinUrl: data.linkedinUrl || null }),
      ...(data.showreel !== undefined && { showreel: data.showreel || null }),
      ...(data.tjmMin !== undefined && { tjmMin: data.tjmMin }),
      ...(data.tjmMax !== undefined && { tjmMax: data.tjmMax }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.availability !== undefined && { availability: data.availability }),
    },
    include: { certifications: true, reviews: true },
  });
}

// ── 2. Get Profile ──────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  return db.talentProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
      certifications: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

// ── 3. Search Talents ───────────────────────────────────────────────────────

export async function searchTalents(input: SearchTalentsInput) {
  const { query, category, level, availability, specializations, minScore, tjmMin, tjmMax, page, pageSize, sortBy, sortDir } = input;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (level) where.level = level;
  if (availability) where.availability = availability;
  if (minScore) where.avgScore = { gte: minScore };
  if (tjmMin) where.tjmMin = { gte: tjmMin };
  if (tjmMax) where.tjmMax = { lte: tjmMax };

  // JSON array containment for specializations
  if (specializations?.length) {
    where.specializations = { array_contains: specializations };
  }

  // Free text search on displayName, headline, bio
  if (query) {
    where.OR = [
      { displayName: { contains: query, mode: "insensitive" } },
      { headline: { contains: query, mode: "insensitive" } },
      { bio: { contains: query, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.talentProfile.findMany({
      where: where as any,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.talentProfile.count({ where: where as any }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ── 4. Match Talents ────────────────────────────────────────────────────────

export async function matchTalents(input: MatchTalentsInput) {
  // Get mission details
  const mission = await db.mission.findUnique({
    where: { id: input.missionId },
    include: { assignments: true },
  });
  if (!mission) throw new Error("Mission not found");

  // Already assigned user IDs
  const assignedIds = mission.assignments.map((a) => a.userId);

  // Build base filter
  const where: Record<string, unknown> = {
    availability: { in: ["AVAILABLE", "PARTIAL"] },
    userId: { notIn: assignedIds },
  };

  if (input.minLevel) {
    const levelIdx = TALENT_LEVELS.indexOf(input.minLevel);
    where.level = { in: TALENT_LEVELS.slice(levelIdx) as unknown as string[] };
  }
  if (input.budgetMax) {
    where.tjmMin = { lte: input.budgetMax };
  }

  const candidates = await db.talentProfile.findMany({
    where: where as any,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    take: 100, // Pre-filter pool
  });

  // Score each candidate
  const scored = candidates.map((c) => {
    let score = 0;
    const cSpecs = (c.specializations as string[] | null) ?? [];
    const cSkills = (c.skills as string[] | null) ?? [];

    // Specialization match (40%)
    if (input.requiredSpecializations?.length) {
      const matches = input.requiredSpecializations.filter((s) => cSpecs.includes(s));
      score += (matches.length / input.requiredSpecializations.length) * 40;
    } else {
      score += 20; // baseline
    }

    // Skills match (15%)
    if (input.requiredSkills?.length) {
      const matches = input.requiredSkills.filter((s) =>
        cSkills.some((sk) => sk.toLowerCase().includes(s.toLowerCase())),
      );
      score += (matches.length / input.requiredSkills.length) * 15;
    }

    // Level (25%)
    const levelIdx = TALENT_LEVELS.indexOf(c.level as TalentLevel);
    score += ((levelIdx + 1) / TALENT_LEVELS.length) * 25;

    // Average score (20%)
    if (c.avgScore) {
      score += (c.avgScore / 5) * 20;
    }

    return { ...c, matchScore: Math.round(score * 10) / 10 };
  });

  // Sort by match score and limit
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, input.limit);
}

// ── 5. Compute Level ────────────────────────────────────────────────────────

export async function computeLevel(userId: string): Promise<TalentLevel> {
  const profile = await db.talentProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Talent profile not found");

  // Count completed assignments
  const completedAssignments = await db.missionAssignment.count({
    where: {
      userId,
      status: { in: ["DELIVERED", "REVIEWED"] },
    },
  });

  // Calculate average review score
  const reviews = await db.talentReview.findMany({
    where: { talentProfileId: profile.id },
    select: { qualityScore: true },
  });
  const avgScore =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.qualityScore, 0) / reviews.length
      : 0;

  // Determine new level (walk backwards from LEGEND)
  let newLevel: TalentLevel = "NOVICE";
  for (let i = TALENT_LEVELS.length - 1; i >= 0; i--) {
    const lvl = TALENT_LEVELS[i]!;
    const cfg = TALENT_LEVEL_CONFIG[lvl];
    if (completedAssignments >= cfg.minMissions && avgScore >= cfg.minAvgScore) {
      newLevel = lvl;
      break;
    }
  }

  // Update profile
  await db.talentProfile.update({
    where: { userId },
    data: {
      level: newLevel,
      totalMissions: completedAssignments,
      avgScore: avgScore > 0 ? Math.round(avgScore * 100) / 100 : null,
    },
  });

  return newLevel;
}

// ── 6. Create Review ────────────────────────────────────────────────────────

export async function createReview(
  reviewerId: string,
  data: CreateTalentReviewInput,
) {
  const review = await db.talentReview.create({
    data: {
      talentProfileId: data.talentProfileId,
      missionId: data.missionId,
      assignmentId: data.assignmentId,
      reviewerId,
      qualityScore: data.qualityScore,
      communicationScore: data.communicationScore,
      deadlinesScore: data.deadlinesScore,
      creativityScore: data.creativityScore,
      autonomyScore: data.autonomyScore,
      comment: data.comment,
      isPublic: data.isPublic,
    },
  });

  // Trigger level recomputation
  const profile = await db.talentProfile.findUnique({
    where: { id: data.talentProfileId },
  });
  if (profile) {
    await computeLevel(profile.userId);
  }

  return review;
}

// ── 7. Get Reviews ──────────────────────────────────────────────────────────

export async function getReviews(talentProfileId: string) {
  return db.talentReview.findMany({
    where: { talentProfileId },
    orderBy: { createdAt: "desc" },
  });
}

// ── 8. Get Talent Stats ─────────────────────────────────────────────────────

export async function getTalentStats(userId: string) {
  const profile = await db.talentProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const [reviewCount, certCount, commissions] = await Promise.all([
    db.talentReview.count({ where: { talentProfileId: profile.id } }),
    db.talentCertification.count({ where: { talentProfileId: profile.id } }),
    db.commission.findMany({
      where: { talentId: userId },
      select: { netAmount: true, currency: true },
    }),
  ]);

  const totalEarnings = commissions.reduce((sum, c) => sum + c.netAmount, 0);

  return {
    totalMissions: profile.totalMissions,
    avgScore: profile.avgScore,
    level: profile.level,
    category: profile.category,
    reviewCount,
    certCount,
    totalEarnings,
    currency: profile.currency,
  };
}

// ── 9. Create Certification ─────────────────────────────────────────────────

export async function createCertification(data: CreateCertificationInput) {
  return db.talentCertification.create({
    data: {
      talentProfileId: data.talentProfileId,
      name: data.name,
      issuedBy: data.issuedBy,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      score: data.score,
      badgeUrl: data.badgeUrl,
      metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
    },
  });
}

// ── 10. Get Certifications ──────────────────────────────────────────────────

export async function getCertifications(talentProfileId: string) {
  return db.talentCertification.findMany({
    where: { talentProfileId },
    orderBy: { createdAt: "desc" },
  });
}

// ── 11. Get Progression Path ────────────────────────────────────────────────

export async function getProgressionPath(userId: string) {
  const profile = await db.talentProfile.findUnique({ where: { userId } });
  if (!profile) return null;

  const currentLevel = profile.level as TalentLevel;
  const currentIdx = TALENT_LEVELS.indexOf(currentLevel);
  const nextLevel = currentIdx < TALENT_LEVELS.length - 1 ? TALENT_LEVELS[currentIdx + 1] : null;

  const currentCfg = TALENT_LEVEL_CONFIG[currentLevel];
  const nextCfg = nextLevel ? TALENT_LEVEL_CONFIG[nextLevel] : null;

  return {
    currentLevel,
    currentLevelConfig: currentCfg,
    nextLevel,
    nextLevelConfig: nextCfg,
    totalMissions: profile.totalMissions,
    avgScore: profile.avgScore ?? 0,
    missionsProgress: nextCfg
      ? Math.min(1, profile.totalMissions / nextCfg.minMissions)
      : 1,
    scoreProgress: nextCfg
      ? Math.min(1, (profile.avgScore ?? 0) / nextCfg.minAvgScore)
      : 1,
    isMaxLevel: nextLevel === null,
  };
}

// ── 12. Get Directory ───────────────────────────────────────────────────────

export async function getDirectory(input: SearchTalentsInput) {
  // Reuse searchTalents with added user info
  return searchTalents(input);
}
