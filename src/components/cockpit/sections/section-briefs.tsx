// =============================================================================
// COMPONENT C.K12 — Section Briefs
// =============================================================================
// Translation document list (Brief Toolbox) for the cockpit.
// Props: strategyId.
// Key features: brief cards grouped by type with freshness badges (fresh/aging/
// stale), status indicators (DRAFT/VALIDATED/STALE/ARCHIVED), source pillar
// tags, generation from presets or individual brief type, seed system presets,
// drill-down to SectionBriefDetail for full content view.
// =============================================================================

"use client";

// Section Briefs — Brief Toolbox display
// Shows all TranslationDocuments grouped by type, with freshness badges,
// status indicators, and generation actions.

import { useState } from "react";
import {
  FileText,
  Loader2,
  Plus,
  Sparkles,
  RefreshCcw,
  Check,
  Archive,
  ChevronRight,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  BRIEF_TYPE_LABELS,
  BRIEF_TYPES,
  PILLAR_CONFIG,
  type PillarType,
  type BriefType,
} from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";
import { FreshnessBadge } from "~/components/ui/freshness-badge";
import { SectionBriefDetail } from "./section-brief-detail";

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-700 border-gray-200" },
  VALIDATED: { label: "Validé", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  STALE: { label: "Obsolète", className: "bg-red-100 text-red-700 border-red-200" },
  ARCHIVED: { label: "Archivé", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

// ---------------------------------------------------------------------------
// SectionBriefs
// ---------------------------------------------------------------------------

export function SectionBriefs({ strategyId }: { strategyId: string }) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedBriefType, setSelectedBriefType] = useState<string>("");

  const { data: docs, isLoading, refetch } = api.translation.documents.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const { data: freshness } = api.translation.documents.getFreshness.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const { data: presets } = api.translation.presets.getAll.useQuery(undefined, {
    enabled: !!strategyId,
  });

  const generateMutation = api.translation.documents.generate.useMutation({
    onSuccess: () => {
      void refetch();
      setShowGenerateForm(false);
      setSelectedBriefType("");
    },
  });

  const seedPresetsMutation = api.translation.presets.seedDefaults.useMutation({
    onSuccess: () => void api.useUtils().translation.presets.invalidate(),
  });

  const generateFromPresetMutation = api.translation.documents.generateFromPreset.useMutation({
    onSuccess: () => void refetch(),
  });

  const totalDocs = docs?.length ?? 0;

  // If a doc is selected, show its detail view
  if (selectedDocId) {
    return (
      <CockpitSection
        icon={<FileText className="h-5 w-5" />}
        pillarLetter="I"
        title="Boîte à Outils — Détail"
        subtitle="Vue détaillée du brief"
        color="#3cc4c4"
      >
        <SectionBriefDetail
          documentId={selectedDocId}
          onBack={() => setSelectedDocId(null)}
        />
      </CockpitSection>
    );
  }

  if (isLoading) {
    return (
      <CockpitSection
        icon={<FileText className="h-5 w-5" />}
        pillarLetter="I"
        title="Boîte à Outils"
        subtitle="Chargement…"
        color="#3cc4c4"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<FileText className="h-5 w-5" />}
      pillarLetter="I"
      title="Boîte à Outils"
      subtitle={
        totalDocs > 0
          ? `${totalDocs} brief${totalDocs > 1 ? "s" : ""} généré${totalDocs > 1 ? "s" : ""}`
          : "Aucun brief généré"
      }
      color="#3cc4c4"
    >
      <div className="space-y-4">
        {/* Freshness summary */}
        {freshness && freshness.summary.total > 0 && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-semibold text-muted-foreground">Fraîcheur :</span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {freshness.summary.fresh} frais
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {freshness.summary.aging} vieillissant{freshness.summary.aging > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {freshness.summary.stale} obsolète{freshness.summary.stale > 1 ? "s" : ""}
            </span>
            {freshness.summary.oldestDataDays > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                Donnée la plus ancienne : {freshness.summary.oldestDataDays}j
              </span>
            )}
          </div>
        )}

        {/* Brief list */}
        {totalDocs > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs?.filter((d) => d.status !== "ARCHIVED").map((doc) => (
              <BriefCard
                key={doc.id}
                doc={doc}
                onClick={() => setSelectedDocId(doc.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun brief généré. Commencez par un preset ou générez un brief individuel.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Generate from preset */}
          {presets && presets.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border bg-white px-3 py-1.5 text-xs"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    generateFromPresetMutation.mutate({
                      strategyId,
                      presetId: e.target.value,
                    });
                    e.target.value = "";
                  }
                }}
                disabled={generateFromPresetMutation.isPending}
              >
                <option value="">Générer depuis un preset…</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isSystem ? "(système)" : ""}
                  </option>
                ))}
              </select>
              {generateFromPresetMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}

          {/* Generate single brief */}
          {showGenerateForm ? (
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border bg-white px-3 py-1.5 text-xs"
                value={selectedBriefType}
                onChange={(e) => setSelectedBriefType(e.target.value)}
              >
                <option value="">Choisir un type…</option>
                {BRIEF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {BRIEF_TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedBriefType) {
                    generateMutation.mutate({
                      strategyId,
                      type: selectedBriefType as BriefType,
                    });
                  }
                }}
                disabled={!selectedBriefType || generateMutation.isPending}
                className="inline-flex items-center gap-1 rounded-md bg-terracotta px-3 py-1.5 text-xs font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Générer
              </button>
              <button
                onClick={() => {
                  setShowGenerateForm(false);
                  setSelectedBriefType("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowGenerateForm(true)}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              <Plus className="h-3 w-3" />
              Générer un brief
            </button>
          )}

          {/* Seed presets if none exist */}
          {presets && presets.length === 0 && (
            <button
              onClick={() => seedPresetsMutation.mutate()}
              disabled={seedPresetsMutation.isPending}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              {seedPresetsMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Initialiser les presets système
            </button>
          )}
        </div>
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// Brief Card
// ---------------------------------------------------------------------------

function BriefCard({
  doc,
  onClick,
}: {
  doc: {
    id: string;
    type: string;
    version: number;
    status: string;
    staleReason: string | null;
    sourcePillars: unknown;
    generatedAt: Date;
  };
  onClick: () => void;
}) {
  const typeLabel = BRIEF_TYPE_LABELS[doc.type] ?? doc.type;
  const statusInfo = STATUS_BADGES[doc.status] ?? STATUS_BADGES.DRAFT!;
  const sourcePillars = Array.isArray(doc.sourcePillars) ? (doc.sourcePillars as string[]) : [];

  return (
    <button
      onClick={onClick}
      className="group rounded-lg border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate group-hover:text-terracotta transition-colors">
            {typeLabel}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                statusInfo.className,
              )}
            >
              {statusInfo.label}
            </span>
            <span className="text-[10px] text-muted-foreground">v{doc.version}</span>
            <FreshnessBadge date={doc.generatedAt} />
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-terracotta transition-colors" />
      </div>

      {/* Source pillars */}
      {sourcePillars.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          {sourcePillars.map((p) => {
            const config = PILLAR_CONFIG[p as PillarType];
            return (
              <span
                key={p}
                className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: config?.color ?? "#6b7280" }}
              >
                {p}
              </span>
            );
          })}
        </div>
      )}

      {/* Stale reason */}
      {doc.staleReason && (
        <p className="mt-1 text-[10px] text-red-500 truncate">
          {doc.staleReason}
        </p>
      )}
    </button>
  );
}
