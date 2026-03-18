// ==========================================================================
// PAGE P.TRS4 — Signaux & Tendances
// Aggregated market signals: macro trends, weak signals, emerging patterns,
// cross-brand sector signals.
// ==========================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingUp,
  Search,
  Radar as RadarIcon,
  Lightbulb,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { StrategySelector } from "~/components/shared/strategy-selector";
import { parsePillarContent } from "~/lib/types/pillar-parsers";
import type { TrackAuditResult } from "~/lib/types/pillar-schemas";
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { PageHeader } from "~/components/ui/page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Signal = { text: string; brand: string; brandId: string };
type SectorSignal = {
  sector: string;
  pillar: string;
  layer: string;
  count: number;
  brands: string[];
  brandIds: string[];
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisSignalsPage() {
  const { data: overview, isLoading: overviewLoading } =
    api.analytics.getAgencyOverview.useQuery();
  const { data: crossBrand, isLoading: crossBrandLoading } =
    api.marketContext.crossBrand.getAll.useQuery();

  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Create signal dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newStrategyId, setNewStrategyId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLayer, setNewLayer] = useState<string>("");
  const [newPillar, setNewPillar] = useState("");
  const [newValue, setNewValue] = useState("");

  const utils = api.useUtils();

  const createMutation = api.signal.create.useMutation({
    onSuccess: () => {
      toast.success("Signal créé avec succès");
      void utils.analytics.getAgencyOverview.invalidate();
      void utils.marketContext.crossBrand.getAll.invalidate();
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors de la création");
    },
  });

  function resetCreateForm() {
    setNewStrategyId(null);
    setNewLabel("");
    setNewDescription("");
    setNewLayer("");
    setNewPillar("");
    setNewValue("");
  }

  function handleCreate() {
    if (!newStrategyId || !newLabel || !newLayer || !newPillar) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    // Default status based on layer
    const defaultStatus = newLayer === "METRIC" ? "HEALTHY" : newLayer === "STRONG" ? "ACTIVE" : "WATCH";
    createMutation.mutate({
      strategyId: newStrategyId,
      title: newLabel,
      description: newDescription || undefined,
      layer: newLayer as "METRIC" | "STRONG" | "WEAK",
      pillar: newPillar,
      status: defaultStatus,
    });
  }

  const isLoading = overviewLoading || crossBrandLoading;

  // Parse T pillar data to extract market reality
  const { macroTrends, weakSignals, emergingPatterns, brandList } = useMemo(() => {
    if (!overview?.brands) return { macroTrends: [] as Signal[], weakSignals: [] as Signal[], emergingPatterns: [] as Signal[], brandList: [] as string[] };

    const trends: Signal[] = [];
    const signals: Signal[] = [];
    const patterns: Signal[] = [];
    const brands = new Set<string>();

    for (const brand of overview.brands) {
      const tPillar = brand.pillars.find((p) => p.type === "T");
      if (!tPillar?.content || tPillar.status !== "complete") continue;

      const { data: t } = parsePillarContent<TrackAuditResult>("T", tPillar.content);
      if (!t) continue;

      brands.add(brand.brandName);

      for (const trend of t.marketReality.macroTrends) {
        trends.push({ text: trend, brand: brand.brandName, brandId: brand.id });
      }
      for (const sig of t.marketReality.weakSignals) {
        signals.push({ text: sig, brand: brand.brandName, brandId: brand.id });
      }
      for (const pat of t.marketReality.emergingPatterns) {
        patterns.push({ text: pat, brand: brand.brandName, brandId: brand.id });
      }
    }

    return {
      macroTrends: trends,
      weakSignals: signals,
      emergingPatterns: patterns,
      brandList: Array.from(brands).sort(),
    };
  }, [overview?.brands]);

  const sectorSignals: SectorSignal[] = useMemo(
    () => (crossBrand?.sectorSignals ?? []) as SectorSignal[],
    [crossBrand?.sectorSignals],
  );

  // Filtered signals
  const filterFn = (s: Signal) => brandFilter === "all" || s.brand === brandFilter;
  const fTrends = macroTrends.filter(filterFn);
  const fSignals = weakSignals.filter(filterFn);
  const fPatterns = emergingPatterns.filter(filterFn);

  const totalCount = fTrends.length + fSignals.length + fPatterns.length + sectorSignals.length;

  // ── States ──

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Signaux & Tendances"
          description="Tendances macro, signaux faibles et patterns émergents agrégés"
          backHref="/tarsis"
          backLabel="Retour au tableau Tarsis"
        />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un signal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau signal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Stratégie *</Label>
                <StrategySelector
                  value={newStrategyId}
                  onChange={setNewStrategyId}
                />
              </div>
              <div className="grid gap-2">
                <Label>Label *</Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nom du signal"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description du signal..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Couche *</Label>
                  <Select value={newLayer} onValueChange={setNewLayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="METRIC">Métrique</SelectItem>
                      <SelectItem value="STRONG">Fort</SelectItem>
                      <SelectItem value="WEAK">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Pilier *</Label>
                  <Input
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    placeholder="Ex: T, A, R, S..."
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Valeur</Label>
                <Input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Valeur numérique (optionnel)"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Créer le signal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total signaux</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{fTrends.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Tendances macro</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{fSignals.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Signaux faibles</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{sectorSignals.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Signaux sectoriels</p>
        </div>
      </div>

      {/* Filter */}
      {brandList.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Filtre :</span>
          <button
            onClick={() => setBrandFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              brandFilter === "all"
                ? "bg-cyan-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            Toutes
          </button>
          {brandList.map((brand) => (
            <button
              key={brand}
              onClick={() => setBrandFilter(brand)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                brandFilter === brand
                  ? "bg-cyan-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <EmptyState
          icon={Zap}
          title="Aucun signal détecté"
          description="Lancez des audits T pour détecter les tendances marché."
        />
      )}

      {/* Sector signals */}
      {sectorSignals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <RadarIcon className="h-4 w-4" />
            Signaux sectoriels ({sectorSignals.length})
          </h2>
          <div className="space-y-2">
            {sectorSignals.map((ss, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-cyan-600/20 bg-cyan-600/5 dark:bg-cyan-600/10 p-3"
              >
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {ss.count} marques avec signal {ss.layer} sur pilier {ss.pillar}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Secteur : {ss.sector} — Marques :{" "}
                    {ss.brands.map((brand, bi) => (
                      <span key={bi}>
                        {bi > 0 && ", "}
                        <Link
                          href={`/brand/${ss.brandIds[bi]}`}
                          className="text-cyan-600 hover:underline"
                        >
                          {brand}
                        </Link>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Macro trends */}
      {fTrends.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendances macro ({fTrends.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {fTrends.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-medium"
              >
                <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                {t.text}
                <span className="ml-1 text-[9px] text-muted-foreground">
                  ({t.brand})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak signals */}
      {fSignals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Signaux faibles ({fSignals.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {fSignals.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-medium"
              >
                <Search className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                {s.text}
                <span className="ml-1 text-[9px] text-muted-foreground">
                  ({s.brand})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Emerging patterns */}
      {fPatterns.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Patterns émergents ({fPatterns.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {fPatterns.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-medium"
              >
                <Lightbulb className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                {p.text}
                <span className="ml-1 text-[9px] text-muted-foreground">
                  ({p.brand})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
