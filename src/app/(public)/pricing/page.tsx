"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AdvertisMonogram, AdvertisWordmark } from "~/components/brand/advertis-logo";

const PLANS = [
  {
    name: "Starter",
    price: "99",
    currency: "EUR",
    period: "/mois",
    description: "Pour les consultants indépendants et les petites agences.",
    highlight: false,
    features: [
      "3 marques actives",
      "Piliers A-D-V-E (Fiche)",
      "Export PDF & Excel",
      "1 utilisateur",
      "Support email",
    ],
    cta: "Démarrer",
  },
  {
    name: "Professional",
    price: "299",
    currency: "EUR",
    period: "/mois",
    description: "Pour les agences qui veulent vendre de la stratégie.",
    highlight: true,
    features: [
      "15 marques actives",
      "8 piliers complets (A-D-V-E-R-T-I-S)",
      "Cockpit interactif + partage",
      "Outils GLORY inclus",
      "Missions & freelances",
      "3 utilisateurs",
      "Support prioritaire",
    ],
    cta: "Essai gratuit 14 jours",
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    currency: "",
    period: "",
    description: "Pour les groupes et réseaux d'agences.",
    highlight: false,
    features: [
      "Marques illimitées",
      "8 piliers + modules custom",
      "Arbre de marques multi-niveaux",
      "Intégrations CRM (Zoho, HubSpot)",
      "White-label",
      "Utilisateurs illimités",
      "Account manager dédié",
    ],
    cta: "Nous contacter",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <AdvertisMonogram size={28} variant="color" />
            <AdvertisWordmark className="text-lg text-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Header ─── */}
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-16 text-center">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Retour
        </Link>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Un plan pour chaque ambition
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Commencez gratuitement, montez en gamme quand votre portefeuille grandit.
          Tous les plans incluent l&apos;IA stratégique.
        </p>
      </div>

      {/* ─── Plans Grid ─── */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                plan.highlight
                  ? "border-primary bg-primary/[0.02] shadow-md"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.currency ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-lg text-muted-foreground">
                      {plan.currency}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">{plan.price}</div>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-auto">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* ─── Note ─── */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Tarifs en EUR. Facturation possible en XOF, XAF, USD ou GHS.
          Contactez-nous pour un devis en devise locale.
        </p>
      </div>

      {/* ─── FAQ Compact ─── */}
      <section className="border-t border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Questions fréquentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "Puis-je essayer ADVERTIS gratuitement ?",
                a: "Oui. Le plan Professional inclut 14 jours d'essai gratuit, sans carte bancaire. Vous pouvez aussi commencer avec le plan Starter.",
              },
              {
                q: "Combien de pages sont générées par marque ?",
                a: "Entre 300 et 600 pages selon le secteur et la complétude des données. Chaque pilier génère un document structuré de 15 à 120 pages.",
              },
              {
                q: "L'IA remplace-t-elle le stratège ?",
                a: "Non. ADVERTIS structure et accélère le travail stratégique. Chaque phase inclut une revue humaine. L'IA génère, le stratège valide et enrichit.",
              },
              {
                q: "Quelles devises sont supportées ?",
                a: "XOF, XAF, EUR, USD, GHS et NGN. Le pricing des missions et des budgets s'adapte automatiquement à la devise sélectionnée.",
              },
            ].map((faq) => (
              <div key={faq.q} className="space-y-2">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
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
