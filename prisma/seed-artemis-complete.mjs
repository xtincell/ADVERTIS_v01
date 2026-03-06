// =============================================================================
// Seed: Complete Artemis brand — MATURE FMCG brand with all 8 pillars filled
// Run: node prisma/seed-artemis-complete.mjs
// =============================================================================
// This script:
// 1. Finds the first user in the DB (or uses ARTEMIS_USER_ID env var)
// 2. Upserts the Artemis Strategy with ALL fields filled
// 3. Creates all 8 pillars (A-D-V-E-R-T-I-S) with complete content
// 4. Then runs the Brand OS seed (social channels, cult index, etc.)
// =============================================================================

import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();
const ARTEMIS_ID = "cmm89uf360002010cxr552ya5";

// ── Pillar content imports (defined below) ──
import {
  pillarA, pillarD, pillarV, pillarE,
  pillarR, pillarT, pillarI, pillarS,
} from "./seed-artemis-pillars.mjs";

async function main() {
  // ── 1. Find user ──
  const userId = process.env.ARTEMIS_USER_ID;
  let user;
  if (userId) {
    user = await db.user.findUnique({ where: { id: userId } });
  }
  if (!user) {
    user = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  }
  if (!user) {
    console.error("No user found in database! Create an account first.");
    process.exit(1);
  }
  console.log(`Using user: ${user.name ?? user.email} (${user.id})`);

  // ── 2. Upsert Strategy ──
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const strategy = await db.strategy.upsert({
    where: { id: ARTEMIS_ID },
    update: {
      userId: user.id,
      name: "Artemis — Stratégie de marque 2025",
      brandName: "Artemis",
      tagline: "Le goût authentique de l'Afrique",
      sector: "fmcg",
      description: "Marque FMCG panafricaine premium — boissons naturelles à base de fruits tropicaux et plantes locales. Présente au Cameroun, Côte d'Ivoire, Sénégal, Ghana et Nigeria. Positionnement : authenticité africaine, qualité internationale.",
      status: "complete",
      phase: "complete",
      coherenceScore: 87,
      inputMethod: "interview",
      generationMode: "wizard",
      generatedAt: threeMonthsAgo,
      nodeType: "BRAND",
      depth: 0,
      deliveryMode: "RETAINER",
      vertical: "FMCG",
      maturityProfile: "MATURE",
      currency: "XOF",
      annualBudget: 450000000,   // 450M XOF (~€690K)
      targetRevenue: 2100000000, // 3.2Mrd XOF (~€4.9M)
      interviewData: {
        nomMarque: "Artemis",
        secteur: "fmcg",
        dateCreation: "2018",
        nombreEmployes: "85",
        marchesPrincipaux: "Cameroun, Côte d'Ivoire, Sénégal, Ghana, Nigeria",
        descriptionActivite: "Production et distribution de boissons naturelles à base de fruits tropicaux africains et plantes médicinales locales (bissap, baobab, gingembre, tamarin). Gamme premium positionnée sur l'authenticité et la traçabilité.",
        publicCible: "Urbains CSP B+/A, 25-45 ans, soucieux de leur santé, fiers de leur identité africaine",
        concurrentsPrincipaux: "Coca-Cola (Minute Maid), Brasseries du Cameroun (Top), marques locales artisanales",
        budgetAnnuel: "450 000 000 XOF",
        objectifPrincipal: "Devenir la marque de boissons naturelles #1 en Afrique de l'Ouest d'ici 2027",
        defis: "Distribution en zone rurale, perception prix vs produits industriels, chaîne du froid",
        valeursMarque: "Authenticité, Qualité, Fierté africaine, Durabilité, Innovation locale",
        toneOfVoice: "Chaleureux, fier, moderne mais ancré dans la tradition",
      },
      updatedAt: now,
    },
    create: {
      id: ARTEMIS_ID,
      userId: user.id,
      name: "Artemis — Stratégie de marque 2025",
      brandName: "Artemis",
      tagline: "Le goût authentique de l'Afrique",
      sector: "fmcg",
      description: "Marque FMCG panafricaine premium — boissons naturelles à base de fruits tropicaux et plantes locales. Présente au Cameroun, Côte d'Ivoire, Sénégal, Ghana et Nigeria. Positionnement : authenticité africaine, qualité internationale.",
      status: "complete",
      phase: "complete",
      coherenceScore: 87,
      inputMethod: "interview",
      generationMode: "wizard",
      generatedAt: threeMonthsAgo,
      nodeType: "BRAND",
      depth: 0,
      deliveryMode: "RETAINER",
      vertical: "FMCG",
      maturityProfile: "MATURE",
      currency: "XOF",
      annualBudget: 450000000,
      targetRevenue: 2100000000,
      interviewData: {
        nomMarque: "Artemis",
        secteur: "fmcg",
        dateCreation: "2018",
        nombreEmployes: "85",
        marchesPrincipaux: "Cameroun, Côte d'Ivoire, Sénégal, Ghana, Nigeria",
        descriptionActivite: "Production et distribution de boissons naturelles à base de fruits tropicaux africains et plantes médicinales locales.",
        publicCible: "Urbains CSP B+/A, 25-45 ans",
        concurrentsPrincipaux: "Coca-Cola, Brasseries du Cameroun, marques locales",
        budgetAnnuel: "450 000 000 XOF",
        objectifPrincipal: "Marque de boissons naturelles #1 en Afrique de l'Ouest d'ici 2027",
        defis: "Distribution, perception prix, chaîne du froid",
        valeursMarque: "Authenticité, Qualité, Fierté africaine, Durabilité, Innovation locale",
        toneOfVoice: "Chaleureux, fier, moderne, ancré dans la tradition",
      },
    },
  });
  console.log(`Strategy upserted: "${strategy.brandName}" (${strategy.id})`);

  // ── 3. Upsert all 8 Pillars ──
  const pillarDefs = [
    { type: "A", title: "Authenticité", order: 1, content: pillarA, summary: "ADN de marque Artemis : archétype du Héros africain, purpose d'authenticité, 5 valeurs fondatrices, mythologie vivante pan-africaine." },
    { type: "D", title: "Distinction", order: 2, content: pillarD, summary: "Positionnement premium naturel : 3 personas (Amara, Kofi, Fatou), territoire visuel afro-futuriste, vocabulaire propriétaire." },
    { type: "V", title: "Valeur", order: 3, content: pillarV, summary: "Catalogue 12 SKUs, ladder 3 tiers (Essentiel/Premium/Prestige), CAC 4 200 XOF, LTV 89 000 XOF, ratio 21.2x." },
    { type: "E", title: "Engagement", order: 4, content: pillarE, summary: "12 touchpoints omnicanal, 6 rituels communautaires, calendrier sacré 8 moments, 10 commandements Artemis." },
    { type: "R", title: "Risk", order: 5, content: pillarR, summary: "Score de risque 38/100 (modéré). 8 micro-SWOT, matrice probabilité-impact, 6 priorités de mitigation." },
    { type: "T", title: "Track", order: 6, content: pillarT, summary: "Brand-Market Fit 74/100. TAM 2.8T XOF, SAM 420Mrd, SOM 85Mrd. 5 tendances macro validées." },
    { type: "I", title: "Implémentation", order: 7, content: pillarI, summary: "Roadmap 36 mois, budget 450M XOF ventilé, équipe 12 postes, 4 workstreams, gouvernance tri-niveau." },
    { type: "S", title: "Stratégie", order: 8, content: pillarS, summary: "Synthèse exécutive : score cohérence 87, 4 axes stratégiques, sprint 90j validé, dashboard 16 KPIs." },
  ];

  for (const def of pillarDefs) {
    await db.pillar.upsert({
      where: {
        strategyId_type: {
          strategyId: ARTEMIS_ID,
          type: def.type,
        },
      },
      update: {
        title: def.title,
        order: def.order,
        status: "complete",
        content: def.content,
        summary: def.summary,
        version: 1,
        generatedAt: threeMonthsAgo,
        staleReason: null,
        staleSince: null,
        errorMessage: null,
      },
      create: {
        strategyId: ARTEMIS_ID,
        type: def.type,
        title: def.title,
        order: def.order,
        status: "complete",
        content: def.content,
        summary: def.summary,
        version: 1,
        generatedAt: threeMonthsAgo,
      },
    });
    console.log(`  Pillar ${def.type} (${def.title}) — complete ✓`);
  }

  console.log(`\nDone! Artemis brand fully seeded with ${pillarDefs.length} pillars.`);
  console.log(`Brand should now appear in the dashboard for user ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
