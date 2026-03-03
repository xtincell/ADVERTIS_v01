// ==========================================================================
// PAGE P.C1 — Client Home
// White-labeled cockpit for CLIENT_RETAINER / CLIENT_STATIC users.
// Supports multi-brand strategy switching.
// ==========================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  AlertCircle,
  ChevronDown,
  Check,
  Atom,
  ArrowRight,
} from "lucide-react";

import { api } from "~/trpc/react";
import { useRole } from "~/components/hooks/use-role";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { CockpitContent } from "~/components/cockpit/cockpit-content";
import type { CockpitData } from "~/components/cockpit/cockpit-content";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

/** Roles that have access to the Brand OS portal. */
const BRAND_OS_ROLES = ["ADMIN", "OPERATOR", "CLIENT_RETAINER"];

export default function ClientHomePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { role } = useRole();

  // Step 1: Get the client's strategies
  const {
    data: strategies,
    isLoading: strategiesLoading,
    error: strategiesError,
  } = api.strategy.getAll.useQuery({});

  const selectedStrategy = strategies?.[selectedIndex] as
    | { id: string; brandName: string; name: string; sector: string | null }
    | undefined;

  // Step 2: Fetch cockpit data for the selected strategy
  const {
    data: cockpitData,
    isLoading: cockpitLoading,
    error: cockpitError,
  } = api.cockpit.getData.useQuery(
    { strategyId: selectedStrategy?.id ?? "" },
    { enabled: !!selectedStrategy?.id },
  );

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (strategiesLoading || (selectedStrategy && cockpitLoading)) {
    return <PageSpinner />;
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (strategiesError || cockpitError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title="Erreur de chargement"
          description="Erreur lors du chargement de votre cockpit. Veuillez rafraîchir la page."
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // No brand found
  // ---------------------------------------------------------------------------
  if (!strategies?.length || !selectedStrategy) {
    return (
      <div className="flex h-96 items-center justify-center">
        <EmptyState
          icon={Eye}
          title="Aucune marque associée"
          description="Aucune marque n'est associée à votre compte. Contactez votre agence pour en savoir plus."
        />
      </div>
    );
  }

  const hasMultipleStrategies = strategies.length > 1;

  // ---------------------------------------------------------------------------
  // Render white-labeled cockpit
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header with optional strategy switcher */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">
              {selectedStrategy.brandName}
            </h1>
            <p className="text-sm text-muted-foreground">Votre marque</p>
          </div>
        </div>

        {/* Strategy switcher — only show when multiple brands */}
        {hasMultipleStrategies && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                Changer de marque
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {strategies.map((s, idx) => {
                const strat = s as { id: string; brandName: string };
                return (
                  <DropdownMenuItem
                    key={strat.id}
                    onClick={() => setSelectedIndex(idx)}
                    className="gap-2"
                  >
                    {idx === selectedIndex && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <span className={idx === selectedIndex ? "font-medium" : ""}>
                      {strat.brandName}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* CTA → Brand OS (retainer users only) */}
      {BRAND_OS_ROLES.includes(role) && (
        <Link
          href="/os"
          className="group flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/40 hover:bg-amber-500/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Atom className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Brand OS
            </p>
            <p className="text-xs text-muted-foreground">
              Accédez au tableau de bord opérationnel de votre marque
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-amber-500/60 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* Cockpit content */}
      {cockpitData && (
        <CockpitContent
          data={cockpitData as CockpitData}
          isPublic={false}
          isClientView={true}
          initialViewMode="EXECUTIVE"
        />
      )}
    </div>
  );
}
