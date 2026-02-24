"use client";

// =============================================================================
// COMP C.GLORY — StrategySelector
// =============================================================================
// Dropdown selector for picking which strategy/brand to work with in GLORY.
// Uses tRPC to load the user's strategies and displays brand + sector.
// =============================================================================

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Building2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StrategySelectorProps {
  value?: string;
  onChange: (strategyId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StrategySelector({ value, onChange }: StrategySelectorProps) {
  const { data: strategies, isLoading, isError } = api.strategy.getAll.useQuery();

  if (isLoading) {
    return <Skeleton className="h-9 w-full max-w-[260px] rounded-md" />;
  }

  if (isError || !strategies) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <Building2 className="h-4 w-4" />
        <span>Impossible de charger les marques</span>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Aucune marque disponible</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-[#6C5CE7] shrink-0" />
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "w-full max-w-[260px] h-9 text-sm",
            "border-[#6C5CE7]/20 focus:ring-[#6C5CE7]/30",
          )}
        >
          <SelectValue placeholder="Sélectionner une marque..." />
        </SelectTrigger>
        <SelectContent>
          {strategies.map((strategy) => (
            <SelectItem key={strategy.id} value={strategy.id}>
              <span className="font-medium">{strategy.brandName}</span>
              {strategy.sector && (
                <span className="ml-1.5 text-muted-foreground">
                  — {strategy.sector}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
