// ==========================================================================
// C.MS1 — Market Study Dashboard
// Multi-source data collection UI.
// ==========================================================================

"use client";

import { useState, useCallback } from "react";
import {
  Globe,
  Loader2,
  CheckCircle,
  SkipForward,
  Sparkles,
  Play,
  Database,
  FileSearch,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  Search,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  DataSourceName,
  SourceStatus,
  SourceStatusMap,
  ManualDataStore,
  ManualDataCategory,
  MarketStudySynthesis,
} from "~/lib/types/market-study";
import { SourceStatusCard } from "./source-status-card";
import { ManualDataForm } from "./manual-data-form";
import { SynthesisViewer } from "./synthesis-viewer";

type Tab = "sources" | "manual" | "synthesis";

interface DataSourceInfo {
  sourceId: DataSourceName;
  name: string;
  configured: boolean;
}

interface MarketStudyDashboardProps {
  strategyId: string;
  marketStudyStatus: string;
  sourceStatuses: SourceStatusMap;
  manualData: ManualDataStore | null;
  synthesis: MarketStudySynthesis | null;
  availableSources: DataSourceInfo[];
  // Actions
  onLaunchCollection: () => Promise<void>;
  onAddManualData: (data: {
    title: string;
    content: string;
    category: ManualDataCategory;
    sourceType: string;
  }) => Promise<void>;
  onRemoveManualData: (entryId: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  onSynthesize: () => Promise<void>;
  onSkip: () => Promise<void>;
  onComplete: () => Promise<void>;
  isCollecting?: boolean;
  isSynthesizing?: boolean;
  className?: string;
}

export function MarketStudyDashboard({
  strategyId,
  marketStudyStatus,
  sourceStatuses,
  manualData,
  synthesis,
  availableSources,
  onLaunchCollection,
  onAddManualData,
  onRemoveManualData,
  onUploadFile,
  onSynthesize,
  onSkip,
  onComplete,
  isCollecting = false,
  isSynthesizing = false,
  className,
}: MarketStudyDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>(synthesis ? "synthesis" : "sources");

  const configuredCount = availableSources.filter((s) => s.configured).length;
  const completedSources = Object.values(sourceStatuses).filter(
    (s) => s === "complete" || s === "partial",
  ).length;
  const manualEntries = manualData?.entries ?? [];
  const hasAnyData = completedSources > 0 || manualEntries.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-terracotta" />
          <h3 className="text-lg font-semibold">Étude de Marché</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Optionnel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={marketStudyStatus} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Collectez des données marché réelles pour enrichir l&apos;audit Track (T).
        Les données automatiques et manuelles seront synthétisées par IA.
        Vous pouvez aussi sauter cette étape.
      </p>

      {/* Summary banner — visible when synthesis exists */}
      {synthesis && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Confidence score */}
            {synthesis.overallConfidence != null && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white",
                    synthesis.overallConfidence >= 70
                      ? "bg-emerald-500"
                      : synthesis.overallConfidence >= 40
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                >
                  {synthesis.overallConfidence}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Score de confiance</p>
                  <p className="text-muted-foreground">
                    {synthesis.overallConfidence >= 70
                      ? "Élevé"
                      : synthesis.overallConfidence >= 40
                        ? "Moyen"
                        : "Faible"}
                  </p>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {completedSources > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-medium">
                  <BarChart3 className="h-3 w-3 text-emerald-600" />
                  {completedSources} source{completedSources > 1 ? "s" : ""}
                </span>
              )}
              {manualEntries.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-medium">
                  <Database className="h-3 w-3 text-emerald-600" />
                  {manualEntries.length} donnée{manualEntries.length > 1 ? "s" : ""} manuelle{manualEntries.length > 1 ? "s" : ""}
                </span>
              )}
              {synthesis.macroTrends?.trends?.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-medium">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  {synthesis.macroTrends.trends.length} tendance{synthesis.macroTrends.trends.length > 1 ? "s" : ""}
                </span>
              )}
              {synthesis.competitiveLandscape?.competitors?.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-medium">
                  <Users className="h-3 w-3 text-emerald-600" />
                  {synthesis.competitiveLandscape.competitors.length} concurrent{synthesis.competitiveLandscape.competitors.length > 1 ? "s" : ""}
                </span>
              )}
              {synthesis.weakSignals?.signals?.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 font-medium">
                  <Search className="h-3 w-3 text-emerald-600" />
                  {synthesis.weakSignals.signals.length} signal{synthesis.weakSignals.signals.length > 1 ? "ux" : ""} faible{synthesis.weakSignals.signals.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Link to synthesis tab */}
            {activeTab !== "synthesis" && (
              <button
                onClick={() => setActiveTab("synthesis")}
                className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
              >
                Voir la synthèse complète →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {(
          [
            { id: "sources", label: "Sources automatiques", icon: FileSearch, count: `${completedSources}/${configuredCount}` },
            { id: "manual", label: "Données manuelles", icon: Database, count: `${manualEntries.length}` },
            { id: "synthesis", label: "Synthèse", icon: Sparkles, count: synthesis ? "✓" : "" },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === "sources" && (
          <div className="space-y-4">
            {/* Source cards grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableSources.map((source) => (
                <SourceStatusCard
                  key={source.sourceId}
                  sourceId={source.sourceId}
                  status={
                    (sourceStatuses[source.sourceId] as SourceStatus) ??
                    (source.configured ? "pending" : "not_configured")
                  }
                  configured={source.configured}
                />
              ))}
            </div>

            {/* Launch collection button */}
            <button
              onClick={onLaunchCollection}
              disabled={isCollecting || configuredCount === 0}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isCollecting
                  ? "bg-terracotta/50 text-white cursor-not-allowed"
                  : configuredCount > 0
                    ? "bg-terracotta text-white hover:bg-terracotta/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isCollecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Collecte en cours…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Lancer la collecte ({configuredCount} source
                  {configuredCount > 1 ? "s" : ""})
                </>
              )}
            </button>

            {configuredCount === 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Aucune source de données n&apos;est configurée. Ajoutez des clés API
                  dans les variables d&apos;environnement pour activer les sources automatiques,
                  ou ajoutez des données manuellement.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "manual" && (
          <ManualDataForm
            entries={manualEntries}
            onAdd={onAddManualData}
            onRemove={onRemoveManualData}
            onUploadFile={onUploadFile}
          />
        )}

        {activeTab === "synthesis" && (
          <div className="space-y-4">
            {synthesis ? (
              <SynthesisViewer synthesis={synthesis} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {hasAnyData
                    ? "Lancez la synthèse pour analyser les données collectées."
                    : "Aucune donnée collectée. La synthèse sera 100\u00A0% basée sur les connaissances IA du secteur et les données de la fiche de marque."}
                </p>
              </div>
            )}

            {/* Synthesize button — always visible, works even without collected data */}
            <button
              onClick={onSynthesize}
              disabled={isSynthesizing}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isSynthesizing
                  ? "bg-terracotta/50 text-white cursor-not-allowed"
                  : "bg-terracotta text-white hover:bg-terracotta/90",
              )}
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Synthèse en cours…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {synthesis
                    ? "Relancer la synthèse"
                    : hasAnyData
                      ? "Lancer la synthèse IA"
                      : "Générer une estimation IA"}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Passer l&apos;étude de marché
        </button>

        {(hasAnyData || synthesis) && (
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta px-6 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 shadow-sm transition-all"
          >
            <CheckCircle className="h-4 w-4" />
            Valider et continuer
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-muted text-muted-foreground" },
    collecting: { label: "Collecte...", className: "bg-terracotta/10 text-terracotta" },
    partial: { label: "Partiel", className: "bg-amber-50 text-amber-700" },
    complete: { label: "Terminé", className: "bg-green-50 text-green-700" },
    skipped: { label: "Ignoré", className: "bg-muted text-muted-foreground" },
  };

  const config = configs[status] ?? configs.pending!;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
