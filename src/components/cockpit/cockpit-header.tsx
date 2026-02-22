// ==========================================================================
// COMPONENT C.K20 — CockpitHeader
// Sticky mobile header for brand cockpit: brand name, scores, menu.
// ==========================================================================

"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Share2,
  Download,
  RefreshCw,
  Copy,
  Archive,
  GitBranch,
  Edit,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useLabel } from "~/components/hooks/use-label";

interface CockpitHeaderProps {
  brandName: string;
  sector?: string | null;
  maturityProfile?: string | null;
  coherenceScore?: number | null;
  strategyId: string;
  onShare?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export function CockpitHeader({
  brandName,
  sector,
  maturityProfile,
  coherenceScore,
  strategyId,
  onShare,
  onExport,
  onRefresh,
}: CockpitHeaderProps) {
  const router = useRouter();
  const label = useLabel();

  const meta = [sector, maturityProfile].filter(Boolean).join(" · ");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Brand info */}
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-base font-semibold">{brandName}</h1>
          {meta && (
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          )}
        </div>

        {/* Score badge */}
        {coherenceScore != null && (
          <span className="shrink-0 rounded-full bg-terracotta/10 px-2.5 py-0.5 text-sm font-semibold text-terracotta">
            {Math.round(coherenceScore)}
          </span>
        )}

        {/* Context menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push(`/brand/${strategyId}/generate`)}>
              <Edit className="mr-2 h-4 w-4" />
              Éditer la fiche
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/brand/${strategyId}/generate`)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Générer / Régénérer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Partager le cockpit
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </DropdownMenuItem>
            )}
            {onRefresh && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalculer les scores
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <GitBranch className="mr-2 h-4 w-4" />
              Créer sous-marque
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
