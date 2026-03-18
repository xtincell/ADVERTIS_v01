"use client";

import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StrategySelectorProps {
  value: string | null;
  onChange: (strategyId: string) => void;
  className?: string;
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StrategySelector({
  value,
  onChange,
  className,
  placeholder = "Sélectionner une stratégie",
}: StrategySelectorProps) {
  const { data: strategies, isLoading } = api.strategy.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement des stratégies...
      </div>
    );
  }

  if (!strategies || strategies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucune stratégie disponible</p>
    );
  }

  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {strategies.map((s: { id: string; brandName: string; sector: string | null }) => (
          <SelectItem key={s.id} value={s.id}>
            {s.brandName}
            {s.sector ? ` — ${s.sector}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
