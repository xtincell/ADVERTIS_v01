// =============================================================================
// FW-12 — Narrative Engineering Handler
// =============================================================================
// AI-native framework: generates narrative arcs per superfan stage,
// sacred texts, vocabulary levels, and story bank.
// Inputs: A (herosJourney), D (tonDeVoix), FW-20 (prophecy, enemy, doctrine),
//         FW-05 (grammaires), FW-11 (transitionMap)
// Outputs: XB.narrativeArc, XB.sacredTexts, XB.vocabularyByStage, XB.storyBank
// =============================================================================

import { registerFrameworkHandler } from "../framework-executor";
import type { FrameworkContext, FrameworkHandlerResult } from "../framework-executor";
import { SUPERFAN_STAGES } from "~/lib/types/frameworks/framework-descriptor";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function execute(ctx: FrameworkContext): Promise<FrameworkHandlerResult> {
  try {
    // Resolve inputs
    const herosJourney = ctx.inputs["A.herosJourney"] as Record<string, unknown> | null;
    const tonDeVoix = ctx.inputs["D.tonDeVoix"] as Record<string, unknown> | null;
    const prophecy = ctx.inputs["MA.prophecy"] as Record<string, unknown> | null;
    const enemy = ctx.inputs["MA.existentialEnemy"] as Record<string, unknown> | null;
    const doctrine = ctx.inputs["MA.doctrine"] as Record<string, unknown> | null;
    const _grammaire = ctx.inputs["GS.conceptualGrammar"] as Record<string, unknown> | null;
    const vocabAuth = ctx.inputs["GS.vocabularyAuthorized"] as string[] | null;
    const vocabForbid = ctx.inputs["GS.vocabularyForbidden"] as string[] | null;
    const transitionMap = ctx.inputs["XA.transitionMap"] as Record<string, unknown>[] | null;

    // Build narrative arcs per stage
    const narrativeArc = SUPERFAN_STAGES.map((stage, idx) => ({
      stage,
      archetype: ARCHETYPES[idx]!,
      hook: deriveHook(stage, prophecy, enemy),
      coreMessage: deriveCoreMessage(stage, doctrine, herosJourney),
      emotionalTone: deriveTone(stage, tonDeVoix),
      callToAction: deriveCTA(stage, transitionMap?.[idx]),
      channels: deriveChannels(stage),
    }));

    // Generate sacred texts
    const sacredTexts = generateSacredTexts(prophecy, enemy, doctrine, herosJourney);

    // Build vocabulary by stage
    const vocabularyByStage = SUPERFAN_STAGES.map((stage, idx) => ({
      stage,
      registerLevel: REGISTER_LEVELS[idx]! as "ACCESSIBLE" | "INITIATED" | "INSIDER" | "SACRED",
      authorizedTerms: vocabAuth?.slice(0, 5 + idx * 2) ?? [`terme-${stage.toLowerCase()}`],
      forbiddenTerms: vocabForbid?.slice(0, 3) ?? [],
      toneDirectives: deriveToneDirective(stage, tonDeVoix),
      jargonLevel: Math.min(10, idx * 2),
    }));

    // Generate story bank
    const storyBank = generateStoryBank(prophecy, enemy, herosJourney);

    return {
      success: true,
      data: {
        "XB.narrativeArc": narrativeArc,
        "XB.sacredTexts": sacredTexts,
        "XB.vocabularyByStage": vocabularyByStage,
        "XB.storyBank": storyBank,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: {},
      error: err instanceof Error ? err.message : "Erreur FW-12",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ARCHETYPES = [
  "L'Étranger Curieux",
  "Le Disciple Attentif",
  "Le Participant Actif",
  "Le Fidèle Passionné",
  "Le Gardien Dévoué",
  "Le Missionnaire",
];

const REGISTER_LEVELS = [
  "ACCESSIBLE",
  "ACCESSIBLE",
  "INITIATED",
  "INSIDER",
  "INSIDER",
  "SACRED",
];

function deriveHook(
  stage: string,
  prophecy: Record<string, unknown> | null,
  enemy: Record<string, unknown> | null,
): string {
  if (stage === "AUDIENCE" && prophecy) {
    return `Découvrez la vision : ${String((prophecy as Record<string, unknown>).vision ?? "un futur différent")}`;
  }
  if (stage === "FOLLOWER" && enemy) {
    return `Rejoignez le combat contre ${String((enemy as Record<string, unknown>).name ?? "le statu quo")}`;
  }
  const hooks: Record<string, string> = {
    AUDIENCE: "Découvrez une nouvelle perspective",
    FOLLOWER: "Approfondissez votre compréhension",
    ENGAGED: "Faites partie de l'histoire",
    FAN: "Devenez un acteur du changement",
    SUPERFAN: "Portez le flambeau",
    EVANGELIST: "Menez le mouvement",
  };
  return hooks[stage] ?? "Rejoignez-nous";
}

function deriveCoreMessage(
  stage: string,
  doctrine: Record<string, unknown> | null,
  herosJourney: Record<string, unknown> | null,
): string {
  if (doctrine) {
    const principles = (doctrine as Record<string, unknown>).principles;
    if (Array.isArray(principles) && principles.length > 0) {
      return `Message fondé sur la doctrine : ${String(principles[0])}`;
    }
  }
  if (herosJourney) {
    return `Parcours héroïque : ${String((herosJourney as Record<string, unknown>).transformation ?? "transformation")}`;
  }
  return `Message central pour le stade ${stage}`;
}

function deriveTone(stage: string, tonDeVoix: Record<string, unknown> | null): string {
  if (tonDeVoix) {
    const traits = (tonDeVoix as Record<string, unknown>).traits;
    if (Array.isArray(traits) && traits.length > 0) {
      return String(traits[0]);
    }
  }
  const tones: Record<string, string> = {
    AUDIENCE: "Accessible et intrigant",
    FOLLOWER: "Chaleureux et éducatif",
    ENGAGED: "Inclusif et motivant",
    FAN: "Complice et inspirant",
    SUPERFAN: "Intime et sacré",
    EVANGELIST: "Missionnaire et galvanisant",
  };
  return tones[stage] ?? "Professionnel";
}

function deriveCTA(stage: string, transition: Record<string, unknown> | undefined | null): string {
  if (transition) {
    return String((transition as Record<string, unknown>).triggerCondition ?? `Action pour ${stage}`);
  }
  const ctas: Record<string, string> = {
    AUDIENCE: "Abonnez-vous pour en savoir plus",
    FOLLOWER: "Participez à votre premier événement",
    ENGAGED: "Rejoignez la communauté",
    FAN: "Devenez ambassadeur",
    SUPERFAN: "Prenez la parole",
    EVANGELIST: "Créez votre chapitre local",
  };
  return ctas[stage] ?? "Passez à l'action";
}

function deriveChannels(stage: string): string[] {
  const channels: Record<string, string[]> = {
    AUDIENCE: ["Social Media", "SEO", "PR"],
    FOLLOWER: ["Newsletter", "Blog", "YouTube"],
    ENGAGED: ["Communauté", "Events", "App"],
    FAN: ["Programme fidélité", "Cercle privé", "Mentoring"],
    SUPERFAN: ["Inner Circle", "Co-création", "Board consultatif"],
    EVANGELIST: ["Ambassadeur", "Speaking", "Chapitres locaux"],
  };
  return channels[stage] ?? ["Digital"];
}

function deriveToneDirective(stage: string, tonDeVoix: Record<string, unknown> | null): string {
  if (tonDeVoix) {
    return `Adapté depuis le ton de voix de la marque pour le stade ${stage}`;
  }
  return `Ton adapté au niveau d'engagement ${stage}`;
}

function generateSacredTexts(
  prophecy: Record<string, unknown> | null,
  enemy: Record<string, unknown> | null,
  doctrine: Record<string, unknown> | null,
  herosJourney: Record<string, unknown> | null,
): Array<Record<string, unknown>> {
  const texts = [];

  if (herosJourney) {
    texts.push({
      id: "sacred-origin",
      title: "Histoire des Origines",
      type: "ORIGIN_STORY",
      content: `L'histoire fondatrice de la marque, ancrée dans le parcours héroïque : ${String((herosJourney as Record<string, unknown>).transformation ?? "une quête de sens")}`,
      usageGuidelines: "À utiliser pour le onboarding et les moments fondateurs",
    });
  }

  if (prophecy) {
    texts.push({
      id: "sacred-prophecy",
      title: "La Prophétie",
      type: "PROPHECY_NARRATIVE",
      content: `Notre vision du futur : ${String((prophecy as Record<string, unknown>).vision ?? "un monde transformé")}`,
      audience: "ENGAGED",
      usageGuidelines: "Réservé aux stades ENGAGED+ pour créer l'aspiration",
    });
  }

  if (enemy) {
    texts.push({
      id: "sacred-enemy",
      title: "Déclaration contre l'Ennemi",
      type: "ENEMY_DECLARATION",
      content: `Notre combat contre ${String((enemy as Record<string, unknown>).name ?? "le statu quo")} — ce qui nous unit dans le refus`,
      usageGuidelines: "Pour les moments de mobilisation communautaire",
    });
  }

  if (doctrine) {
    texts.push({
      id: "sacred-credo",
      title: "Le Credo",
      type: "CREDO",
      content: `Nos principes fondamentaux : ${String((doctrine as Record<string, unknown>).summary ?? "ce en quoi nous croyons")}`,
      usageGuidelines: "Base de tous les contenus de marque",
    });
  }

  // Always include manifesto
  texts.push({
    id: "sacred-manifesto",
    title: "Le Manifeste",
    type: "MANIFESTO",
    content: "Manifeste de la marque — à personnaliser via AI generation",
    usageGuidelines: "Document public, partageable, emblématique",
  });

  return texts;
}

function generateStoryBank(
  prophecy: Record<string, unknown> | null,
  enemy: Record<string, unknown> | null,
  herosJourney: Record<string, unknown> | null,
): Array<Record<string, unknown>> {
  const stories = [];

  stories.push({
    id: "story-origin",
    title: "L'Histoire Fondatrice",
    type: "HERO_STORY",
    targetStage: "AUDIENCE",
    synopsis: herosJourney
      ? `Comment tout a commencé : ${String((herosJourney as Record<string, unknown>).departure ?? "le début du voyage")}`
      : "L'histoire de la création de la marque",
    keyMessage: "Nous sommes nés d'une conviction profonde",
    channels: ["Site web", "About page", "Vidéo brand"],
    emotionalImpact: "Inspiration et connexion émotionnelle",
  });

  stories.push({
    id: "story-transformation",
    title: "La Transformation Client",
    type: "TRANSFORMATION",
    targetStage: "FOLLOWER",
    synopsis: "Comment un client est passé de sceptique à convaincu",
    keyMessage: "Le changement est possible",
    channels: ["Témoignages", "Case studies", "Social media"],
    emotionalImpact: "Confiance et aspiration",
  });

  stories.push({
    id: "story-community",
    title: "Le Moment Communautaire",
    type: "COMMUNITY_MOMENT",
    targetStage: "ENGAGED",
    synopsis: "L'événement qui a soudé la communauté",
    keyMessage: "Ensemble, nous sommes plus forts",
    channels: ["Events", "Newsletter", "Communauté"],
    emotionalImpact: "Appartenance et fierté",
  });

  if (prophecy) {
    stories.push({
      id: "story-parable",
      title: "La Parabole du Futur",
      type: "PARABLE",
      targetStage: "FAN",
      synopsis: `Illustration de notre prophétie : ${String((prophecy as Record<string, unknown>).vision ?? "le monde que nous construisons")}`,
      keyMessage: "Notre vision prend forme",
      channels: ["Contenu premium", "Cercle privé"],
      emotionalImpact: "Conviction et dévotion",
    });
  }

  if (enemy) {
    stories.push({
      id: "story-testimony",
      title: "Le Témoignage de Combat",
      type: "TESTIMONY",
      targetStage: "SUPERFAN",
      synopsis: `Comment nous avons résisté à ${String((enemy as Record<string, unknown>).name ?? "l'adversité")}`,
      keyMessage: "Notre combat est juste",
      channels: ["Inner Circle", "Events exclusifs"],
      emotionalImpact: "Détermination et solidarité",
    });
  }

  return stories;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerFrameworkHandler("FW-12", execute);
