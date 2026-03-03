// ==========================================================================
// C.CRM1 — Pipeline Board
// Kanban-style CRM deal management with 6 stages.
// Drag-and-drop via native HTML5 DnD. Modeled after mission-board.tsx.
// ==========================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  Plus,
  Building2,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  DEAL_SOURCE_LABELS,
  type PipelineStage,
  type DealSource,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealData {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  stage: string;
  amount: number | null;
  currency: string;
  probability: number;
  source: string | null;
  sector: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: Date | null;
  tags: unknown;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Pipeline Board
// ---------------------------------------------------------------------------

interface PipelineBoardProps {
  onCreateDeal?: () => void;
  onSelectDeal?: (dealId: string) => void;
}

export function PipelineBoard({ onCreateDeal, onSelectDeal }: PipelineBoardProps) {
  const { data: kanban, isLoading } = api.crm.getKanban.useQuery();
  const { data: stats } = api.crm.getStats.useQuery();
  const transitionMutation = api.crm.transition.useMutation();
  const utils = api.useUtils();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (!dealId) return;

    try {
      await transitionMutation.mutateAsync({
        id: dealId,
        newStage: targetStage,
      });
      await utils.crm.getKanban.invalidate();
      await utils.crm.getStats.invalidate();
      toast.success(`Deal déplacé → ${PIPELINE_STAGE_LABELS[targetStage]}`);
    } catch {
      toast.error("Transition non autorisée");
    }
    setDraggedId(null);
  };

  // Pipeline value per stage
  const activeStages = PIPELINE_STAGES.filter(
    (s) => s !== "GAGNE" && s !== "PERDU",
  );
  const closedStages: PipelineStage[] = ["GAGNE", "PERDU"];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-float text-muted-foreground">
          Chargement du pipeline...
        </div>
      </div>
    );
  }

  function formatAmount(val: number, currency: string): string {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currency}`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K ${currency}`;
    return `${new Intl.NumberFormat("fr-FR").format(val)} ${currency}`;
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Pipeline CRM</h2>
          <Badge variant="secondary">
            {stats?.totalDeals ?? 0} deals
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Weighted pipeline value */}
          {stats && stats.weightedValue > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-600">
                {formatAmount(stats.weightedValue, "XOF")}
              </span>
              <span className="text-xs text-muted-foreground">pondéré</span>
            </div>
          )}
          {onCreateDeal && (
            <Button size="sm" onClick={onCreateDeal}>
              <Plus className="mr-1 h-4 w-4" />
              Nouveau deal
            </Button>
          )}
        </div>
      </div>

      {/* Active Pipeline Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {activeStages.map((stage) => {
          const deals = (kanban?.[stage] ?? []) as DealData[];
          const colorClasses = PIPELINE_STAGE_COLORS[stage];
          const stageValue = deals.reduce((s, d) => s + (d.amount ?? 0), 0);

          return (
            <div
              key={stage}
              className="flex min-w-[240px] max-w-[280px] flex-1 flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className={`mb-2 rounded-t-lg border px-3 py-2 ${colorClasses}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {PIPELINE_STAGE_LABELS[stage]}
                    <span className="ml-1 text-xs opacity-60">
                      ({deals.length})
                    </span>
                  </span>
                </div>
                {stageValue > 0 && (
                  <p className="text-[10px] font-medium opacity-70 mt-0.5">
                    {formatAmount(stageValue, "XOF")}
                  </p>
                )}
              </div>

              {/* Column Body */}
              <div className="flex min-h-[200px] flex-col gap-2 rounded-b-lg border border-t-0 bg-muted/30 p-2">
                <AnimatePresence>
                  {deals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isDragged={draggedId === deal.id}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => onSelectDeal?.(deal.id)}
                    />
                  ))}
                </AnimatePresence>

                {deals.length === 0 && (
                  <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground/50">
                    Aucun deal
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closed deals summary */}
      {closedStages.some((s) => ((kanban?.[s] ?? []) as DealData[]).length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {closedStages.map((stage) => {
            const deals = (kanban?.[stage] ?? []) as DealData[];
            if (deals.length === 0) return null;
            const colorClasses = PIPELINE_STAGE_COLORS[stage];
            const totalValue = deals.reduce((s, d) => s + (d.amount ?? 0), 0);

            return (
              <div
                key={stage}
                className={`rounded-lg border px-4 py-3 ${colorClasses}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {PIPELINE_STAGE_LABELS[stage]}
                    <span className="ml-1 text-xs opacity-60">
                      ({deals.length})
                    </span>
                  </span>
                  {totalValue > 0 && (
                    <span className="text-sm font-bold">
                      {formatAmount(totalValue, "XOF")}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {deals.slice(0, 5).map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:bg-background/50"
                      onClick={() => onSelectDeal?.(d.id)}
                    >
                      {d.companyName}
                    </span>
                  ))}
                  {deals.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{deals.length - 5}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deal Card sub-component
// ---------------------------------------------------------------------------

function DealCard({
  deal,
  isDragged,
  onDragStart,
  onClick,
}: {
  deal: DealData;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e) =>
        onDragStart(
          e as unknown as React.DragEvent,
        )
      }
      className={`cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
        isDragged ? "opacity-50" : ""
      }`}
      onClick={onClick}
    >
      {/* Company name */}
      <div className="mb-1 flex items-center gap-1.5">
        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold leading-tight truncate">
          {deal.companyName}
        </span>
      </div>

      {/* Contact */}
      {deal.contactName && (
        <p className="text-xs text-muted-foreground truncate mb-1">
          {deal.contactName}
        </p>
      )}

      {/* Amount + Probability */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {deal.amount != null && deal.amount > 0 ? (
          <span className="text-sm font-bold text-emerald-600">
            {new Intl.NumberFormat("fr-FR").format(deal.amount)} {deal.currency}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">Montant N/A</span>
        )}
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {deal.probability}%
        </span>
      </div>

      {/* Meta badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {deal.source && (
          <Badge variant="outline" className="text-[10px] border-border">
            {DEAL_SOURCE_LABELS[deal.source as DealSource] ?? deal.source}
          </Badge>
        )}
        {deal.nextAction && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
            <Calendar className="h-2.5 w-2.5" />
            {deal.nextAction.length > 20
              ? deal.nextAction.slice(0, 20) + "..."
              : deal.nextAction}
          </span>
        )}
      </div>
    </motion.div>
  );
}
