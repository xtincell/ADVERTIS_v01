// ==========================================================================
// PAGE P.2 — Brand Cockpit (Mobile-First)
// Central screen: sticky header + tabs + sections. Replaces the old
// /strategy/[id]/cockpit with a unified mobile-first experience.
// ==========================================================================

"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  Loader2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { CockpitHeader } from "~/components/cockpit/cockpit-header";
import { ScoreTriad } from "~/components/cockpit/score-triad";
import { CockpitTabs, TAB_SECTION_MAP } from "~/components/cockpit/cockpit-tabs";
import { QuickActions } from "~/components/cockpit/quick-actions";
import {
  CockpitContent,
  type CockpitData,
} from "~/components/cockpit/cockpit-content";
import { CockpitShareDialog } from "~/components/cockpit/cockpit-share-dialog";
import { ExportDialog } from "~/components/strategy/export-dialog";

export default function BrandCockpitPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const [activeTab, setActiveTab] = useState("overview");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // ── Data fetching ──
  const {
    data: strategy,
    isLoading,
    isError,
    refetch,
  } = api.cockpit.getData.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const { data: scoreHistory } = api.analytics.getScoreHistory.useQuery(
    { strategyId, limit: 2 },
    { enabled: !!strategyId },
  );

  const { data: breakdowns } = api.analytics.getBreakdowns.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const recalcMutation = api.analytics.recalculateScores.useMutation({
    onSuccess: () => {
      toast.success("Scores recalculés");
      void refetch();
    },
    onError: () => toast.error("Erreur lors du recalcul"),
  });

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Impossible de charger le cockpit</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // ── No data ──
  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm font-medium">Cockpit non disponible</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>
    );
  }

  // ── Build CockpitData ──
  const previousSnapshot =
    scoreHistory && scoreHistory.length >= 2 ? scoreHistory[1] : null;

  const cockpitData: CockpitData = {
    strategyId,
    brandName: strategy.brandName,
    tagline: strategy.tagline,
    name: strategy.name,
    sector: strategy.sector,
    description: strategy.description,
    phase: strategy.phase,
    coherenceScore: strategy.coherenceScore,
    vertical: strategy.vertical,
    pillars: strategy.pillars.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      status: p.status,
      summary: p.summary,
      content: p.content,
      version: p.version,
      updatedAt: p.updatedAt,
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
    coherenceBreakdown: breakdowns?.coherenceBreakdown ?? null,
    riskBreakdown: breakdowns?.riskBreakdown ?? null,
    bmfBreakdown: breakdowns?.bmfBreakdown ?? null,
  };

  // Extract scores for triad
  const rPillar = strategy.pillars.find((p) => p.type === "R");
  const tPillar = strategy.pillars.find((p) => p.type === "T");
  const riskScore =
    rPillar?.content && typeof rPillar.content === "object"
      ? ((rPillar.content as Record<string, unknown>).riskScore as number) ?? null
      : null;
  const bmfScore =
    tPillar?.content && typeof tPillar.content === "object"
      ? ((tPillar.content as Record<string, unknown>).brandMarketFitScore as number) ?? null
      : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <CockpitHeader
        brandName={strategy.brandName}
        sector={strategy.sector}
        maturityProfile={strategy.maturityProfile}
        coherenceScore={strategy.coherenceScore}
        strategyId={strategyId}
        onShare={() => setShowShareDialog(true)}
        onExport={() => setShowExportDialog(true)}
        onRefresh={() => recalcMutation.mutate({ strategyId })}
      />

      {/* Sticky tabs */}
      <CockpitTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Score triad */}
      <div className="py-4">
        <ScoreTriad
          coherence={strategy.coherenceScore}
          risk={riskScore}
          bmf={bmfScore}
          coherenceBreakdown={breakdowns?.coherenceBreakdown}
          riskBreakdown={breakdowns?.riskBreakdown}
          bmfBreakdown={breakdowns?.bmfBreakdown}
        />
      </div>

      {/* Main content — reuse existing CockpitContent */}
      <div className="flex-1 px-0 md:px-6 md:max-w-5xl md:mx-auto">
        <CockpitContent
          data={cockpitData}
          onRefresh={() => void refetch()}
          tabSections={TAB_SECTION_MAP[activeTab] ?? null}
        />
      </div>

      {/* Mobile FAB */}
      <QuickActions
        onExport={() => setShowExportDialog(true)}
        onShare={() => setShowShareDialog(true)}
        onRefresh={() => recalcMutation.mutate({ strategyId })}
      />

      {/* Dialogs */}
      {showShareDialog && (
        <CockpitShareDialog
          strategyId={strategyId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
      {showExportDialog && (
        <ExportDialog
          strategyId={strategyId}
          brandName={strategy.brandName}
          pillars={strategy.pillars.map((p) => ({
            type: p.type,
            title: p.title,
            status: p.status,
          }))}
        >
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(false)}>
            Fermer
          </Button>
        </ExportDialog>
      )}
    </div>
  );
}
