// =============================================================================
// COMPONENT C.K5 — Section Engagement
// =============================================================================
// Pillar E cockpit display: Engagement strategy.
// Props: eContent (EngagementPillarData), implContent, pillar, vertical.
// Key features: AARRR funnel (5 stages), typed touchpoints (physique/digital/
// humain), rituels with frequency badges, community principles & tabous,
// gamification levels with rewards, KPI cards with targets and frequency.
// Falls back to implContent.engagementStrategy.
// =============================================================================

// Section Engagement (Pillar E) — Touchpoints, Rituels, AARRR, Communaute, Gamification, KPIs

import {
  Users,
  Gauge,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import type { ImplementationData } from "~/lib/types/implementation-data";
import {
  CockpitSection,
  DataCard,
  PillarContentDisplay,
} from "../cockpit-shared";

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
  updatedAt?: Date | string | null;
}

const COLOR = PILLAR_CONFIG.E.color; // #3c7ac4

export function SectionEngagement({
  eContent,
  implContent,
  pillar,
  vertical,
}: {
  eContent: EngagementPillarData;
  implContent: ImplementationData;
  pillar?: PillarData | null;
  vertical?: string | null;
}) {
  // ---------------------------------------------------------------------------
  // Primary: Full EngagementPillarSchema data
  // ---------------------------------------------------------------------------
  const hasFullData =
    (eContent?.aarrr?.acquisition || eContent?.aarrr?.activation) ||
    (Array.isArray(eContent?.touchpoints) && eContent.touchpoints.length > 0) ||
    (Array.isArray(eContent?.rituels) && eContent.rituels.length > 0) ||
    (Array.isArray(eContent?.gamification) && eContent.gamification.length > 0) ||
    (Array.isArray(eContent?.kpis) && eContent.kpis.length > 0);

  // ---------------------------------------------------------------------------
  // Fallback: implContent.engagementStrategy
  // ---------------------------------------------------------------------------
  const hasFallbackData =
    implContent?.engagementStrategy?.aarrr?.acquisition ||
    (Array.isArray(implContent?.engagementStrategy?.touchpoints) && implContent.engagementStrategy.touchpoints.length > 0) ||
    (Array.isArray(implContent?.engagementStrategy?.kpis) && implContent.engagementStrategy.kpis.length > 0) ||
    (Array.isArray(implContent?.engagementStrategy?.rituals) && implContent.engagementStrategy.rituals.length > 0);

  return (
    <CockpitSection
      icon={<Users className="h-5 w-5" />}
      pillarLetter="E"
      title="Engagement"
      subtitle="Touchpoints, Rituels, AARRR, Communauté"
      color={COLOR}
      updatedAt={pillar?.updatedAt}
      vertical={vertical}
    >
      {hasFullData ? (
        <div className="space-y-5">
          {/* 1. AARRR Funnel */}
          {eContent.aarrr && (eContent.aarrr.acquisition || eContent.aarrr.activation || eContent.aarrr.retention || eContent.aarrr.revenue || eContent.aarrr.referral) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Funnel AARRR
              </p>
              <div className="space-y-2">
                {[
                  { key: "acquisition" as const, label: "Acquisition", icon: "\uD83C\uDFAF" },
                  { key: "activation" as const, label: "Activation", icon: "\u26A1" },
                  { key: "retention" as const, label: "Rétention", icon: "\uD83D\uDD04" },
                  { key: "revenue" as const, label: "Revenue", icon: "\uD83D\uDCB0" },
                  { key: "referral" as const, label: "Referral", icon: "\uD83D\uDCE3" },
                ].map((step) => {
                  const value = eContent.aarrr[step.key];
                  if (!value) return null;
                  return (
                    <div key={step.key} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2">
                      <span className="mt-0.5 text-base">{step.icon}</span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{step.label}</span>
                        <p className="text-sm">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Touchpoints */}
          {Array.isArray(eContent.touchpoints) && eContent.touchpoints.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Touchpoints
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {eContent.touchpoints.map((tp, i) => {
                  const typeBadgeColors: Record<string, string> = {
                    physique: "bg-amber-100 text-amber-800 border-amber-200",
                    digital: "bg-blue-100 text-blue-800 border-blue-200",
                    humain: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  };
                  return (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: COLOR }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold">{tp.canal}</span>
                        <span
                          className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${typeBadgeColors[tp.type] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}
                        >
                          {tp.type}
                        </span>
                      </div>
                      {tp.role && (
                        <p className="mt-1 text-xs text-muted-foreground">{tp.role}</p>
                      )}
                      {tp.priorite > 0 && (
                        <p className="mt-1 text-xs text-[#3c7ac4]">{"\u2726"} Priorité {tp.priorite}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Rituels */}
          {Array.isArray(eContent.rituels) && eContent.rituels.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rituels
              </p>
              <div className="space-y-2">
                {eContent.rituels.map((r, i) => {
                  const rituelTypeBadge: Record<string, string> = {
                    "always-on": "bg-emerald-100 text-emerald-800 border-emerald-200",
                    cyclique: "bg-violet-100 text-violet-800 border-violet-200",
                  };
                  return (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{r.nom}</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rituelTypeBadge[r.type] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}
                        >
                          {r.type}
                        </span>
                        {r.frequence && (
                          <span className="inline-flex items-center rounded-full border bg-blue-50 border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                            {r.frequence}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Principes Communautaires — Principes */}
          {eContent.principesCommunautaires?.principes && eContent.principesCommunautaires.principes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Principes communautaires
              </p>
              <div className="space-y-1.5">
                {eContent.principesCommunautaires.principes.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm text-foreground/80">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4b. Principes Communautaires — Tabous */}
          {eContent.principesCommunautaires?.tabous && eContent.principesCommunautaires.tabous.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tabous
              </p>
              <div className="space-y-1.5">
                {eContent.principesCommunautaires.tabous.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/50 px-3 py-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-sm text-foreground/80">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Gamification */}
          {Array.isArray(eContent.gamification) && eContent.gamification.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gamification
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {eContent.gamification.map((g, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: COLOR }}
                      >
                        {g.niveau}
                      </span>
                      <span className="text-sm font-semibold">{g.nom}</span>
                    </div>
                    {g.condition && (
                      <p className="mt-1 text-xs text-muted-foreground">{g.condition}</p>
                    )}
                    {g.recompense && (
                      <p className="mt-1 text-xs text-[#3c7ac4]">{"\uD83C\uDFC6"} {g.recompense}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. KPIs */}
          {Array.isArray(eContent.kpis) && eContent.kpis.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                KPIs
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {eContent.kpis.map((kpi, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {kpi.variable || kpi.nom}
                      </p>
                    </div>
                    {kpi.nom && kpi.variable && (
                      <p className="text-sm font-semibold">{kpi.nom}</p>
                    )}
                    {kpi.cible && (
                      <p className="text-xs text-foreground/80">Cible : {kpi.cible}</p>
                    )}
                    {kpi.frequence && (
                      <p className="text-xs text-muted-foreground">Fréquence : {kpi.frequence}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : hasFallbackData ? (
        /* ------------------------------------------------------------------- */
        /* Fallback: implContent.engagementStrategy                            */
        /* ------------------------------------------------------------------- */
        <div className="space-y-5">
          {/* Fallback AARRR */}
          {implContent.engagementStrategy.aarrr && (implContent.engagementStrategy.aarrr.acquisition || implContent.engagementStrategy.aarrr.activation) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Funnel AARRR
              </p>
              <div className="space-y-2">
                {[
                  { key: "acquisition" as const, label: "Acquisition", icon: "\uD83C\uDFAF" },
                  { key: "activation" as const, label: "Activation", icon: "\u26A1" },
                  { key: "retention" as const, label: "Rétention", icon: "\uD83D\uDD04" },
                  { key: "revenue" as const, label: "Revenue", icon: "\uD83D\uDCB0" },
                  { key: "referral" as const, label: "Referral", icon: "\uD83D\uDCE3" },
                ].map((step) => {
                  const value = implContent.engagementStrategy.aarrr[step.key];
                  if (!value) return null;
                  return (
                    <div key={step.key} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2">
                      <span className="mt-0.5 text-base">{step.icon}</span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{step.label}</span>
                        <p className="text-sm">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback Touchpoints */}
          {Array.isArray(implContent.engagementStrategy.touchpoints) && implContent.engagementStrategy.touchpoints.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Touchpoints
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {implContent.engagementStrategy.touchpoints.map((tp, i) => (
                  <DataCard
                    key={i}
                    icon={<Users className="h-4 w-4" />}
                    label={tp.channel || `Touchpoint ${i + 1}`}
                    value={`${tp.role}${tp.priority ? ` (priorité ${tp.priority})` : ""}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fallback Rituals */}
          {Array.isArray(implContent.engagementStrategy.rituals) && implContent.engagementStrategy.rituals.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rituels
              </p>
              <div className="space-y-2">
                {implContent.engagementStrategy.rituals.map((r, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{r.name}</span>
                      {r.frequency && (
                        <span className="inline-flex items-center rounded-full border bg-blue-50 border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                          {r.frequency}
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback KPIs */}
          {Array.isArray(implContent.engagementStrategy.kpis) && implContent.engagementStrategy.kpis.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                KPIs
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {implContent.engagementStrategy.kpis.map((kpi, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {kpi.name}
                      </p>
                    </div>
                    {kpi.target && (
                      <p className="text-xs text-foreground/80">Cible : {kpi.target}</p>
                    )}
                    {kpi.frequency && (
                      <p className="text-xs text-muted-foreground">Fréquence : {kpi.frequency}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* Final fallback: PillarContentDisplay                                */
        /* ------------------------------------------------------------------- */
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
