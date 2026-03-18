// ═══════════════════════════════════════════════════════════════════════════
// Simulated MCP responses for the interactive demo
// ═══════════════════════════════════════════════════════════════════════════

export interface DemoScenario {
  server: string;
  tool: string;
  params: Record<string, string>;
  response: string; // Pre-formatted JSON string
  duration: number; // Simulated response time in ms
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    server: "mcp-intelligence",
    tool: "recalculate_scores",
    params: {
      strategyId: "strat_amara_2026",
      brandName: "AMARA Beauty",
    },
    response: JSON.stringify(
      {
        scores: {
          coherence: { value: 87, trend: "+3", components: { "A-D": 92, "D-V": 84, "V-E": 88, "E-I": 83, "fidelite": 91 } },
          risk: { value: 34, trend: "-8", level: "LOW" },
          bmf: { value: 72, trend: "+5", level: "STRONG" },
          investment: { value: 91, trend: "+2", level: "READY" },
        },
        snapshotId: "snap_20260315_001",
        computedAt: "2026-03-15T14:32:00Z",
      },
      null,
      2,
    ),
    duration: 1200,
  },
  {
    server: "mcp-intelligence",
    tool: "generate_pillar",
    params: {
      pillar: "A",
      brandName: "AMARA Beauty",
      sector: "cosmetique",
    },
    response: JSON.stringify(
      {
        pillar: "A",
        title: "Authenticite",
        content: {
          purpose: "Reveler la beaute authentique des femmes africaines a travers des soins naturels ancres dans le patrimoine botanique du continent.",
          values: ["Heritage naturel", "Fierte culturelle", "Innovation durable", "Accessibilite"],
          archetype: "Le Sage",
          ikigai: {
            passion: "Sublimer la beaute naturelle africaine",
            mission: "Democratiser les soins premium bio-sources",
            vocation: "Expert en cosmetologie tropicale",
            profession: "Marque de soins premium accessible",
          },
          heroJourney: {
            ordinaryWorld: "Des femmes qui ne trouvent pas de soins adaptes a leur peau...",
            callToAdventure: "AMARA propose une alternative: des formules ancestrales modernisees.",
          },
        },
        generatedAt: "2026-03-15T14:33:12Z",
        tokensUsed: 4280,
      },
      null,
      2,
    ),
    duration: 3500,
  },
  {
    server: "mcp-operations",
    tool: "create_campaign",
    params: {
      brandName: "AMARA Beauty",
      name: "Campagne Fete des Meres 2026",
      budget: "15 000 000 FCFA",
    },
    response: JSON.stringify(
      {
        campaign: {
          id: "camp_amara_fdm_2026",
          name: "Campagne Fete des Meres 2026",
          state: "BRIEF_DRAFT",
          budget: { total: 15000000, currency: "XOF", allocated: 0 },
          actions: { ATL: 0, BTL: 0, TTL: 0 },
          team: [],
          milestones: [
            { name: "Brief valide", date: "2026-04-15", blocking: true },
            { name: "Creative approved", date: "2026-05-01", blocking: true },
            { name: "Go live", date: "2026-05-20", blocking: false },
          ],
        },
        nextStates: ["BRIEF_VALIDATED"],
        createdAt: "2026-03-15T14:35:00Z",
      },
      null,
      2,
    ),
    duration: 800,
  },
  {
    server: "mcp-creative",
    tool: "glory_concept_generator",
    params: {
      brandName: "AMARA Beauty",
      campaign: "Fete des Meres",
      insight: "Les meres africaines transmettent des rituels beaute",
    },
    response: JSON.stringify(
      {
        concepts: [
          {
            title: "L'Heritage des Mains",
            insight: "Chaque geste de soin est un heritage transmis de mere en fille",
            idea: "Campagne montrant des mains de meres appliquant des soins AMARA sur leurs filles — le geste comme vecteur de transmission culturelle.",
            tone: "Emotionnel, intime, cinematographique",
            channels: ["TV 30s", "Instagram Reels", "Activation terrain"],
          },
          {
            title: "Ma Premiere Recette",
            insight: "Les recettes beaute maison sont des secrets de famille",
            idea: "Chaque produit AMARA est une 'recette de maman' modernisee. UGC campaign ou les clientes partagent la recette beaute de leur mere.",
            tone: "Nostalgique, participatif, authentique",
            channels: ["TikTok Challenge", "Packaging QR", "Event pop-up"],
          },
        ],
        fromPillars: ["A.values", "D.positioning", "E.touchpoints"],
        generatedAt: "2026-03-15T14:36:45Z",
      },
      null,
      2,
    ),
    duration: 2800,
  },
  {
    server: "mcp-pulse",
    tool: "calculate_cult_index",
    params: {
      strategyId: "strat_amara_2026",
      brandName: "AMARA Beauty",
    },
    response: JSON.stringify(
      {
        cultIndex: {
          overall: 68,
          trend: "+4",
          dimensions: {
            engagementDepth: { value: 74, weight: 0.2 },
            superfanVelocity: { value: 62, weight: 0.15 },
            communityCohesion: { value: 71, weight: 0.15 },
            brandDefenseRate: { value: 58, weight: 0.15 },
            ugcGenerationRate: { value: 73, weight: 0.1 },
            ritualAdoption: { value: 65, weight: 0.1 },
            evangelismScore: { value: 69, weight: 0.15 },
          },
        },
        superfanCount: 1247,
        communityHealth: "GROWING",
        computedAt: "2026-03-15T14:38:00Z",
      },
      null,
      2,
    ),
    duration: 1500,
  },
];
