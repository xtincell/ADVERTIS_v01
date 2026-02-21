// =============================================================================
// COMPONENT C.K18 — Section Opportunities
// =============================================================================
// Opportunity calendar display for the cockpit.
// Props: strategyId.
// Key features: timeline rows sorted by startDate, type badges (SEASONAL,
// CULTURAL, COMPETITIVE, INTERNAL) with color coding, impact level indicators
// (HIGH/MEDIUM/LOW), channel pills, date range display, notes preview,
// add/delete forms, CRUD via tRPC mutations, empty state.
// =============================================================================

"use client";

// Section Opportunities — Opportunity Calendar display
// Timeline/list sorted by startDate, type badges, impact indicators
// Dialog for add/edit

import { useState } from "react";
import {
  Calendar,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  IMPACT_LABELS,
} from "~/lib/constants";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Impact colors
// ---------------------------------------------------------------------------

const IMPACT_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-gray-100 text-gray-600",
};

// ---------------------------------------------------------------------------
// SectionOpportunities
// ---------------------------------------------------------------------------

export function SectionOpportunities({ strategyId }: { strategyId: string }) {
  const [showAdd, setShowAdd] = useState(false);

  const { data: opportunities, isLoading, refetch } = api.marketContext.opportunities.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const createMutation = api.marketContext.opportunities.create.useMutation({
    onSuccess: () => {
      void refetch();
      setShowAdd(false);
    },
  });

  const deleteMutation = api.marketContext.opportunities.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const totalOpportunities = opportunities?.length ?? 0;

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Calendar className="h-5 w-5" />}
        pillarLetter="T"
        title="Calendrier d'Opportunités"
        subtitle="Chargement…"
        color="#8c3cc4"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  return (
    <CockpitSection
      icon={<Calendar className="h-5 w-5" />}
      pillarLetter="T"
      title="Calendrier d'Opportunités"
      subtitle={`${totalOpportunities} opportunité${totalOpportunities > 1 ? "s" : ""}`}
      color="#8c3cc4"
    >
      <div className="space-y-4">
        {totalOpportunities > 0 ? (
          <div className="space-y-2">
            {opportunities?.map((opp) => (
              <OpportunityRow
                key={opp.id}
                opportunity={opp}
                onDelete={() => deleteMutation.mutate({ id: opp.id })}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune opportunité enregistrée. Ajoutez des fenêtres d&apos;opportunité.
            </p>
          </div>
        )}

        {/* Add form */}
        {showAdd ? (
          <OpportunityForm
            strategyId={strategyId}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowAdd(false)}
            isSubmitting={createMutation.isPending}
          />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-purple-300 px-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une opportunité
          </button>
        )}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// Opportunity Row
// ---------------------------------------------------------------------------

function OpportunityRow({
  opportunity,
  onDelete,
  isDeleting,
}: {
  opportunity: {
    id: string;
    title: string;
    startDate: Date | string;
    endDate: Date | string | null;
    type: string;
    impact: string;
    channels: unknown;
    linkedAxes: unknown;
    notes: string | null;
  };
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const channels = Array.isArray(opportunity.channels) ? opportunity.channels : [];
  const typeLabel = OPPORTUNITY_TYPE_LABELS[opportunity.type as keyof typeof OPPORTUNITY_TYPE_LABELS] ?? opportunity.type;
  const typeColor = OPPORTUNITY_TYPE_COLORS[opportunity.type as keyof typeof OPPORTUNITY_TYPE_COLORS] ?? "bg-gray-100 text-gray-700";
  const impactColor = IMPACT_COLORS[opportunity.impact] ?? IMPACT_COLORS.MEDIUM!;
  const impactLabel = IMPACT_LABELS[opportunity.impact as keyof typeof IMPACT_LABELS] ?? opportunity.impact;

  const startDate = new Date(opportunity.startDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const endDate = opportunity.endDate
    ? new Date(opportunity.endDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
      {/* Date column */}
      <div className="shrink-0 text-center w-16">
        <p className="text-xs font-semibold">{startDate}</p>
        {endDate && (
          <p className="text-[10px] text-muted-foreground">→ {endDate}</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              typeColor,
            )}
          >
            {typeLabel}
          </span>
          <p className="text-sm font-medium truncate">{opportunity.title}</p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium",
              impactColor,
            )}
          >
            Impact {impactLabel}
          </span>

          {channels.slice(0, 3).map((ch, i) => (
            <span
              key={i}
              className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-medium text-purple-700"
            >
              {String(ch)}
            </span>
          ))}
        </div>

        {opportunity.notes && (
          <p className="mt-1 text-[10px] text-muted-foreground truncate">
            {opportunity.notes}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Opportunity Form
// ---------------------------------------------------------------------------

function OpportunityForm({
  strategyId,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  strategyId: string;
  onSubmit: (data: {
    strategyId: string;
    title: string;
    startDate: Date;
    type: "SEASONAL" | "CULTURAL" | "COMPETITIVE" | "INTERNAL";
    impact: "LOW" | "MEDIUM" | "HIGH";
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [type, setType] = useState<"SEASONAL" | "CULTURAL" | "COMPETITIVE" | "INTERNAL">("SEASONAL");
  const [impact, setImpact] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-purple-700">
          Nouvelle opportunité
        </h4>
        <button onClick={onCancel} className="rounded p-1 hover:bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre *"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <input
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          type="date"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        >
          <option value="SEASONAL">Saisonnière</option>
          <option value="CULTURAL">Culturelle</option>
          <option value="COMPETITIVE">Compétitive</option>
          <option value="INTERNAL">Interne</option>
        </select>
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value as typeof impact)}
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        >
          <option value="LOW">Impact faible</option>
          <option value="MEDIUM">Impact moyen</option>
          <option value="HIGH">Impact élevé</option>
        </select>
      </div>

      <button
        onClick={() => {
          if (!title.trim() || !startDate) return;
          onSubmit({
            strategyId,
            title: title.trim(),
            startDate: new Date(startDate),
            type,
            impact,
          });
        }}
        disabled={isSubmitting || !title.trim() || !startDate}
        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
        Ajouter
      </button>
    </div>
  );
}
