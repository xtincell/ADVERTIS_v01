// ==========================================================================
// C.B2 — Brand Search Bar
// Search and filter bar for the brand list on the dashboard.
// Mobile: stacked layout. Desktop: inline row.
// ==========================================================================

"use client";

import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  sectorFilter: string;
  onSectorChange: (v: string) => void;
  phaseFilter: string;
  onPhaseChange: (v: string) => void;
}

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const SECTOR_OPTIONS = [
  { value: "", label: "Tous secteurs" },
  { value: "FMCG", label: "FMCG" },
  { value: "TECH", label: "Tech" },
  { value: "HEALTH_PUBLIC", label: "Sante" },
  { value: "INSTITUTIONAL", label: "Institutionnel" },
  { value: "CULTURE", label: "Culture" },
  { value: "LUXURY", label: "Luxe" },
  { value: "NGO", label: "ONG" },
] as const;

const PHASE_OPTIONS = [
  { value: "", label: "Toutes phases" },
  { value: "AUDIT", label: "Audit" },
  { value: "BUILD", label: "Build" },
  { value: "GENERATE", label: "Generation" },
  { value: "LIVE", label: "Live" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrandSearchBar({
  value,
  onChange,
  sectorFilter,
  onSectorChange,
  phaseFilter,
  onPhaseChange,
}: BrandSearchBarProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
      {/* Search input with icon */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher une marque..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sector filter */}
      <Select
        value={sectorFilter}
        onValueChange={(v) => onSectorChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Tous secteurs" />
        </SelectTrigger>
        <SelectContent>
          {SECTOR_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value || "__all__"}
              value={opt.value || "__all__"}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phase filter */}
      <Select
        value={phaseFilter}
        onValueChange={(v) => onPhaseChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Toutes phases" />
        </SelectTrigger>
        <SelectContent>
          {PHASE_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value || "__all__"}
              value={opt.value || "__all__"}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
