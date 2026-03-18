"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowLeft, Zap, Shield, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";

// ---------------------------------------------------------------------------
// Plan data — EUR + FCFA (1 EUR ≈ 656 FCFA, taux fixe zone franc)
// ---------------------------------------------------------------------------

const PLANS = [
  {
    name: "Starter",
    priceEur: "99",
    priceFcfa: "65 000",
    period: "/mois",
    icon: Zap,
    tagline: "Lancez votre premier pilier en 24h.",
    description:
      "Vous êtes consultant indépendant ou petite agence. Vous perdez des heures à structurer des stratégies à la main. Arrêtez.",
    highlight: false,
    features: [
      "3 marques actives simultanément",
      "Piliers A-D-V-E (fiches stratégiques complètes)",
      "Export PDF & Excel prêt-à-livrer au client",
      "1 utilisateur",
      "Support email sous 24h",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "Professional",
    priceEur: "299",
    priceFcfa: "196 000",
    period: "/mois",
    icon: Users,
    tagline: "Vendez de la stratégie. Pas du temps.",
    description:
      "Vos clients veulent de la méthode, pas des slides recyclés. Professional vous donne le système complet pour livrer en jours ce qui prenait des semaines.",
    highlight: true,
    features: [
      "15 marques actives",
      "Les 8 piliers complets (A-D-V-E-R-T-I-S)",
      "Cockpit interactif partageable avec vos clients",
      "Suite GLORY incluse (objectifs & mesure)",
      "Gestion de missions & freelances",
      "3 utilisateurs",
      "Support prioritaire sous 4h",
    ],
    cta: "Essai gratuit — 14 jours",
  },
  {
    name: "Enterprise",
    priceEur: null,
    priceFcfa: null,
    period: "",
    icon: Shield,
    tagline: "Votre réseau. Votre méthode. À l'échelle.",
    description:
      "Pour les groupes et réseaux d'agences qui veulent standardiser leur méthodologie stratégique sur toutes leurs entités.",
    highlight: false,
    features: [
      "Marques illimitées",
      "8 piliers + modules sur mesure",
      "Arbre de marques multi-niveaux",
      "Intégrations CRM (Zoho, HubSpot, Salesforce)",
      "White-label complet",
      "Utilisateurs illimités",
      "Account manager dédié",
    ],
    cta: "Parlons-en",
  },
];

// ---------------------------------------------------------------------------
// FAQ — Hormozi-style: anticipate objections, remove friction
// ---------------------------------------------------------------------------

const FAQS = [
  {
    q: "Ça vaut vraiment le coup ?",
    a: "Faites le calcul. Une stratégie de marque complète coûte entre 5 000 € et 25 000 € en cabinet. ADVERTIS vous permet de la produire en interne pour une fraction du prix, en jours au lieu de semaines.",
  },
  {
    q: "Et si je ne suis pas convaincu après 14 jours ?",
    a: "Vous arrêtez. Pas de piège. Pas de carte bancaire demandée à l'inscription. 14 jours pour tester le plan Professional en conditions réelles.",
  },
  {
    q: "L'IA va remplacer mes stratèges ?",
    a: "Non. Elle va les rendre 5x plus productifs. L'IA structure, accélère et génère. Le stratège valide, enrichit et livre. Chaque phase inclut une revue humaine obligatoire.",
  },
  {
    q: "Quelles devises sont acceptées ?",
    a: "EUR, FCFA (XOF/XAF), USD, GHS et NGN. La facturation et les prix s'adaptent automatiquement à votre devise.",
  },
  {
    q: "Combien de pages sont générées par marque ?",
    a: "Entre 300 et 600 pages selon le secteur. Chaque pilier produit un document de 15 à 120 pages. C'est un livrable complet, pas un résumé.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PricingPage() {
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
            <Link href="/mcp" className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline">
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

      {/* ─── Header — Hormozi-style: lead with the pain ─── */}
      <div className="mx-auto max-w-4xl px-4 pb-4 pt-12 text-center sm:px-6 sm:pt-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Retour
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Combien vous coûte l&apos;absence{" "}
          <span className="text-gradient">de méthode</span> ?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Une stratégie de marque en cabinet : 5 000 € à 25 000 €.
          Avec ADVERTIS : un système complet, reproductible, livrable en&nbsp;jours.
          Faites le calcul.
        </p>
      </div>

      {/* ─── Plans Grid ─── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-5 transition-shadow hover:shadow-lg sm:p-6 ${
                  plan.highlight
                    ? "border-primary bg-primary/[0.02] shadow-md ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    Le plus choisi
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {plan.tagline}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Price — dual currency */}
                <div className="mb-4 sm:mb-6">
                  {plan.priceEur ? (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold sm:text-4xl">
                          {plan.priceEur}
                        </span>
                        <span className="text-base font-medium text-muted-foreground sm:text-lg">
                          €
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        soit{" "}
                        <span className="font-medium text-foreground">
                          {plan.priceFcfa} FCFA
                        </span>
                        {plan.period}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold sm:text-3xl">
                        Sur mesure
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tarif adapté à votre réseau
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2.5 sm:mb-8 sm:space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/register" className="mt-auto">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "gradient" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* ─── Guarantee strip ─── */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-center sm:flex-row sm:justify-center sm:gap-6 sm:p-6 sm:text-left">
          <Shield className="size-8 shrink-0 text-primary/60" />
          <div>
            <p className="text-sm font-semibold">
              Pas de risque. Pas de carte bancaire à l&apos;essai.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              14 jours pour tester en conditions réelles. Si ça ne vous convient
              pas, vous partez sans frais.
            </p>
          </div>
        </div>

        {/* Note devises */}
        <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
          Prix affichés en EUR et FCFA. Facturation aussi disponible en USD, GHS
          et NGN.
        </p>
      </div>

      {/* ─── FAQ — Objection handling ─── */}
      <section className="border-t border-border/50 bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
            Vos questions, nos réponses directes
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
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
            <Link href="/login" className="transition hover:text-foreground">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
