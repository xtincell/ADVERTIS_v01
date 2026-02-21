// ==========================================================================
// PAGE P.3 — Brand Tree
// Flat list of all strategies displayed as tree nodes. Search + navigate.
// Uses strategy.getAll for simplicity; TreeNodeCard handles visual hierarchy.
// ==========================================================================

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, RotateCcw, Search } from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TreeNodeCard } from "~/components/brand/tree-node-card";

export default function BrandTreePage() {
  const router = useRouter();

  // ── Data fetching ──
  const {
    data: strategies,
    isLoading,
    isError,
    refetch,
  } = api.strategy.getAll.useQuery();

  // ── Search state ──
  const [search, setSearch] = useState("");

  // ── Filtered strategies ──
  const filtered = useMemo(() => {
    if (!strategies) return [];
    if (!search.trim()) return strategies;
    const q = search.toLowerCase();
    return strategies.filter(
      (s) =>
        s.brandName?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q),
    );
  }, [strategies, search]);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger l&apos;arbre des marques
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Arbre des marques</h1>
        <p className="text-sm text-muted-foreground">
          {strategies?.length ?? 0} stratégie
          {(strategies?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une marque..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Strategy list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune stratégie trouvée
          </p>
        ) : (
          filtered.map((strategy) => (
            <TreeNodeCard
              key={strategy.id}
              id={strategy.id}
              name={strategy.name}
              brandName={strategy.brandName}
              nodeType={(strategy as Record<string, unknown>).nodeType as string ?? "BRAND"}
              depth={0}
              coherenceScore={strategy.coherenceScore}
              pillarCount={strategy.pillars?.length}
              completedPillars={strategy.pillars?.filter((p) => p.status === "complete").length}
              onNavigate={(id) => router.push(`/brand/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
