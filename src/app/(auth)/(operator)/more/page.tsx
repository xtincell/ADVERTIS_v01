// ==========================================================================
// PAGE P.8A — More Menu
// Grid of link cards to operator sub-pages.
// ==========================================================================

"use client";

import Link from "next/link";
import {
  Brain,
  DollarSign,
  Palette,
  Cpu,
  Shield,
  Settings,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------

const MENU_ITEMS = [
  {
    href: "/more/interventions",
    icon: AlertTriangle,
    label: "Interventions",
    description: "Demandes d'intervention en attente",
  },
  {
    href: "/more/intelligence",
    icon: Brain,
    label: "Intelligence",
    description: "Vue consolidée des données marché",
  },
  {
    href: "/more/pricing",
    icon: DollarSign,
    label: "Pricing",
    description: "Référentiel tarifaire par marché",
  },
  {
    href: "/more/presets",
    icon: Palette,
    label: "Presets",
    description: "Templates de briefs personnalisés",
  },
  {
    href: "/more/costs",
    icon: Cpu,
    label: "Coûts IA",
    description: "Suivi des consommations IA",
  },
  {
    href: "/more/admin",
    icon: Shield,
    label: "Admin",
    description: "Administration de la plateforme",
  },
  {
    href: "/more/settings",
    icon: Settings,
    label: "Paramètres",
    description: "Profil et configuration du compte",
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MoreMenuPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Plus</h1>
        <p className="text-sm text-muted-foreground">
          Accédez aux outils et paramètres avancés
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-terracotta/30 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-terracotta/10">
                <Icon className="h-5 w-5 text-terracotta" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
