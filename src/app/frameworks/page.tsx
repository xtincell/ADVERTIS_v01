"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Layers,
  Brain,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  BarChart3,
  Rocket,
  Eye,
  Compass,
  Gem,
  Cpu,
  Palette,
  Swords,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Category badge config
// ---------------------------------------------------------------------------

type FrameworkCategory = "theoretical" | "compute" | "ai" | "hybrid";

const CATEGORY_CONFIG: Record<
  FrameworkCategory,
  { label: string; className: string }
> = {
  theoretical: {
    label: "Theoretical",
    className:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  compute: {
    label: "Compute",
    className:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  ai: {
    label: "AI",
    className:
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  hybrid: {
    label: "Hybrid",
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

// ---------------------------------------------------------------------------
// Framework type
// ---------------------------------------------------------------------------

interface Framework {
  id: string;
  name: string;
  description: string;
  category: FrameworkCategory;
}

// ---------------------------------------------------------------------------
// Layer type
// ---------------------------------------------------------------------------

interface Layer {
  number: number;
  name: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
  frameworks: Framework[];
}

// ---------------------------------------------------------------------------
// Layer data — 9 concentric layers, 24 frameworks total
// ---------------------------------------------------------------------------

const LAYERS: Layer[] = [
  {
    number: 0,
    name: "PHILOSOPHY",
    icon: Compass,
    colorClass: "text-violet-400",
    borderClass: "border-violet-500/30",
    bgClass: "bg-violet-500/5",
    badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    frameworks: [
      {
        id: "FW-01",
        name: "ADVE Cult Marketing",
        description:
          "Philosophie cult marketing qui informe toutes les variables",
        category: "theoretical",
      },
      {
        id: "FW-20",
        name: "Movement Architecture",
        description:
          "D\u00e9finit le projet civilisationnel : proph\u00e9tie, ennemi, doctrine, artefacts, mythologie",
        category: "hybrid",
      },
    ],
  },
  {
    number: 1,
    name: "IDENTITY",
    icon: Gem,
    colorClass: "text-indigo-400",
    borderClass: "border-indigo-500/30",
    bgClass: "bg-indigo-500/5",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    frameworks: [
      {
        id: "FW-02",
        name: "ADVERTIS Pipeline",
        description:
          "Pipeline 8 piliers A-D-V-E-R-T-I-S produisant la fondation strat\u00e9gique",
        category: "hybrid",
      },
      {
        id: "FW-05",
        name: "Grammar Systems",
        description:
          "Triple grammaire (conceptuelle, iconographique, transconcept) + validation C\u00d7F\u00d7P",
        category: "ai",
      },
    ],
  },
  {
    number: 2,
    name: "VALUE",
    icon: Target,
    colorClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/5",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    frameworks: [
      {
        id: "FW-03",
        name: "Parametric Budget",
        description:
          "Mod\u00e9lisation d\u00e9terministe des co\u00fbts : Budget = CA \u00d7 \u03b1(secteur) \u00d7 \u03b2(maturit\u00e9) \u00d7 \u03b3(environnement)",
        category: "compute",
      },
      {
        id: "FW-13",
        name: "Value Exchange Design",
        description:
          "Transaction comme rituel : mapping tier-segment, signaux d\u2019appartenance",
        category: "hybrid",
      },
      {
        id: "FW-21",
        name: "Value Capture Engine",
        description:
          "Mod\u00e9lisation des revenus : mod\u00e8le, m\u00e9caniques de pricing, sc\u00e9narios",
        category: "hybrid",
      },
      {
        id: "FW-24",
        name: "Alliance Architecture",
        description:
          "Partenariats B2B strat\u00e9giques : taxonomie, packages, int\u00e9gration narrative",
        category: "ai",
      },
    ],
  },
  {
    number: 3,
    name: "EXPERIENCE",
    icon: Sparkles,
    colorClass: "text-pink-400",
    borderClass: "border-pink-500/30",
    bgClass: "bg-pink-500/5",
    badgeClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    frameworks: [
      {
        id: "FW-11",
        name: "Experience Architecture",
        description:
          "Conversion par stade superfan : 5 transitions avec trigger, exp\u00e9rience, shift \u00e9motionnel",
        category: "hybrid",
      },
      {
        id: "FW-12",
        name: "Narrative Engineering",
        description:
          "Story par stade superfan : arcs narratifs, textes sacr\u00e9s, vocabulaire par stade",
        category: "ai",
      },
      {
        id: "FW-04",
        name: "Narrative Immersive",
        description:
          "Narration \u00e9v\u00e9nementielle : North Star, factions, carte spatiale, qu\u00eates, PNJs",
        category: "ai",
      },
    ],
  },
  {
    number: 4,
    name: "VALIDATION",
    icon: Eye,
    colorClass: "text-sky-400",
    borderClass: "border-sky-500/30",
    bgClass: "bg-sky-500/5",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    frameworks: [
      {
        id: "FW-06",
        name: "Signal Intelligence System",
        description:
          "Intelligence march\u00e9 temps r\u00e9el : m\u00e9triques, signaux forts, signaux faibles",
        category: "hybrid",
      },
    ],
  },
  {
    number: 5,
    name: "EXECUTION",
    icon: Rocket,
    colorClass: "text-orange-400",
    borderClass: "border-orange-500/30",
    bgClass: "bg-orange-500/5",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    frameworks: [
      {
        id: "FW-09",
        name: "GLORY Production System",
        description:
          "Syst\u00e8me de production cr\u00e9ative 38 outils en 4 couches",
        category: "ai",
      },
      {
        id: "FW-18",
        name: "Internal Alignment System",
        description:
          "Dimension organique : l\u2019\u00e9quipe vit-elle la marque ?",
        category: "ai",
      },
      {
        id: "FW-22",
        name: "Creative Methodology Layer",
        description:
          "M\u00e9thodes de pens\u00e9e cr\u00e9ative : Kubo Titling, Nano Banana, Pinterest Curation",
        category: "compute",
      },
      {
        id: "FW-23",
        name: "Execution Sequencing Engine",
        description:
          "Orchestration temporelle : GTM Launch, Planning Annuel, Production",
        category: "hybrid",
      },
    ],
  },
  {
    number: 6,
    name: "MEASURE",
    icon: BarChart3,
    colorClass: "text-teal-400",
    borderClass: "border-teal-500/30",
    bgClass: "bg-teal-500/5",
    badgeClass: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    frameworks: [
      {
        id: "FW-07",
        name: "Cult Index Engine",
        description:
          "Sant\u00e9 communautaire : score composite 7 m\u00e9triques mesurant le niveau cult (0-100)",
        category: "compute",
      },
      {
        id: "FW-08",
        name: "Superfan Segmentation",
        description:
          "\u00c9chelle de d\u00e9votion 6 stades avec suivi des transitions",
        category: "compute",
      },
      {
        id: "FW-10",
        name: "Attribution & Cohort Analysis",
        description:
          "Mesure ROI : attribution par canal, LTV par cohorte",
        category: "compute",
      },
    ],
  },
  {
    number: 7,
    name: "GROWTH",
    icon: TrendingUp,
    colorClass: "text-lime-400",
    borderClass: "border-lime-500/30",
    bgClass: "bg-lime-500/5",
    badgeClass: "bg-lime-500/10 text-lime-400 border-lime-500/20",
    frameworks: [
      {
        id: "FW-19",
        name: "Growth Mechanics Engine",
        description:
          "Flywheel, points de rupture scaling, matrice Ansoff",
        category: "hybrid",
      },
      {
        id: "FW-15",
        name: "Cultural Expansion Protocol",
        description:
          "Adaptation nouveaux march\u00e9s : transposition culturelle, l\u00e9gitimit\u00e9 locale",
        category: "ai",
      },
      {
        id: "FW-16",
        name: "Brand Architecture System",
        description:
          "Gestion portfolio : mod\u00e8le d\u2019architecture, r\u00e8gles d\u2019h\u00e9ritage",
        category: "compute",
      },
    ],
  },
  {
    number: 8,
    name: "SURVIVAL",
    icon: Shield,
    colorClass: "text-red-400",
    borderClass: "border-red-500/30",
    bgClass: "bg-red-500/5",
    badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
    frameworks: [
      {
        id: "FW-14",
        name: "Brand Evolution Engine",
        description:
          "Mutation contr\u00f4l\u00e9e : identit\u00e9 immuable vs mutable, d\u00e9tection de d\u00e9rive",
        category: "compute",
      },
      {
        id: "FW-17",
        name: "Brand Defense Protocol",
        description:
          "Syst\u00e8me immunitaire : carte des menaces, d\u00e9fense communautaire, crise narrative",
        category: "hybrid",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const STATS = [
  { value: "24", label: "frameworks" },
  { value: "9", label: "couches" },
  { value: "29", label: "variables d\u2019entr\u00e9e" },
  { value: "300-600", label: "pages g\u00e9n\u00e9r\u00e9es par marque" },
];

// ---------------------------------------------------------------------------
// Category badge component
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: FrameworkCategory }) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Framework card component
// ---------------------------------------------------------------------------

function FrameworkCard({ framework }: { framework: Framework }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
          {framework.id}
        </span>
        <CategoryBadge category={framework.category} />
      </div>
      <h4 className="mb-2 text-sm font-semibold leading-tight sm:text-base">
        {framework.name}
      </h4>
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {framework.description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FrameworksPage() {
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
            <Link
              href="/mcp"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              MCP
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
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

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Layers className="size-4" />
          24 frameworks &bull; 9 couches concentriques
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Le syst&egrave;me{" "}
          <span className="text-gradient">ARTEMIS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Ce qui prenait 3 semaines en cabinet prend 48h. 24 frameworks
          interconnect&eacute;s transforment 29 variables d&apos;entr&eacute;e
          en un &eacute;cosyst&egrave;me de marque vivant.
        </p>

        <div className="mt-8">
          <Link href="/register">
            <Button variant="gradient" size="lg" className="group text-base">
              Commencer gratuitement
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Brain className="size-6 text-primary" />
          </div>
          <h2 className="mb-3 text-xl font-bold sm:text-2xl">
            Comment &ccedil;a fonctionne
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            9 couches concentriques, de la philosophie &agrave; la survie.
            Chaque framework s&apos;appuie sur les pr&eacute;c&eacute;dents pour
            construire une strat&eacute;gie coh&eacute;rente et compl&egrave;te.
          </p>
        </div>
      </section>

      {/* ─── Framework Grid — by Layer ─── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="space-y-12 sm:space-y-16">
          {LAYERS.map((layer) => {
            const LayerIcon = layer.icon;
            return (
              <div key={layer.number}>
                {/* Layer heading */}
                <div className="mb-6 flex items-center gap-3 sm:mb-8">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border sm:size-12",
                      layer.borderClass,
                      layer.bgClass
                    )}
                  >
                    <LayerIcon className={cn("size-5 sm:size-6", layer.colorClass)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                          layer.badgeClass
                        )}
                      >
                        Couche {layer.number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {layer.frameworks.length} framework
                        {layer.frameworks.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <h3 className={cn("text-lg font-bold sm:text-xl", layer.colorClass)}>
                      {layer.name}
                    </h3>
                  </div>
                </div>

                {/* Framework cards */}
                <div
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    layer.frameworks.length === 1
                      ? "grid-cols-1 max-w-lg"
                      : layer.frameworks.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : layer.frameworks.length === 3
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  )}
                >
                  {layer.frameworks.map((fw) => (
                    <FrameworkCard key={fw.id} framework={fw} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-t border-border/50 bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
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

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-slate-950 to-rose-950" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute left-[20%] top-10 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-[20%] size-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <AdvertisMonogram
            size={48}
            variant="white"
            className="mx-auto mb-6"
          />
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            24 frameworks. Une seule plateforme.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Transformez 29 variables d&apos;entr&eacute;e en un
            &eacute;cosyst&egrave;me de marque complet. 300 &agrave; 600 pages
            g&eacute;n&eacute;r&eacute;es automatiquement. Testez gratuitement
            &mdash; sans carte bancaire.
          </p>
          <div className="mt-10">
            <Link href="/register">
              <Button
                variant="gradient"
                size="lg"
                className="h-12 px-8 text-base"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
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
