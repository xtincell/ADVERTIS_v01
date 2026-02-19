// Cockpit Shared Components — Reusable building blocks for all cockpit sections.

import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Score Helpers
// ---------------------------------------------------------------------------

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

export function getScoreBorderColor(score: number): string {
  if (score >= 80) return "border-emerald-300 bg-emerald-50";
  if (score >= 60) return "border-blue-300 bg-blue-50";
  if (score >= 40) return "border-amber-300 bg-amber-50";
  if (score >= 20) return "border-orange-300 bg-orange-50";
  return "border-red-300 bg-red-50";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  if (score >= 40) return "Moyen";
  if (score >= 20) return "Faible";
  return "Critique";
}

export function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Risque élevé", color: "text-red-600" };
  if (score >= 50) return { label: "Risque modéré", color: "text-amber-600" };
  if (score >= 25) return { label: "Risque faible", color: "text-blue-600" };
  return { label: "Risque minimal", color: "text-emerald-600" };
}

/** Safely display an unknown value — avoids "[object Object]" and "undefined" */
export function safeDisplay(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

// ---------------------------------------------------------------------------
// Score Circle — reusable score visualization
// ---------------------------------------------------------------------------

export function ScoreCircle({
  score,
  label,
  sublabel,
  size = "md",
  invertForRisk = false,
}: {
  score: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  invertForRisk?: boolean;
}) {
  const displayScore = invertForRisk ? 100 - score : score;
  const colorScore = invertForRisk ? displayScore : score;
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-28 w-28",
  };
  const textSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center justify-center rounded-full border-4 ${sizeClasses[size]} ${getScoreBorderColor(colorScore)}`}
      >
        <span className={`font-bold ${textSize[size]} ${getScoreColor(colorScore)}`}>
          {score}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          / 100
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      {sublabel && (
        <span className={`mt-0.5 text-xs font-medium ${invertForRisk ? getRiskLevel(score).color : getScoreColor(score)}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Breakdown Tooltip — shows decomposition of each score type
// ---------------------------------------------------------------------------

export interface CoherenceBreakdownData {
  pillarCompletion: number;
  variableCoverage: number;
  contentQuality: number;
  crossPillarAlignment: number;
  auditIntegration: number;
  total: number;
}

export interface RiskBreakdownData {
  microSwotRisk: number;
  probabilityImpactRisk: number;
  globalSwotBalance: number;
  mitigationCoverage: number;
  total: number;
}

export interface BmfBreakdownData {
  triangulationQuality: number;
  hypothesisValidation: number;
  marketSizing: number;
  competitiveDifferentiation: number;
  total: number;
}

function BreakdownRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-[120px] text-[10px] text-background/70 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-background/20">
        <div
          className="h-full rounded-full bg-background/60"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-background/80 w-[40px] text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export function ScoreBreakdownTooltip({
  type,
  breakdown,
  children,
}: {
  type: "coherence" | "risk" | "bmf";
  breakdown: CoherenceBreakdownData | RiskBreakdownData | BmfBreakdownData | null;
  children: React.ReactNode;
}) {
  if (!breakdown) return <>{children}</>;

  const rows: { label: string; value: number; max: number }[] = [];

  if (type === "coherence") {
    const b = breakdown as CoherenceBreakdownData;
    rows.push(
      { label: "Complétion piliers", value: b.pillarCompletion, max: 25 },
      { label: "Couverture variables", value: b.variableCoverage, max: 20 },
      { label: "Qualité contenu", value: b.contentQuality, max: 15 },
      { label: "Alignement inter-piliers", value: b.crossPillarAlignment, max: 25 },
      { label: "Intégration audits", value: b.auditIntegration, max: 15 },
    );
  } else if (type === "risk") {
    const b = breakdown as RiskBreakdownData;
    rows.push(
      { label: "Micro-SWOT Risk", value: b.microSwotRisk, max: 40 },
      { label: "Probabilité × Impact", value: b.probabilityImpactRisk, max: 30 },
      { label: "Balance SWOT", value: b.globalSwotBalance, max: 20 },
      { label: "Couverture mitigations", value: b.mitigationCoverage, max: 10 },
    );
  } else {
    const b = breakdown as BmfBreakdownData;
    rows.push(
      { label: "Triangulation", value: b.triangulationQuality, max: 25 },
      { label: "Validation hypothèses", value: b.hypothesisValidation, max: 30 },
      { label: "Market Sizing", value: b.marketSizing, max: 20 },
      { label: "Différenciation", value: b.competitiveDifferentiation, max: 25 },
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="bottom" className="w-[260px] p-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-background/60 mb-2">
            {type === "coherence"
              ? "Décomposition Cohérence"
              : type === "risk"
                ? "Décomposition Risque"
                : "Décomposition BMF"}
          </p>
          {rows.map((r) => (
            <BreakdownRow key={r.label} {...r} />
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// ScoreCircleWithEvolution — wraps ScoreCircle + delta indicator
// ---------------------------------------------------------------------------

export function ScoreCircleWithEvolution({
  score,
  previousScore,
  label,
  sublabel,
  size = "lg",
  invertForRisk = false,
  breakdownType,
  breakdown,
}: {
  score: number;
  previousScore?: number | null;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  invertForRisk?: boolean;
  breakdownType?: "coherence" | "risk" | "bmf";
  breakdown?: CoherenceBreakdownData | RiskBreakdownData | BmfBreakdownData | null;
}) {
  const delta = previousScore != null ? score - previousScore : null;

  const circle = (
    <div className="flex flex-col items-center">
      <ScoreCircle
        score={score}
        label={label}
        sublabel={sublabel}
        size={size}
        invertForRisk={invertForRisk}
      />
      {delta != null && delta !== 0 && (
        <div className="mt-1 flex items-center gap-0.5">
          {(() => {
            // For risk: going UP is bad (red), going DOWN is good (green)
            const isPositive = invertForRisk ? delta < 0 : delta > 0;
            const color = isPositive ? "text-emerald-600" : "text-red-600";
            const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
            return (
              <>
                <Icon className={`h-3 w-3 ${color}`} />
                <span className={`text-[11px] font-semibold ${color}`}>
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );

  if (breakdownType && breakdown) {
    return (
      <ScoreBreakdownTooltip type={breakdownType} breakdown={breakdown}>
        {circle}
      </ScoreBreakdownTooltip>
    );
  }

  return circle;
}

// ---------------------------------------------------------------------------
// CockpitSection — wrapper card with colored top border and pillar badge
// ---------------------------------------------------------------------------

export function CockpitSection({
  icon,
  pillarLetter,
  title,
  subtitle,
  color,
  children,
}: {
  icon: React.ReactNode;
  pillarLetter: string;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="overflow-hidden"
      style={{ borderTopWidth: "3px", borderTopColor: color }}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {pillarLetter}
              </span>
            </div>
            <CardDescription>{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DataCard — label + value with icon
// ---------------------------------------------------------------------------

export function DataCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MetricCard — centered numeric metric
// ---------------------------------------------------------------------------

export function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value || "\u2013"}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SwotCard — colored SWOT quadrant
// ---------------------------------------------------------------------------

export function SwotCard({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "red" | "blue" | "amber";
}) {
  const colorMap = {
    green: {
      card: "border-emerald-200 bg-emerald-50/50",
      dot: "bg-emerald-500",
      title: "text-emerald-800",
    },
    red: {
      card: "border-red-200 bg-red-50/50",
      dot: "bg-red-500",
      title: "text-red-800",
    },
    blue: {
      card: "border-blue-200 bg-blue-50/50",
      dot: "bg-blue-500",
      title: "text-blue-800",
    },
    amber: {
      card: "border-amber-200 bg-amber-50/50",
      dot: "bg-amber-500",
      title: "text-amber-800",
    },
  };

  const scheme = colorMap[color];

  return (
    <div className={`rounded-lg border p-3 ${scheme.card}`}>
      <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${scheme.title}`}>
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-foreground/80"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${scheme.dot}`}
              />
              {typeof item === "string" ? item : safeDisplay(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          Aucune donnée
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MiniSwotGrid — compact 2x2 SWOT for micro-SWOTs
// ---------------------------------------------------------------------------

export function MiniSwotGrid({
  strengths,
  weaknesses,
  opportunities,
  threats,
}: {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}) {
  const quadrants = [
    { label: "S", items: strengths, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    { label: "W", items: weaknesses, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    { label: "O", items: opportunities, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    { label: "T", items: threats, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {quadrants.map((q) => (
        <div key={q.label} className={`rounded-md border ${q.border} ${q.bg} p-2`}>
          <p className={`text-[10px] font-bold ${q.text}`}>{q.label}</p>
          {q.items.length > 0 ? (
            <ul className="mt-0.5 space-y-0.5">
              {q.items.map((item, i) => (
                <li key={i} className="text-[11px] leading-tight text-foreground/70">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-0.5 text-[10px] italic text-muted-foreground">\u2014</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RiskLevelBadge — colored badge for low/medium/high
// ---------------------------------------------------------------------------

export function RiskLevelBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-800 border-emerald-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };
  const labelMap: Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorMap[level] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {labelMap[level] ?? level}
    </span>
  );
}

// ---------------------------------------------------------------------------
// UrgencyBadge — colored badge for urgency levels
// ---------------------------------------------------------------------------

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const colorMap: Record<string, string> = {
    immediate: "bg-red-100 text-red-800 border-red-200",
    short_term: "bg-amber-100 text-amber-800 border-amber-200",
    medium_term: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const labelMap: Record<string, string> = {
    immediate: "Immédiat",
    short_term: "Court terme",
    medium_term: "Moyen terme",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorMap[urgency] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {labelMap[urgency] ?? urgency}
    </span>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge — for hypothesis validation status
// ---------------------------------------------------------------------------

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    validated: "bg-emerald-100 text-emerald-800 border-emerald-200",
    invalidated: "bg-red-100 text-red-800 border-red-200",
    to_test: "bg-amber-100 text-amber-800 border-amber-200",
  };
  const labelMap: Record<string, string> = {
    validated: "Validée",
    invalidated: "Invalidée",
    to_test: "À tester",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${colorMap[status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {labelMap[status] ?? status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PillarContentDisplay — fallback for string/object/missing content
// ---------------------------------------------------------------------------

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
}

export function PillarContentDisplay({ pillar }: { pillar?: PillarData | null }) {
  if (!pillar) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
        <Layers className="mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Données non disponibles.
        </p>
      </div>
    );
  }

  if (pillar.status !== "complete") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
        <Layers className="mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Ce pilier n&apos;a pas encore été généré.
        </p>
      </div>
    );
  }

  // If string content — render as prose with basic formatting
  if (typeof pillar.content === "string") {
    return (
      <div className="space-y-2">
        {pillar.content.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={i} className="mt-3 text-sm font-semibold">
                {trimmed.replace(/^###\s*/, "")}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={i} className="mt-4 text-base font-semibold">
                {trimmed.replace(/^##\s*/, "")}
              </h3>
            );
          }

          if (trimmed.startsWith("- ") || trimmed.startsWith("\u2022 ")) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                <span className="text-foreground/80">
                  {trimmed.replace(/^[-\u2022]\s*/, "")}
                </span>
              </div>
            );
          }

          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <p key={i} className="mt-2 text-sm font-semibold">
                {trimmed.replace(/^\*\*|\*\*$/g, "")}
              </p>
            );
          }

          return (
            <p key={i} className="text-sm leading-relaxed text-foreground/80">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  }

  // Object content — render as structured key-value display
  if (typeof pillar.content === "object" && pillar.content !== null) {
    const obj = pillar.content as Record<string, unknown>;
    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([key, val]) => {
          if (val == null) return null;

          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase())
            .trim();

          if (Array.isArray(val)) {
            if (val.length === 0) return null;

            if (typeof val[0] === "string") {
              return (
                <div key={key}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <div className="space-y-1">
                    {(val as string[]).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 pl-1 text-sm"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={key}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(val as Record<string, unknown>[]).map((item, i) => (
                    <div key={i} className="rounded-md border bg-muted/20 px-3 py-2">
                      {Object.entries(item).map(([k, v]) => (
                        <p key={k} className="text-xs">
                          <span className="font-medium text-muted-foreground">
                            {k}:{" "}
                          </span>
                          <span>{safeDisplay(v)}</span>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (typeof val === "object") {
            const nested = val as Record<string, unknown>;
            return (
              <div key={key}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <div className="rounded-md border bg-muted/20 px-3 py-2">
                  {Object.entries(nested).map(([k, v]) => (
                    <p key={k} className="text-xs">
                      <span className="font-medium text-muted-foreground">
                        {k}:{" "}
                      </span>
                      <span>
                        {Array.isArray(v) ? v.map(safeDisplay).filter(Boolean).join(", ") : safeDisplay(v)}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {label} :
              </span>
              <span className="text-sm text-foreground/80">
                {safeDisplay(val)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
      <Layers className="mb-2 h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">
        Format de contenu non reconnu.
      </p>
    </div>
  );
}
