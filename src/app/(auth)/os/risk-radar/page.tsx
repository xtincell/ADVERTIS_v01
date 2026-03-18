// ==========================================================================
// PAGE P.OS8 — Brand OS / Risk Radar
// Brand protection — crisis early warning, reputation monitoring.
// Connects to Signal Intelligence System for real-time risk data.
// ==========================================================================

"use client";

import { Suspense, useMemo } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Activity,
  RotateCcw,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { EmptyState } from "~/components/ui/empty-state";
import { PageSpinner } from "~/components/ui/loading-skeleton";

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  ALERT: { label: "Critique", color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: ShieldAlert },
  WATCH: { label: "Surveillance", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  MONITOR: { label: "Suivi", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: Activity },
  RESOLVED: { label: "Résolu", color: "text-green-600", bgColor: "bg-green-50 border-green-200", icon: Shield },
};

function getSeverityConfig(status: string) {
  return SEVERITY_CONFIG[status] ?? SEVERITY_CONFIG.MONITOR!;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function RiskRadarContent() {
  const brandId = useBrandId();

  const { data: signals, isLoading, isError, refetch } =
    api.signal.getByStrategy.useQuery(
      { strategyId: brandId! },
      { enabled: !!brandId },
    );

  // Filter risk-relevant signals (WEAK signals and any in ALERT/WATCH/CRITICAL/WARNING status)
  const riskSignals = useMemo(() => {
    if (!signals) return [];
    return signals.filter(
      (s) =>
        s.layer === "WEAK" ||
        s.status === "CRITICAL" ||
        s.status === "WARNING" ||
        s.status === "WATCH" ||
        s.status === "DECLINING",
    );
  }, [signals]);

  // Map signal statuses to severity levels
  function toSeverity(status: string): "ALERT" | "WATCH" | "MONITOR" | "RESOLVED" {
    if (status === "CRITICAL") return "ALERT";
    if (status === "WARNING" || status === "WATCH" || status === "DECLINING") return "WATCH";
    if (status === "HEALTHY" || status === "ACTIVE") return "RESOLVED";
    return "MONITOR";
  }

  // Severity counts
  const counts = useMemo(() => {
    const c = { ALERT: 0, WATCH: 0, MONITOR: 0, RESOLVED: 0 };
    for (const s of riskSignals) {
      c[toSeverity(s.status)]++;
    }
    return c;
  }, [riskSignals]);

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (isLoading) return <PageSpinner />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Impossible de charger les données de risque</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" /> Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Risk Radar</h1>
        <p className="text-sm text-muted-foreground">Veille & protection de la marque</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["ALERT", "WATCH", "MONITOR", "RESOLVED"] as const).map((level) => {
          const config = getSeverityConfig(level);
          const Icon = config.icon;
          return (
            <Card key={level} className={`${config.bgColor} border`}>
              <CardContent className="py-4 text-center">
                <Icon className={`h-5 w-5 mx-auto mb-1 ${config.color}`} />
                <p className={`text-2xl font-bold ${config.color}`}>{counts[level]}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {config.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signal List */}
      {riskSignals.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Aucun risque détecté"
          description="Lancez des audits T et R pour détecter les risques et signaux faibles de votre marque."
        />
      ) : (
        <div className="space-y-3">
          {riskSignals.map((signal) => {
            const severity = toSeverity(signal.status);
            const config = getSeverityConfig(severity);
            const Icon = config.icon;
            return (
              <Card key={signal.id} className="overflow-hidden">
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={`rounded-lg p-2 ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{signal.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {signal.layer}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Pilier {signal.pillar}
                      </Badge>
                    </div>
                    {signal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {signal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <Badge variant="secondary" className={`text-[10px] ${config.color}`}>
                        {config.label}
                      </Badge>
                      <span className="capitalize">{signal.status.toLowerCase()}</span>
                      <span>
                        {new Date(signal.updatedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RiskRadarPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <RiskRadarContent />
    </Suspense>
  );
}
