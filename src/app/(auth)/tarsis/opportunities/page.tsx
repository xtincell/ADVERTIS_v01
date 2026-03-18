// ==========================================================================
// PAGE P.TRS6 — Opportunities Calendar
// Cross-brand opportunity timeline: SEASONAL, CULTURAL, COMPETITIVE, INTERNAL.
// ==========================================================================

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  Calendar,
  Sun,
  Globe2,
  Swords,
  Building2,
  Plus,
  Loader2,
  Trash2,
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
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";
import { PageHeader } from "~/components/ui/page-header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Opportunity = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  type: string;
  impact: string;
  channels: string[];
  notes: string | null;
  brandName: string;
  brandId: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function typeIcon(type: string) {
  switch (type) {
    case "SEASONAL":
      return <Sun className="h-4 w-4" />;
    case "CULTURAL":
      return <Globe2 className="h-4 w-4" />;
    case "COMPETITIVE":
      return <Swords className="h-4 w-4" />;
    case "INTERNAL":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "SEASONAL":
      return "Saisonnier";
    case "CULTURAL":
      return "Culturel";
    case "COMPETITIVE":
      return "Compétitif";
    case "INTERNAL":
      return "Interne";
    default:
      return type;
  }
}

function typeColor(type: string): string {
  switch (type) {
    case "SEASONAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "CULTURAL":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300";
    case "COMPETITIVE":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
    case "INTERNAL":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function impactColor(impact: string): string {
  switch (impact) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-amber-500";
    case "LOW":
      return "bg-blue-400";
    default:
      return "bg-muted-foreground";
  }
}

function impactLabel(impact: string): string {
  switch (impact) {
    case "HIGH":
      return "Élevé";
    case "MEDIUM":
      return "Moyen";
    case "LOW":
      return "Faible";
    default:
      return impact;
  }
}

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TarsisOpportunitiesPage() {
  const { data, isLoading, isError, refetch } =
    api.marketContext.crossBrand.getAll.useQuery();

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");

  // Create opportunity dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newStrategyId, setNewStrategyId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newType, setNewType] = useState<string>("");
  const [newImpact, setNewImpact] = useState<string>("");
  const [newChannels, setNewChannels] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const utils = api.useUtils();

  const createMutation = api.marketContext.opportunities.create.useMutation({
    onSuccess: () => {
      toast.success("Opportunité créée avec succès");
      void utils.marketContext.crossBrand.getAll.invalidate();
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors de la création");
    },
  });

  const deleteMutation = api.marketContext.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunité supprimée");
      void utils.marketContext.crossBrand.getAll.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Erreur lors de la suppression");
    },
  });

  function resetCreateForm() {
    setNewStrategyId(null);
    setNewTitle("");
    setNewStartDate("");
    setNewEndDate("");
    setNewType("");
    setNewImpact("");
    setNewChannels("");
    setNewNotes("");
  }

  function handleCreate() {
    if (!newStrategyId || !newTitle || !newStartDate || !newType || !newImpact) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createMutation.mutate({
      strategyId: newStrategyId,
      title: newTitle,
      startDate: new Date(newStartDate),
      endDate: newEndDate ? new Date(newEndDate) : undefined,
      type: newType as "SEASONAL" | "CULTURAL" | "COMPETITIVE" | "INTERNAL",
      impact: newImpact as "LOW" | "MEDIUM" | "HIGH",
      channels: newChannels
        ? newChannels.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined,
      notes: newNotes || undefined,
    });
  }

  // Flatten & enrich
  const { allOpportunities, brandList } = useMemo(() => {
    if (!data?.opportunities) return { allOpportunities: [] as Opportunity[], brandList: [] as string[] };

    const brands = new Set<string>();
    const opps: Opportunity[] = data.opportunities.map((o) => {
      const bName = (o as unknown as { strategy: { brandName: string; id: string } }).strategy?.brandName ?? "—";
      const bId = (o as unknown as { strategy: { id: string } }).strategy?.id ?? "";
      brands.add(bName);
      return {
        id: o.id,
        title: o.title,
        startDate: new Date(o.startDate),
        endDate: o.endDate ? new Date(o.endDate) : null,
        type: o.type,
        impact: o.impact,
        channels: (o.channels as string[] | null) ?? [],
        notes: o.notes ?? null,
        brandName: bName,
        brandId: bId,
      };
    });

    return { allOpportunities: opps, brandList: Array.from(brands).sort() };
  }, [data?.opportunities]);

  // Filters
  const filtered = allOpportunities
    .filter((o) => brandFilter === "all" || o.brandName === brandFilter)
    .filter((o) => typeFilter === "all" || o.type === typeFilter)
    .filter((o) => impactFilter === "all" || o.impact === impactFilter);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Opportunity[] }>();
    for (const o of filtered) {
      const key = monthKey(o.startDate);
      if (!map.has(key)) map.set(key, { label: monthLabel(o.startDate), items: [] });
      map.get(key)!.items.push(o);
    }
    // Sort by key asc (chronological)
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // KPIs
  const high = filtered.filter((o) => o.impact === "HIGH").length;
  const seasonal = filtered.filter((o) => o.type === "SEASONAL").length;
  const competitive = filtered.filter((o) => o.type === "COMPETITIVE").length;

  // ── States ──

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Impossible de charger les données</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Calendrier des Opportunités"
          description="Timeline cross-marques des fenêtres d'opportunité marché"
          backHref="/tarsis"
          backLabel="Retour au tableau Tarsis"
        />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une opportunité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle opportunité</DialogTitle>
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
                <Label>Titre *</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nom de l'opportunité"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date de début *</Label>
                  <Input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEASONAL">Saisonnier</SelectItem>
                      <SelectItem value="CULTURAL">Culturel</SelectItem>
                      <SelectItem value="COMPETITIVE">Compétitif</SelectItem>
                      <SelectItem value="INTERNAL">Interne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Impact *</Label>
                  <Select value={newImpact} onValueChange={setNewImpact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Faible</SelectItem>
                      <SelectItem value="MEDIUM">Moyen</SelectItem>
                      <SelectItem value="HIGH">Élevé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Canaux (séparés par des virgules)</Label>
                <Input
                  value={newChannels}
                  onChange={(e) => setNewChannels(e.target.value)}
                  placeholder="SEO, SEA, Social..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Créer l&apos;opportunité
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{filtered.length}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Total
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{high}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Impact élevé
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{seasonal}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Saisonniers
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{competitive}</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Compétitifs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Brand filter */}
        {brandList.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
              Marque :
            </span>
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

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
            Type :
          </span>
          {["all", "SEASONAL", "CULTURAL", "COMPETITIVE", "INTERNAL"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  typeFilter === t
                    ? "bg-cyan-600 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {t === "all" ? "Tous" : typeLabel(t)}
              </button>
            ),
          )}
        </div>

        {/* Impact filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
            Impact :
          </span>
          {["all", "HIGH", "MEDIUM", "LOW"].map((i) => (
            <button
              key={i}
              onClick={() => setImpactFilter(i)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                impactFilter === i
                  ? "bg-cyan-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {i === "all" ? "Tous" : impactLabel(i)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="Aucune opportunité détectée"
          description="Les données marché génèrent automatiquement les fenêtres d'opportunité."
        />
      )}

      {/* Timeline by month */}
      {grouped.map(([key, group]) => (
        <div key={key}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {group.label} ({group.items.length})
          </h2>
          <div className="space-y-2">
            {group.items.map((o) => (
              <div
                key={o.id}
                className="flex items-start gap-3 rounded-xl border bg-card p-3"
              >
                {/* Impact dot */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className={cn("h-3 w-3 rounded-full", impactColor(o.impact))}
                    title={`Impact ${impactLabel(o.impact)}`}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{o.title}</p>
                  </div>

                  {/* Date range */}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.startDate)}
                    {o.endDate ? ` → ${formatDate(o.endDate)}` : ""}
                  </p>

                  {/* Notes */}
                  {o.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {o.notes}
                    </p>
                  )}

                  {/* Channels */}
                  {o.channels.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {o.channels.map((ch) => (
                        <span
                          key={ch}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/brand/${o.brandId}`}
                      className="text-[10px] text-cyan-600 hover:underline"
                    >
                      {o.brandName}
                    </Link>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        typeColor(o.type),
                      )}
                    >
                      {typeIcon(o.type)}
                      {typeLabel(o.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          impactColor(o.impact),
                        )}
                      />
                      {impactLabel(o.impact)}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-red-500"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate({ id: o.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
