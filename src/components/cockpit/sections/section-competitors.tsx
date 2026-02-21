// =============================================================================
// COMPONENT C.K11 — Section Competitors
// =============================================================================
// Competitor snapshot display for the cockpit.
// Props: strategyId.
// Key features: SVG radar visualization for Share of Voice (SOV) comparison,
// bar chart fallback for < 3 competitors, toggle between radar/grid views,
// competitor cards (name, SOV%, positioning, strengths, weaknesses, recent
// moves), add/delete competitor forms, CRUD via tRPC mutations.
// =============================================================================

"use client";

// Section Competitors — Competitive landscape display
// SVG radar visualization for SOV comparison + card grid
// Table: name, SOV%, positioning, strengths, weaknesses, recent moves
// Dialog for add/edit

import { useState, useMemo } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
  BarChart3,
  LayoutGrid,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Colors for radar polygon vertices
// ---------------------------------------------------------------------------

const RADAR_COLORS = [
  "#8c3cc4", // purple
  "#c45a3c", // terracotta
  "#2563eb", // blue
  "#16a34a", // green
  "#d97706", // amber
  "#dc2626", // red
  "#0d9488", // teal
  "#7c3aed", // violet
];

type ViewMode = "radar" | "grid";

// ---------------------------------------------------------------------------
// SectionCompetitors
// ---------------------------------------------------------------------------

export function SectionCompetitors({ strategyId }: { strategyId: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("radar");

  const { data: competitors, isLoading, refetch } = api.marketContext.competitors.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const upsertMutation = api.marketContext.competitors.upsert.useMutation({
    onSuccess: () => {
      void refetch();
      setShowAdd(false);
    },
  });

  const deleteMutation = api.marketContext.competitors.delete.useMutation({
    onSuccess: () => void refetch(),
  });

  const totalCompetitors = competitors?.length ?? 0;

  // Competitors with SOV data for the radar
  const radarData = useMemo(
    () =>
      (competitors ?? [])
        .filter((c) => c.sov != null && c.sov > 0)
        .sort((a, b) => (b.sov ?? 0) - (a.sov ?? 0)),
    [competitors],
  );

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Users className="h-5 w-5" />}
        pillarLetter="T"
        title="Paysage Concurrentiel"
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
      icon={<Users className="h-5 w-5" />}
      pillarLetter="T"
      title="Paysage Concurrentiel"
      subtitle={`${totalCompetitors} concurrent${totalCompetitors > 1 ? "s" : ""}`}
      color="#8c3cc4"
    >
      <div className="space-y-4">
        {/* View mode toggle */}
        {totalCompetitors > 0 && (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode("radar")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "radar"
                  ? "bg-purple-100 text-purple-700"
                  : "text-muted-foreground hover:bg-muted",
              )}
              title="Vue radar"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-purple-100 text-purple-700"
                  : "text-muted-foreground hover:bg-muted",
              )}
              title="Vue cartes"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Radar visualization */}
        {totalCompetitors > 0 && viewMode === "radar" && radarData.length > 0 && (
          <CompetitorRadar competitors={radarData} />
        )}

        {/* Grid of cards */}
        {totalCompetitors > 0 && (viewMode === "grid" || radarData.length === 0) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competitors?.map((comp) => (
              <CompetitorCard
                key={comp.id}
                competitor={comp}
                onDelete={() => deleteMutation.mutate({ id: comp.id })}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Detailed cards below radar */}
        {totalCompetitors > 0 && viewMode === "radar" && radarData.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competitors?.map((comp) => (
              <CompetitorCard
                key={comp.id}
                competitor={comp}
                onDelete={() => deleteMutation.mutate({ id: comp.id })}
                isDeleting={deleteMutation.isPending}
                compact
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {totalCompetitors === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun concurrent enregistré. Ajoutez des concurrents pour suivre le paysage.
            </p>
          </div>
        )}

        {/* Add form */}
        {showAdd ? (
          <CompetitorForm
            strategyId={strategyId}
            onSubmit={(data) => upsertMutation.mutate(data)}
            onCancel={() => setShowAdd(false)}
            isSubmitting={upsertMutation.isPending}
          />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-purple-300 px-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un concurrent
          </button>
        )}
      </div>
    </CockpitSection>
  );
}

// ---------------------------------------------------------------------------
// CompetitorRadar — SVG polar/radar visualization
// ---------------------------------------------------------------------------

function CompetitorRadar({
  competitors,
}: {
  competitors: Array<{
    id: string;
    name: string;
    sov: number | null;
    strengths: unknown;
    weaknesses: unknown;
  }>;
}) {
  const maxSov = Math.max(...competitors.map((c) => c.sov ?? 0), 10);
  const cx = 160;
  const cy = 140;
  const maxR = 110;
  const n = competitors.length;

  // For a proper radar, we need ≥ 3 points — otherwise fall back to bar chart
  if (n < 3) {
    return <CompetitorBarChart competitors={competitors} />;
  }

  const angleStep = (2 * Math.PI) / n;
  // Start from top (- PI/2)
  const startAngle = -Math.PI / 2;

  // Generate axis lines and labels
  const axes = competitors.map((c, i) => {
    const angle = startAngle + i * angleStep;
    const x = cx + maxR * Math.cos(angle);
    const y = cy + maxR * Math.sin(angle);
    // Label position (slightly outside)
    const lx = cx + (maxR + 18) * Math.cos(angle);
    const ly = cy + (maxR + 18) * Math.sin(angle);
    return { x, y, lx, ly, name: c.name, angle };
  });

  // Generate polygon points for data
  const dataPoints = competitors.map((c, i) => {
    const angle = startAngle + i * angleStep;
    const r = ((c.sov ?? 0) / maxSov) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      sov: c.sov ?? 0,
      name: c.name,
      color: RADAR_COLORS[i % RADAR_COLORS.length]!,
    };
  });

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Concentric rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="rounded-xl border bg-gradient-to-br from-purple-50/50 to-white p-4">
      <svg viewBox="0 0 320 290" className="w-full max-w-md mx-auto" aria-label="Radar concurrentiel SOV">
        {/* Concentric rings */}
        {rings.map((pct) => (
          <circle
            key={pct}
            cx={cx}
            cy={cy}
            r={maxR * pct}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray={pct < 1 ? "3 3" : undefined}
          />
        ))}

        {/* Ring labels */}
        {rings.map((pct) => (
          <text
            key={`lbl-${pct}`}
            x={cx + 3}
            y={cy - maxR * pct + 3}
            fontSize={7}
            fill="#9ca3af"
          >
            {Math.round(maxSov * pct)}%
          </text>
        ))}

        {/* Axis lines */}
        {axes.map((a, i) => (
          <line
            key={`ax-${i}`}
            x1={cx}
            y1={cy}
            x2={a.x}
            y2={a.y}
            stroke="#d1d5db"
            strokeWidth={0.5}
          />
        ))}

        {/* Data polygon */}
        <path
          d={polygonPath}
          fill="rgba(140, 60, 196, 0.15)"
          stroke="#8c3cc4"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points + labels */}
        {dataPoints.map((p, i) => (
          <g key={`dp-${i}`}>
            <circle cx={p.x} cy={p.y} r={4} fill={p.color} stroke="white" strokeWidth={1.5} />
            <text
              x={axes[i]!.lx}
              y={axes[i]!.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fontWeight={600}
              fill="#374151"
            >
              {p.name.length > 12 ? p.name.substring(0, 11) + "…" : p.name}
            </text>
            <text
              x={axes[i]!.lx}
              y={axes[i]!.ly + 10}
              textAnchor="middle"
              fontSize={7}
              fill={p.color}
              fontWeight={700}
            >
              {p.sov}%
            </text>
          </g>
        ))}
      </svg>

      <p className="text-center text-[10px] text-muted-foreground mt-1">
        Share of Voice (SOV) — Radar concurrentiel
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompetitorBarChart — Fallback for < 3 competitors
// ---------------------------------------------------------------------------

function CompetitorBarChart({
  competitors,
}: {
  competitors: Array<{
    id: string;
    name: string;
    sov: number | null;
  }>;
}) {
  const maxSov = Math.max(...competitors.map((c) => c.sov ?? 0), 10);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-purple-50/50 to-white p-4">
      <div className="space-y-2">
        {competitors.map((c, i) => {
          const pct = ((c.sov ?? 0) / maxSov) * 100;
          const color = RADAR_COLORS[i % RADAR_COLORS.length]!;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-xs font-medium w-24 truncate text-right">
                {c.name}
              </span>
              <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span
                className="text-xs font-bold w-10 text-right"
                style={{ color }}
              >
                {c.sov ?? 0}%
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2">
        Share of Voice (SOV)
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Competitor Card
// ---------------------------------------------------------------------------

function CompetitorCard({
  competitor,
  onDelete,
  isDeleting,
  compact = false,
}: {
  competitor: {
    id: string;
    name: string;
    sov: number | null;
    positioning: string | null;
    strengths: unknown;
    weaknesses: unknown;
    recentMoves: unknown;
  };
  onDelete: () => void;
  isDeleting: boolean;
  compact?: boolean;
}) {
  const strengths = Array.isArray(competitor.strengths) ? competitor.strengths : [];
  const weaknesses = Array.isArray(competitor.weaknesses) ? competitor.weaknesses : [];
  const recentMoves = Array.isArray(competitor.recentMoves) ? competitor.recentMoves : [];

  if (compact) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold truncate">{competitor.name}</h4>
            {competitor.positioning && (
              <p className="text-[9px] text-muted-foreground italic truncate mt-0.5">
                {competitor.positioning}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {competitor.sov != null && (
              <span className="text-[10px] font-bold text-purple-600">
                {competitor.sov}%
              </span>
            )}
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded p-0.5 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
        {/* Compact: just counts */}
        <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground">
          {strengths.length > 0 && (
            <span className="text-emerald-600">{strengths.length} force{strengths.length > 1 ? "s" : ""}</span>
          )}
          {weaknesses.length > 0 && (
            <span className="text-red-500">{weaknesses.length} faiblesse{weaknesses.length > 1 ? "s" : ""}</span>
          )}
          {recentMoves.length > 0 && (
            <span className="text-blue-600">{recentMoves.length} mouvement{recentMoves.length > 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold">{competitor.name}</h4>
          {competitor.positioning && (
            <p className="text-[10px] text-muted-foreground italic mt-0.5">
              {competitor.positioning}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {competitor.sov != null && (
            <div className="flex items-center gap-1.5 mr-2">
              <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.min(competitor.sov, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-purple-600">
                {competitor.sov}%
              </span>
            </div>
          )}

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {strengths.length > 0 && (
          <div>
            <p className="font-semibold text-emerald-600 mb-0.5">Forces</p>
            <ul className="space-y-0.5">
              {(strengths as string[]).slice(0, 3).map((s, i) => (
                <li key={i} className="text-muted-foreground truncate">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div>
            <p className="font-semibold text-red-500 mb-0.5">Faiblesses</p>
            <ul className="space-y-0.5">
              {(weaknesses as string[]).slice(0, 3).map((w, i) => (
                <li key={i} className="text-muted-foreground truncate">
                  • {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recent moves */}
      {recentMoves.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-[10px] font-semibold text-blue-600 mb-0.5">
            Mouvements récents
          </p>
          <ul className="space-y-0.5 text-[10px] text-muted-foreground">
            {(recentMoves as string[]).slice(0, 2).map((m, i) => (
              <li key={i} className="truncate">→ {m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Competitor Form
// ---------------------------------------------------------------------------

function CompetitorForm({
  strategyId,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  strategyId: string;
  onSubmit: (data: {
    strategyId: string;
    name: string;
    sov?: number;
    positioning?: string;
    strengths?: string[];
    weaknesses?: string[];
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState("");
  const [sov, setSov] = useState("");
  const [positioning, setPositioning] = useState("");

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-purple-700">
          Nouveau concurrent
        </h4>
        <button onClick={onCancel} className="rounded p-1 hover:bg-muted">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du concurrent *"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <input
          value={sov}
          onChange={(e) => setSov(e.target.value)}
          placeholder="SOV % (optionnel)"
          type="number"
          min="0"
          max="100"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <input
          value={positioning}
          onChange={(e) => setPositioning(e.target.value)}
          placeholder="Positionnement (optionnel)"
          className="rounded-md border bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
      </div>

      <button
        onClick={() => {
          if (!name.trim()) return;
          onSubmit({
            strategyId,
            name: name.trim(),
            sov: sov ? Number(sov) : undefined,
            positioning: positioning || undefined,
          });
        }}
        disabled={isSubmitting || !name.trim()}
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
