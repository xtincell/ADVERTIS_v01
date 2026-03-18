// ==========================================================================
// SECTION C.K24 — Fiche Client
// Company profile summary card displayed in the cockpit overview.
// Shows brand name, sector, description, phase, maturity, budget.
// ==========================================================================

"use client";

import {
  Building2,
  Globe,
  Calendar,
  TrendingUp,
  Wallet,
  Target,
  Layers,
  BadgeCheck,
} from "lucide-react";
import { PHASE_CONFIG, SECTORS } from "~/lib/constants";
import type { Phase, SupportedCurrency } from "~/lib/constants";
import { formatCompact } from "~/lib/currency";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FicheClientProps {
  brandName: string;
  projectName: string;
  sector: string | null;
  description: string | null;
  phase: string;
  vertical?: string | null;
  maturityProfile?: string | null;
  deliveryMode?: string | null;
  currency?: string | null;
  annualBudget?: number | null;
  targetRevenue?: number | null;
  coherenceScore?: number | null;
  createdAt?: Date | string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSectorLabel(sector: string | null): string {
  if (!sector) return "Non défini";
  const found = SECTORS.find((s) => s.value === sector);
  return found?.label ?? sector;
}

function getPhaseLabel(phase: string): string {
  const cfg = PHASE_CONFIG[phase as Phase];
  return cfg?.title ?? phase;
}

const MATURITY_LABELS: Record<string, string> = {
  MATURE: "Marque Mature",
  GROWTH: "Croissance",
  STARTUP: "Startup",
  LAUNCH: "Lancement",
};

const DELIVERY_LABELS: Record<string, string> = {
  ONE_SHOT: "One Shot",
  PLACEMENT: "Placement",
  RETAINER: "Retainer",
};

const DELIVERY_COLORS: Record<string, string> = {
  ONE_SHOT: "#94a3b8",
  PLACEMENT: "#8B5CF6",
  RETAINER: "#22C55E",
};

// formatCurrency → replaced by centralized formatCompact from ~/lib/currency

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionFicheClient({
  brandName,
  projectName,
  sector,
  description,
  phase,
  vertical,
  maturityProfile,
  deliveryMode,
  currency,
  annualBudget,
  targetRevenue,
  coherenceScore,
  createdAt,
}: FicheClientProps) {
  const deliveryColor = deliveryMode ? (DELIVERY_COLORS[deliveryMode] ?? "#94a3b8") : "#94a3b8";

  return (
    <section className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
      {/* Header gradient bar */}
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(to right, ${deliveryColor}, ${deliveryColor}60)`,
        }}
      />

      <div className="p-4 md:p-5 space-y-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Fiche Client</h2>
              <p className="text-xs text-muted-foreground">Récapitulatif entreprise</p>
            </div>
          </div>
          {deliveryMode && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${deliveryColor}15`,
                color: deliveryColor,
              }}
            >
              <BadgeCheck className="h-3 w-3" />
              {DELIVERY_LABELS[deliveryMode] ?? deliveryMode}
            </span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Sector */}
          <InfoItem
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Secteur"
            value={getSectorLabel(sector)}
          />

          {/* Phase */}
          <InfoItem
            icon={<Layers className="h-3.5 w-3.5" />}
            label="Phase"
            value={getPhaseLabel(phase)}
          />

          {/* Maturity */}
          {maturityProfile && (
            <InfoItem
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Maturité"
              value={MATURITY_LABELS[maturityProfile] ?? maturityProfile}
            />
          )}

          {/* Vertical */}
          {vertical && (
            <InfoItem
              icon={<Target className="h-3.5 w-3.5" />}
              label="Verticale"
              value={vertical}
            />
          )}

          {/* Annual budget */}
          {annualBudget != null && annualBudget > 0 && (
            <InfoItem
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Budget annuel"
              value={formatCompact(annualBudget, (currency ?? "XOF") as SupportedCurrency)}
            />
          )}

          {/* Target revenue */}
          {targetRevenue != null && targetRevenue > 0 && (
            <InfoItem
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="CA visé"
              value={formatCompact(targetRevenue, (currency ?? "XOF") as SupportedCurrency)}
            />
          )}

          {/* Created */}
          {createdAt && (
            <InfoItem
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Créé le"
              value={new Date(createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Info item sub-component
// ---------------------------------------------------------------------------

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
