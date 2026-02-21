// =============================================================================
// COMPONENT C.K13 — Section Brief Detail
// =============================================================================
// Individual brief viewer for a TranslationDocument.
// Props: documentId, onBack.
// Key features: structured content rendering with heading/block layout, typed
// blocks (rule, recommendation, insight, warning) with color-coded left borders,
// sourceRef tooltips per assertion, freshness badges per block, actions for
// regenerate, validate (DRAFT->VALIDATED), and archive. Back navigation.
// =============================================================================

"use client";

// Section Brief Detail — Displays a TranslationDocument's full structured content
// with sourceRef tooltips and freshness badges per assertion.

import {
  FileText,
  RefreshCcw,
  Check,
  Archive,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { BRIEF_TYPE_LABELS, PILLAR_CONFIG, type PillarType } from "~/lib/constants";
import { FreshnessBadge } from "~/components/ui/freshness-badge";
import { SourceRefTooltip, type SourceRefData } from "~/components/ui/source-ref-tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BriefBlock {
  assertion: string;
  sourceRef?: SourceRefData;
  type?: "rule" | "recommendation" | "insight" | "warning";
}

interface BriefSection {
  heading: string;
  blocks: BriefBlock[];
}

interface BriefContent {
  title: string;
  briefType: string;
  sections: BriefSection[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionBriefDetail({
  documentId,
  onBack,
}: {
  documentId: string;
  onBack: () => void;
}) {
  const { data: doc, isLoading } = api.translation.documents.getById.useQuery(
    { id: documentId },
    { enabled: !!documentId },
  );

  const utils = api.useUtils();

  const regenerateMutation = api.translation.documents.regenerate.useMutation({
    onSuccess: () => void utils.translation.documents.invalidate(),
  });

  const updateStatusMutation = api.translation.documents.updateStatus.useMutation({
    onSuccess: () => void utils.translation.documents.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!doc) return null;

  const content = doc.content as unknown as BriefContent | null;
  const vertical = doc.strategy?.vertical ?? null;
  const typeLabel = BRIEF_TYPE_LABELS[doc.type] ?? doc.type;

  const STATUS_BADGES: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    VALIDATED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    STALE: "bg-red-100 text-red-700 border-red-200",
    ARCHIVED: "bg-gray-100 text-gray-500 border-gray-200",
  };

  const BLOCK_TYPE_STYLES: Record<string, string> = {
    rule: "border-l-terracotta bg-terracotta/5",
    recommendation: "border-l-blue-500 bg-blue-50",
    insight: "border-l-amber-500 bg-amber-50",
    warning: "border-l-red-500 bg-red-50",
  };

  const BLOCK_TYPE_LABELS: Record<string, string> = {
    rule: "Règle",
    recommendation: "Recommandation",
    insight: "Insight",
    warning: "Attention",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour aux briefs
          </button>
          <h3 className="text-lg font-bold">
            {content?.title ?? typeLabel}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full border bg-muted px-2 py-0.5 text-[10px] font-semibold">
              {typeLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">
              v{doc.version}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                STATUS_BADGES[doc.status] ?? STATUS_BADGES.DRAFT,
              )}
            >
              {doc.status}
            </span>
            <FreshnessBadge date={doc.generatedAt} vertical={vertical} />
          </div>
          {doc.staleReason && (
            <p className="mt-1 text-xs text-red-600">{doc.staleReason}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {doc.status !== "ARCHIVED" && (
            <>
              <button
                onClick={() => regenerateMutation.mutate({ id: doc.id })}
                disabled={regenerateMutation.isPending}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                {regenerateMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3 w-3" />
                )}
                Régénérer
              </button>

              {doc.status === "DRAFT" && (
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: doc.id,
                      status: "VALIDATED",
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Valider
                </button>
              )}

              <button
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: doc.id,
                    status: "ARCHIVED",
                  })
                }
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Archive className="h-3 w-3" />
                Archiver
              </button>
            </>
          )}
        </div>
      </div>

      {/* Source pillars */}
      {Array.isArray(doc.sourcePillars) && (doc.sourcePillars as string[]).length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground">
            Piliers source :
          </span>
          {(doc.sourcePillars as string[]).map((p) => {
            const config = PILLAR_CONFIG[p as PillarType];
            return (
              <span
                key={p}
                className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: config?.color ?? "#6b7280" }}
              >
                {p}
              </span>
            );
          })}
        </div>
      )}

      {/* Content sections */}
      {content?.sections?.map((section, sIdx) => (
        <div key={sIdx} className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            {section.heading}
          </h4>

          <div className="space-y-2">
            {section.blocks?.map((block, bIdx) => (
              <div
                key={bIdx}
                className={cn(
                  "rounded-lg border-l-4 p-3",
                  BLOCK_TYPE_STYLES[block.type ?? "rule"] ?? BLOCK_TYPE_STYLES.rule,
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {BLOCK_TYPE_LABELS[block.type ?? "rule"] ?? "Règle"}
                  </span>
                  {block.sourceRef && (
                    <FreshnessBadge
                      date={block.sourceRef.updatedAt}
                      vertical={vertical}
                    />
                  )}
                </div>

                {block.sourceRef ? (
                  <SourceRefTooltip
                    sourceRef={block.sourceRef}
                    vertical={vertical}
                  >
                    <p className="text-sm leading-relaxed">{block.assertion}</p>
                  </SourceRefTooltip>
                ) : (
                  <p className="text-sm leading-relaxed">{block.assertion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {(!content?.sections || content.sections.length === 0) && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Aucun contenu disponible pour ce brief.
        </div>
      )}
    </div>
  );
}
