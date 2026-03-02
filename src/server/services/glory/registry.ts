// =============================================================================
// SERVICE S.GLORY.1 — Glory Tool Registry
// =============================================================================

import type {
  GloryLayer,
  GloryToolDescriptor,
  GloryToolInput,
} from "~/lib/types/glory-tools";

// =============================================================================
// COUCHE CR — 10 outils créatifs
// =============================================================================

const conceptGenerator: GloryToolDescriptor = {
  slug: "concept-generator",
  name: "Concept Generator",
  shortName: "Concepts",
  layer: "CR",
  description:
    "Génère des concepts créatifs à partir d'un insight et de contraintes média. Produit plusieurs pistes exploitables avec axe, promesse et territoire visuel.",
  icon: "Lightbulb",
  persistable: true,
  requiredContext: ["competitors", "market"],
  inputs: [
    {
      key: "insight",
      label: "Insight consommateur",
      type: "textarea",
      placeholder: "Ex : Les mères camerounaises veulent protéger leur famille mais manquent de temps…",
      required: true,
      helpText: "L'insight humain qui servira de tremplin créatif.",
      enrichable: true,
    },
    {
      key: "mediaConstraint",
      label: "Contrainte média",
      type: "select",
      required: true,
      options: [
        { value: "tv", label: "TV" },
        { value: "radio", label: "Radio" },
        { value: "affichage", label: "Affichage" },
        { value: "digital", label: "Digital" },
        { value: "presse", label: "Presse" },
        { value: "activation", label: "Activation" },
        { value: "multi", label: "Multi-média" },
      ],
      helpText: "Le canal principal pour lequel le concept sera développé.",
      enrichable: true,
      enrichKey: "channels",
    },
    {
      key: "tonality",
      label: "Tonalité",
      type: "select",
      options: [
        { value: "premium", label: "Premium" },
        { value: "populaire", label: "Populaire" },
        { value: "jeune", label: "Jeune" },
        { value: "corporate", label: "Corporate" },
        { value: "humoristique", label: "Humoristique" },
        { value: "emotionnel", label: "Émotionnel" },
      ],
      helpText: "Le ton souhaité pour les concepts générés.",
      enrichable: true,
    },
    {
      key: "numConcepts",
      label: "Nombre de concepts",
      type: "number",
      defaultValue: 3,
      helpText: "Combien de pistes créatives souhaitez-vous recevoir ?",
    },
    {
      key: "additionalConstraints",
      label: "Contraintes additionnelles",
      type: "textarea",
      placeholder: "Ex : Éviter les clichés sur la famille, intégrer un élément musical…",
      helpText: "Toute contrainte ou directive supplémentaire pour le brief.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["création", "concept", "idéation"],
};

const scriptWriter: GloryToolDescriptor = {
  slug: "script-writer",
  name: "Script Writer",
  shortName: "Scripts",
  layer: "CR",
  description:
    "Rédige des scripts publicitaires complets avec indications de réalisation, dialogues et directions artistiques pour TV, radio et digital.",
  icon: "Film",
  persistable: true,
  requiredContext: ["missions"],
  inputs: [
    {
      key: "format",
      label: "Format du script",
      type: "select",
      required: true,
      options: [
        { value: "tv_30", label: "Spot TV 30s" },
        { value: "tv_60", label: "Spot TV 60s" },
        { value: "radio_30", label: "Spot Radio 30s" },
        { value: "radio_60", label: "Spot Radio 60s" },
        { value: "digital_15", label: "Digital 15s" },
        { value: "digital_30", label: "Digital 30s" },
        { value: "digital_60", label: "Digital 60s" },
        { value: "podcast", label: "Podcast" },
      ],
      helpText: "Le format détermine la durée et la structure du script.",
    },
    {
      key: "concept",
      label: "Concept à scripter",
      type: "textarea",
      placeholder: "Décrivez le concept créatif, l'axe et la promesse…",
      required: true,
      helpText: "Le concept créatif qui servira de base au script.",
      enrichable: true,
    },
    {
      key: "language",
      label: "Langue / registre",
      type: "select",
      options: [
        { value: "fr_standard", label: "Français standard" },
        { value: "fr_cameroun", label: "Français camerounais" },
        { value: "francanglais", label: "Francanglais" },
        { value: "pidgin", label: "Pidgin" },
        { value: "fr_ivoirien", label: "Français ivoirien" },
        { value: "wolof_mix", label: "Wolof mix" },
      ],
      helpText: "Le registre linguistique des dialogues.",
    },
    {
      key: "numVersions",
      label: "Nombre de versions",
      type: "number",
      defaultValue: 1,
      helpText: "Nombre de versions alternatives du script.",
    },
    {
      key: "callToAction",
      label: "Call to Action",
      type: "text",
      placeholder: "Ex : Appelez le 800-XXXX, Téléchargez l'app…",
      helpText: "Le message d'appel à l'action en fin de spot.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["création", "script", "rédaction"],
};

const longCopyCraftsman: GloryToolDescriptor = {
  slug: "long-copy-craftsman",
  name: "Long Copy Craftsman",
  shortName: "Long Copy",
  layer: "CR",
  description:
    "Rédige des textes longs — manifestes, publirédactionnels, brand stories — avec une plume soignée et un storytelling maîtrisé.",
  icon: "FileText",
  persistable: true,
  requiredContext: [],
  inputs: [
    {
      key: "format",
      label: "Type de texte",
      type: "select",
      required: true,
      options: [
        { value: "manifeste", label: "Manifeste" },
        { value: "publiredac", label: "Publirédactionnel" },
        { value: "brand_story", label: "Brand Story" },
        { value: "edito", label: "Éditorial" },
        { value: "lettre_ouverte", label: "Lettre ouverte" },
      ],
      helpText: "Le genre rédactionnel du texte à produire.",
    },
    {
      key: "angle",
      label: "Angle rédactionnel",
      type: "textarea",
      placeholder: "Décrivez l'angle, le message clé et le ton souhaité…",
      required: true,
      helpText: "L'angle et la direction rédactionnelle du texte.",
    },
    {
      key: "targetLength",
      label: "Longueur cible (mots)",
      type: "number",
      defaultValue: 500,
      helpText: "Le nombre de mots approximatif du texte final.",
    },
    {
      key: "tonality",
      label: "Tonalité",
      type: "select",
      options: [
        { value: "inspirant", label: "Inspirant" },
        { value: "factuel", label: "Factuel" },
        { value: "emotionnel", label: "Émotionnel" },
        { value: "provocateur", label: "Provocateur" },
      ],
      helpText: "Le registre émotionnel du texte.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "markdown",
  tags: ["création", "rédaction", "long-format"],
};

const dialogueWriter: GloryToolDescriptor = {
  slug: "dialogue-writer",
  name: "Dialogue Writer",
  shortName: "Dialogues",
  layer: "CR",
  description:
    "Écrit des dialogues authentiques et culturellement ancrés pour spots publicitaires, avec gestion des registres linguistiques africains.",
  icon: "MessageSquare",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "scenario",
      label: "Scénario",
      type: "textarea",
      placeholder: "Décrivez la situation, le lieu et l'action…",
      required: true,
      helpText: "Le contexte narratif dans lequel se déroule le dialogue.",
    },
    {
      key: "characters",
      label: "Personnages",
      type: "textarea",
      placeholder: "Ex : Mama Ngo (50 ans, commerçante), Son fils Éric (25 ans, étudiant)…",
      required: true,
      helpText: "Description des personnages et de leur profil.",
    },
    {
      key: "language",
      label: "Langue / registre",
      type: "select",
      required: true,
      options: [
        { value: "fr_soutenu", label: "Français soutenu" },
        { value: "fr_cameroun", label: "Français camerounais" },
        { value: "francanglais", label: "Francanglais" },
        { value: "pidgin", label: "Pidgin" },
        { value: "nouchi", label: "Nouchi" },
        { value: "wolof_mix", label: "Wolof mix" },
      ],
      helpText: "Le registre linguistique principal des dialogues.",
    },
    {
      key: "duration",
      label: "Durée cible (secondes)",
      type: "number",
      defaultValue: 30,
      helpText: "La durée approximative du dialogue en secondes.",
    },
    {
      key: "mood",
      label: "Ambiance",
      type: "select",
      options: [
        { value: "comique", label: "Comique" },
        { value: "dramatique", label: "Dramatique" },
        { value: "quotidien", label: "Quotidien" },
        { value: "suspense", label: "Suspense" },
      ],
      helpText: "L'atmosphère générale du dialogue.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["création", "dialogue", "linguistique"],
};

const claimBaselineFactory: GloryToolDescriptor = {
  slug: "claim-baseline-factory",
  name: "Claim & Baseline Factory",
  shortName: "Claims",
  layer: "CR",
  description:
    "Génère des baselines, claims et slogans de campagne percutants. Propose des variations courtes, mémorisables et différenciantes.",
  icon: "Award",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "type",
      label: "Type de claim",
      type: "select",
      required: true,
      options: [
        { value: "baseline", label: "Baseline (signature de marque)" },
        { value: "claim", label: "Claim produit" },
        { value: "slogan_campagne", label: "Slogan de campagne" },
        { value: "tagline", label: "Tagline" },
      ],
      helpText: "Le type de phrase courte à générer.",
    },
    {
      key: "numProposals",
      label: "Nombre de propositions",
      type: "number",
      defaultValue: 10,
      helpText: "Combien de propositions souhaitez-vous recevoir ?",
    },
    {
      key: "constraints",
      label: "Contraintes",
      type: "textarea",
      placeholder: "Ex : Maximum 5 mots, doit fonctionner en français et en anglais…",
      helpText: "Contraintes spécifiques pour la génération.",
    },
    {
      key: "existingBaseline",
      label: "Baseline existante",
      type: "text",
      placeholder: "Ex : La baseline actuelle de la marque…",
      helpText: "La baseline actuelle à prendre en compte ou à remplacer.",
    },
  ],
  requiredPillars: ["A", "D", "V"],
  outputFormat: "structured",
  tags: ["création", "claim", "baseline", "slogan"],
};

const printAdArchitect: GloryToolDescriptor = {
  slug: "print-ad-architect",
  name: "Print Ad Architect",
  shortName: "Print Ads",
  layer: "CR",
  description:
    "Conçoit l'architecture d'annonces presse et affiches : headline, body copy, mise en page, hiérarchie visuelle et appel à l'action.",
  icon: "Newspaper",
  persistable: true,
  requiredContext: ["missions"],
  inputs: [
    {
      key: "format",
      label: "Format",
      type: "select",
      required: true,
      options: [
        { value: "pleine_page", label: "Pleine page" },
        { value: "demi_page", label: "Demi-page" },
        { value: "quart_page", label: "Quart de page" },
        { value: "affichage_4x3", label: "Affichage 4x3" },
        { value: "affichage_sucette", label: "Affichage sucette" },
      ],
      helpText: "Le format physique de l'annonce.",
    },
    {
      key: "objective",
      label: "Objectif de l'annonce",
      type: "textarea",
      placeholder: "Ex : Lancer le nouveau pack familial, mettre en avant le prix…",
      required: true,
      helpText: "Ce que l'annonce doit accomplir.",
      enrichable: true,
      enrichKey: "campaignObjective",
    },
    {
      key: "mandatories",
      label: "Éléments obligatoires",
      type: "textarea",
      placeholder: "Ex : Logo en bas à droite, mentions légales, QR code…",
      helpText: "Les éléments imposés qui doivent figurer dans l'annonce.",
    },
    {
      key: "numVersions",
      label: "Nombre de versions",
      type: "number",
      defaultValue: 2,
      helpText: "Nombre de déclinaisons à proposer.",
    },
  ],
  requiredPillars: ["A", "D", "V"],
  outputFormat: "structured",
  tags: ["création", "print", "affichage", "presse"],
};

const socialCopyEngine: GloryToolDescriptor = {
  slug: "social-copy-engine",
  name: "Social Copy Engine",
  shortName: "Social Copy",
  layer: "CR",
  description:
    "Produit des copies social media adaptées à chaque plateforme, avec hashtags, emojis et formats natifs optimisés pour l'engagement.",
  icon: "Share2",
  persistable: false,
  requiredContext: ["opportunities"],
  inputs: [
    {
      key: "platforms",
      label: "Plateformes",
      type: "multiselect",
      required: true,
      enrichable: true,
      options: [
        { value: "facebook", label: "Facebook" },
        { value: "instagram", label: "Instagram" },
        { value: "tiktok", label: "TikTok" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "twitter", label: "Twitter / X" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "youtube", label: "YouTube" },
        { value: "threads", label: "Threads" },
      ],
      helpText: "Les plateformes pour lesquelles générer du contenu.",
    },
    {
      key: "contentType",
      label: "Type de contenu",
      type: "select",
      required: true,
      options: [
        { value: "lancement", label: "Lancement" },
        { value: "promo", label: "Promotion" },
        { value: "engagement", label: "Engagement" },
        { value: "corporate", label: "Corporate" },
        { value: "event", label: "Événement" },
        { value: "storytelling", label: "Storytelling" },
      ],
      helpText: "La nature du contenu à publier.",
    },
    {
      key: "message",
      label: "Message clé",
      type: "textarea",
      placeholder: "Quel est le message principal à faire passer ?",
      required: true,
      helpText: "Le message central que chaque post doit véhiculer.",
    },
    {
      key: "hashtags",
      label: "Inclure des hashtags",
      type: "toggle",
      defaultValue: true,
      helpText: "Générer automatiquement des hashtags pertinents.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["création", "social-media", "digital"],
};

const storytellingSequencer: GloryToolDescriptor = {
  slug: "storytelling-sequencer",
  name: "Storytelling Sequencer",
  shortName: "Storytelling",
  layer: "CR",
  description:
    "Construit des séquences narratives multi-touchpoints avec arcs dramatiques cohérents, du teasing au call-to-action final.",
  icon: "BookOpen",
  persistable: true,
  requiredContext: ["opportunities"],
  variations: 2,
  inputs: [
    {
      key: "objective",
      label: "Objectif narratif",
      type: "textarea",
      placeholder: "Ex : Raconter l'histoire de la marque à travers 4 épisodes…",
      required: true,
      helpText: "L'objectif global de la séquence storytelling.",
      enrichable: true,
      enrichKey: "campaignObjective",
    },
    {
      key: "numTouchpoints",
      label: "Nombre de touchpoints",
      type: "number",
      defaultValue: 4,
      helpText: "Le nombre de points de contact dans la séquence.",
    },
    {
      key: "channels",
      label: "Canaux",
      type: "multiselect",
      options: [
        { value: "social", label: "Social Media" },
        { value: "tv", label: "TV" },
        { value: "radio", label: "Radio" },
        { value: "affichage", label: "Affichage" },
        { value: "digital", label: "Digital" },
        { value: "activation", label: "Activation" },
        { value: "pr", label: "Relations Presse" },
        { value: "influencer", label: "Influenceur" },
      ],
      helpText: "Les canaux de diffusion pour chaque touchpoint.",
      enrichable: true,
      enrichKey: "channels",
    },
    {
      key: "duration",
      label: "Durée de la séquence",
      type: "select",
      options: [
        { value: "1_week", label: "1 semaine" },
        { value: "2_weeks", label: "2 semaines" },
        { value: "1_month", label: "1 mois" },
        { value: "3_months", label: "3 mois" },
      ],
      helpText: "La durée totale de déploiement de la séquence.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["création", "storytelling", "séquence"],
};

const wordplayCulturalBank: GloryToolDescriptor = {
  slug: "wordplay-cultural-bank",
  name: "Wordplay & Cultural Reference Bank",
  shortName: "Jeux de mots",
  layer: "CR",
  description:
    "Banque de jeux de mots, proverbes, expressions culturelles et références populaires par marché africain pour enrichir la création.",
  icon: "Languages",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "market",
      label: "Marché",
      type: "select",
      required: true,
      enrichable: true,
      options: [
        { value: "CM", label: "Cameroun" },
        { value: "CI", label: "Côte d'Ivoire" },
        { value: "SN", label: "Sénégal" },
        { value: "GH", label: "Ghana" },
        { value: "NG", label: "Nigeria" },
        { value: "GA", label: "Gabon" },
        { value: "CD", label: "RD Congo" },
        { value: "pan_african", label: "Pan-Africain" },
      ],
      helpText: "Le marché cible pour les références culturelles.",
    },
    {
      key: "theme",
      label: "Thème",
      type: "text",
      placeholder: "Ex : famille, argent, réussite, nourriture…",
      required: true,
      helpText: "Le thème autour duquel chercher des références.",
    },
    {
      key: "type",
      label: "Type de référence",
      type: "multiselect",
      options: [
        { value: "proverbes", label: "Proverbes" },
        { value: "jeux_mots", label: "Jeux de mots" },
        { value: "expressions", label: "Expressions populaires" },
        { value: "musique", label: "Références musicales" },
        { value: "cinema", label: "Références cinéma / séries" },
        { value: "sport", label: "Références sportives" },
      ],
      helpText: "Les types de références culturelles à explorer.",
    },
    {
      key: "numResults",
      label: "Nombre de résultats",
      type: "number",
      defaultValue: 20,
      helpText: "Combien de références souhaitez-vous recevoir ?",
    },
  ],
  requiredPillars: ["A"],
  outputFormat: "structured",
  tags: ["création", "culture", "linguistique", "références"],
};

const briefCreatifInterne: GloryToolDescriptor = {
  slug: "brief-creatif-interne",
  name: "Brief Créatif Interne",
  shortName: "Brief Créa",
  layer: "CR",
  description:
    "Transforme un brief client en brief créatif interne structuré avec insights, territoire, contraintes et orientations pour l'équipe créative.",
  icon: "ClipboardList",
  persistable: true,
  requiredContext: ["budgets", "missions"],
  inputs: [
    {
      key: "clientBrief",
      label: "Brief client",
      type: "textarea",
      placeholder: "Collez ou résumez le brief client ici…",
      required: true,
      helpText: "Le brief client original ou son résumé.",
    },
    {
      key: "budget",
      label: "Budget",
      type: "text",
      placeholder: "Ex : 50M FCFA, 100K EUR…",
      helpText: "L'enveloppe budgétaire globale du projet.",
      enrichable: true,
    },
    {
      key: "deadline",
      label: "Deadline",
      type: "text",
      placeholder: "Ex : 15 mars 2026, 2 semaines…",
      helpText: "La date limite ou le délai de livraison.",
    },
    {
      key: "team",
      label: "Équipe assignée",
      type: "text",
      placeholder: "Ex : DA Senior + CR Junior + Planneur…",
      helpText: "La composition de l'équipe créative assignée.",
    },
  ],
  requiredPillars: ["A", "D", "V", "E"],
  outputFormat: "structured",
  tags: ["création", "brief", "organisation"],
};

// =============================================================================
// COUCHE DC — 8 outils de direction créative
// =============================================================================

const campaignArchitecturePlanner: GloryToolDescriptor = {
  slug: "campaign-architecture-planner",
  name: "Campaign Architecture Planner",
  shortName: "Architecture",
  layer: "DC",
  description:
    "Planifie l'architecture complète d'une campagne : phases, canaux, messages clés, touchpoints et allocation budgétaire par canal.",
  icon: "Network",
  persistable: true,
  requiredContext: ["budgets", "competitors", "opportunities", "missions"],
  variations: 3,
  inputs: [
    {
      key: "campaignObjective",
      label: "Objectif de la campagne",
      type: "textarea",
      placeholder: "Ex : Lancer le nouveau produit X auprès des 18-35 ans en zone urbaine…",
      required: true,
      helpText: "L'objectif stratégique principal de la campagne.",
      enrichable: true,
    },
    {
      key: "bigIdea",
      label: "Big Idea",
      type: "textarea",
      placeholder: "Le concept créatif central, si déjà défini…",
      helpText: "La grande idée créative de la campagne.",
      enrichable: true,
    },
    {
      key: "budget",
      label: "Budget total",
      type: "text",
      placeholder: "Ex : 200M FCFA, 500K EUR…",
      required: true,
      helpText: "Le budget total alloué à la campagne.",
      enrichable: true,
    },
    {
      key: "duration",
      label: "Durée de la campagne",
      type: "select",
      options: [
        { value: "1_week", label: "1 semaine" },
        { value: "2_weeks", label: "2 semaines" },
        { value: "1_month", label: "1 mois" },
        { value: "3_months", label: "3 mois" },
        { value: "6_months", label: "6 mois" },
        { value: "1_year", label: "1 an" },
      ],
      helpText: "La durée totale prévue pour la campagne.",
      enrichable: true,
    },
    {
      key: "channels",
      label: "Canaux envisagés",
      type: "multiselect",
      options: [
        { value: "tv", label: "TV" },
        { value: "radio", label: "Radio" },
        { value: "affichage", label: "Affichage" },
        { value: "digital", label: "Digital" },
        { value: "social", label: "Social Media" },
        { value: "activation", label: "Activation" },
        { value: "pr", label: "Relations Presse" },
        { value: "influencer", label: "Influenceur" },
      ],
      helpText: "Les canaux de communication envisagés.",
      enrichable: true,
    },
  ],
  requiredPillars: ["A", "D", "V", "E"],
  outputFormat: "structured",
  tags: ["direction-créative", "architecture", "campagne", "planning"],
};

const creativeEvaluationMatrix: GloryToolDescriptor = {
  slug: "creative-evaluation-matrix",
  name: "Creative Evaluation Matrix",
  shortName: "Évaluation",
  layer: "DC",
  description:
    "Évalue des concepts créatifs selon une grille multicritère : pertinence stratégique, originalité, faisabilité, impact culturel et potentiel viral.",
  icon: "Grid3X3",
  persistable: false,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "concepts",
      label: "Concepts à évaluer",
      type: "textarea",
      placeholder: "Listez les concepts créatifs à évaluer…",
      required: true,
      helpText: "Les concepts créatifs soumis à l'évaluation.",
      enrichable: true,
      enrichKey: "concept",
    },
    {
      key: "criteria",
      label: "Critères spécifiques",
      type: "textarea",
      placeholder: "Ex : Impact culturel local, compatibilité média, potentiel viral…",
      helpText: "Des critères d'évaluation additionnels ou spécifiques au projet.",
    },
    {
      key: "context",
      label: "Contexte",
      type: "textarea",
      placeholder: "Ex : Pitch pour un client télécom, marché camerounais…",
      helpText: "Le contexte stratégique et marché de l'évaluation.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["direction-créative", "évaluation", "analyse"],
};

const ideaKillerSaver: GloryToolDescriptor = {
  slug: "idea-killer-saver",
  name: "Idea Killer / Idea Saver",
  shortName: "Idea Audit",
  layer: "DC",
  description:
    "Analyse critique d'un concept : identifie les forces, faiblesses, risques et propose des pistes d'amélioration ou de sauvetage créatif.",
  icon: "Scale",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "concept",
      label: "Concept à auditer",
      type: "textarea",
      placeholder: "Décrivez le concept créatif en détail…",
      required: true,
      helpText: "Le concept créatif à soumettre à l'audit.",
      enrichable: true,
    },
    {
      key: "execution",
      label: "Pistes d'exécution",
      type: "textarea",
      placeholder: "Comment le concept serait exécuté…",
      helpText: "Les pistes d'exécution envisagées.",
    },
    {
      key: "concerns",
      label: "Préoccupations",
      type: "textarea",
      placeholder: "Ex : Le client trouve que c'est trop risqué…",
      helpText: "Les doutes ou préoccupations déjà identifiés.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["direction-créative", "audit", "amélioration"],
};

const multiTeamCoherenceChecker: GloryToolDescriptor = {
  slug: "multi-team-coherence-checker",
  name: "Multi-Team Coherence Checker",
  shortName: "Cohérence",
  layer: "DC",
  description:
    "Vérifie la cohérence entre les productions de différentes équipes ou canaux : ton, message, identité visuelle et territoire de marque.",
  icon: "GitCompare",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "outputs",
      label: "Productions à vérifier",
      type: "textarea",
      placeholder: "Collez les différentes productions (copy, scripts, posts…) à comparer…",
      required: true,
      helpText: "Les productions des différentes équipes à analyser.",
    },
    {
      key: "brandGuidelines",
      label: "Guidelines de marque",
      type: "textarea",
      placeholder: "Les éléments clés de la charte de marque…",
      helpText: "Les guidelines de référence pour la vérification.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["direction-créative", "cohérence", "qualité"],
};

const clientPresentationStrategist: GloryToolDescriptor = {
  slug: "client-presentation-strategist",
  name: "Client Presentation Strategist",
  shortName: "Présentation",
  layer: "DC",
  description:
    "Stratégie de présentation client : structure le storytelling du deck, anticipe les objections et prépare les arguments de vente créatifs.",
  icon: "Presentation",
  persistable: false,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "concepts",
      label: "Concepts à présenter",
      type: "textarea",
      placeholder: "Les concepts créatifs à défendre devant le client…",
      required: true,
      helpText: "Les concepts qui seront présentés au client.",
      enrichable: true,
      enrichKey: "concept",
    },
    {
      key: "clientProfile",
      label: "Profil du client",
      type: "textarea",
      placeholder: "Ex : DG conservateur, équipe marketing jeune, historique de rejets…",
      helpText: "Le profil du client et ses habitudes de validation.",
    },
    {
      key: "preferredConcept",
      label: "Concept préféré",
      type: "textarea",
      placeholder: "Le concept que vous souhaitez vendre en priorité…",
      helpText: "Le concept que l'agence souhaite recommander.",
    },
    {
      key: "presentationFormat",
      label: "Format de présentation",
      type: "select",
      options: [
        { value: "deck", label: "Deck / Keynote" },
        { value: "board", label: "Board / Planche" },
        { value: "video_call", label: "Visioconférence" },
        { value: "in_person", label: "Présentation en personne" },
      ],
      helpText: "Le format dans lequel la présentation sera faite.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["direction-créative", "présentation", "client"],
};

const creativeDirectionMemo: GloryToolDescriptor = {
  slug: "creative-direction-memo",
  name: "Creative Direction Memo",
  shortName: "Note DC",
  layer: "DC",
  description:
    "Rédige des notes de direction créative pour les prestataires : photographes, réalisateurs, illustrateurs, musiciens et autres.",
  icon: "FileEdit",
  persistable: true,
  requiredContext: ["missions"],
  inputs: [
    {
      key: "target",
      label: "Destinataire",
      type: "select",
      required: true,
      options: [
        { value: "photographe", label: "Photographe" },
        { value: "realisateur", label: "Réalisateur" },
        { value: "illustrateur", label: "Illustrateur" },
        { value: "musicien", label: "Musicien / Compositeur" },
        { value: "webdesigner", label: "Web Designer" },
        { value: "animateur", label: "Animateur / Motion Designer" },
      ],
      helpText: "Le type de prestataire destinataire de la note.",
    },
    {
      key: "project",
      label: "Projet",
      type: "textarea",
      placeholder: "Décrivez le projet et le résultat attendu…",
      required: true,
      helpText: "La description du projet et de ses objectifs.",
    },
    {
      key: "references",
      label: "Références visuelles / sonores",
      type: "textarea",
      placeholder: "Liens, descriptions de moodboard, références stylistiques…",
      helpText: "Les références créatives pour guider le prestataire.",
    },
    {
      key: "constraints",
      label: "Contraintes techniques",
      type: "textarea",
      placeholder: "Ex : Format 16:9, durée max 45s, livraison en 4K…",
      helpText: "Les contraintes techniques et de livraison.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["direction-créative", "brief", "production"],
};

const pitchArchitect: GloryToolDescriptor = {
  slug: "pitch-architect",
  name: "Pitch Architect",
  shortName: "Pitch",
  layer: "DC",
  description:
    "Construit la structure complète d'un pitch compétitif : stratégie, création, média, budget et différenciateurs clés pour remporter l'appel d'offres.",
  icon: "Target",
  persistable: true,
  requiredContext: ["budgets", "missions", "competitors"],
  variations: 2,
  inputs: [
    {
      key: "pitchContext",
      label: "Contexte du pitch",
      type: "textarea",
      placeholder: "Ex : Appel d'offres MTN Cameroun pour campagne de fin d'année…",
      required: true,
      helpText: "Le contexte complet de l'appel d'offres.",
    },
    {
      key: "budget",
      label: "Budget estimé",
      type: "text",
      placeholder: "Ex : 300M FCFA…",
      helpText: "Le budget estimé ou communiqué par l'annonceur.",
      enrichable: true,
    },
    {
      key: "deliverables",
      label: "Livrables attendus",
      type: "textarea",
      placeholder: "Ex : Stratégie, 3 concepts, plan média, budget production…",
      helpText: "Les livrables demandés dans le cahier des charges.",
      enrichable: true,
    },
    {
      key: "differentiator",
      label: "Différenciateur agence",
      type: "textarea",
      placeholder: "Ce qui vous distingue des autres agences en lice…",
      helpText: "Les atouts uniques de votre agence pour ce pitch.",
    },
    {
      key: "deadline",
      label: "Date du pitch",
      type: "text",
      placeholder: "Ex : 20 mars 2026…",
      helpText: "La date de la présentation du pitch.",
    },
  ],
  requiredPillars: ["A", "D", "V", "E"],
  outputFormat: "structured",
  tags: ["direction-créative", "pitch", "compétition"],
};

const awardCaseBuilder: GloryToolDescriptor = {
  slug: "award-case-builder",
  name: "Award Case Builder",
  shortName: "Case Study",
  layer: "DC",
  description:
    "Construit des case studies pour festivals créatifs : narrative, résultats, insights stratégiques et mise en forme selon les standards internationaux.",
  icon: "Trophy",
  persistable: true,
  requiredContext: ["missions"],
  inputs: [
    {
      key: "festival",
      label: "Festival visé",
      type: "select",
      required: true,
      options: [
        { value: "cannes_lions", label: "Cannes Lions" },
        { value: "loeries", label: "Loeries" },
        { value: "aapca", label: "AAPCA" },
        { value: "clio", label: "Clio Awards" },
        { value: "epica", label: "Epica Awards" },
        { value: "other", label: "Autre festival" },
      ],
      helpText: "Le festival créatif pour lequel préparer le dossier.",
    },
    {
      key: "category",
      label: "Catégorie",
      type: "text",
      placeholder: "Ex : Film, Print, Digital, Integrated…",
      required: true,
      helpText: "La catégorie de compétition visée.",
    },
    {
      key: "campaignDescription",
      label: "Description de la campagne",
      type: "textarea",
      placeholder: "Décrivez la campagne en détail : contexte, concept, exécution…",
      required: true,
      helpText: "La description complète de la campagne soumise.",
    },
    {
      key: "results",
      label: "Résultats obtenus",
      type: "textarea",
      placeholder: "Ex : +45% de ventes, 2M de vues, 150K interactions…",
      required: true,
      helpText: "Les résultats mesurables de la campagne.",
    },
    {
      key: "mediaInvestment",
      label: "Investissement média",
      type: "text",
      placeholder: "Ex : 150M FCFA…",
      helpText: "Le budget média investi dans la campagne.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["direction-créative", "case-study", "festival", "awards"],
};

// =============================================================================
// COUCHE HYBRIDE — 9 outils transversaux
// =============================================================================

const campaign360Simulator: GloryToolDescriptor = {
  slug: "campaign-360-simulator",
  name: "360 Campaign Simulator",
  shortName: "360°",
  layer: "HYBRID",
  description:
    "Simule la déclinaison d'une campagne sur tous les points de contact : adapte le key visual et le headline à chaque format et canal.",
  icon: "Globe",
  persistable: true,
  requiredContext: ["budgets", "missions"],
  variations: 2,
  inputs: [
    {
      key: "keyVisual",
      label: "Key Visual",
      type: "textarea",
      placeholder: "Décrivez le key visual de la campagne…",
      required: true,
      helpText: "La description du visuel principal de la campagne.",
    },
    {
      key: "headline",
      label: "Headline",
      type: "text",
      placeholder: "Le headline principal de la campagne…",
      required: true,
      helpText: "Le titre / accroche principale de la campagne.",
    },
    {
      key: "channels",
      label: "Points de contact",
      type: "multiselect",
      required: true,
      enrichable: true,
      options: [
        { value: "affichage_4x3", label: "Affichage 4x3" },
        { value: "affichage_sucette", label: "Affichage sucette" },
        { value: "banner_digital", label: "Bannière digitale" },
        { value: "post_social", label: "Post social media" },
        { value: "story", label: "Story (Instagram / Facebook)" },
        { value: "plv", label: "PLV" },
        { value: "packaging", label: "Packaging" },
        { value: "email", label: "E-mail" },
        { value: "activation", label: "Activation terrain" },
        { value: "spot_tv", label: "Spot TV" },
      ],
      helpText: "Les points de contact sur lesquels décliner la campagne.",
    },
    {
      key: "adaptationNotes",
      label: "Notes d'adaptation",
      type: "textarea",
      placeholder: "Ex : Adapter le wording pour le marché ivoirien…",
      helpText: "Instructions spécifiques pour les adaptations.",
    },
  ],
  requiredPillars: ["A", "D", "V"],
  outputFormat: "structured",
  tags: ["hybride", "déclinaison", "360", "multi-canal"],
};

const productionBudgetOptimizer: GloryToolDescriptor = {
  slug: "production-budget-optimizer",
  name: "Production Budget Optimizer",
  shortName: "Budget Prod",
  layer: "HYBRID",
  description:
    "Optimise le budget de production en proposant des alternatives créatives, des mutualisations et des arbitrages qualité/coût par marché.",
  icon: "Calculator",
  persistable: false,
  requiredContext: ["budgets", "missions"],
  variations: 3,
  inputs: [
    {
      key: "totalBudget",
      label: "Budget total production",
      type: "text",
      placeholder: "Ex : 80M FCFA…",
      required: true,
      helpText: "Le budget total alloué à la production.",
      enrichable: true,
    },
    {
      key: "deliverables",
      label: "Livrables à produire",
      type: "textarea",
      placeholder: "Ex : 1 spot TV 30s, 5 posts social, 2 affiches 4x3…",
      required: true,
      helpText: "La liste complète des livrables à produire.",
      enrichable: true,
    },
    {
      key: "market",
      label: "Marché",
      type: "select",
      enrichable: true,
      options: [
        { value: "CM", label: "Cameroun" },
        { value: "CI", label: "Côte d'Ivoire" },
        { value: "SN", label: "Sénégal" },
        { value: "GH", label: "Ghana" },
        { value: "NG", label: "Nigeria" },
      ],
      helpText: "Le marché principal pour les coûts de production.",
    },
    {
      key: "qualityLevel",
      label: "Niveau de qualité",
      type: "select",
      options: [
        { value: "premium", label: "Premium" },
        { value: "standard", label: "Standard" },
        { value: "economique", label: "Économique" },
      ],
      helpText: "Le niveau de qualité attendu pour la production.",
    },
  ],
  requiredPillars: ["A"],
  outputFormat: "structured",
  tags: ["hybride", "budget", "production", "optimisation"],
};

const vendorBriefGenerator: GloryToolDescriptor = {
  slug: "vendor-brief-generator",
  name: "Vendor Brief Generator",
  shortName: "Brief Vendor",
  layer: "HYBRID",
  description:
    "Génère des briefs prestataires structurés et professionnels pour imprimeurs, réalisateurs, photographes, développeurs et autres fournisseurs.",
  icon: "Users",
  persistable: true,
  requiredContext: ["budgets", "missions"],
  inputs: [
    {
      key: "vendorType",
      label: "Type de prestataire",
      type: "select",
      required: true,
      options: [
        { value: "imprimeur", label: "Imprimeur" },
        { value: "realisateur", label: "Réalisateur" },
        { value: "photographe", label: "Photographe" },
        { value: "developpeur", label: "Développeur" },
        { value: "community_manager", label: "Community Manager" },
        { value: "regisseur", label: "Régisseur" },
        { value: "motion_designer", label: "Motion Designer" },
        { value: "voix_off", label: "Voix off" },
      ],
      helpText: "Le type de prestataire à briefer.",
    },
    {
      key: "projectDescription",
      label: "Description du projet",
      type: "textarea",
      placeholder: "Décrivez le projet et les attentes…",
      required: true,
      helpText: "La description détaillée du projet.",
    },
    {
      key: "specs",
      label: "Spécifications techniques",
      type: "textarea",
      placeholder: "Ex : Format A3, papier couché 250g, quadri R/V…",
      helpText: "Les spécifications techniques du livrable.",
    },
    {
      key: "deadline",
      label: "Deadline",
      type: "text",
      placeholder: "Ex : 10 mars 2026…",
      helpText: "La date limite de livraison.",
    },
    {
      key: "budget",
      label: "Budget alloué",
      type: "text",
      placeholder: "Ex : 5M FCFA…",
      helpText: "Le budget alloué pour cette prestation.",
      enrichable: true,
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["hybride", "brief", "prestataire", "production"],
};

const productionDevisGenerator: GloryToolDescriptor = {
  slug: "production-devis-generator",
  name: "Devis de Production",
  shortName: "Devis Prod",
  layer: "HYBRID",
  description:
    "Génère un devis de production détaillé avec lignes de coûts alignées sur les prix du marché, spécifications techniques, planning et conditions pour chaque livrable.",
  icon: "Receipt",
  persistable: true,
  requiredContext: ["budgets", "missions"],
  inputs: [
    {
      key: "campaignName",
      label: "Nom de la campagne",
      type: "text",
      placeholder: "Ex : Lancement Produit X — Notoriété Q2…",
      required: true,
      helpText: "Le nom ou l'intitulé de la campagne.",
    },
    {
      key: "objective",
      label: "Objectif de la campagne",
      type: "text",
      placeholder: "Ex : Notoriété, Conversion, Lancement produit…",
      required: true,
      helpText: "L'objectif principal de la campagne.",
    },
    {
      key: "deliverables",
      label: "Liste des livrables",
      type: "textarea",
      placeholder:
        "Ex : 1 affiche 4x3, 1 poster, 4 vidéos 30s, 4 visuels digital…",
      required: true,
      helpText:
        "La liste complète des livrables à produire avec formats et quantités.",
      enrichable: true,
    },
    {
      key: "totalBudget",
      label: "Enveloppe budgétaire",
      type: "text",
      placeholder: "Ex : 50M FCFA…",
      required: true,
      helpText:
        "Le budget total alloué. Rappel : budget prod = 20-30% du budget comm.",
      enrichable: true,
    },
    {
      key: "market",
      label: "Marché",
      type: "select",
      enrichable: true,
      options: [
        { value: "CM", label: "Cameroun" },
        { value: "CI", label: "Côte d'Ivoire" },
        { value: "SN", label: "Sénégal" },
        { value: "GH", label: "Ghana" },
        { value: "NG", label: "Nigeria" },
        { value: "global", label: "Multi-marchés" },
      ],
      helpText:
        "Le marché principal — détermine la grille tarifaire de référence.",
    },
    {
      key: "qualityLevel",
      label: "Niveau de qualité",
      type: "select",
      options: [
        { value: "premium", label: "Premium" },
        { value: "standard", label: "Standard" },
        { value: "economique", label: "Économique" },
      ],
      helpText: "Le niveau de qualité attendu pour la production.",
    },
    {
      key: "deadline",
      label: "Date de livraison",
      type: "text",
      placeholder: "Ex : 15 avril 2026…",
      helpText: "La date limite de livraison finale.",
    },
    {
      key: "additionalSpecs",
      label: "Spécifications additionnelles",
      type: "textarea",
      placeholder:
        "Contraintes techniques, formats spécifiques, durées vidéo, etc.",
      helpText: "Toute information complémentaire pour le chiffrage.",
    },
  ],
  requiredPillars: ["A"],
  outputFormat: "structured",
  tags: ["devis", "production", "budget", "coûts"],
};

const contentCalendarStrategist: GloryToolDescriptor = {
  slug: "content-calendar-strategist",
  name: "Content Calendar Strategist",
  shortName: "Calendrier",
  layer: "HYBRID",
  description:
    "Planifie un calendrier éditorial social media avec thématiques, formats, fréquences et moments clés adaptés au marché africain.",
  icon: "CalendarDays",
  persistable: true,
  requiredContext: ["opportunities", "missions"],
  inputs: [
    {
      key: "period",
      label: "Période",
      type: "select",
      required: true,
      options: [
        { value: "1_week", label: "1 semaine" },
        { value: "2_weeks", label: "2 semaines" },
        { value: "1_month", label: "1 mois" },
        { value: "3_months", label: "3 mois" },
      ],
      helpText: "La période couverte par le calendrier.",
    },
    {
      key: "platforms",
      label: "Plateformes",
      type: "multiselect",
      required: true,
      options: [
        { value: "facebook", label: "Facebook" },
        { value: "instagram", label: "Instagram" },
        { value: "tiktok", label: "TikTok" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "twitter", label: "Twitter / X" },
        { value: "whatsapp", label: "WhatsApp" },
      ],
      helpText: "Les plateformes à couvrir dans le calendrier.",
      enrichable: true,
    },
    {
      key: "frequency",
      label: "Fréquence de publication",
      type: "select",
      options: [
        { value: "daily", label: "Quotidien" },
        { value: "3_per_week", label: "3 fois par semaine" },
        { value: "2_per_week", label: "2 fois par semaine" },
        { value: "weekly", label: "Hebdomadaire" },
      ],
      helpText: "Le rythme de publication souhaité.",
    },
    {
      key: "campaignContext",
      label: "Contexte campagne",
      type: "textarea",
      placeholder: "Ex : Lancement produit en cours, campagne institutionnelle…",
      helpText: "Le contexte de campagne à intégrer au calendrier.",
      enrichable: true,
    },
    {
      key: "events",
      label: "Événements / marronniers",
      type: "textarea",
      placeholder: "Ex : Fête des mères, Ramadan, CAN, Black Friday…",
      helpText: "Les événements et temps forts à intégrer.",
      enrichable: true,
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["hybride", "calendrier", "social-media", "planning"],
};

const approvalWorkflowManager: GloryToolDescriptor = {
  slug: "approval-workflow-manager",
  name: "Approval Workflow Manager",
  shortName: "Validations",
  layer: "HYBRID",
  description:
    "Gère le workflow de validation : définit les étapes, les intervenants, les délais et génère les check-lists d'approbation par type de projet.",
  icon: "CheckSquare",
  persistable: false,
  requiredContext: ["missions"],
  inputs: [
    {
      key: "projectType",
      label: "Type de projet",
      type: "select",
      required: true,
      options: [
        { value: "campagne", label: "Campagne complète" },
        { value: "spot_tv", label: "Spot TV" },
        { value: "print", label: "Print / Affichage" },
        { value: "digital", label: "Digital" },
        { value: "packaging", label: "Packaging" },
        { value: "activation", label: "Activation" },
      ],
      helpText: "Le type de projet pour lequel définir le workflow.",
    },
    {
      key: "stakeholders",
      label: "Parties prenantes",
      type: "textarea",
      placeholder: "Ex : DA, DC, Account Manager, Client Marketing, Client DG…",
      required: true,
      helpText: "Les personnes impliquées dans le processus de validation.",
    },
    {
      key: "currentStage",
      label: "Étape actuelle",
      type: "select",
      options: [
        { value: "brief", label: "Brief" },
        { value: "concept", label: "Concept" },
        { value: "maquette", label: "Maquette" },
        { value: "production", label: "Production" },
        { value: "final", label: "Livraison finale" },
      ],
      helpText: "L'étape actuelle du projet dans le workflow.",
    },
  ],
  requiredPillars: [],
  outputFormat: "structured",
  tags: ["hybride", "workflow", "validation", "organisation"],
};

const brandGuardianSystem: GloryToolDescriptor = {
  slug: "brand-guardian-system",
  name: "Brand Guardian System",
  shortName: "Guardian",
  layer: "HYBRID",
  description:
    "Vérifie la conformité des productions avec la charte de marque : logo, couleurs, ton, territoire et cohérence globale.",
  icon: "Shield",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "outputToCheck",
      label: "Production à vérifier",
      type: "textarea",
      placeholder: "Collez le texte ou décrivez le visuel à vérifier…",
      required: true,
      helpText: "La production à soumettre à la vérification de marque.",
    },
    {
      key: "outputType",
      label: "Type de production",
      type: "select",
      options: [
        { value: "copy", label: "Copy / Texte" },
        { value: "visual", label: "Visuel" },
        { value: "campaign", label: "Campagne" },
        { value: "social", label: "Social Media" },
        { value: "packaging", label: "Packaging" },
      ],
      helpText: "Le type de production à vérifier.",
    },
    {
      key: "strictness",
      label: "Niveau de rigueur",
      type: "select",
      options: [
        { value: "strict", label: "Strict" },
        { value: "moderate", label: "Modéré" },
        { value: "flexible", label: "Flexible" },
      ],
      helpText: "Le niveau de rigueur de la vérification.",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["hybride", "marque", "conformité", "qualité"],
};

const clientEducationModule: GloryToolDescriptor = {
  slug: "client-education-module",
  name: "Client Education Module",
  shortName: "Éducation",
  layer: "HYBRID",
  description:
    "Génère des contenus pédagogiques pour éduquer les clients sur les bonnes pratiques créatives, les processus et les standards du métier.",
  icon: "GraduationCap",
  persistable: false,
  requiredContext: [],
  inputs: [
    {
      key: "topic",
      label: "Sujet",
      type: "select",
      required: true,
      options: [
        { value: "logo_size", label: "Taille du logo" },
        { value: "white_space", label: "Importance du blanc" },
        { value: "creative_process", label: "Processus créatif" },
        { value: "brand_consistency", label: "Cohérence de marque" },
        { value: "digital_metrics", label: "Métriques digitales" },
        { value: "production_cost", label: "Coûts de production" },
        { value: "brief_importance", label: "Importance du brief" },
        { value: "custom", label: "Sujet personnalisé" },
      ],
      helpText: "Le sujet pédagogique à traiter.",
    },
    {
      key: "customTopic",
      label: "Sujet personnalisé",
      type: "textarea",
      placeholder: "Décrivez le sujet si vous avez choisi 'Sujet personnalisé'…",
      helpText: "Le sujet personnalisé à développer (si applicable).",
    },
    {
      key: "clientLevel",
      label: "Niveau du client",
      type: "select",
      options: [
        { value: "debutant", label: "Débutant" },
        { value: "intermediaire", label: "Intermédiaire" },
        { value: "averti", label: "Averti" },
      ],
      helpText: "Le niveau de maturité du client en communication.",
    },
    {
      key: "format",
      label: "Format de sortie",
      type: "select",
      options: [
        { value: "email", label: "E-mail" },
        { value: "slide", label: "Slide / Diapositive" },
        { value: "memo", label: "Mémo interne" },
        { value: "infographie", label: "Infographie (texte)" },
      ],
      helpText: "Le format dans lequel produire le contenu pédagogique.",
    },
  ],
  requiredPillars: [],
  outputFormat: "markdown",
  tags: ["hybride", "éducation", "client", "pédagogie"],
};

const benchmarkReferenceFinder: GloryToolDescriptor = {
  slug: "benchmark-reference-finder",
  name: "Benchmark & Reference Finder",
  shortName: "Références",
  layer: "HYBRID",
  description:
    "Trouve des benchmarks et références créatives par secteur, marché et mécanisme : campagnes inspirantes, case studies et tendances.",
  icon: "Search",
  persistable: false,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "sector",
      label: "Secteur d'activité",
      type: "text",
      placeholder: "Ex : Télécom, FMCG, Banque, Brasserie…",
      required: true,
      helpText: "Le secteur pour lequel chercher des références.",
      enrichable: true,
    },
    {
      key: "market",
      label: "Marché",
      type: "select",
      enrichable: true,
      options: [
        { value: "CM", label: "Cameroun" },
        { value: "CI", label: "Côte d'Ivoire" },
        { value: "SN", label: "Sénégal" },
        { value: "west_africa", label: "Afrique de l'Ouest" },
        { value: "africa", label: "Afrique" },
        { value: "global", label: "Global" },
      ],
      helpText: "Le périmètre géographique de la recherche.",
    },
    {
      key: "mechanism",
      label: "Mécanisme créatif",
      type: "select",
      options: [
        { value: "humour", label: "Humour" },
        { value: "emotion", label: "Émotion" },
        { value: "celebrity", label: "Celebrity / Endorsement" },
        { value: "demonstration", label: "Démonstration" },
        { value: "comparison", label: "Comparaison" },
        { value: "storytelling", label: "Storytelling" },
        { value: "shock", label: "Shock / Provocation" },
        { value: "musical", label: "Musical" },
      ],
      helpText: "Le mécanisme créatif recherché dans les références.",
    },
    {
      key: "numResults",
      label: "Nombre de résultats",
      type: "number",
      defaultValue: 10,
      helpText: "Combien de références souhaitez-vous recevoir ?",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["hybride", "benchmark", "références", "inspiration"],
};

const postCampaignReader: GloryToolDescriptor = {
  slug: "post-campaign-reader",
  name: "Post-Campaign Performance Reader",
  shortName: "Post-Campagne",
  layer: "HYBRID",
  description:
    "Analyse les performances post-campagne : interprète les métriques, identifie les apprentissages et formule des recommandations pour les prochaines campagnes.",
  icon: "BarChart3",
  persistable: true,
  requiredContext: ["budgets", "missions"],
  inputs: [
    {
      key: "metrics",
      label: "Métriques de performance",
      type: "textarea",
      placeholder: "Collez les données de performance : reach, impressions, engagement, ventes…",
      required: true,
      helpText: "Les données quantitatives de performance de la campagne.",
    },
    {
      key: "campaignDescription",
      label: "Description de la campagne",
      type: "textarea",
      placeholder: "Décrivez la campagne : concept, canaux, durée, cible…",
      required: true,
      helpText: "Le résumé de la campagne analysée.",
    },
    {
      key: "objectives",
      label: "Objectifs initiaux",
      type: "textarea",
      placeholder: "Ex : +20% de notoriété assistée, 500K reach, 10K leads…",
      helpText: "Les objectifs définis en amont de la campagne.",
    },
    {
      key: "budget",
      label: "Budget investi",
      type: "text",
      placeholder: "Ex : 100M FCFA…",
      helpText: "Le budget total investi dans la campagne.",
      enrichable: true,
    },
    {
      key: "period",
      label: "Période",
      type: "text",
      placeholder: "Ex : Janvier - Mars 2026…",
      helpText: "La période de diffusion de la campagne.",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["hybride", "analytics", "performance", "post-campagne"],
};

const digitalPlanner: GloryToolDescriptor = {
  slug: "digital-planner",
  name: "Planning Digital",
  shortName: "Planner",
  layer: "HYBRID",
  description:
    "Génère un calendrier éditorial digital complet avec répartition par plateforme, content pillars, planning semaine par semaine, formats recommandés et KPIs cibles.",
  icon: "CalendarDays",
  persistable: true,
  requiredContext: ["competitors", "market"],
  inputs: [
    {
      key: "platforms",
      label: "Plateformes",
      type: "multiselect",
      required: true,
      options: [
        { value: "instagram", label: "Instagram" },
        { value: "tiktok", label: "TikTok" },
        { value: "facebook", label: "Facebook" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "twitter", label: "X (Twitter)" },
        { value: "youtube", label: "YouTube" },
        { value: "whatsapp", label: "WhatsApp Business" },
      ],
      helpText: "Les plateformes à inclure dans le planning éditorial.",
      enrichable: true,
    },
    {
      key: "duration",
      label: "Durée du planning (semaines)",
      type: "number",
      required: true,
      helpText: "Nombre de semaines à planifier (4 à 16 recommandé).",
    },
    {
      key: "postsPerWeek",
      label: "Posts par semaine (total)",
      type: "number",
      required: true,
      helpText: "Nombre total de publications par semaine toutes plateformes confondues.",
    },
    {
      key: "contentPillars",
      label: "Piliers de contenu",
      type: "textarea",
      placeholder: "Ex : Éducation, Inspiration, Promotion, Behind the scenes, Témoignages…",
      helpText: "Les thématiques récurrentes autour desquelles organiser le contenu. Laissez vide pour une suggestion IA.",
      enrichable: true,
    },
    {
      key: "tone",
      label: "Ton éditorial",
      type: "select",
      required: true,
      options: [
        { value: "professionnel", label: "Professionnel" },
        { value: "decontracte", label: "Décontracté" },
        { value: "inspirant", label: "Inspirant" },
        { value: "educatif", label: "Éducatif" },
        { value: "humoristique", label: "Humoristique" },
      ],
      helpText: "Le registre de communication dominant pour le contenu.",
    },
    {
      key: "objective",
      label: "Objectif principal",
      type: "select",
      required: true,
      options: [
        { value: "awareness", label: "Notoriété" },
        { value: "engagement", label: "Engagement" },
        { value: "conversion", label: "Conversion" },
        { value: "retention", label: "Fidélisation" },
      ],
      helpText: "L'objectif marketing principal que le planning doit servir.",
    },
  ],
  requiredPillars: ["D", "E"],
  outputFormat: "structured",
  tags: ["hybride", "planning", "social-media", "calendar", "digital"],
};

// =============================================================================
// COUCHE BRAND — 10 outils identité de marque (pipeline séquencé)
// =============================================================================

const semioticBrandAnalyzer: GloryToolDescriptor = {
  slug: "semiotic-brand-analyzer",
  name: "Analyse Sémiotique de Marque",
  shortName: "Sémiotique",
  layer: "BRAND",
  description:
    "Analyse sémiotique complète : carré de Greimas, axes de Floch, analyse connotative de Barthes, identification des gaps de sens dans le paysage concurrentiel.",
  icon: "Brain",
  persistable: true,
  requiredContext: ["competitors", "market"],
  inputs: [
    {
      key: "category",
      label: "Catégorie produit/service",
      type: "text",
      required: true,
      enrichable: true,
      placeholder: "Ex: Boissons gazeuses, Cosmétiques bio, Fintech…",
    },
    {
      key: "competitors",
      label: "Concurrents principaux (3-5)",
      type: "textarea",
      required: true,
      enrichable: true,
      enrichKey: "competitors",
      placeholder:
        "Listez les concurrents directs et leurs positionnements visuels…",
    },
    {
      key: "culturalContext",
      label: "Contexte culturel cible",
      type: "multiselect",
      required: true,
      options: [
        { value: "afrique-ouest", label: "Afrique de l'Ouest" },
        { value: "afrique-centrale", label: "Afrique Centrale" },
        { value: "afrique-est", label: "Afrique de l'Est" },
        { value: "afrique-sud", label: "Afrique du Sud" },
        { value: "maghreb", label: "Maghreb" },
        { value: "france", label: "France" },
        { value: "europe", label: "Europe" },
        { value: "amerique-nord", label: "Amérique du Nord" },
        { value: "asie", label: "Asie" },
      ],
    },
    {
      key: "analysisDepth",
      label: "Profondeur d'analyse",
      type: "select",
      required: true,
      options: [
        { value: "essential", label: "Essentiel (Carré sémiotique)" },
        { value: "advanced", label: "Avancé (+ Barthes connotatif)" },
        { value: "comprehensive", label: "Complet (+ Floch + Oswald)" },
      ],
    },
  ],
  requiredPillars: ["A", "D", "T"],
  outputFormat: "structured",
  tags: ["sémiotique", "brand", "positioning", "research"],
  sequence: 1,
  dependsOn: [],
};

const visualLandscapeMapper: GloryToolDescriptor = {
  slug: "visual-landscape-mapper",
  name: "Cartographie Visuelle Concurrentielle",
  shortName: "Paysage Visuel",
  layer: "BRAND",
  description:
    "Cartographie complète du paysage visuel concurrentiel : matrice 2×2, analyse DBA (Distinctive Brand Assets), identification des zones chromatiques et typographiques disponibles.",
  icon: "Map",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "competitors",
      label: "Concurrents à cartographier",
      type: "textarea",
      required: true,
      enrichable: true,
      enrichKey: "competitors",
      placeholder:
        "Listez 5-10 concurrents avec leurs éléments visuels connus…",
    },
    {
      key: "axes",
      label: "Axes de positionnement",
      type: "multiselect",
      required: true,
      options: [
        { value: "premium-accessible", label: "Premium ↔ Accessible" },
        { value: "playful-formal", label: "Playful ↔ Formal" },
        { value: "modern-heritage", label: "Modern ↔ Heritage" },
        { value: "bold-subtle", label: "Bold ↔ Subtle" },
        { value: "warm-cool", label: "Warm ↔ Cool" },
        { value: "organic-geometric", label: "Organic ↔ Geometric" },
      ],
    },
    {
      key: "elements",
      label: "Éléments à analyser",
      type: "multiselect",
      required: true,
      options: [
        { value: "couleurs", label: "Couleurs" },
        { value: "typographie", label: "Typographie" },
        { value: "style-iconique", label: "Style iconique" },
        { value: "imagerie", label: "Imagerie" },
        { value: "packaging", label: "Packaging" },
        { value: "tonalite-visuelle", label: "Tonalité visuelle" },
      ],
    },
    {
      key: "focusRegion",
      label: "Région de focus",
      type: "select",
      required: true,
      options: [
        { value: "global", label: "Global" },
        { value: "afrique", label: "Afrique" },
        { value: "europe", label: "Europe" },
        { value: "ameriques", label: "Amériques" },
        { value: "asie", label: "Asie" },
        { value: "mena", label: "MENA" },
      ],
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["competitive", "visual-audit", "brand", "mapping"],
  sequence: 2,
  dependsOn: ["semiotic-brand-analyzer"],
};

const visualMoodboardGenerator: GloryToolDescriptor = {
  slug: "visual-moodboard-generator",
  name: "Générateur de Moodboard Visuel",
  shortName: "Moodboard",
  layer: "BRAND",
  description:
    "Génère un moodboard visuel multi-source (Unsplash, Pexels, Pinterest, Are.na, Brave) avec direction artistique, analyse CMF et prompts Nano Banana pour génération IA.",
  icon: "ImagePlus",
  persistable: true,
  requiredContext: ["competitors", "visual-references"],
  inputs: [
    {
      key: "visualDirection",
      label: "Direction visuelle",
      type: "textarea",
      required: true,
      placeholder:
        "Décrivez l'univers visuel souhaité : ambiance, références, époque, textures…",
    },
    {
      key: "mood",
      label: "Ambiance",
      type: "multiselect",
      required: true,
      options: [
        { value: "luxe-raffine", label: "Luxe raffiné" },
        { value: "energie-urbaine", label: "Énergie urbaine" },
        { value: "nature-organique", label: "Nature organique" },
        { value: "tech-futuriste", label: "Tech futuriste" },
        { value: "heritage-authentique", label: "Heritage authentique" },
        { value: "minimalisme-epure", label: "Minimalisme épuré" },
        { value: "afro-contemporain", label: "Afro-contemporain" },
        { value: "pop-culture", label: "Pop culture" },
      ],
    },
    {
      key: "colorDirection",
      label: "Direction chromatique",
      type: "textarea",
      required: false,
      placeholder:
        "Couleurs pressenties ou à explorer (ou laisser vide pour exploration libre)",
    },
    {
      key: "applications",
      label: "Applications prioritaires",
      type: "multiselect",
      required: true,
      options: [
        { value: "Logo/Identité", label: "Logo / Identité" },
        { value: "Packaging", label: "Packaging" },
        { value: "Digital/Web", label: "Digital / Web" },
        { value: "Réseaux sociaux", label: "Réseaux sociaux" },
        { value: "Print/Affichage", label: "Print / Affichage" },
        { value: "Espace/Retail", label: "Espace / Retail" },
        { value: "Motion/Vidéo", label: "Motion / Vidéo" },
      ],
    },
    {
      key: "nanoBananaVersion",
      label: "Version Nano Banana",
      type: "select",
      required: true,
      defaultValue: "v1",
      options: [
        { value: "v1", label: "Nano Banana v1" },
        { value: "v2", label: "Nano Banana v2 (Beta)" },
      ],
    },
    {
      key: "inspirationRegions",
      label: "Régions d'inspiration",
      type: "multiselect",
      required: true,
      options: [
        { value: "Afrique", label: "Afrique" },
        { value: "Europe", label: "Europe" },
        { value: "Amériques", label: "Amériques" },
        { value: "Asie", label: "Asie" },
        { value: "Moyen-Orient", label: "Moyen-Orient" },
        { value: "Global", label: "Global" },
      ],
    },
    {
      key: "referencesPerSource",
      label: "Références par source",
      type: "number",
      defaultValue: 6,
      helpText:
        "Nombre de références visuelles à collecter par plateforme (Unsplash, Pexels, etc.)",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["moodboard", "visual", "inspiration", "nano-banana"],
  sequence: 3,
  dependsOn: ["semiotic-brand-analyzer", "visual-landscape-mapper"],
};

const chromaticStrategyBuilder: GloryToolDescriptor = {
  slug: "chromatic-strategy-builder",
  name: "Architecte Chromatique",
  shortName: "Couleurs",
  layer: "BRAND",
  description:
    "Architecture chromatique complète : système 5 niveaux (primaire→sémantique), spécifications Munsell/NCS, pairings accessibilité WCAG, builds Pantone+CMYK pour packaging.",
  icon: "Palette",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "colorSystem",
      label: "Système de référence",
      type: "select",
      required: true,
      options: [
        { value: "munsell", label: "Munsell (perceptuel)" },
        { value: "ncs", label: "NCS (Natural Color System)" },
        { value: "pantone", label: "Pantone" },
        { value: "libre", label: "Libre" },
      ],
    },
    {
      key: "paletteSize",
      label: "Taille de palette",
      type: "select",
      required: true,
      options: [
        { value: "minimal", label: "Minimale (3-5 couleurs)" },
        { value: "standard", label: "Standard (6-10)" },
        { value: "extended", label: "Étendue (11-16)" },
        { value: "enterprise", label: "Enterprise (16+)" },
      ],
    },
    {
      key: "accessibilityLevel",
      label: "Niveau accessibilité",
      type: "select",
      required: true,
      options: [
        { value: "wcag-aa", label: "WCAG AA" },
        { value: "wcag-aaa", label: "WCAG AAA" },
        { value: "ibm-carbon", label: "IBM Carbon (≥50 rule)" },
      ],
    },
    {
      key: "applications",
      label: "Supports cibles",
      type: "multiselect",
      required: true,
      options: [
        { value: "digital", label: "Digital / Screen" },
        { value: "print-cmyk", label: "Print CMYK" },
        { value: "packaging-pantone", label: "Packaging (Pantone)" },
        { value: "environmental", label: "Environnemental / Signalétique" },
        { value: "textile", label: "Textile" },
      ],
    },
    {
      key: "constraints",
      label: "Contraintes spécifiques",
      type: "textarea",
      placeholder:
        "Ex: Doit fonctionner en flexographie, substrat kraft, marché open-air…",
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["color", "chromatic", "brand", "system", "accessibility"],
  sequence: 4,
  dependsOn: ["visual-moodboard-generator"],
};

const typographySystemArchitect: GloryToolDescriptor = {
  slug: "typography-system-architect",
  name: "Architecte Typographique",
  shortName: "Typographie",
  layer: "BRAND",
  description:
    "Système typographique complet : 4 couches (primaire, secondaire, display, fonctionnel), scale modulaire, modes productive/expressive (IBM), spécifications multi-support.",
  icon: "Type",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "scaleRatio",
      label: "Ratio modulaire",
      type: "select",
      required: true,
      options: [
        { value: "minor-third", label: "Minor Third (1.2)" },
        { value: "major-third", label: "Major Third (1.25)" },
        { value: "perfect-fourth", label: "Perfect Fourth (1.333)" },
        { value: "golden-ratio", label: "Golden Ratio (1.618)" },
      ],
    },
    {
      key: "modes",
      label: "Modes typographiques",
      type: "multiselect",
      required: true,
      options: [
        { value: "productive", label: "Productive (UI/interface)" },
        { value: "expressive", label: "Expressive (marketing)" },
        { value: "packaging", label: "Packaging" },
        { value: "editorial", label: "Éditorial" },
      ],
    },
    {
      key: "languageSupport",
      label: "Support linguistique",
      type: "multiselect",
      required: true,
      options: [
        { value: "latin-extended", label: "Latin étendu" },
        { value: "cyrillic", label: "Cyrillique" },
        { value: "arabic", label: "Arabe" },
        { value: "chinese", label: "Chinois simplifié" },
        { value: "japanese", label: "Japonais" },
        { value: "korean", label: "Coréen" },
        { value: "african-tonal", label: "Langues africaines (ton)" },
      ],
    },
    {
      key: "budget",
      label: "Budget licensing",
      type: "select",
      required: true,
      options: [
        { value: "open-source", label: "Open-source only" },
        { value: "small", label: "Petit (<500$/an)" },
        { value: "medium", label: "Moyen (<2000$/an)" },
        { value: "premium", label: "Premium (illimité)" },
      ],
    },
    {
      key: "personality",
      label: "Personnalité typographique",
      type: "textarea",
      required: true,
      placeholder:
        "Décrivez l'impression souhaitée : autoritaire, amicale, tech, artisanale…",
      enrichable: true,
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["typography", "type-system", "brand", "hierarchy"],
  sequence: 5,
  dependsOn: ["chromatic-strategy-builder"],
};

const logoTypeAdvisor: GloryToolDescriptor = {
  slug: "logo-type-advisor",
  name: "Conseiller Type de Logo",
  shortName: "Logo Type",
  layer: "BRAND",
  description:
    "Framework décisionnel logo : matrice 8 facteurs (nom, marché, budget, média, modèle), recommandation wordmark/symbol/combo/emblem, brief pour designer.",
  icon: "Stamp",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "brandNameLength",
      label: "Longueur du nom",
      type: "select",
      required: true,
      options: [
        { value: "short", label: "Court (1-5 caractères)" },
        { value: "medium", label: "Moyen (6-10 caractères)" },
        { value: "long", label: "Long (11+ caractères)" },
      ],
    },
    {
      key: "primaryMedium",
      label: "Média principal",
      type: "select",
      required: true,
      options: [
        { value: "digital-first", label: "Digital-first" },
        { value: "print-heavy", label: "Print-heavy" },
        { value: "packaging", label: "Packaging" },
        { value: "environmental", label: "Environnemental" },
        { value: "mixed", label: "Mixte" },
      ],
    },
    {
      key: "marketScope",
      label: "Portée géographique",
      type: "select",
      required: true,
      options: [
        { value: "local", label: "Local / national" },
        { value: "regional", label: "Régional multi-pays" },
        { value: "global", label: "Global multi-langues" },
      ],
    },
    {
      key: "marketingBudget",
      label: "Budget marketing",
      type: "select",
      required: true,
      options: [
        { value: "limited", label: "Limité (pas de campagnes symbole)" },
        { value: "medium", label: "Moyen" },
        { value: "high", label: "Élevé (peut investir en recognition)" },
      ],
    },
    {
      key: "heritage",
      label: "Patrimoine visuel existant",
      type: "select",
      required: true,
      options: [
        { value: "none", label: "Aucun (nouvelle marque)" },
        { value: "modernize", label: "Existant à moderniser" },
        { value: "strong", label: "Fort (ne pas perdre)" },
      ],
    },
    {
      key: "businessModel",
      label: "Modèle d'affaires",
      type: "select",
      required: true,
      options: [
        { value: "b2c-emotional", label: "B2C émotionnel" },
        { value: "b2b-rational", label: "B2B rationnel" },
        { value: "fmcg", label: "FMCG" },
        { value: "tech-saas", label: "Tech / SaaS" },
        { value: "luxury", label: "Luxe" },
        { value: "services", label: "Services" },
      ],
    },
  ],
  requiredPillars: ["A", "D", "V"],
  outputFormat: "structured",
  tags: ["logo", "decision", "brand", "mark"],
  sequence: 6,
  dependsOn: ["chromatic-strategy-builder", "typography-system-architect"],
};

const logoValidationProtocol: GloryToolDescriptor = {
  slug: "logo-validation-protocol",
  name: "Protocole de Validation Logo",
  shortName: "Validation",
  layer: "BRAND",
  description:
    "Protocole de validation complet : scalabilité (16px→billboard), monochrome, associations implicites, métriques 5 dimensions, architecture responsive 4 tiers.",
  icon: "CheckSquare",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "logoDescription",
      label: "Description du logo actuel/proposé",
      type: "textarea",
      required: true,
      placeholder:
        "Décrivez le logo (type, couleurs, formes, typographie utilisée, symbole…)",
    },
    {
      key: "testingLevel",
      label: "Niveau de testing",
      type: "select",
      required: true,
      options: [
        { value: "basic", label: "Basic (scalabilité + monochrome)" },
        { value: "pro", label: "Pro (+ associations implicites)" },
        {
          value: "premium",
          label: "Premium (+ framework complet 5 dimensions)",
        },
      ],
    },
    {
      key: "applications",
      label: "Applications à tester",
      type: "multiselect",
      required: true,
      options: [
        { value: "favicon", label: "Favicon 16×16" },
        { value: "app-icon", label: "App icon" },
        { value: "carte-visite", label: "Carte de visite" },
        { value: "packaging", label: "Packaging" },
        { value: "billboard", label: "Billboard" },
        { value: "broderie", label: "Broderie / textile" },
        { value: "vehicule", label: "Véhicule" },
      ],
    },
    {
      key: "responsiveTiers",
      label: "Architecture responsive",
      type: "toggle",
      defaultValue: true,
      helpText:
        "Générer le système responsive 4 tiers (full lockup → icon only)",
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["logo", "validation", "testing", "responsive"],
  sequence: 7,
  dependsOn: ["logo-type-advisor"],
};

const designTokenArchitect: GloryToolDescriptor = {
  slug: "design-token-architect",
  name: "Architecte Design Tokens",
  shortName: "Tokens",
  layer: "BRAND",
  description:
    "Architecture design tokens 3-tier (Salesforce) : primitive→semantic→component, multi-plateforme, support multi-marque (Clearleft), export JSON/YAML/CSS/Tailwind.",
  icon: "Layers",
  persistable: true,
  requiredContext: [],
  inputs: [
    {
      key: "tokenArchitecture",
      label: "Architecture de tokens",
      type: "select",
      required: true,
      options: [
        { value: "salesforce-3tier", label: "Standard 3-tier (Salesforce)" },
        { value: "clearleft-multibrand", label: "Clearleft multi-brand" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      key: "platforms",
      label: "Plateformes cibles",
      type: "multiselect",
      required: true,
      options: [
        { value: "web-css", label: "Web (CSS custom properties)" },
        { value: "ios-swift", label: "iOS (Swift)" },
        { value: "android-kotlin", label: "Android (Kotlin/XML)" },
        { value: "react-native", label: "React Native" },
        { value: "flutter", label: "Flutter" },
        { value: "figma", label: "Figma" },
      ],
    },
    {
      key: "multiBrand",
      label: "Multi-marque",
      type: "toggle",
      defaultValue: false,
      helpText:
        "Activer l'architecture white-label (swap de valeurs par thème)",
    },
    {
      key: "outputFormats",
      label: "Formats de sortie",
      type: "multiselect",
      required: true,
      options: [
        { value: "json", label: "JSON" },
        { value: "yaml", label: "YAML" },
        { value: "css-vars", label: "CSS Variables" },
        { value: "scss", label: "SCSS" },
        { value: "tailwind", label: "Tailwind Config" },
        { value: "style-dictionary", label: "Style Dictionary" },
      ],
    },
  ],
  requiredPillars: ["A", "D", "E"],
  outputFormat: "structured",
  tags: ["tokens", "design-system", "architecture", "multi-brand"],
  sequence: 8,
  dependsOn: [
    "chromatic-strategy-builder",
    "typography-system-architect",
    "logo-validation-protocol",
  ],
};

const motionIdentityDesigner: GloryToolDescriptor = {
  slug: "motion-identity-designer",
  name: "Designer Motion Identity",
  shortName: "Motion",
  layer: "BRAND",
  description:
    "Système motion identity : principes productive/expressive (IBM), courbes bézier documentées, durées par complexité, chorégraphie multi-éléments, specs Lottie/CSS/Framer.",
  icon: "Play",
  persistable: true,
  requiredContext: [],
  inputs: [
    {
      key: "motionStyle",
      label: "Style de motion",
      type: "select",
      required: true,
      options: [
        { value: "productive", label: "Productive (IBM-style, efficience)" },
        { value: "expressive", label: "Expressive (enthousiasme, énergie)" },
        { value: "cinematic", label: "Cinématique (luxe, lent)" },
        { value: "playful", label: "Playful (bounce, squash)" },
      ],
    },
    {
      key: "applications",
      label: "Applications motion",
      type: "multiselect",
      required: true,
      options: [
        { value: "logo-animation", label: "Logo animation" },
        { value: "transitions-ui", label: "Transitions UI" },
        { value: "micro-interactions", label: "Micro-interactions" },
        { value: "loading-states", label: "Loading states" },
        { value: "scroll-animations", label: "Scroll animations" },
        { value: "social-media", label: "Réseaux sociaux" },
        { value: "packaging-ar", label: "Packaging AR" },
      ],
    },
    {
      key: "complexity",
      label: "Complexité souhaitée",
      type: "select",
      required: true,
      options: [
        { value: "simple", label: "Simple (entrée/sortie)" },
        {
          value: "medium",
          label: "Moyen (chorégraphie multi-éléments)",
        },
        { value: "advanced", label: "Avancé (variable/réactif)" },
      ],
    },
    {
      key: "deliverableFormat",
      label: "Formats livrables",
      type: "multiselect",
      required: true,
      options: [
        { value: "specs", label: "Spécifications (durées, courbes)" },
        { value: "lottie", label: "Lottie JSON" },
        { value: "after-effects", label: "After Effects expressions" },
        { value: "css-keyframes", label: "CSS @keyframes" },
        { value: "framer-motion", label: "Framer Motion config" },
      ],
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["motion", "animation", "identity", "brand"],
  sequence: 9,
  dependsOn: ["design-token-architect"],
};

const brandGuidelinesGenerator: GloryToolDescriptor = {
  slug: "brand-guidelines-generator",
  name: "Générateur de Guidelines",
  shortName: "Guidelines",
  layer: "BRAND",
  description:
    "Structure de guidelines complète 13 sections (best-in-class Frontify/Brandpad) : brand foundation, logo, couleurs, typo, imagery, motion, accessibilité, governance, specs régionales.",
  icon: "BookOpen",
  persistable: true,
  requiredContext: ["competitors"],
  inputs: [
    {
      key: "deliveryFormat",
      label: "Format de livraison",
      type: "select",
      required: true,
      options: [
        { value: "web-portal", label: "Web portal (Frontify-style)" },
        { value: "pdf-static", label: "PDF statique" },
        { value: "hybrid", label: "Hybride (web + PDF offline)" },
      ],
    },
    {
      key: "sections",
      label: "Sections à inclure",
      type: "multiselect",
      required: true,
      options: [
        { value: "brand-foundation", label: "Brand foundation" },
        { value: "logo-system", label: "Logo system" },
        { value: "color-system", label: "Color system" },
        { value: "typography", label: "Typography" },
        { value: "photography", label: "Photography / Imagery" },
        { value: "iconography", label: "Iconography" },
        { value: "layout-grids", label: "Layout grids" },
        { value: "voice-tone", label: "Voice & Tone" },
        { value: "applications", label: "Applications" },
        { value: "motion", label: "Motion" },
        { value: "data-viz", label: "Data visualization" },
        { value: "accessibility", label: "Accessibility" },
        { value: "governance", label: "Governance" },
      ],
    },
    {
      key: "audience",
      label: "Audience des guidelines",
      type: "multiselect",
      required: true,
      options: [
        { value: "designers", label: "Designers internes" },
        { value: "agencies", label: "Agences partenaires" },
        { value: "marketing", label: "Équipes marketing" },
        { value: "developers", label: "Développeurs" },
        { value: "direction", label: "Direction" },
      ],
    },
    {
      key: "region",
      label: "Spécificités régionales",
      type: "multiselect",
      options: [
        {
          value: "pantone-cmyk-africa",
          label: "Specs Pantone+CMYK pour print Afrique",
        },
        {
          value: "packaging-substrates",
          label: "Substrats packaging locaux",
        },
        { value: "whatsapp-assets", label: "WhatsApp asset packages" },
        { value: "offline-first", label: "Offline-first" },
        { value: "multi-language", label: "Multi-langue" },
      ],
    },
    {
      key: "assetPackage",
      label: "Package fichiers",
      type: "toggle",
      defaultValue: true,
      helpText:
        "Générer la spec complète du package de fichiers livrables (vector, web, social, favicon, die-lines)",
    },
  ],
  requiredPillars: ["A", "D", "V", "E"],
  outputFormat: "structured",
  tags: ["guidelines", "brand-book", "system", "delivery"],
  sequence: 10,
  dependsOn: [
    "chromatic-strategy-builder",
    "typography-system-architect",
    "logo-validation-protocol",
    "design-token-architect",
    "motion-identity-designer",
  ],
};

// =============================================================================
// GLORY_TOOLS — Registre complet des 38 outils
// =============================================================================

export const GLORY_TOOLS: GloryToolDescriptor[] = [
  // Couche CR (10 outils)
  conceptGenerator,
  scriptWriter,
  longCopyCraftsman,
  dialogueWriter,
  claimBaselineFactory,
  printAdArchitect,
  socialCopyEngine,
  storytellingSequencer,
  wordplayCulturalBank,
  briefCreatifInterne,
  // Couche DC (8 outils)
  campaignArchitecturePlanner,
  creativeEvaluationMatrix,
  ideaKillerSaver,
  multiTeamCoherenceChecker,
  clientPresentationStrategist,
  creativeDirectionMemo,
  pitchArchitect,
  awardCaseBuilder,
  // Couche HYBRIDE (10 outils)
  campaign360Simulator,
  productionBudgetOptimizer,
  vendorBriefGenerator,
  productionDevisGenerator,
  contentCalendarStrategist,
  approvalWorkflowManager,
  brandGuardianSystem,
  clientEducationModule,
  benchmarkReferenceFinder,
  postCampaignReader,
  digitalPlanner,
  // Couche BRAND (10 outils)
  semioticBrandAnalyzer,
  visualLandscapeMapper,
  visualMoodboardGenerator,
  chromaticStrategyBuilder,
  typographySystemArchitect,
  logoTypeAdvisor,
  logoValidationProtocol,
  designTokenArchitect,
  motionIdentityDesigner,
  brandGuidelinesGenerator,
];

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Retrieves a single tool descriptor by its unique slug.
 * Returns `undefined` if no tool matches the given slug.
 */
export function getToolBySlug(
  slug: string,
): GloryToolDescriptor | undefined {
  return GLORY_TOOLS.find((tool) => tool.slug === slug);
}

/**
 * Returns all tools belonging to a specific GLORY layer (CR, DC, HYBRID, or BRAND).
 */
export function getToolsByLayer(
  layer: GloryLayer,
): GloryToolDescriptor[] {
  return GLORY_TOOLS.filter((tool) => tool.layer === layer);
}

/**
 * Returns the complete array of all 39 GLORY tools.
 */
export function getAllTools(): GloryToolDescriptor[] {
  return [...GLORY_TOOLS];
}
