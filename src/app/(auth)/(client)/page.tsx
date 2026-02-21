// ==========================================================================
// PAGE P.C1 — Client Home
// White-labeled cockpit for CLIENT_RETAINER / CLIENT_STATIC users.
// Fetches the client's brand strategy and renders CockpitContent.
// ==========================================================================

"use client";

import {
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api } from "~/trpc/react";
import { CockpitContent } from "~/components/cockpit/cockpit-content";
import type { CockpitData } from "~/components/cockpit/cockpit-content";

export default function ClientHomePage() {
  // Step 1: Get the client's strategies — pick the first one
  const {
    data: strategies,
    isLoading: strategiesLoading,
    error: strategiesError,
  } = api.strategy.getAll.useQuery({});

  const firstStrategy = strategies?.[0] as
    | { id: string; brandName: string; name: string; sector: string | null }
    | undefined;

  // Step 2: Fetch cockpit data for the selected strategy
  const {
    data: cockpitData,
    isLoading: cockpitLoading,
    error: cockpitError,
  } = api.cockpit.getData.useQuery(
    { strategyId: firstStrategy?.id ?? "" },
    { enabled: !!firstStrategy?.id },
  );

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (strategiesLoading || (firstStrategy && cockpitLoading)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (strategiesError || cockpitError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">
          Erreur lors du chargement de votre cockpit.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // No brand found
  // ---------------------------------------------------------------------------
  if (!firstStrategy) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <Eye className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Aucune marque associée à votre compte.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render white-labeled cockpit
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Simple header */}
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-terracotta" />
        <div>
          <h1 className="text-xl font-semibold">
            {firstStrategy.brandName}
          </h1>
          <p className="text-sm text-muted-foreground">Votre marque</p>
        </div>
      </div>

      {/* Cockpit content — isPublic=false but white-label is handled by useLabel hook */}
      {cockpitData && (
        <CockpitContent
          data={cockpitData as CockpitData}
          isPublic={false}
          initialViewMode="EXECUTIVE"
        />
      )}
    </div>
  );
}
