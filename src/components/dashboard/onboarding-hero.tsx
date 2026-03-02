"use client";

import {
  Sparkles,
  FileText,
  BarChart3,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { AdvertisMonogram } from "~/components/brand/advertis-logo";

interface OnboardingHeroProps {
  firstName: string;
  onCreateBrand: () => void;
}

const STEPS = [
  {
    icon: <Lightbulb className="size-5 text-primary" />,
    title: "1. Créez votre marque",
    description: "Renseignez le nom, le secteur et les premières données de votre marque.",
  },
  {
    icon: <FileText className="size-5 text-accent" />,
    title: "2. Remplissez la fiche",
    description: "Répondez aux questions des piliers A-D-V-E. L'IA s'occupe du reste.",
  },
  {
    icon: <Sparkles className="size-5 text-amber-500" />,
    title: "3. Générez la stratégie",
    description: "Audit Risk, Track, Implémentation et Cockpit sont générés automatiquement.",
  },
  {
    icon: <BarChart3 className="size-5 text-primary" />,
    title: "4. Pilotez et partagez",
    description: "Consultez votre cockpit interactif et partagez-le avec vos clients.",
  },
];

export function OnboardingHero({ firstName, onCreateBrand }: OnboardingHeroProps) {
  return (
    <div className="animate-scale-in bg-mesh rounded-2xl p-6 md:p-10 space-y-8">
      {/* Welcome message */}
      <div className="text-center">
        <AdvertisMonogram size={48} variant="color" className="mx-auto" />
        <h1 className="mt-4 text-2xl font-bold text-gradient">
          Bienvenue{firstName ? ` ${firstName}` : ""} !
        </h1>
        <p className="mt-2 text-muted-foreground">
          Créez votre première marque pour démarrer votre stratégie en 8 piliers.
        </p>
      </div>

      {/* Steps */}
      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="flex gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {step.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" onClick={onCreateBrand} className="text-base">
          Créer ma première marque
          <ArrowRight className="ml-2 size-5" />
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          C&apos;est gratuit et ça prend moins de 2 minutes.
        </p>
      </div>
    </div>
  );
}
