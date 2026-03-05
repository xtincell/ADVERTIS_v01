// =============================================================================
// C.COCKPIT.W1 — Partnership Radar
// =============================================================================
// Displays FW-24 Alliance Architecture data as a radar-style overview
// showing partner categories, integration levels, and strategic fit scores.
//
// Used by: Cockpit dashboard, ARTEMIS overview page
// =============================================================================

"use client";

import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PartnerCategory {
  id: string;
  name: string;
  type: string;
  description: string;
  strategicFit: number;
  potentialPartners: string[];
  idealLevel: string;
}

interface PartnerPackage {
  id: string;
  level: string;
  name: string;
  description: string;
  investmentRange: string;
  exclusivity: boolean;
}

interface PartnershipRadarProps {
  partnerTaxonomy: PartnerCategory[];
  partnerPackages: PartnerPackage[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Level colors
// ---------------------------------------------------------------------------

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  SPONSOR: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  GUILD: { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  GUARDIAN_DEITY: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  ALLIANCE: { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300" },
};

const LEVEL_LABELS: Record<string, string> = {
  SPONSOR: "Sponsor",
  GUILD: "Guilde",
  GUARDIAN_DEITY: "Gardien",
  ALLIANCE: "Alliance",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PartnershipRadar({
  partnerTaxonomy,
  partnerPackages,
  className,
}: PartnershipRadarProps) {
  if (partnerTaxonomy.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-slot="partnership-radar">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune taxonomie de partenaires. Exécutez FW-24 (Alliance Architecture).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} data-slot="partnership-radar">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Radar Partenariats
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {partnerTaxonomy.length} catégories
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Partner categories with fit scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {partnerTaxonomy.map((cat) => {
            const levelColors = LEVEL_COLORS[cat.idealLevel] ?? LEVEL_COLORS.SPONSOR!;
            const fitColor =
              cat.strategicFit >= 80
                ? "text-emerald-600 dark:text-emerald-400"
                : cat.strategicFit >= 60
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-500";

            return (
              <div
                key={cat.id}
                className="rounded-lg border p-3 space-y-1.5 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{cat.name}</span>
                  <span className={cn("font-mono text-sm font-bold", fitColor)}>
                    {cat.strategicFit}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      levelColors.bg,
                      levelColors.text,
                    )}
                  >
                    {LEVEL_LABELS[cat.idealLevel] ?? cat.idealLevel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {cat.type}
                  </span>
                </div>
                {cat.potentialPartners.length > 0 && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {cat.potentialPartners.join(" · ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Integration levels summary */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Niveaux d&apos;Intégration
          </p>
          <div className="flex flex-col gap-1.5">
            {partnerPackages.map((pkg) => {
              const colors = LEVEL_COLORS[pkg.level] ?? LEVEL_COLORS.SPONSOR!;
              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2",
                    colors.bg,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium text-sm", colors.text)}>
                      {pkg.name}
                    </span>
                    {pkg.exclusivity && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Exclusif
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pkg.investmentRange}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
