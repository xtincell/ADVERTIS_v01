"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Target,
  Users,
  Globe,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { AdvertisMonogram, AdvertisWordmark } from "~/components/brand/advertis-logo";
import { Button } from "~/components/ui/button";
import { PILLAR_CONFIG, type PillarType } from "~/lib/constants";

const PILLAR_ICONS: Record<PillarType, React.ReactNode> = {
  A: <Sparkles className="size-5" />,
  D: <Target className="size-5" />,
  V: <BarChart3 className="size-5" />,
  E: <Users className="size-5" />,
  R: <Shield className="size-5" />,
  T: <Globe className="size-5" />,
  I: <FileText className="size-5" />,
  S: <Zap className="size-5" />,
};

const STATS = [
  { value: "8", label: "piliers stratégiques" },
  { value: "300+", label: "pages générées par marque" },
  { value: "9", label: "phases de validation" },
  { value: "< 48h", label: "pour une stratégie complète" },
];

const FEATURES = [
  {
    title: "IA Stratégique",
    description:
      "Claude analyse vos données de marque et génère des documents stratégiques structurés, sourcés et actionnables.",
    icon: <Sparkles className="size-6 text-primary" />,
  },
  {
    title: "Cockpit Interactif",
    description:
      "Tableau de bord stratégique en temps réel. Partagez-le avec vos clients via un lien sécurisé.",
    icon: <BarChart3 className="size-6 text-accent" />,
  },
  {
    title: "Multi-Marques",
    description:
      "Gérez un portefeuille complet avec arbre de marques, benchmarks sectoriels et scores de cohérence.",
    icon: <Target className="size-6 text-amber-500" />,
  },
  {
    title: "Outils GLORY",
    description:
      "Suite d'outils opérationnels : générateur de concepts, rédacteur de scripts, briefs créatifs et plus.",
    icon: <Zap className="size-6 text-primary" />,
  },
  {
    title: "Missions & Freelances",
    description:
      "Orchestrez vos équipes : assignation de missions, suivi des livrables, contrôle qualité intégré.",
    icon: <Users className="size-6 text-accent" />,
  },
  {
    title: "Export Pro",
    description:
      "Exportez en PDF, Excel ou HTML. Documents prêts pour la présentation client, au format agence.",
    icon: <FileText className="size-6 text-amber-500" />,
  },
];

interface LandingPageProps {
  /** When the user is logged in, pass their home route to show "Mon espace" */
  userHomeHref?: string;
}

export function LandingPage({ userHomeHref }: LandingPageProps) {
  const isLoggedIn = !!userHomeHref;
  const homeHref = userHomeHref ?? "/login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <AdvertisMonogram size={28} variant="color" />
            <AdvertisWordmark className="text-lg text-foreground" />
          </Link>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <a href="#pillars" className="text-muted-foreground transition hover:text-foreground">
              Méthode
            </a>
            <a href="#features" className="text-muted-foreground transition hover:text-foreground">
              Fonctionnalités
            </a>
            <a href="/pricing" className="text-muted-foreground transition hover:text-foreground">
              Tarifs
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href={homeHref}>
                <Button size="sm">
                  Mon espace
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Essai gratuit
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center md:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Propulsé par l&apos;IA stratégique
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            La stratégie de marque,{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              structurée en 8 piliers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            ADVERTIS génère des documents stratégiques de 300+ pages en moins de 48h.
            De l&apos;ADN de marque au cockpit interactif, chaque pilier est guidé par l&apos;IA.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Démarrer gratuitement
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="#pillars">
              <Button variant="outline" size="lg" className="text-base">
                Découvrir la méthode
              </Button>
            </Link>
          </div>

          {/* ─── Stats bar ─── */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8 Piliers ─── */}
      <section id="pillars" className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              La méthode A-D-V-E-R-T-I-S
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              8 piliers. 9 phases. Un framework complet de stratégie de marque.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PILLAR_CONFIG) as PillarType[]).map((key) => {
              const pillar = PILLAR_CONFIG[key];
              return (
                <div
                  key={key}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <span className="text-sm font-bold">{key}</span>
                    </div>
                    <h3 className="font-semibold">{pillar.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Tout ce qu&apos;il faut pour vendre de la stratégie
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              De la collecte de données au livrable client, ADVERTIS couvre toute la chaîne.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="space-y-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pensé pour l&apos;Afrique, construit pour le monde
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ADVERTIS est né des réalités du marché africain : multi-devises (XOF, XAF, EUR, USD),
            pricing régional, et connaissance sectorielle locale.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-3xl font-bold text-primary">40+</div>
              <div className="mt-2 text-sm text-muted-foreground">Secteurs couverts</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-3xl font-bold text-accent">6</div>
              <div className="mt-2 text-sm text-muted-foreground">Devises supportées</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="text-3xl font-bold text-amber-500">20+</div>
              <div className="mt-2 text-sm text-muted-foreground">Types de briefs</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <AdvertisMonogram size={48} variant="color" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
            Prêt à structurer votre stratégie ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Créez votre premier projet gratuitement. Aucune carte bancaire requise.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Commencer maintenant
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-base">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <AdvertisMonogram size={20} variant="color" />
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ADVERTIS by UPGRADERS
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="transition hover:text-foreground">
              Tarifs
            </Link>
            <Link href={isLoggedIn ? homeHref : "/login"} className="transition hover:text-foreground">
              {isLoggedIn ? "Mon espace" : "Connexion"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
