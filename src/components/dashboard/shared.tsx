// ==========================================================================
// C.D0 — Dashboard Shared
// Shared dashboard utilities/types.
// ==========================================================================

import { Badge } from "~/components/ui/badge";
import { SECTORS } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

export function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="secondary" className="text-xs">
          Brouillon
        </Badge>
      );
    case "generating":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
          En cours
        </Badge>
      );
    case "complete":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
          Terminée
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="text-muted-foreground text-xs">
          Archivée
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Sector Label
// ---------------------------------------------------------------------------

export function getSectorLabel(
  sectorValue: string | null | undefined,
): string {
  if (!sectorValue) return "Non défini";
  const found = SECTORS.find((s) => s.value === sectorValue);
  return found ? found.label : sectorValue;
}

// ---------------------------------------------------------------------------
// Relative Date
// ---------------------------------------------------------------------------

export function getRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMs < 0) {
    const absDiffSeconds = Math.abs(diffSeconds);
    const absDiffMinutes = Math.floor(absDiffSeconds / 60);
    const absDiffHours = Math.floor(absDiffMinutes / 60);
    const absDiffDays = Math.floor(absDiffHours / 24);
    if (absDiffSeconds < 60) return "dans un instant";
    if (absDiffMinutes < 60)
      return `dans ${absDiffMinutes} minute${absDiffMinutes > 1 ? "s" : ""}`;
    if (absDiffHours < 24)
      return `dans ${absDiffHours} heure${absDiffHours > 1 ? "s" : ""}`;
    return `dans ${absDiffDays} jour${absDiffDays > 1 ? "s" : ""}`;
  }

  if (diffSeconds < 60) return "à l'instant";
  if (diffMinutes < 60)
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7)
    return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  if (diffWeeks < 5)
    return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`;
  return `il y a ${diffMonths} mois`;
}

// ---------------------------------------------------------------------------
// Score Colour (matches cockpit-shared)
// ---------------------------------------------------------------------------

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#22c55e"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function getRiskColor(score: number): string {
  if (score >= 70) return "#ef4444"; // red — high risk
  if (score >= 50) return "#f59e0b"; // amber
  if (score >= 30) return "#22c55e"; // green
  return "#10b981"; // emerald — low risk
}
