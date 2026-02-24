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
  inputs: [
    {
      key: "insight",
      label: "Insight consommateur",
      type: "textarea",
      placeholder: "Ex : Les mères camerounaises veulent protéger leur famille mais manquent de temps…",
      required: true,
      helpText: "L'insight humain qui servira de tremplin créatif.",
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
  inputs: [
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
  inputs: [
    {
      key: "objective",
      label: "Objectif narratif",
      type: "textarea",
      placeholder: "Ex : Raconter l'histoire de la marque à travers 4 épisodes…",
      required: true,
      helpText: "L'objectif global de la séquence storytelling.",
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
  inputs: [
    {
      key: "market",
      label: "Marché",
      type: "select",
      required: true,
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
  inputs: [
    {
      key: "campaignObjective",
      label: "Objectif de la campagne",
      type: "textarea",
      placeholder: "Ex : Lancer le nouveau produit X auprès des 18-35 ans en zone urbaine…",
      required: true,
      helpText: "L'objectif stratégique principal de la campagne.",
    },
    {
      key: "bigIdea",
      label: "Big Idea",
      type: "textarea",
      placeholder: "Le concept créatif central, si déjà défini…",
      helpText: "La grande idée créative de la campagne.",
    },
    {
      key: "budget",
      label: "Budget total",
      type: "text",
      placeholder: "Ex : 200M FCFA, 500K EUR…",
      required: true,
      helpText: "Le budget total alloué à la campagne.",
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
  inputs: [
    {
      key: "concepts",
      label: "Concepts à évaluer",
      type: "textarea",
      placeholder: "Listez les concepts créatifs à évaluer…",
      required: true,
      helpText: "Les concepts créatifs soumis à l'évaluation.",
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
  inputs: [
    {
      key: "concept",
      label: "Concept à auditer",
      type: "textarea",
      placeholder: "Décrivez le concept créatif en détail…",
      required: true,
      helpText: "Le concept créatif à soumettre à l'audit.",
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
  inputs: [
    {
      key: "concepts",
      label: "Concepts à présenter",
      type: "textarea",
      placeholder: "Les concepts créatifs à défendre devant le client…",
      required: true,
      helpText: "Les concepts qui seront présentés au client.",
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
    },
    {
      key: "deliverables",
      label: "Livrables attendus",
      type: "textarea",
      placeholder: "Ex : Stratégie, 3 concepts, plan média, budget production…",
      helpText: "Les livrables demandés dans le cahier des charges.",
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
  inputs: [
    {
      key: "totalBudget",
      label: "Budget total production",
      type: "text",
      placeholder: "Ex : 80M FCFA…",
      required: true,
      helpText: "Le budget total alloué à la production.",
    },
    {
      key: "deliverables",
      label: "Livrables à produire",
      type: "textarea",
      placeholder: "Ex : 1 spot TV 30s, 5 posts social, 2 affiches 4x3…",
      required: true,
      helpText: "La liste complète des livrables à produire.",
    },
    {
      key: "market",
      label: "Marché",
      type: "select",
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
    },
  ],
  requiredPillars: ["A", "D"],
  outputFormat: "structured",
  tags: ["hybride", "brief", "prestataire", "production"],
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
    },
    {
      key: "events",
      label: "Événements / marronniers",
      type: "textarea",
      placeholder: "Ex : Fête des mères, Ramadan, CAN, Black Friday…",
      helpText: "Les événements et temps forts à intégrer.",
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
  inputs: [
    {
      key: "sector",
      label: "Secteur d'activité",
      type: "text",
      placeholder: "Ex : Télécom, FMCG, Banque, Brasserie…",
      required: true,
      helpText: "Le secteur pour lequel chercher des références.",
    },
    {
      key: "market",
      label: "Marché",
      type: "select",
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

// =============================================================================
// GLORY_TOOLS — Registre complet des 27 outils
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
  // Couche HYBRIDE (9 outils)
  campaign360Simulator,
  productionBudgetOptimizer,
  vendorBriefGenerator,
  contentCalendarStrategist,
  approvalWorkflowManager,
  brandGuardianSystem,
  clientEducationModule,
  benchmarkReferenceFinder,
  postCampaignReader,
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
 * Returns all tools belonging to a specific GLORY layer (CR, DC, or HYBRID).
 */
export function getToolsByLayer(
  layer: GloryLayer,
): GloryToolDescriptor[] {
  return GLORY_TOOLS.filter((tool) => tool.layer === layer);
}

/**
 * Returns the complete array of all 27 GLORY tools.
 */
export function getAllTools(): GloryToolDescriptor[] {
  return [...GLORY_TOOLS];
}
