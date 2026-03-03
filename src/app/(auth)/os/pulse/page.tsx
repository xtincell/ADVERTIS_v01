// ==========================================================================
// PAGE P.OS2 — Brand OS / Pulse
// Community health monitoring in real-time.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";

function PulseContent() {
  const brandId = useBrandId();

  const { data: health } = api.brandOS.getCommunityHealth.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const { data: history } = api.brandOS.getCommunityHistory.useQuery(
    { strategyId: brandId!, period: "DAILY", limit: 30 },
    { enabled: !!brandId },
  );

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  const metrics = [
    { label: "Santé globale", value: health?.healthScore, max: 100, color: "#22c55e", suffix: "/100" },
    { label: "Croissance", value: health?.growthRate ? (health.growthRate * 100) : null, max: null, color: "#3b82f6", suffix: "%" },
    { label: "Rétention", value: health?.retentionRate ? (health.retentionRate * 100) : null, max: 100, color: "#8b5cf6", suffix: "%" },
    { label: "Activité", value: health?.activityRate ? (health.activityRate * 100) : null, max: 100, color: "#f59e0b", suffix: "%" },
    { label: "Sentiment", value: health?.sentimentAvg ? (health.sentimentAvg * 100) : null, max: 100, color: health?.sentimentAvg && health.sentimentAvg > 0 ? "#22c55e" : "#ef4444", suffix: "" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Pulse</h1>
        <p className="text-sm text-muted-foreground">Santé de la communauté en temps réel</p>
      </div>

      {/* Health Score Hero */}
      {health && (
        <div className="flex justify-center py-4">
          <div className="text-center">
            <p className="text-6xl font-black tabular-nums" style={{
              color: health.healthScore > 70 ? "#22c55e" : health.healthScore > 40 ? "#f59e0b" : "#ef4444",
            }}>
              {Math.round(health.healthScore)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Community Health Score</p>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/30 p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{m.label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: m.color }}>
              {m.value != null ? `${m.value.toFixed(1)}${m.suffix}` : "—"}
            </p>
            {m.max && m.value != null && (
              <div className="h-1 mt-2 rounded-full bg-muted-foreground/10">
                <div
                  className="h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(100, m.value)}%`, backgroundColor: m.color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Volume metrics */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase">Membres totaux</p>
            <p className="text-2xl font-bold tabular-nums">{health.totalMembers.toLocaleString("fr-FR")}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase">Actifs (7j)</p>
            <p className="text-2xl font-bold tabular-nums">{health.activeMembersD7.toLocaleString("fr-FR")}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase">Mentions</p>
            <p className="text-2xl font-bold tabular-nums">{health.mentionCount.toLocaleString("fr-FR")}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] text-muted-foreground uppercase">Conversations</p>
            <p className="text-2xl font-bold tabular-nums">{health.conversationVol.toLocaleString("fr-FR")}</p>
          </div>
        </div>
      )}

      {/* Topic clusters */}
      {health?.topTopics && Array.isArray(health.topTopics) && (
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Sujets de conversation
          </h3>
          <div className="flex flex-wrap gap-2">
            {(health.topTopics as Array<{ topic: string; volume: number; sentiment: number }>).map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border/30"
                style={{
                  backgroundColor: t.sentiment > 0 ? "rgba(34,197,94,0.1)" : t.sentiment < 0 ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.1)",
                }}
              >
                {t.topic}
                <span className="ml-1.5 text-xs text-muted-foreground">{t.volume}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Crisis signals */}
      {health?.toxicityLevel != null && health.toxicityLevel > 0.3 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="text-sm font-semibold text-red-500 mb-1">Alerte toxicité</h3>
          <p className="text-xs text-muted-foreground">
            Niveau de toxicité: {(health.toxicityLevel * 100).toFixed(0)}% — surveillance renforcée recommandée.
          </p>
        </div>
      )}

      {/* History placeholder */}
      {history && history.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Évolution (30 derniers jours)
          </h3>
          <div className="flex items-end gap-1 h-24">
            {[...history].reverse().map((snap, i) => (
              <div
                key={snap.id}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${snap.healthScore}%`,
                  backgroundColor: snap.healthScore > 70 ? "#22c55e40" : snap.healthScore > 40 ? "#f59e0b40" : "#ef444440",
                }}
                title={`${snap.healthScore.toFixed(0)} — ${new Date(snap.periodStart).toLocaleDateString("fr-FR")}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PulsePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <PulseContent />
    </Suspense>
  );
}
