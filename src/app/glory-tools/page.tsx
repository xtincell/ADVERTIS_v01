"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PenTool,
  Eye,
  Settings,
  Fingerprint,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tool {
  name: string;
  description: string;
  step?: string; // For BRAND pipeline numbering
}

interface Layer {
  id: string;
  label: string;
  fullLabel: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  subtitle: string;
  icon: React.ElementType;
  toolCount: number;
  isPipeline?: boolean;
  tools: Tool[];
}

// ---------------------------------------------------------------------------
// Layer data
// ---------------------------------------------------------------------------

const LAYERS: Layer[] = [
  {
    id: "cr",
    label: "CR",
    fullLabel: "Layer CR — Concepteur-Redacteur",
    color: "#8B5CF6",
    colorBg: "bg-violet-500/10",
    colorBorder: "border-violet-500/30",
    colorText: "text-violet-400",
    subtitle:
      "Production creative : concepts, scripts, copy, dialogues",
    icon: PenTool,
    toolCount: 10,
    tools: [
      {
        name: "Concept Generator",
        description:
          "Cree des concepts creatifs a partir d\u2019insights et contraintes medias",
      },
      {
        name: "Script Writer",
        description:
          "Ecrit des scripts pub complets avec directions artistiques pour TV, radio, digital",
      },
      {
        name: "Long Copy Craftsman",
        description:
          "Redige textes longs \u2014 manifestes, publireportages, brand stories",
      },
      {
        name: "Dialogue Writer",
        description:
          "Ecrit des dialogues authentiques avec gestion des registres linguistiques africains",
      },
      {
        name: "Claim & Baseline Factory",
        description:
          "Genere baselines, claims et slogans memorables",
      },
      {
        name: "Print Ad Architect",
        description:
          "Concoit l\u2019architecture de presses et affiches : headline, body copy, hierarchie",
      },
      {
        name: "Social Copy Engine",
        description:
          "Produit du copy social adapte a chaque plateforme avec hashtags et formats natifs",
      },
      {
        name: "Storytelling Sequencer",
        description:
          "Construit des sequences narratives multi-touchpoints avec arcs dramatiques",
      },
      {
        name: "Wordplay & Cultural Bank",
        description:
          "Banque de jeux de mots, proverbes et references culturelles par marche africain",
      },
      {
        name: "Brief Creatif Interne",
        description:
          "Transforme un brief client en brief creatif structure avec insights et directions",
      },
    ],
  },
  {
    id: "dc",
    label: "DC",
    fullLabel: "Layer DC — Direction de Creation",
    color: "#00B894",
    colorBg: "bg-emerald-500/10",
    colorBorder: "border-emerald-500/30",
    colorText: "text-emerald-400",
    subtitle:
      "Supervision creative : architecture, evaluation, pitch",
    icon: Eye,
    toolCount: 8,
    tools: [
      {
        name: "Campaign Architecture Planner",
        description:
          "Planifie l\u2019architecture complete de campagne : phases, canaux, messages cles",
      },
      {
        name: "Creative Evaluation Matrix",
        description:
          "Evalue les concepts via grille multi-criteres : pertinence, originalite, faisabilite",
      },
      {
        name: "Idea Killer / Idea Saver",
        description:
          "Analyse critique d\u2019un concept : forces, faiblesses, pistes d\u2019amelioration",
      },
      {
        name: "Multi-Team Coherence Checker",
        description:
          "Verifie la coherence entre productions de differentes equipes",
      },
      {
        name: "Client Presentation Strategist",
        description:
          "Structure la strategie de presentation client avec anticipation des objections",
      },
      {
        name: "Creative Direction Memo",
        description:
          "Redige les notes de direction creative pour prestataires",
      },
      {
        name: "Pitch Architect",
        description:
          "Construit la structure complete de pitch : strategie, creation, media, budget",
      },
      {
        name: "Award Case Builder",
        description:
          "Construit des case studies pour festivals creatifs aux standards internationaux",
      },
    ],
  },
  {
    id: "hybrid",
    label: "HYBRID",
    fullLabel: "Layer HYBRID — Operationnel",
    color: "#FDCB6E",
    colorBg: "bg-amber-500/10",
    colorBorder: "border-amber-500/30",
    colorText: "text-amber-400",
    subtitle:
      "Outils operationnels transverses : planning, budget, workflow",
    icon: Settings,
    toolCount: 11,
    tools: [
      {
        name: "360 Campaign Simulator",
        description:
          "Simule le deploiement campagne sur tous les touchpoints",
      },
      {
        name: "Production Budget Optimizer",
        description:
          "Optimise le budget production avec alternatives et arbitrages qualite/cout",
      },
      {
        name: "Vendor Brief Generator",
        description:
          "Genere des briefs prestataires structures et professionnels",
      },
      {
        name: "Production Devis Generator",
        description:
          "Genere des devis production detailles alignes aux prix du marche",
      },
      {
        name: "Content Calendar Strategist",
        description:
          "Planifie le calendrier editorial avec themes, formats et moments cles",
      },
      {
        name: "Approval Workflow Manager",
        description:
          "Gere le workflow de validation : etapes, parties prenantes, delais",
      },
      {
        name: "Brand Guardian System",
        description:
          "Verifie la conformite de production avec la charte de marque",
      },
      {
        name: "Client Education Module",
        description:
          "Genere du contenu educatif sur les best practices creatives",
      },
      {
        name: "Benchmark & Reference Finder",
        description:
          "Trouve des benchmarks creatifs par secteur, marche et mecanisme",
      },
      {
        name: "Post-Campaign Performance Reader",
        description:
          "Analyse post-campagne : metriques, apprentissages, recommandations",
      },
      {
        name: "Digital Planning",
        description:
          "Genere un calendrier editorial digital complet avec distribution par plateforme",
      },
    ],
  },
  {
    id: "brand",
    label: "BRAND",
    fullLabel: "Layer BRAND — Pipeline Identite",
    color: "#EC4899",
    colorBg: "bg-pink-500/10",
    colorBorder: "border-pink-500/30",
    colorText: "text-pink-400",
    subtitle:
      "Pipeline complet d\u2019identite de marque : semiotique \u2192 guidelines",
    icon: Fingerprint,
    toolCount: 10,
    isPipeline: true,
    tools: [
      {
        name: "Semiotic Brand Analyzer",
        description:
          "Analyse semiotique complete : carre de Greimas, axes de Floch, Barthes",
        step: "1/10",
      },
      {
        name: "Visual Landscape Mapper",
        description:
          "Paysage concurrentiel visuel : matrice 2\u00d72, analyse DBA",
        step: "2/10",
      },
      {
        name: "Visual Moodboard Generator",
        description:
          "Genere moodboards visuels multi-sources avec DA et prompts IA",
        step: "3/10",
      },
      {
        name: "Chromatic Strategy Builder",
        description:
          "Architecture chromatique 5 niveaux avec accessibilite WCAG",
        step: "4/10",
      },
      {
        name: "Typography System Architect",
        description:
          "Systeme typographique 4 couches avec echelle modulaire",
        step: "5/10",
      },
      {
        name: "Logo Type Advisor",
        description:
          "Framework de decision logo : matrice 8 facteurs, brief designer",
        step: "6/10",
      },
      {
        name: "Logo Validation Protocol",
        description:
          "Protocole de validation : scalabilite, monochrome, metriques 5D",
        step: "7/10",
      },
      {
        name: "Design Token Architect",
        description:
          "Design tokens 3 tiers : primitif \u2192 semantique \u2192 composant",
        step: "8/10",
      },
      {
        name: "Motion Identity Designer",
        description:
          "Identite motion : principes, courbes bezier, choregraphie",
        step: "9/10",
      },
      {
        name: "Brand Guidelines Generator",
        description:
          "Guidelines completes 13 sections aux standards Frontify/Brandpad",
        step: "10/10",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const STATS = [
  { value: "39", label: "outils" },
  { value: "4", label: "couches" },
  { value: "22", label: "outputs persistables" },
  { value: "\u2248 min", label: "pas des jours" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GloryToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AdvertisMonogram size={28} variant="color" />
            <AdvertisWordmark className="text-lg text-foreground" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Tarifs
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <div className="mx-auto max-w-4xl px-4 pb-4 pt-12 text-center sm:px-6 sm:pt-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Retour
        </Link>

        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          39 outils &bull; 4 couches de production
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          La suite{" "}
          <span className="text-gradient">GLORY</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Naming, scripts, briefs cr&eacute;atifs, moodboards, posts sociaux.
          39&nbsp;outils IA qui remplacent 5&nbsp;freelances et produisent en
          minutes ce qui prenait des jours.
        </p>

        <div className="mt-8">
          <Link href="/register">
            <Button variant="gradient" size="lg">
              Commencer gratuitement
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Layer Sections ─── */}
      {LAYERS.map((layer) => {
        const LayerIcon = layer.icon;
        return (
          <section
            key={layer.id}
            className="border-t border-border/50 py-12 sm:py-16"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              {/* Layer header */}
              <div className="mb-8 sm:mb-10">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${layer.colorBg}`}
                  >
                    <LayerIcon
                      className="size-5"
                      style={{ color: layer.color }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        {layer.fullLabel}
                      </h2>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${layer.color}20`,
                          color: layer.color,
                        }}
                      >
                        {layer.toolCount} outils
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {layer.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tool grid — standard layers */}
              {!layer.isPipeline && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {layer.tools.map((tool, i) => (
                    <div
                      key={tool.name}
                      className="group relative rounded-xl border border-border/50 bg-card p-4 transition-shadow hover:shadow-md sm:p-5"
                      style={{ borderLeftColor: layer.color, borderLeftWidth: 3 }}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                          style={{
                            backgroundColor: `${layer.color}15`,
                            color: layer.color,
                          }}
                        >
                          {i + 1}
                        </span>
                        <h3 className="text-sm font-semibold leading-tight">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {tool.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tool pipeline — BRAND layer */}
              {layer.isPipeline && (
                <div className="space-y-0">
                  {layer.tools.map((tool, i) => (
                    <div key={tool.name} className="relative flex gap-4">
                      {/* Vertical pipeline connector */}
                      <div className="flex flex-col items-center">
                        {/* Step circle */}
                        <div
                          className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                          style={{
                            borderColor: layer.color,
                            backgroundColor: `${layer.color}15`,
                            color: layer.color,
                          }}
                        >
                          {i + 1}
                        </div>
                        {/* Connector line */}
                        {i < layer.tools.length - 1 && (
                          <div
                            className="w-0.5 flex-1"
                            style={{
                              background: `linear-gradient(to bottom, ${layer.color}60, ${layer.color}20)`,
                              minHeight: 24,
                            }}
                          />
                        )}
                      </div>

                      {/* Tool card */}
                      <div
                        className="mb-4 flex-1 rounded-xl border border-border/50 bg-card p-4 transition-shadow hover:shadow-md sm:p-5"
                        style={{ borderLeftColor: layer.color, borderLeftWidth: 3 }}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-sm font-semibold leading-tight">
                            {tool.name}
                          </h3>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                            style={{
                              backgroundColor: `${layer.color}15`,
                              color: layer.color,
                            }}
                          >
                            {tool.step}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ─── Stats ─── */}
      <section className="border-t border-border/50 bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
            GLORY en chiffres
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA — dark gradient ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-slate-950 to-rose-950" />
        <div className="absolute top-10 left-[20%] size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-[20%] size-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AdvertisMonogram
            size={48}
            variant="white"
            className="mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            39&nbsp;outils. 0&nbsp;excuse.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Chaque brief sans GLORY, c&apos;est du temps perdu et de
            l&apos;argent laiss&eacute; sur la table. Testez gratuitement
            pendant 14&nbsp;jours &mdash; sans carte bancaire.
          </p>
          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="votre@email.com"
              className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/40 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Link href="/register">
              <Button
                variant="gradient"
                size="lg"
                className="h-12 w-full shrink-0 px-8 sm:w-auto"
              >
                Commencer
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            Pas de pi&egrave;ge. Pas de carte. Vous pouvez annuler en 2&nbsp;clics.
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <AdvertisMonogram size={20} variant="color" />
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ADVERTIS by UPGRADERS
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="transition hover:text-foreground">
              Accueil
            </Link>
            <Link href="/pricing" className="transition hover:text-foreground">
              Tarifs
            </Link>
            <Link href="/login" className="transition hover:text-foreground">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
