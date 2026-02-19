"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Download,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  CockpitContent,
  type CockpitData,
} from "~/components/cockpit/cockpit-content";
import { CockpitShareDialog } from "~/components/cockpit/cockpit-share-dialog";
import { StrategySubNav } from "~/components/strategy/strategy-sub-nav";
import { ExportDialog } from "~/components/strategy/export-dialog";

export default function CockpitPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const [showShareDialog, setShowShareDialog] = useState(false);

  const {
    data: strategy,
    isLoading,
    isError,
    refetch,
  } = api.cockpit.getData.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  // Fetch last 2 score snapshots for evolution delta
  const { data: scoreHistory } = api.analytics.getScoreHistory.useQuery(
    { strategyId, limit: 2 },
    { enabled: !!strategyId },
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">
          Chargement du cockpit stratégique…
        </p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-red-700">
            Impossible de charger le cockpit
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez votre connexion ou réessayez.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // No data (strategy not found or not at cockpit phase)
  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            Cockpit non disponible
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cette fiche n&apos;a pas encore atteint la phase cockpit,
            ou elle n&apos;existe pas.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    );
  }

  // The 2nd snapshot (index 1) is the "previous" state for computing deltas
  const previousSnapshot = scoreHistory && scoreHistory.length >= 2 ? scoreHistory[1] : null;

  const cockpitData: CockpitData = {
    strategyId,
    brandName: strategy.brandName,
    name: strategy.name,
    sector: strategy.sector,
    description: strategy.description,
    phase: strategy.phase,
    coherenceScore: strategy.coherenceScore,
    pillars: strategy.pillars.map((p) => ({
      type: p.type,
      title: p.title,
      status: p.status,
      summary: p.summary,
      content: p.content,
    })),
    documents: strategy.documents.map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      status: d.status,
      pageCount: d.pageCount,
    })),
    previousScores: previousSnapshot
      ? {
          coherenceScore: previousSnapshot.coherenceScore,
          riskScore: previousSnapshot.riskScore,
          bmfScore: previousSnapshot.bmfScore,
        }
      : null,
  };

  return (
    <div>
      {/* Sub-navigation */}
      <StrategySubNav strategyId={strategyId} className="-mx-6 -mt-6 px-3 mb-6" />

      <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Partager
          </Button>
          <ExportDialog
            strategyId={strategyId}
            brandName={strategy.brandName}
            pillars={strategy.pillars.map((p) => ({
              type: p.type,
              title: p.title,
              status: p.status,
            }))}
          >
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exporter PDF
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Cockpit content */}
      <CockpitContent data={cockpitData} />

      {/* Share dialog */}
      {showShareDialog && (
        <CockpitShareDialog
          strategyId={strategyId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
    </div>
  );
}
