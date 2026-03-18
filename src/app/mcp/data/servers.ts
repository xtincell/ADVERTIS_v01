import { Brain, Rocket, Sparkles, Activity, type LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// MCP Server catalog data
// ═══════════════════════════════════════════════════════════════════════════

export interface McpTool {
  name: string;
  description: string;
}

export interface McpResource {
  uri: string;
  description: string;
}

export interface McpServer {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string; // Tailwind-compatible oklch color token
  badgeVariant: "default" | "rose" | "warning" | "success";
  tools: McpTool[];
  resources: McpResource[];
  stats: { tools: number; resources: number };
}

export const MCP_SERVERS: McpServer[] = [
  {
    id: "intelligence",
    name: "mcp-intelligence",
    subtitle: "Le Cerveau",
    tagline: "Toute l'intelligence strategique de ta marque, accessible par API.",
    description:
      "Genere les 8 piliers, recalcule les scores, execute les 24 frameworks ARTEMIS, et interroge les 120+ variables de marque. C'est le coeur du systeme.",
    icon: Brain,
    color: "oklch(0.63 0.22 34)",
    badgeVariant: "default",
    tools: [
      { name: "generate_pillar", description: "Generer n'importe quel pilier (A/D/V/E/R/T/I/S) avec cascade automatique" },
      { name: "recalculate_scores", description: "Recalculer les 4 scores : coherence, risque, BMF, investissement" },
      { name: "run_framework", description: "Executer un des 24 frameworks strategiques ARTEMIS" },
      { name: "orchestrate_frameworks", description: "Executer tous les frameworks en ordre topologique" },
      { name: "check_freshness", description: "Verifier la fraicheur des donnees dans tout le systeme" },
      { name: "set_variable", description: "Ecrire une variable de marque avec provenance tracee" },
      { name: "import_brand_data", description: "Importer des donnees depuis XLSX, DOCX ou PDF" },
      { name: "synthesize_market_study", description: "Synthetiser une etude de marche depuis les donnees collectees" },
      { name: "get_interview_schema", description: "Recuperer le schema complet du questionnaire d'interview" },
    ],
    resources: [
      { uri: "advertis://strategy/{id}/pillars", description: "Contenu de tous les piliers generes" },
      { uri: "advertis://strategy/{id}/scores", description: "Les 4 scores + historique des snapshots" },
      { uri: "advertis://strategy/{id}/variables", description: "120+ variables de marque avec provenance" },
      { uri: "advertis://strategy/{id}/frameworks", description: "Outputs de tous les frameworks executes" },
      { uri: "advertis://strategy/{id}/freshness", description: "Carte de fraicheur du systeme" },
      { uri: "advertis://methodology", description: "Description complete de la methodologie ADVERTIS" },
    ],
    stats: { tools: 9, resources: 6 },
  },
  {
    id: "operations",
    name: "mcp-operations",
    subtitle: "Le Bras",
    tagline: "Planifie, execute, et suis tes campagnes sans quitter ton outil.",
    description:
      "Gestion complete du cycle de vie campagne (12 etats), missions operationnelles, matching de talents, budgets et roadmap d'implementation sur 36 mois.",
    icon: Rocket,
    color: "oklch(0.62 0.25 12)",
    badgeVariant: "rose",
    tools: [
      { name: "create_campaign", description: "Creer une campagne avec state machine 12 etats" },
      { name: "transition_campaign", description: "Avancer la campagne dans son cycle de vie" },
      { name: "manage_campaign_budget", description: "Lignes budgetaires, allocation, suivi des depenses" },
      { name: "manage_campaign_team", description: "Assigner et gerer l'equipe campagne" },
      { name: "generate_campaign_plan", description: "Plan de campagne AI-powered" },
      { name: "generate_campaign_brief", description: "Brief creatif genere depuis les piliers" },
      { name: "create_mission", description: "Creer une mission operationnelle" },
      { name: "transition_mission", description: "Avancer la mission (Intake → WIP → Review → Closed)" },
      { name: "assign_talent", description: "Assigner un freelance avec matching pondere" },
      { name: "search_talents", description: "Chercher des talents par competence et disponibilite" },
      { name: "generate_implementation", description: "Roadmap d'implementation 36 mois" },
      { name: "get_financial_dashboard", description: "KPIs financiers en temps reel" },
    ],
    resources: [
      { uri: "advertis://strategy/{id}/campaigns", description: "Vue kanban de toutes les campagnes" },
      { uri: "advertis://strategy/{id}/missions", description: "Pipeline de missions operationnelles" },
      { uri: "advertis://strategy/{id}/implementation", description: "Roadmap d'implementation" },
      { uri: "advertis://strategy/{id}/budget", description: "Vue budgetaire consolidee" },
      { uri: "advertis://talent/directory", description: "Repertoire de talents (La Guilde)" },
    ],
    stats: { tools: 12, resources: 5 },
  },
  {
    id: "creative",
    name: "mcp-creative",
    subtitle: "Le Moteur",
    tagline: "40+ outils creatifs qui connaissent ta marque par coeur.",
    description:
      "Suite GLORY complete : concepts, scripts, copies social, dialogues culturels, architecture de campagne. Chaque outil est context-aware — il tire du DNA de la marque pour des outputs uniques.",
    icon: Sparkles,
    color: "oklch(0.76 0.19 75)",
    badgeVariant: "warning",
    tools: [
      { name: "glory_concept_generator", description: "Generer des concepts creatifs depuis insight + contraintes" },
      { name: "glory_script_writer", description: "Scripts TV/Radio/Digital avec notes de production" },
      { name: "glory_long_copy_craftsman", description: "Manifestes, brand stories, editoriaux" },
      { name: "glory_dialogue_writer", description: "Dialogues culturellement ancres (Francanglais, Pidgin, Wolof...)" },
      { name: "glory_claim_baseline_factory", description: "Taglines, baselines, slogans de campagne" },
      { name: "glory_social_copy_engine", description: "Copies adaptees par plateforme (Insta, TikTok, LinkedIn)" },
      { name: "glory_campaign_architecture", description: "Architecture de campagne complete" },
      { name: "glory_storytelling_sequencer", description: "Sequences narratives multi-touchpoint" },
      { name: "generate_brief", description: "Brief operationnel depuis les piliers" },
      { name: "get_editorial_calendar", description: "Vue calendrier editorial complet" },
    ],
    resources: [
      { uri: "advertis://glory/catalog", description: "Catalogue complet des 40+ outils GLORY" },
      { uri: "advertis://strategy/{id}/glory-outputs", description: "Tous les outputs creatifs sauvegardes" },
      { uri: "advertis://strategy/{id}/briefs", description: "Briefs generes (creative playbook, production kit...)" },
      { uri: "advertis://strategy/{id}/publications", description: "Calendrier editorial + performances" },
    ],
    stats: { tools: 40, resources: 4 },
  },
  {
    id: "pulse",
    name: "mcp-pulse",
    subtitle: "Le Systeme Nerveux",
    tagline: "Le pouls de ta marque, en temps reel, depuis n'importe ou.",
    description:
      "Cult Index 7 dimensions, signaux strategiques, ecoute sociale, superfans, cohortes, attribution multi-touch. Le monitoring continu de la sante de ta marque.",
    icon: Activity,
    color: "oklch(0.65 0.19 155)",
    badgeVariant: "success",
    tools: [
      { name: "calculate_cult_index", description: "Cult Index sur 7 dimensions d'engagement (0-100)" },
      { name: "create_signal", description: "Creer un signal strategique (METRIC/STRONG/WEAK)" },
      { name: "mutate_signal", description: "Muter le statut d'un signal avec audit trail" },
      { name: "collect_internal_data", description: "Collecter les KPIs internes" },
      { name: "run_external_connectors", description: "Connecteurs donnees externes (social, CRM...)" },
      { name: "generate_intel_report", description: "Generer un rapport d'intelligence strategique" },
      { name: "track_attribution", description: "Enregistrer un evenement d'attribution marketing" },
      { name: "calculate_attribution", description: "Calculer le ROI par canal (linear, first-touch, decay...)" },
      { name: "snapshot_cohort", description: "Capturer une cohorte (retention, LTV, churn)" },
      { name: "manage_superfans", description: "CRUD profils superfans (Audience → Evangelist)" },
      { name: "manage_ambassadors", description: "Programme ambassadeurs (Bronze → Diamond)" },
    ],
    resources: [
      { uri: "advertis://strategy/{id}/cult-index", description: "Cult Index actuel + decomposition 7 dimensions" },
      { uri: "advertis://strategy/{id}/signals", description: "Signaux strategiques actifs" },
      { uri: "advertis://strategy/{id}/social-channels", description: "Canaux sociaux + metriques + sante" },
      { uri: "advertis://strategy/{id}/community", description: "Snapshots communaute (sentiment, croissance)" },
      { uri: "advertis://strategy/{id}/superfans", description: "Profils superfans segmentes" },
      { uri: "advertis://strategy/{id}/cohorts", description: "Courbes de retention et LTV" },
      { uri: "advertis://strategy/{id}/attribution", description: "Attribution multi-touch par canal" },
    ],
    stats: { tools: 11, resources: 7 },
  },
];

// Aggregate stats
export const TOTAL_STATS = {
  servers: MCP_SERVERS.length,
  tools: MCP_SERVERS.reduce((sum, s) => sum + s.stats.tools, 0),
  resources: MCP_SERVERS.reduce((sum, s) => sum + s.stats.resources, 0),
};
