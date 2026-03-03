// =============================================================================
// Seed: Brand OS demo data for Artemis only
// Run: node prisma/seed-brand-os.mjs
// =============================================================================

import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();
const ARTEMIS_ID = "cmm89uf360002010cxr552ya5";

async function main() {
  // Verify Artemis exists
  const artemis = await db.strategy.findUnique({ where: { id: ARTEMIS_ID } });
  if (!artemis) {
    console.error("Artemis strategy not found!");
    process.exit(1);
  }
  console.log(`Seeding Brand OS data for "${artemis.brandName}"...`);

  // Clean existing Brand OS data for Artemis only
  await db.cultIndexSnapshot.deleteMany({ where: { strategyId: ARTEMIS_ID } });
  await db.communitySnapshot.deleteMany({ where: { strategyId: ARTEMIS_ID } });
  await db.superfanProfile.deleteMany({ where: { strategyId: ARTEMIS_ID } });
  await db.socialChannel.deleteMany({ where: { strategyId: ARTEMIS_ID } });
  await db.brandOSConfig.deleteMany({ where: { strategyId: ARTEMIS_ID } });
  console.log("  Cleaned previous data.");

  // ── 1. BrandOSConfig ──
  await db.brandOSConfig.create({
    data: {
      strategyId: ARTEMIS_ID,
      isActive: true,
      refreshCadence: "DAILY",
      enabledViews: ["nucleus", "pulse", "touchpoints", "community", "command"],
      cultWeights: {
        engagementDepth: 0.20,
        superfanVelocity: 0.15,
        communityCohesion: 0.15,
        brandDefenseRate: 0.10,
        ugcGenerationRate: 0.15,
        ritualAdoption: 0.10,
        evangelismScore: 0.15,
      },
      theme: {
        primaryColor: "#F59E0B",
        fontFamily: "Inter",
      },
    },
  });
  console.log("  BrandOSConfig created.");

  // ── 2. Social Channels ──
  const channels = [
    {
      platform: "INSTAGRAM",
      accountName: "@artemis.africa",
      isConnected: true,
      category: "SOCIAL",
      followers: 47200,
      engagementRate: 4.8,
      avgReach: 18500,
      avgImpressions: 32000,
      postFrequency: 5.2,
      responseTime: 45,
      sentimentScore: 0.72,
      healthStatus: "HEALTHY",
      lastActivityAt: daysAgo(0),
    },
    {
      platform: "FACEBOOK",
      accountName: "Artemis Africa",
      isConnected: true,
      category: "SOCIAL",
      followers: 23800,
      engagementRate: 2.1,
      avgReach: 9200,
      avgImpressions: 15400,
      postFrequency: 3.0,
      responseTime: 120,
      sentimentScore: 0.65,
      healthStatus: "HEALTHY",
      lastActivityAt: daysAgo(1),
    },
    {
      platform: "TIKTOK",
      accountName: "@artemis_afrique",
      isConnected: true,
      category: "SOCIAL",
      followers: 12400,
      engagementRate: 8.3,
      avgReach: 42000,
      avgImpressions: 68000,
      postFrequency: 2.5,
      sentimentScore: 0.81,
      healthStatus: "HEALTHY",
      lastActivityAt: daysAgo(0),
    },
    {
      platform: "TWITTER",
      accountName: "@ArtemisAfrica",
      isConnected: true,
      category: "SOCIAL",
      followers: 8900,
      engagementRate: 1.4,
      avgReach: 5200,
      avgImpressions: 11000,
      postFrequency: 7.0,
      responseTime: 30,
      sentimentScore: 0.58,
      healthStatus: "WARNING",
      lastActivityAt: daysAgo(2),
    },
    {
      platform: "LINKEDIN",
      accountName: "Artemis Group",
      isConnected: true,
      category: "OWNED",
      followers: 5600,
      engagementRate: 3.2,
      avgReach: 3800,
      avgImpressions: 7200,
      postFrequency: 1.5,
      sentimentScore: 0.77,
      healthStatus: "HEALTHY",
      lastActivityAt: daysAgo(3),
    },
  ];

  for (const ch of channels) {
    await db.socialChannel.create({
      data: { strategyId: ARTEMIS_ID, ...ch },
    });
  }
  console.log(`  ${channels.length} social channels created.`);

  // ── 3. Cult Index Snapshots (30 days of history) ──
  const snapshots = [];
  for (let i = 29; i >= 0; i--) {
    const base = 62 + (29 - i) * 0.4 + (Math.random() - 0.5) * 3;
    snapshots.push({
      strategyId: ARTEMIS_ID,
      cultIndex: clamp(base, 0, 100),
      engagementDepth: clamp(68 + (Math.random() - 0.4) * 10, 0, 100),
      superfanVelocity: clamp(55 + (Math.random() - 0.3) * 12, 0, 100),
      communityCohesion: clamp(72 + (Math.random() - 0.5) * 8, 0, 100),
      brandDefenseRate: clamp(45 + (Math.random() - 0.3) * 15, 0, 100),
      ugcGenerationRate: clamp(58 + (Math.random() - 0.4) * 10, 0, 100),
      ritualAdoption: clamp(38 + (Math.random() - 0.3) * 12, 0, 100),
      evangelismScore: clamp(52 + (Math.random() - 0.4) * 10, 0, 100),
      superfanCount: 340 + Math.floor((29 - i) * 2.5 + Math.random() * 5),
      totalCommunity: 97300 + Math.floor((29 - i) * 120 + Math.random() * 200),
      trigger: "scheduled",
      createdAt: daysAgo(i),
    });
  }
  await db.cultIndexSnapshot.createMany({ data: snapshots });
  console.log(`  ${snapshots.length} cult index snapshots created.`);

  // ── 4. Community Snapshots (30 days) ──
  const communitySnaps = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    const nextD = daysAgo(i - 1);
    communitySnaps.push({
      strategyId: ARTEMIS_ID,
      healthScore: clamp(71 + (29 - i) * 0.3 + (Math.random() - 0.5) * 5, 0, 100),
      growthRate: clamp(1.2 + (Math.random() - 0.4) * 0.8, -2, 10),
      retentionRate: clamp(88 + (Math.random() - 0.5) * 6, 50, 100),
      activityRate: clamp(24 + (Math.random() - 0.5) * 8, 5, 80),
      sentimentAvg: clamp(0.68 + (Math.random() - 0.5) * 0.15, -1, 1),
      totalMembers: 97300 + Math.floor((29 - i) * 120),
      activeMembersD7: 23000 + Math.floor(Math.random() * 2000),
      newMembers: 100 + Math.floor(Math.random() * 80),
      lostMembers: 30 + Math.floor(Math.random() * 25),
      mentionCount: 180 + Math.floor(Math.random() * 120),
      conversationVol: 450 + Math.floor(Math.random() * 200),
      avgResponseTime: 35 + Math.floor(Math.random() * 30),
      toxicityLevel: clamp(0.03 + Math.random() * 0.04, 0, 1),
      topTopics: [
        { topic: "Nouveau packaging", volume: 85, sentiment: 0.82, trend: "up" },
        { topic: "Campagne Ramadan", volume: 72, sentiment: 0.91, trend: "stable" },
        { topic: "Prix augmentation", volume: 45, sentiment: -0.3, trend: "down" },
        { topic: "Recette originale", volume: 38, sentiment: 0.75, trend: "stable" },
      ],
      period: "DAILY",
      periodStart: d,
      periodEnd: nextD,
      createdAt: d,
    });
  }
  await db.communitySnapshot.createMany({ data: communitySnaps });
  console.log(`  ${communitySnaps.length} community snapshots created.`);

  // ── 5. Superfan Profiles ──
  const markets = ["CM", "CI", "SN", "GH", "NG"];
  const cities = {
    CM: ["Douala", "Yaoundé", "Bafoussam", "Bamenda"],
    CI: ["Abidjan", "Bouaké", "Yamoussoukro"],
    SN: ["Dakar", "Saint-Louis", "Thiès"],
    GH: ["Accra", "Kumasi", "Tamale"],
    NG: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
  };
  const segments = ["AUDIENCE", "FOLLOWER", "ENGAGED", "FAN", "SUPERFAN", "EVANGELIST"];
  const segmentWeights = [5, 15, 30, 25, 18, 7]; // distribution %

  const superfans = [];
  const names = [
    "Awa Diallo", "Kofi Mensah", "Fatou Ndiaye", "Chidi Okafor", "Aminata Traoré",
    "Kwame Asante", "Mariama Bah", "Ousmane Sow", "Nana Akua", "Ibrahim Touré",
    "Adama Koné", "Esi Adjei", "Moussa Diop", "Aïcha Bamba", "Emeka Nwankwo",
    "Salimata Coulibaly", "Yaw Boateng", "Rokia Sangaré", "Tunde Adeyemi", "Nafissatou Fall",
    "Jean-Paul Kamga", "Grace Osei", "Abdoulaye Cissé", "Blessing Eze", "Mamadou Barry",
    "Akosua Mensah", "Seydou Keita", "Chiamaka Obi", "Fatoumata Sy", "Prince Owusu",
    "Ismaël Ndao", "Adjoa Manu", "Boubacar Bâ", "Ngozi Ibe", "Khadija Ouattara",
    "Samuel Tetteh", "Ramatoulaye Diallo", "Chibueze Agu", "Astou Sarr", "Kwesi Appiah",
    "Hadja Camara", "Obinna Eze", "Dienaba Sall", "Kokou Agbeko", "Mariam Diabaté",
    "Victor Amadi", "Coumba Gueye", "Yaa Asantewaa", "Souleymane Dembélé", "Favour Okoro",
    "Kadiatou Balde", "Emmanuel Ofori", "Bineta Diop", "Chidera Okpara", "Lamine Faye",
    "Abena Nyarko", "Mouhamadou Diallo", "Adwoa Serwaa", "Bakary Sanogo", "Oluchi Nnamdi",
  ];

  for (let i = 0; i < 60; i++) {
    const market = markets[Math.floor(Math.random() * markets.length)];
    const cityList = cities[market];
    const segment = weightedPick(segments, segmentWeights);
    const depth = segmentDepth(segment);

    superfans.push({
      strategyId: ARTEMIS_ID,
      displayName: names[i],
      market,
      city: cityList[Math.floor(Math.random() * cityList.length)],
      segment,
      engagementDepth: depth,
      totalInteractions: Math.floor(depth * 8 + Math.random() * 50),
      ugcCount: segment === "EVANGELIST" ? Math.floor(5 + Math.random() * 15) : Math.floor(Math.random() * 5),
      defenseCount: segment === "SUPERFAN" || segment === "EVANGELIST" ? Math.floor(2 + Math.random() * 8) : Math.floor(Math.random() * 2),
      shareCount: Math.floor(depth * 0.3 + Math.random() * 10),
      purchaseCount: Math.floor(1 + Math.random() * 6),
      referralCount: segment === "EVANGELIST" ? Math.floor(3 + Math.random() * 7) : Math.floor(Math.random() * 3),
      firstSeenAt: daysAgo(Math.floor(30 + Math.random() * 300)),
      lastActiveAt: daysAgo(Math.floor(Math.random() * 14)),
      promotedAt: ["SUPERFAN", "EVANGELIST"].includes(segment) ? daysAgo(Math.floor(Math.random() * 60)) : null,
      handles: {
        instagram: `@${names[i].toLowerCase().replace(/[\s-]/g, ".")}`,
      },
      tags: segmentTags(segment),
    });
  }
  await db.superfanProfile.createMany({ data: superfans });
  console.log(`  ${superfans.length} superfan profiles created.`);

  console.log("\nDone! Brand OS data seeded for Artemis.");
}

// ── Helpers ──

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d;
}

function clamp(v, min, max) {
  return Math.round(Math.min(max, Math.max(min, v)) * 100) / 100;
}

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function segmentDepth(segment) {
  const base = {
    AUDIENCE: 5, FOLLOWER: 18, ENGAGED: 42, FAN: 65, SUPERFAN: 82, EVANGELIST: 94,
  };
  return clamp((base[segment] ?? 30) + (Math.random() - 0.5) * 12, 0, 100);
}

function segmentTags(segment) {
  if (segment === "EVANGELIST") return ["ambassador", "creator", "defender"];
  if (segment === "SUPERFAN") return ["defender", "loyal"];
  if (segment === "FAN") return ["loyal"];
  if (segment === "ENGAGED") return ["active"];
  return [];
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
