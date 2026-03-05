// =============================================================================
// FW-24 — Alliance Architecture Handler
// =============================================================================
// AI-native module that designs the partnership ecosystem.
// Inputs: A-D-V-E pillars, FW-20 (prophecy, doctrine),
//         FW-05 (transconceptGrammar), FW-21 (revenueModel.streams)
// Outputs: AA.partnerTaxonomy, AA.partnerPackages, AA.negotiationProtocol,
//          AA.narrativeIntegration, AA.mutualValueMatrix
// Integration levels: SPONSOR → GUILD → GUARDIAN_DEITY → ALLIANCE
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INTEGRATION_LEVELS = ["SPONSOR", "GUILD", "GUARDIAN_DEITY", "ALLIANCE"] as const;

const PARTNER_TYPES = [
  { type: "MEDIA" as const, name: "Médias & Influence", fit: 75 },
  { type: "TECH" as const, name: "Technologie & Innovation", fit: 70 },
  { type: "DISTRIBUTION" as const, name: "Distribution & Retail", fit: 80 },
  { type: "CONTENT" as const, name: "Contenu & Créatif", fit: 65 },
  { type: "COMMUNITY" as const, name: "Communautés & Associations", fit: 85 },
  { type: "INSTITUTIONAL" as const, name: "Institutions & Gouvernement", fit: 55 },
];

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
    try {
      // Resolve inputs
      const prophecy = ctx.inputs["MA.prophecy"] as Record<string, unknown> | null;
      const doctrine = ctx.inputs["MA.doctrine"] as Record<string, unknown> | null;
      const _revenueModel = ctx.inputs["VC.revenueModel"] as Record<string, unknown> | null;

      // Build partner taxonomy
      const partnerTaxonomy = PARTNER_TYPES.map((pt, idx) => ({
        id: `cat-${pt.type.toLowerCase()}`,
        name: pt.name,
        type: pt.type,
        description: `Partenaires ${pt.name.toLowerCase()} alignés avec la doctrine de marque`,
        strategicFit: pt.fit,
        potentialPartners: derivePartnerSuggestions(pt.type),
        idealLevel: INTEGRATION_LEVELS[Math.min(idx % 4, 3)]!,
      }));

      // Partner packages — one per integration level
      const partnerPackages = INTEGRATION_LEVELS.map((level, idx) => ({
        id: `pkg-${level.toLowerCase()}`,
        level,
        name: derivePackageName(level),
        description: derivePackageDescription(level),
        brandOffers: deriveBrandOffers(level, prophecy),
        brandReceives: deriveBrandReceives(level),
        investmentRange: deriveInvestmentRange(level),
        duration: deriveDuration(level),
        successKpis: deriveKpis(level),
        exclusivity: idx >= 2, // Guardian Deity + Alliance are exclusive
      }));

      // Negotiation protocol
      const negotiationProtocol = {
        stages: [
          { order: 1, name: "Exploration", description: "Alignement vision et valeurs", deliverables: ["Fiche de compatibilité", "Mapping des synergies"], duration: "2-4 semaines" },
          { order: 2, name: "Proposition", description: "Co-design du package partenariat", deliverables: ["Proposition de valeur mutuelle", "Draft contrat"], duration: "2-3 semaines" },
          { order: 3, name: "Négociation", description: "Ajustement des termes et conditions", deliverables: ["Contrat finalisé", "Plan d'activation"], duration: "1-2 semaines" },
          { order: 4, name: "Activation", description: "Lancement du partenariat", deliverables: ["Campagne co-brandée", "Mesure des KPIs initiaux"], duration: "4-8 semaines" },
          { order: 5, name: "Optimisation", description: "Review et ajustement continu", deliverables: ["Rapport de performance", "Plan d'optimisation"], duration: "Continu (trimestriel)" },
        ],
        redLines: deriveRedLines(doctrine),
        valuePropTemplate: buildValuePropTemplate(prophecy),
        selectionCriteria: [
          "Alignement avec la doctrine de marque",
          "Audience complémentaire (non-cannibalisation)",
          "Capacité de co-création de contenu",
          "Résonance avec la prophétie de marque",
          "Track record de partenariats réussis",
          "Compatibilité culturelle et valeurs",
        ],
      };

      // Narrative integration
      const narrativeIntegration = PARTNER_TYPES.slice(0, 4).map((pt, idx) => ({
        id: `ni-${pt.type.toLowerCase()}`,
        partnerType: pt.name,
        integrationLevel: INTEGRATION_LEVELS[Math.min(idx, 3)]!,
        narrativeRole: deriveNarrativeRole(pt.type, prophecy),
        sharedVocabulary: deriveSharedVocabulary(pt.type),
        coBrandingRules: deriveCoBrandingRules(INTEGRATION_LEVELS[Math.min(idx, 3)]!),
        storyOpportunities: deriveStoryOpportunities(pt.type),
      }));

      // Mutual value matrix
      const mutualValueMatrix = PARTNER_TYPES.slice(0, 4).map((pt, idx) => ({
        partnerCategory: pt.name,
        integrationLevel: INTEGRATION_LEVELS[Math.min(idx, 3)]!,
        brandToPartner: {
          tangible: deriveTangibleOffers(INTEGRATION_LEVELS[Math.min(idx, 3)]!),
          intangible: ["Prestige de marque", "Accès communauté engagée", "Crédibilité narrative"],
          estimatedValue: deriveValueEstimate(INTEGRATION_LEVELS[Math.min(idx, 3)]!, "offer"),
        },
        partnerToBrand: {
          tangible: deriveTangibleReceives(INTEGRATION_LEVELS[Math.min(idx, 3)]!),
          intangible: ["Légitimité sectorielle", "Validation marché", "Effet de réseau"],
          estimatedValue: deriveValueEstimate(INTEGRATION_LEVELS[Math.min(idx, 3)]!, "receive"),
        },
        mutualBenefitScore: pt.fit,
      }));

      return {
        success: true,
        data: {
          partnerTaxonomy,
          partnerPackages,
          negotiationProtocol,
          narrativeIntegration,
          mutualValueMatrix,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        error: error instanceof Error ? error.message : "FW-24 execution error",
      };
    }
}

registerFrameworkHandler("FW-24", execute);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function derivePartnerSuggestions(type: string): string[] {
  const suggestions: Record<string, string[]> = {
    MEDIA: ["Médias locaux influents", "Créateurs de contenu sectoriels", "Podcasts thématiques"],
    TECH: ["Fournisseurs SaaS complémentaires", "Startups innovantes du secteur"],
    DISTRIBUTION: ["Retailers premium", "E-commerce partenaires", "Distributeurs régionaux"],
    CONTENT: ["Agences créatives", "Studios de production", "Artistes et designers"],
    COMMUNITY: ["Associations professionnelles", "ONG alignées", "Clubs et communautés"],
    INSTITUTIONAL: ["Chambres de commerce", "Collectivités locales", "Organismes de formation"],
  };
  return suggestions[type] ?? ["Partenaires à identifier"];
}

function derivePackageName(level: string): string {
  const names: Record<string, string> = {
    SPONSOR: "Sponsorship Classique",
    GUILD: "Guilde Partenaire",
    GUARDIAN_DEITY: "Divinité Gardienne",
    ALLIANCE: "Alliance Sacrée",
  };
  return names[level] ?? level;
}

function derivePackageDescription(level: string): string {
  const desc: Record<string, string> = {
    SPONSOR: "Visibilité de marque contre investissement financier. Intégration narrative minimale.",
    GUILD: "Collaboration opérationnelle sur des projets communs. Co-création de contenu.",
    GUARDIAN_DEITY: "Partenariat stratégique profond avec intégration narrative complète et exclusivité sectorielle.",
    ALLIANCE: "Fusion de destins. Co-construction d'un avenir commun avec gouvernance partagée.",
  };
  return desc[level] ?? "";
}

function deriveBrandOffers(level: string, _prophecy: Record<string, unknown> | null): string[] {
  const offers: Record<string, string[]> = {
    SPONSOR: ["Visibilité événementielle", "Mention dans les communications", "Logo sur supports"],
    GUILD: ["Co-création de contenu", "Accès aux insights communauté", "Données d'engagement anonymisées"],
    GUARDIAN_DEITY: ["Intégration narrative profonde", "Exclusivité sectorielle", "Advisory board seat", "Co-design produit"],
    ALLIANCE: ["Gouvernance partagée", "Revenue sharing", "IP commune", "Destin lié publiquement"],
  };
  return offers[level] ?? [];
}

function deriveBrandReceives(level: string): string[] {
  const receives: Record<string, string[]> = {
    SPONSOR: ["Investissement financier", "Visibilité croisée"],
    GUILD: ["Expertise sectorielle", "Réseau de distribution", "Contenu co-créé"],
    GUARDIAN_DEITY: ["Investissement stratégique", "Accès marché élargi", "Légitimité institutionnelle"],
    ALLIANCE: ["Synergie complète", "Partage des risques", "Effet réseau exponentiel"],
  };
  return receives[level] ?? [];
}

function deriveInvestmentRange(level: string): string {
  const ranges: Record<string, string> = {
    SPONSOR: "5-50M FCFA / an",
    GUILD: "50-200M FCFA / an",
    GUARDIAN_DEITY: "200M-1Md FCFA / an",
    ALLIANCE: "1Md+ FCFA / an (ou equity)",
  };
  return ranges[level] ?? "À définir";
}

function deriveDuration(level: string): string {
  const durations: Record<string, string> = {
    SPONSOR: "6-12 mois (renouvelable)",
    GUILD: "12-24 mois",
    GUARDIAN_DEITY: "24-36 mois (engagement)",
    ALLIANCE: "3-5 ans (stratégique)",
  };
  return durations[level] ?? "12 mois";
}

function deriveKpis(level: string): string[] {
  const kpis: Record<string, string[]> = {
    SPONSOR: ["Impressions co-brandées", "Trafic référé", "Leads générés"],
    GUILD: ["Contenu co-produit", "Engagement croisé", "NPS partenariat"],
    GUARDIAN_DEITY: ["Revenue incrémental", "Market share gain", "Brand equity lift"],
    ALLIANCE: ["Croissance commune", "Innovation index", "Cult Index impact"],
  };
  return kpis[level] ?? [];
}

function deriveRedLines(doctrine: Record<string, unknown> | null): string[] {
  const base = [
    "Aucun partenariat qui contredit les valeurs de marque",
    "Pas de greenwashing ni de valeur-washing",
    "Transparence totale sur les termes financiers",
    "Droit de veto sur tout contenu co-brandé",
  ];
  if (doctrine && typeof doctrine === "object") {
    base.push("Respect intégral de la doctrine de marque par le partenaire");
  }
  return base;
}

function buildValuePropTemplate(prophecy: Record<string, unknown> | null): string {
  const prophecyText = prophecy && typeof prophecy === "object"
    ? String(prophecy.vision ?? prophecy.prophecy ?? "notre vision commune")
    : "une vision partagée";
  return `En rejoignant notre écosystème, vous participez à ${prophecyText}. Ensemble, nous créons une valeur qui dépasse la somme de nos parties.`;
}

function deriveNarrativeRole(partnerType: string, _prophecy: Record<string, unknown> | null): string {
  const roles: Record<string, string> = {
    MEDIA: "Amplificateur du récit — diffuse la prophétie à de nouvelles audiences",
    TECH: "Architecte des outils — construit l'infrastructure du mouvement",
    DISTRIBUTION: "Passeur de seuil — rend la marque accessible à chaque stade",
    CONTENT: "Conteur allié — enrichit la mythologie avec de nouvelles perspectives",
  };
  return roles[partnerType] ?? "Allié stratégique";
}

function deriveSharedVocabulary(partnerType: string): string[] {
  const vocab: Record<string, string[]> = {
    MEDIA: ["impact", "authenticité", "communauté", "engagement"],
    TECH: ["innovation", "scalabilité", "expérience", "data-driven"],
    DISTRIBUTION: ["accessibilité", "proximité", "valeur", "qualité"],
    CONTENT: ["storytelling", "créativité", "immersion", "inspiration"],
  };
  return vocab[partnerType] ?? ["collaboration", "synergie"];
}

function deriveCoBrandingRules(level: string): string[] {
  const rules: Record<string, string[]> = {
    SPONSOR: ["Logo partenaire en position secondaire", "Mention 'avec le soutien de'", "Pas de modification du messaging"],
    GUILD: ["Co-signature équitable", "Charte graphique conjointe", "Validation créative mutuelle"],
    GUARDIAN_DEITY: ["Intégration narrative complète", "Identité visuelle fusionnée (guidelines)", "Storytelling commun"],
    ALLIANCE: ["Marque commune possible", "Identité co-construite", "Gouvernance éditoriale partagée"],
  };
  return rules[level] ?? [];
}

function deriveStoryOpportunities(partnerType: string): string[] {
  const opps: Record<string, string[]> = {
    MEDIA: ["Interview croisée fondateurs", "Série documentaire commune", "Podcast co-hosted"],
    TECH: ["Case study innovation", "Demo day commun", "Hackathon co-organisé"],
    DISTRIBUTION: ["Pop-up store éphémère", "Lancement exclusif retail", "Experience in-store"],
    CONTENT: ["Collection capsule co-signée", "Exposition commune", "NFT/digital collectible"],
  };
  return opps[partnerType] ?? ["Projet commun à définir"];
}

function deriveTangibleOffers(level: string): string[] {
  const offers: Record<string, string[]> = {
    SPONSOR: ["Espace publicitaire", "Placement produit"],
    GUILD: ["Base de données insights", "Accès plateforme", "Formation équipes"],
    GUARDIAN_DEITY: ["Exclusivité catégorie", "R&D conjointe", "Distribution premium"],
    ALLIANCE: ["Equity sharing", "IP commune", "Infrastructure partagée"],
  };
  return offers[level] ?? [];
}

function deriveTangibleReceives(level: string): string[] {
  const receives: Record<string, string[]> = {
    SPONSOR: ["Budget marketing", "Produits/services gratuits"],
    GUILD: ["Expertise technique", "Réseau distribution", "Contenu professionnel"],
    GUARDIAN_DEITY: ["Investissement financier", "Accès marché international", "Technologie propriétaire"],
    ALLIANCE: ["Capital", "Infrastructure mondiale", "Portefeuille de marques"],
  };
  return receives[level] ?? [];
}

function deriveValueEstimate(level: string, direction: "offer" | "receive"): string {
  const estimates: Record<string, Record<string, string>> = {
    SPONSOR: { offer: "10-30M FCFA", receive: "5-50M FCFA" },
    GUILD: { offer: "50-150M FCFA", receive: "50-200M FCFA" },
    GUARDIAN_DEITY: { offer: "200-500M FCFA", receive: "200M-1Md FCFA" },
    ALLIANCE: { offer: "500M+ FCFA", receive: "1Md+ FCFA" },
  };
  return estimates[level]?.[direction] ?? "À évaluer";
}
