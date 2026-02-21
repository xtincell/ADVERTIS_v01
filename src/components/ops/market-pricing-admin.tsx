// ==========================================================================
// C.O7 — Market Pricing Admin
// Pricing configuration UI.
// ==========================================================================

"use client";

/**
 * MarketPricingAdmin — Admin panel for managing the MarketPricing reference database.
 * Table view grouped by market > category, with inline editing and seed defaults.
 */

import { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  MARKETS,
  MARKET_LABELS,
  PRICING_CATEGORIES,
  PRICING_CATEGORY_LABELS,
  type Market,
  type PricingCategory,
} from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

export function MarketPricingAdmin() {
  const [selectedMarket, setSelectedMarket] = useState<Market>("CM");
  const [selectedCategory, setSelectedCategory] = useState<PricingCategory | "ALL">("ALL");

  const { data: pricing, isLoading } =
    api.marketPricing.getByMarket.useQuery({ market: selectedMarket });
  const utils = api.useUtils();

  const seedMutation = api.marketPricing.seedDefaults.useMutation({
    onSuccess: () => void utils.marketPricing.getByMarket.invalidate(),
  });

  const deleteMutation = api.marketPricing.delete.useMutation({
    onSuccess: () => void utils.marketPricing.getByMarket.invalidate(),
  });

  const filteredPricing =
    selectedCategory === "ALL"
      ? pricing
      : pricing?.filter((p) => p.category === selectedCategory);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Référentiel Pricing</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => seedMutation.mutate({ market: selectedMarket })}
          disabled={seedMutation.isPending}
        >
          <RefreshCw
            className={`mr-1 h-4 w-4 ${seedMutation.isPending ? "animate-spin" : ""}`}
          />
          Seed {MARKET_LABELS[selectedMarket]}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Market Tabs */}
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          {MARKETS.map((market) => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selectedMarket === market
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {market}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selectedCategory === "ALL"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tout
          </button>
          {PRICING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PRICING_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Chargement...
          </div>
        </div>
      ) : filteredPricing && filteredPricing.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2 text-left font-medium">Label</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Catégorie
                    </th>
                    <th className="px-4 py-2 text-right font-medium">Min</th>
                    <th className="px-4 py-2 text-right font-medium">Max</th>
                    <th className="px-4 py-2 text-right font-medium">Moy.</th>
                    <th className="px-4 py-2 text-left font-medium">Unité</th>
                    <th className="px-4 py-2 text-center font-medium">
                      Confiance
                    </th>
                    <th className="w-10 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPricing.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-2 font-medium">{entry.label}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {PRICING_CATEGORY_LABELS[
                          entry.category as PricingCategory
                        ] ?? entry.category}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {fmt(entry.minPrice)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {fmt(entry.maxPrice)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {entry.avgPrice ? fmt(entry.avgPrice) : "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {entry.unit}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.confidence === "HIGH"
                              ? "border-emerald-300 text-emerald-600"
                              : entry.confidence === "MEDIUM"
                                ? "border-amber-300 text-amber-600"
                                : "border-gray-300 text-gray-500"
                          }`}
                        >
                          {entry.confidence}
                        </Badge>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() =>
                            deleteMutation.mutate({ id: entry.id })
                          }
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune donnée tarifaire pour {MARKET_LABELS[selectedMarket]}.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => seedMutation.mutate({ market: selectedMarket })}
            >
              Importer les données par défaut
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {filteredPricing && filteredPricing.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filteredPricing.length} entrées ·{" "}
          {MARKET_LABELS[selectedMarket]} ·{" "}
          {selectedCategory === "ALL"
            ? "Toutes catégories"
            : PRICING_CATEGORY_LABELS[selectedCategory]}
        </div>
      )}
    </div>
  );
}
