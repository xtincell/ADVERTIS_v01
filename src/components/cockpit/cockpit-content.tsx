"use client";

import {
  Target,
  Shield,
  TrendingUp,
  Users,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Rocket,
  FileText,
  Award,
  Compass,
  MessageCircle,
  Zap,
  Crown,
  Layers,
  Eye,
  Heart,
  Star,
  ArrowUpRight,
  Gauge,
  CircleDot,
  Calendar,
  DollarSign,
  UserPlus,
  Flag,
  BookOpen,
  Wrench,
  CheckCircle2,
  Clock,
  Megaphone,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
  EngagementPillarData,
} from "~/lib/types/pillar-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarData {
  type: string;
  title: string;
  status: string;
  summary: string | null;
  content: unknown;
}

interface DocumentData {
  id: string;
  type: string;
  title: string;
  status: string;
  pageCount: number | null;
  sections?: unknown;
}

export interface CockpitData {
  brandName: string;
  name: string;
  sector: string | null;
  description: string | null;
  phase: string;
  coherenceScore: number | null;
  pillars: PillarData[];
  documents: DocumentData[];
}

// ---------------------------------------------------------------------------
// Score Helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

function getScoreBorderColor(score: number): string {
  if (score >= 80) return "border-emerald-300 bg-emerald-50";
  if (score >= 60) return "border-blue-300 bg-blue-50";
  if (score >= 40) return "border-amber-300 bg-amber-50";
  if (score >= 20) return "border-orange-300 bg-orange-50";
  return "border-red-300 bg-red-50";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  if (score >= 40) return "Moyen";
  if (score >= 20) return "Faible";
  return "Critique";
}

/** Safely display an unknown value — avoids "[object Object]" and "undefined" */
function safeDisplay(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

/** Safely convert unknown to a number, returns NaN-safe fallback */
function safeNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Risque élevé", color: "text-red-600" };
  if (score >= 50) return { label: "Risque modéré", color: "text-amber-600" };
  if (score >= 25) return { label: "Risque faible", color: "text-blue-600" };
  return { label: "Risque minimal", color: "text-emerald-600" };
}

// ---------------------------------------------------------------------------
// Main Cockpit Content
// ---------------------------------------------------------------------------

export function CockpitContent({
  data,
  isPublic = false,
}: {
  data: CockpitData;
  isPublic?: boolean;
}) {
  const getPillar = (type: string) =>
    data.pillars.find((p) => p.type === type);

  const getContent = (type: string): Record<string, unknown> | null => {
    const pillar = getPillar(type);
    if (!pillar?.content) return null;
    if (typeof pillar.content === "object")
      return pillar.content as Record<string, unknown>;
    try {
      return JSON.parse(pillar.content as string) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  // Try reading structured pillar data from each pillar directly
  const aContent = getContent("A") as AuthenticitePillarData | null;
  const dContent = getContent("D") as DistinctionPillarData | null;
  const vContent = getContent("V") as ValeurPillarData | null;
  const eContent = getContent("E") as EngagementPillarData | null;

  const riskContent = getContent("R");
  const trackContent = getContent("T");

  // ImplementationData from Pillar I (structured data for cockpit)
  const implContent = getContent("I") as ImplementationData | null;
  const coherenceScore = implContent?.coherenceScore ?? data.coherenceScore;

  return (
    <div className="space-y-8">
      {/* ─── Brand Overview ─── */}
      <section className="relative">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-1.5">
            <Crown className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-xs font-medium text-terracotta">
              Cockpit Stratégique
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.brandName}
          </h1>
          {data.name !== data.brandName && (
            <p className="text-lg text-muted-foreground">{data.name}</p>
          )}
          {data.sector && (
            <p className="mt-1 text-sm text-muted-foreground">
              Secteur : {data.sector}
            </p>
          )}
          {data.description && (
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>

        {/* Coherence Score + Executive Summary */}
        <div className="mx-auto max-w-2xl">
          {coherenceScore !== null && coherenceScore !== undefined && (
            <div className="flex flex-col items-center">
              <div
                className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 ${getScoreBorderColor(coherenceScore)}`}
              >
                <span
                  className={`text-3xl font-bold ${getScoreColor(coherenceScore)}`}
                >
                  {coherenceScore}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  / 100
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">Score de Cohérence</p>
              <span
                className={`mt-0.5 text-xs font-medium ${getScoreColor(coherenceScore)}`}
              >
                {getScoreLabel(coherenceScore)}
              </span>
            </div>
          )}

          {implContent?.executiveSummary && (
            <div className="mt-6 rounded-xl border bg-muted/30 px-6 py-4">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Résumé exécutif
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                {implContent.executiveSummary}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Brand DNA (Pillar A) — Authenticité ─── */}
      <CockpitSection
        icon={<Lightbulb className="h-5 w-5" />}
        pillarLetter="A"
        title="ADN de Marque"
        subtitle="Authenticité — Identité, Valeurs, Raison d'être"
        color={PILLAR_CONFIG.A.color}
      >
        {aContent?.identite ? (
          <div className="space-y-5">
            {/* Archetype + Noyau identitaire */}
            {aContent.identite.archetype && (
              <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-[#c45a3c]/5 to-transparent p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c45a3c]/10">
                  <Star className="h-4 w-4 text-[#c45a3c]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Archétype de marque
                  </p>
                  <p className="mt-0.5 text-base font-semibold">
                    {aContent.identite.archetype}
                  </p>
                  {aContent.identite.noyauIdentitaire && (
                    <p className="mt-1 text-sm text-foreground/80">
                      {aContent.identite.noyauIdentitaire}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Citation fondatrice */}
            {aContent.identite.citationFondatrice && (
              <div className="rounded-lg border-l-4 border-[#c45a3c]/30 bg-muted/30 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Citation fondatrice
                </p>
                <p className="text-sm italic leading-relaxed text-foreground/80">
                  &ldquo;{aContent.identite.citationFondatrice}&rdquo;
                </p>
              </div>
            )}

            {/* Ikigai */}
            {aContent.ikigai && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ikigai de marque
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aContent.ikigai.aimer && (
                    <DataCard icon={<Heart className="h-4 w-4" />} label="Ce que la marque aime" value={aContent.ikigai.aimer} />
                  )}
                  {aContent.ikigai.competence && (
                    <DataCard icon={<Star className="h-4 w-4" />} label="Compétence clé" value={aContent.ikigai.competence} />
                  )}
                  {aContent.ikigai.besoinMonde && (
                    <DataCard icon={<Compass className="h-4 w-4" />} label="Besoin du monde" value={aContent.ikigai.besoinMonde} />
                  )}
                  {aContent.ikigai.remuneration && (
                    <DataCard icon={<DollarSign className="h-4 w-4" />} label="Rémunération" value={aContent.ikigai.remuneration} />
                  )}
                </div>
              </div>
            )}

            {/* Hero's Journey */}
            {aContent.herosJourney && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parcours du héros
                </p>
                <div className="space-y-2">
                  {[
                    { key: "acte1Origines", label: "Origines", icon: "🌱" },
                    { key: "acte2Appel", label: "L'appel", icon: "📢" },
                    { key: "acte3Epreuves", label: "Les épreuves", icon: "⚔️" },
                    { key: "acte4Transformation", label: "Transformation", icon: "🦋" },
                    { key: "acte5Revelation", label: "Révélation", icon: "✨" },
                  ].map((step) => {
                    const value = aContent.herosJourney[step.key as keyof typeof aContent.herosJourney];
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

            {/* Values */}
            {Array.isArray(aContent.valeurs) && aContent.valeurs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Valeurs fondamentales
                </p>
                <div className="space-y-2">
                  {aContent.valeurs.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c45a3c]/10 text-xs font-bold text-[#c45a3c]">
                        {v.rang ?? i + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{v.valeur}</span>
                        {v.justification && (
                          <p className="text-xs text-muted-foreground">{v.justification}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community hierarchy */}
            {Array.isArray(aContent.hierarchieCommunautaire) && aContent.hierarchieCommunautaire.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hiérarchie communautaire
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {aContent.hierarchieCommunautaire.map((h, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c45a3c]/10 text-xs font-bold text-[#c45a3c]">
                          {h.niveau}
                        </div>
                        <span className="text-sm font-semibold">{h.nom}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{h.description}</p>
                      {h.privileges && (
                        <p className="mt-1 text-xs text-[#c45a3c]">✦ {h.privileges}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline narrative */}
            {aContent.timelineNarrative && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeline narrative
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aContent.timelineNarrative.origines && (
                    <DataCard icon={<Clock className="h-4 w-4" />} label="Origines" value={aContent.timelineNarrative.origines} />
                  )}
                  {aContent.timelineNarrative.croissance && (
                    <DataCard icon={<TrendingUp className="h-4 w-4" />} label="Croissance" value={aContent.timelineNarrative.croissance} />
                  )}
                  {aContent.timelineNarrative.pivot && (
                    <DataCard icon={<Zap className="h-4 w-4" />} label="Pivot" value={aContent.timelineNarrative.pivot} />
                  )}
                  {aContent.timelineNarrative.futur && (
                    <DataCard icon={<Eye className="h-4 w-4" />} label="Vision future" value={aContent.timelineNarrative.futur} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : implContent?.brandIdentity ? (
          <div className="space-y-5">
            {implContent.brandIdentity.archetype && (
              <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-[#c45a3c]/5 to-transparent p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c45a3c]/10">
                  <Star className="h-4 w-4 text-[#c45a3c]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Archétype de marque</p>
                  <p className="mt-0.5 text-base font-semibold">{implContent.brandIdentity.archetype}</p>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {implContent.brandIdentity.purpose && (
                <DataCard icon={<Compass className="h-4 w-4" />} label="Raison d'être" value={implContent.brandIdentity.purpose} />
              )}
              {implContent.brandIdentity.vision && (
                <DataCard icon={<Eye className="h-4 w-4" />} label="Vision" value={implContent.brandIdentity.vision} />
              )}
            </div>
            {Array.isArray(implContent.brandIdentity.values) && implContent.brandIdentity.values.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valeurs fondamentales</p>
                <div className="flex flex-wrap gap-2">
                  {implContent.brandIdentity.values.map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-[#c45a3c]/20 bg-[#c45a3c]/5 px-3 py-1 text-sm font-medium">
                      <Heart className="h-3 w-3 text-[#c45a3c]" />{v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {implContent.brandIdentity.narrative && (
              <div className="rounded-lg border-l-4 border-[#c45a3c]/30 bg-muted/30 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récit de marque</p>
                <p className="text-sm italic leading-relaxed text-foreground/80">{implContent.brandIdentity.narrative}</p>
              </div>
            )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("A")} />
        )}
      </CockpitSection>

      {/* ─── Positioning (Pillar D) — Distinction ─── */}
      <CockpitSection
        icon={<Target className="h-5 w-5" />}
        pillarLetter="D"
        title="Positionnement & Distinction"
        subtitle="Personas, Promesses, Identité visuelle"
        color={PILLAR_CONFIG.D.color}
      >
        {dContent?.positionnement ? (
          <div className="space-y-5">
            {/* Positioning statement */}
            {dContent.positionnement && (
              <div className="rounded-lg border-l-4 border-[#2d5a3d]/30 bg-[#2d5a3d]/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Déclaration de positionnement
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {dContent.positionnement}
                </p>
              </div>
            )}

            {/* Brand promises */}
            {dContent.promessesDeMarque && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promesses de marque
                </p>
                {dContent.promessesDeMarque.promesseMaitre && (
                  <div className="mb-2 flex items-start gap-2 rounded-md border bg-[#2d5a3d]/5 px-3 py-2">
                    <Crown className="mt-0.5 h-4 w-4 shrink-0 text-[#2d5a3d]" />
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Promesse maître</span>
                      <p className="text-sm font-medium">{dContent.promessesDeMarque.promesseMaitre}</p>
                    </div>
                  </div>
                )}
                {Array.isArray(dContent.promessesDeMarque.sousPromesses) && dContent.promessesDeMarque.sousPromesses.length > 0 && (
                  <div className="space-y-1.5">
                    {dContent.promessesDeMarque.sousPromesses.map((sp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2d5a3d]" />
                        <span>{sp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tone of Voice */}
            {dContent.tonDeVoix && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ton de voix
                </p>
                {dContent.tonDeVoix.personnalite && (
                  <DataCard icon={<MessageCircle className="h-4 w-4" />} label="Personnalité" value={dContent.tonDeVoix.personnalite} />
                )}
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {Array.isArray(dContent.tonDeVoix.onDit) && dContent.tonDeVoix.onDit.length > 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <p className="mb-1.5 text-xs font-bold uppercase text-emerald-800">✓ On dit</p>
                      <ul className="space-y-1">
                        {dContent.tonDeVoix.onDit.map((item, i) => (
                          <li key={i} className="text-xs text-foreground/80">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(dContent.tonDeVoix.onNeditPas) && dContent.tonDeVoix.onNeditPas.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                      <p className="mb-1.5 text-xs font-bold uppercase text-red-800">✗ On ne dit pas</p>
                      <ul className="space-y-1">
                        {dContent.tonDeVoix.onNeditPas.map((item, i) => (
                          <li key={i} className="text-xs text-foreground/80">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personas */}
            {Array.isArray(dContent.personas) && dContent.personas.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personas cibles
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dContent.personas.map((p, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d5a3d]/10 text-xs font-bold text-[#2d5a3d]">
                          {p.priorite ?? i + 1}
                        </div>
                        <span className="text-sm font-semibold">{p.nom}</span>
                      </div>
                      {p.demographie && <p className="mt-1 text-xs text-muted-foreground">{p.demographie}</p>}
                      {p.psychographie && <p className="mt-0.5 text-xs text-muted-foreground">{p.psychographie}</p>}
                      {p.motivations && <p className="mt-0.5 text-xs text-emerald-700">↑ {p.motivations}</p>}
                      {p.freins && <p className="mt-0.5 text-xs text-red-600">↓ {p.freins}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive landscape */}
            {dContent.paysageConcurrentiel?.concurrents && Array.isArray(dContent.paysageConcurrentiel.concurrents) && dContent.paysageConcurrentiel.concurrents.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paysage concurrentiel
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {dContent.paysageConcurrentiel.concurrents.map((c, i) => (
                    <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
                      <span className="text-xs font-semibold">{c.nom}</span>
                      {c.forces && <p className="text-[11px] text-emerald-700">+ {c.forces}</p>}
                      {c.faiblesses && <p className="text-[11px] text-red-600">− {c.faiblesses}</p>}
                      {c.partDeMarche && <p className="text-[11px] text-muted-foreground">PDM: {c.partDeMarche}</p>}
                    </div>
                  ))}
                </div>
                {Array.isArray(dContent.paysageConcurrentiel.avantagesCompetitifs) && dContent.paysageConcurrentiel.avantagesCompetitifs.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Avantages compétitifs</p>
                    <div className="flex flex-wrap gap-2">
                      {dContent.paysageConcurrentiel.avantagesCompetitifs.map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[#2d5a3d]/20 bg-[#2d5a3d]/5 px-2.5 py-0.5 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3 text-[#2d5a3d]" />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual identity */}
            {dContent.identiteVisuelle && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Identité visuelle
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dContent.identiteVisuelle.directionArtistique && (
                    <DataCard icon={<Eye className="h-4 w-4" />} label="Direction artistique" value={dContent.identiteVisuelle.directionArtistique} />
                  )}
                  {dContent.identiteVisuelle.mood && (
                    <DataCard icon={<Lightbulb className="h-4 w-4" />} label="Mood" value={dContent.identiteVisuelle.mood} />
                  )}
                </div>
                {Array.isArray(dContent.identiteVisuelle.paletteCouleurs) && dContent.identiteVisuelle.paletteCouleurs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dContent.identiteVisuelle.paletteCouleurs.map((c, i) => (
                      <span key={i} className="rounded-full border bg-muted/30 px-3 py-0.5 text-xs font-medium">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Linguistic assets */}
            {dContent.assetsLinguistiques && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.isArray(dContent.assetsLinguistiques.mantras) && dContent.assetsLinguistiques.mantras.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mantras</p>
                    <div className="space-y-1">
                      {dContent.assetsLinguistiques.mantras.map((m, i) => (
                        <p key={i} className="text-sm italic text-foreground/80">&ldquo;{m}&rdquo;</p>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(dContent.assetsLinguistiques.vocabulaireProprietaire) && dContent.assetsLinguistiques.vocabulaireProprietaire.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vocabulaire propriétaire</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dContent.assetsLinguistiques.vocabulaireProprietaire.map((v, i) => (
                        <span key={i} className="rounded-full border bg-muted/30 px-2.5 py-0.5 text-xs font-medium">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : implContent?.positioning ? (
          <div className="space-y-5">
            {implContent.positioning.statement && (
              <div className="rounded-lg border-l-4 border-[#2d5a3d]/30 bg-[#2d5a3d]/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Déclaration de positionnement</p>
                <p className="text-sm font-medium leading-relaxed">{implContent.positioning.statement}</p>
              </div>
            )}
            {Array.isArray(implContent.positioning.differentiators) && implContent.positioning.differentiators.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Différenciateurs clés</p>
                <div className="space-y-1.5">
                  {implContent.positioning.differentiators.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2d5a3d]" /><span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {implContent.positioning.toneOfVoice && (
              <DataCard icon={<MessageCircle className="h-4 w-4" />} label="Ton de voix" value={implContent.positioning.toneOfVoice} />
            )}
            {Array.isArray(implContent.positioning.personas) && implContent.positioning.personas.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personas cibles</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {implContent.positioning.personas.map((p, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d5a3d]/10 text-xs font-bold text-[#2d5a3d]">{p.priority ?? "—"}</div>
                        <span className="text-sm font-semibold">{p.name ?? "—"}</span>
                      </div>
                      {p.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("D")} />
        )}
      </CockpitSection>

      {/* ─── Value Canvas (Pillar V) ─── */}
      <CockpitSection
        icon={<TrendingUp className="h-5 w-5" />}
        pillarLetter="V"
        title="Proposition de Valeur"
        subtitle="Product Ladder, Unit Economics, CODB"
        color={PILLAR_CONFIG.V.color}
      >
        {vContent?.productLadder ? (
          <div className="space-y-5">
            {/* Product Ladder */}
            {Array.isArray(vContent.productLadder) && vContent.productLadder.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Échelle de produits
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {vContent.productLadder.map((tier, i) => (
                    <div key={i} className="rounded-lg border p-3 transition-shadow hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{tier.tier}</span>
                        <span className="rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-xs font-bold text-[#c49a3c]">{tier.prix}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tier.description}</p>
                      {tier.cible && <p className="mt-0.5 text-[11px] text-[#c49a3c]">→ {tier.cible}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Value: tangible + intangible */}
            {vContent.valeurMarque && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.isArray(vContent.valeurMarque.tangible) && vContent.valeurMarque.tangible.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valeur tangible</p>
                    <div className="space-y-1">
                      {vContent.valeurMarque.tangible.map((v, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c49a3c]" /><span>{v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(vContent.valeurMarque.intangible) && vContent.valeurMarque.intangible.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valeur intangible</p>
                    <div className="space-y-1">
                      {vContent.valeurMarque.intangible.map((v, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c49a3c]" /><span>{v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Value: functional, emotional, social */}
            {vContent.valeurClient && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gains client</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.isArray(vContent.valeurClient.fonctionnels) && vContent.valeurClient.fonctionnels.length > 0 && (
                    <div className="rounded-lg border p-3">
                      <p className="mb-1.5 text-xs font-bold text-muted-foreground">⚙️ Fonctionnels</p>
                      <ul className="space-y-1">{vContent.valeurClient.fonctionnels.map((v, i) => <li key={i} className="text-xs text-foreground/80">{v}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(vContent.valeurClient.emotionnels) && vContent.valeurClient.emotionnels.length > 0 && (
                    <div className="rounded-lg border p-3">
                      <p className="mb-1.5 text-xs font-bold text-muted-foreground">❤️ Émotionnels</p>
                      <ul className="space-y-1">{vContent.valeurClient.emotionnels.map((v, i) => <li key={i} className="text-xs text-foreground/80">{v}</li>)}</ul>
                    </div>
                  )}
                  {Array.isArray(vContent.valeurClient.sociaux) && vContent.valeurClient.sociaux.length > 0 && (
                    <div className="rounded-lg border p-3">
                      <p className="mb-1.5 text-xs font-bold text-muted-foreground">🤝 Sociaux</p>
                      <ul className="space-y-1">{vContent.valeurClient.sociaux.map((v, i) => <li key={i} className="text-xs text-foreground/80">{v}</li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frictions */}
            {vContent.coutClient?.frictions && Array.isArray(vContent.coutClient.frictions) && vContent.coutClient.frictions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frictions & solutions</p>
                <div className="space-y-2">
                  {vContent.coutClient.frictions.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">{f.friction}</p>
                        <p className="text-xs text-emerald-700">→ {f.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Economics */}
            {vContent.unitEconomics && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Economics</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="CAC" value={vContent.unitEconomics.cac} description="Coût d'acquisition" />
                  <MetricCard label="LTV" value={vContent.unitEconomics.ltv} description="Valeur vie client" />
                  <MetricCard label="LTV/CAC" value={vContent.unitEconomics.ratio} description="Ratio rentabilité" />
                </div>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {vContent.unitEconomics.pointMort && <MetricCard label="Point mort" value={vContent.unitEconomics.pointMort} description="Break-even" />}
                  {vContent.unitEconomics.marges && <MetricCard label="Marges" value={vContent.unitEconomics.marges} description="Marges brutes" />}
                </div>
                {vContent.unitEconomics.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground">{vContent.unitEconomics.notes}</p>
                )}
              </div>
            )}
          </div>
        ) : implContent?.valueArchitecture ? (
          <div className="space-y-5">
            {implContent.valueArchitecture.valueProposition && (
              <div className="rounded-lg border-l-4 border-[#c49a3c]/30 bg-[#c49a3c]/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposition de valeur</p>
                <p className="text-sm font-medium leading-relaxed">{implContent.valueArchitecture.valueProposition}</p>
              </div>
            )}
            {Array.isArray(implContent.valueArchitecture.productLadder) && implContent.valueArchitecture.productLadder.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Échelle de produits</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {implContent.valueArchitecture.productLadder.map((tier, i) => (
                    <div key={i} className="rounded-lg border p-3 transition-shadow hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{tier.tier}</span>
                        <span className="rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-xs font-bold text-[#c49a3c]">{tier.price}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {implContent.valueArchitecture.unitEconomics && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Economics</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="CAC" value={implContent.valueArchitecture.unitEconomics.cac} description="Coût d'acquisition" />
                  <MetricCard label="LTV" value={implContent.valueArchitecture.unitEconomics.ltv} description="Valeur vie client" />
                  <MetricCard label="LTV/CAC" value={implContent.valueArchitecture.unitEconomics.ratio} description="Ratio rentabilité" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("V")} />
        )}
      </CockpitSection>

      {/* ─── Engagement (Pillar E) ─── */}
      <CockpitSection
        icon={<Users className="h-5 w-5" />}
        pillarLetter="E"
        title="Engagement & Communauté"
        subtitle="Touchpoints, Rituels, AARRR, KPIs"
        color={PILLAR_CONFIG.E.color}
      >
        {eContent?.aarrr ? (
          <div className="space-y-5">
            {/* AARRR Funnel */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stratégie AARRR</p>
              <div className="space-y-2">
                {([
                  { key: "acquisition", label: "Acquisition", icon: "🎯" },
                  { key: "activation", label: "Activation", icon: "⚡" },
                  { key: "retention", label: "Rétention", icon: "🔄" },
                  { key: "revenue", label: "Revenue", icon: "💰" },
                  { key: "referral", label: "Referral", icon: "📣" },
                ] as const).map((step) => {
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

            {/* Touchpoints */}
            {Array.isArray(eContent.touchpoints) && eContent.touchpoints.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points de contact</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {eContent.touchpoints.map((tp, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3c7ac4]/10 text-xs font-bold text-[#3c7ac4]">
                        {tp.priorite ?? "—"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{tp.canal}</span>
                        <p className="truncate text-xs text-muted-foreground">
                          {tp.type && <span className="font-medium">[{tp.type}]</span>} {tp.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rituals */}
            {Array.isArray(eContent.rituels) && eContent.rituels.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rituels de marque</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {eContent.rituels.map((r, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{r.nom}</span>
                        <div className="flex items-center gap-1.5">
                          {r.type && (
                            <span className="rounded-full bg-[#3c7ac4]/10 px-2 py-0.5 text-[10px] font-medium text-[#3c7ac4]">{r.type}</span>
                          )}
                          {r.frequence && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{r.frequence}</span>
                          )}
                        </div>
                      </div>
                      {r.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community principles */}
            {eContent.principesCommunautaires && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.isArray(eContent.principesCommunautaires.principes) && eContent.principesCommunautaires.principes.length > 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="mb-1.5 text-xs font-bold uppercase text-emerald-800">Principes</p>
                    <ul className="space-y-1">
                      {eContent.principesCommunautaires.principes.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(eContent.principesCommunautaires.tabous) && eContent.principesCommunautaires.tabous.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                    <p className="mb-1.5 text-xs font-bold uppercase text-red-800">Tabous</p>
                    <ul className="space-y-1">
                      {eContent.principesCommunautaires.tabous.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Gamification */}
            {Array.isArray(eContent.gamification) && eContent.gamification.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gamification</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {eContent.gamification.map((g, i) => (
                    <div key={i} className="rounded-md border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3c7ac4]/10 text-xs font-bold text-[#3c7ac4]">{g.niveau}</div>
                        <span className="text-sm font-semibold">{g.nom}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.condition}</p>
                      <p className="text-xs text-[#3c7ac4]">🏆 {g.recompense}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {Array.isArray(eContent.kpis) && eContent.kpis.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">KPIs de suivi</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {eContent.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2">
                      <Gauge className="h-4 w-4 shrink-0 text-[#3c7ac4]" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold">{kpi.variable ? `${kpi.variable} — ` : ""}{kpi.nom}</span>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {[kpi.cible, kpi.frequence].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : implContent?.engagementStrategy ? (
          <div className="space-y-5">
            {implContent.engagementStrategy.aarrr && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stratégie AARRR</p>
                <div className="space-y-2">
                  {([
                    { key: "acquisition", label: "Acquisition", icon: "🎯" },
                    { key: "activation", label: "Activation", icon: "⚡" },
                    { key: "retention", label: "Rétention", icon: "🔄" },
                    { key: "revenue", label: "Revenue", icon: "💰" },
                    { key: "referral", label: "Referral", icon: "📣" },
                  ] as const).map((step) => {
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
            {Array.isArray(implContent.engagementStrategy.touchpoints) && implContent.engagementStrategy.touchpoints.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points de contact</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {implContent.engagementStrategy.touchpoints.map((tp, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3c7ac4]/10 text-xs font-bold text-[#3c7ac4]">{tp.priority ?? "—"}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{tp.channel ?? "—"}</span>
                        <p className="truncate text-xs text-muted-foreground">{tp.role ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(implContent.engagementStrategy.kpis) && implContent.engagementStrategy.kpis.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">KPIs de suivi</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {implContent.engagementStrategy.kpis.map((kpi, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2">
                      <Gauge className="h-4 w-4 shrink-0 text-[#3c7ac4]" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold">{kpi.name ?? "—"}</span>
                        <p className="truncate text-[11px] text-muted-foreground">{[kpi.target, kpi.frequency].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("E")} />
        )}
      </CockpitSection>

      {/* ─── Risk Radar (Pillar R) ─── */}
      <CockpitSection
        icon={<Shield className="h-5 w-5" />}
        pillarLetter="R"
        title="Analyse des Risques"
        subtitle="Micro-SWOTs, Score de risque, Mitigation"
        color={PILLAR_CONFIG.R.color}
      >
        {riskContent ? (
          <div className="space-y-5">
            {/* Risk score */}
            {riskContent.riskScore != null ? (
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 ${getScoreBorderColor(100 - safeNumber(riskContent.riskScore))}`}
                >
                  <span
                    className={`text-2xl font-bold ${getRiskLevel(safeNumber(riskContent.riskScore)).color}`}
                  >
                    {safeNumber(riskContent.riskScore)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    / 100
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Score de risque</p>
                  <p
                    className={`text-xs font-medium ${getRiskLevel(safeNumber(riskContent.riskScore)).color}`}
                  >
                    {getRiskLevel(safeNumber(riskContent.riskScore)).label}
                  </p>
                  {riskContent.riskScoreJustification ? (
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      {safeDisplay(riskContent.riskScoreJustification)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Global SWOT */}
            {riskContent.globalSwot ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <SwotCard
                  title="Forces"
                  items={
                    (riskContent.globalSwot as Record<string, string[]>)
                      .strengths ?? []
                  }
                  color="green"
                />
                <SwotCard
                  title="Faiblesses"
                  items={
                    (riskContent.globalSwot as Record<string, string[]>)
                      .weaknesses ?? []
                  }
                  color="red"
                />
                <SwotCard
                  title="Opportunités"
                  items={
                    (riskContent.globalSwot as Record<string, string[]>)
                      .opportunities ?? []
                  }
                  color="blue"
                />
                <SwotCard
                  title="Menaces"
                  items={
                    (riskContent.globalSwot as Record<string, string[]>)
                      .threats ?? []
                  }
                  color="amber"
                />
              </div>
            ) : null}

            {/* Top Risks from Implementation data */}
            {implContent?.riskSynthesis?.topRisks &&
              Array.isArray(implContent.riskSynthesis.topRisks) && implContent.riskSynthesis.topRisks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Risques prioritaires & mitigations
                  </p>
                  <div className="space-y-2">
                    {implContent.riskSynthesis.topRisks.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-lg border px-3 py-2"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">
                              {r.risk ?? "—"}
                            </span>
                            {r.impact && (
                              <p className="text-xs text-muted-foreground">
                                Impact : {r.impact}
                              </p>
                            )}
                            {r.mitigation && (
                              <p className="mt-1 flex items-start gap-1 text-xs text-emerald-700">
                                <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                                {r.mitigation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("R")} />
        )}
      </CockpitSection>

      {/* ─── Market Validation (Pillar T) ─── */}
      <CockpitSection
        icon={<BarChart3 className="h-5 w-5" />}
        pillarLetter="T"
        title="Validation Marché"
        subtitle="TAM/SAM/SOM, Brand-Market Fit, Benchmarking"
        color={PILLAR_CONFIG.T.color}
      >
        {trackContent ? (
          <div className="space-y-5">
            {/* Brand-Market Fit score */}
            {trackContent.brandMarketFitScore != null ? (
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 ${getScoreBorderColor(safeNumber(trackContent.brandMarketFitScore))}`}
                >
                  <span
                    className={`text-2xl font-bold ${getScoreColor(safeNumber(trackContent.brandMarketFitScore))}`}
                  >
                    {safeNumber(trackContent.brandMarketFitScore)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    / 100
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Brand-Market Fit</p>
                  <p
                    className={`text-xs font-medium ${getScoreColor(safeNumber(trackContent.brandMarketFitScore))}`}
                  >
                    {getScoreLabel(safeNumber(trackContent.brandMarketFitScore))}
                  </p>
                  {trackContent.brandMarketFitJustification ? (
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      {safeDisplay(trackContent.brandMarketFitJustification)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* TAM/SAM/SOM */}
            {typeof trackContent.tamSamSom === "object" && trackContent.tamSamSom != null && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dimensionnement marché
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["tam", "sam", "som"] as const).map((key) => {
                    const item = (
                      trackContent.tamSamSom as Record<
                        string,
                        { value: string; description: string }
                      >
                    )[key];
                    return (
                      <Card key={key} className="text-center">
                        <CardContent className="pt-4 pb-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {key.toUpperCase()}
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#8c3cc4]">
                            {item?.value ?? "–"}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {item?.description ?? ""}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trends */}
            {implContent?.marketValidation?.trends &&
              Array.isArray(implContent.marketValidation.trends) && implContent.marketValidation.trends.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tendances marché
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {implContent.marketValidation.trends.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-[#8c3cc4]/20 bg-[#8c3cc4]/5 px-3 py-1 text-xs font-medium"
                      >
                        <TrendingUp className="h-3 w-3 text-[#8c3cc4]" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Strategic recommendations */}
            {Array.isArray(trackContent.strategicRecommendations) && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommandations stratégiques
                  </p>
                  <div className="space-y-1.5">
                    {(trackContent.strategicRecommendations as string[]).map(
                      (rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8c3cc4]" />
                          <span className="text-foreground/80">{rec}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <PillarContentDisplay pillar={getPillar("T")} />
        )}
      </CockpitSection>

      {/* ─── Strategic Roadmap (from Pillar I) ─── */}
      {implContent?.strategicRoadmap && (
        <CockpitSection
          icon={<Rocket className="h-5 w-5" />}
          pillarLetter="I"
          title="Roadmap Stratégique"
          subtitle="Sprint 90 jours, Priorités annuelles, Vision 3 ans"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Sprint 90 days */}
            {Array.isArray(implContent.strategicRoadmap.sprint90Days) && implContent.strategicRoadmap.sprint90Days.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sprint 90 jours
                </p>
                <div className="space-y-2">
                  {implContent.strategicRoadmap.sprint90Days.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3cc4c4]/10 text-xs font-bold text-[#3cc4c4]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action ?? "—"}</p>
                        <div className="mt-0.5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                          {item.owner && <span aria-hidden="true">👤 <span className="sr-only">Responsable : </span>{item.owner}</span>}
                          {item.kpi && <span aria-hidden="true">📊 <span className="sr-only">KPI : </span>{item.kpi}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Year 1 priorities */}
            {Array.isArray(implContent.strategicRoadmap.year1Priorities) && implContent.strategicRoadmap.year1Priorities.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Priorités Année 1
                </p>
                <div className="space-y-1.5">
                  {implContent.strategicRoadmap.year1Priorities.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Year 3 vision */}
            {implContent.strategicRoadmap.year3Vision && (
              <div className="rounded-lg border-l-4 border-[#3cc4c4]/30 bg-[#3cc4c4]/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vision 3 ans
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {implContent.strategicRoadmap.year3Vision}
                </p>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Campaigns (from Pillar I) ─── */}
      {implContent?.campaigns && (
        <CockpitSection
          icon={<Megaphone className="h-5 w-5" />}
          pillarLetter="I"
          title="Plan de Campagnes"
          subtitle="Calendrier annuel, Templates, Activation"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Annual calendar */}
            {Array.isArray(implContent.campaigns.annualCalendar) && implContent.campaigns.annualCalendar.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Calendrier annuel de campagnes
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {implContent.campaigns.annualCalendar.map((c, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#3cc4c4]">{c.mois}</span>
                        {c.budget && <span className="text-[10px] font-medium text-muted-foreground">{c.budget}</span>}
                      </div>
                      <p className="mt-1 text-sm font-semibold">{c.campagne}</p>
                      <p className="text-xs text-muted-foreground">{c.objectif}</p>
                      {Array.isArray(c.canaux) && c.canaux.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.canaux.map((ch, j) => (
                            <span key={j} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{ch}</span>
                          ))}
                        </div>
                      )}
                      {c.kpiCible && <p className="mt-1 text-[10px] text-[#3cc4c4]">📊 {c.kpiCible}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign templates */}
            {Array.isArray(implContent.campaigns.templates) && implContent.campaigns.templates.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Templates de campagne
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {implContent.campaigns.templates.map((t, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t.nom}</span>
                        <span className="rounded-full bg-[#3cc4c4]/10 px-2 py-0.5 text-[10px] font-bold text-[#3cc4c4]">{t.type}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                      {t.duree && <p className="mt-0.5 text-[11px] text-muted-foreground">⏱ {t.duree}</p>}
                      {Array.isArray(t.messagesCles) && t.messagesCles.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {t.messagesCles.map((m, j) => (
                            <p key={j} className="text-xs italic text-foreground/70">&ldquo;{m}&rdquo;</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activation plan */}
            {implContent.campaigns.activationPlan && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan d&apos;activation
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { key: "phase1Teasing", label: "Phase 1 — Teasing", icon: "👀" },
                    { key: "phase2Lancement", label: "Phase 2 — Lancement", icon: "🚀" },
                    { key: "phase3Amplification", label: "Phase 3 — Amplification", icon: "📢" },
                    { key: "phase4Fidelisation", label: "Phase 4 — Fidélisation", icon: "❤️" },
                  ].map((phase) => {
                    const value = implContent.campaigns!.activationPlan[phase.key as keyof typeof implContent.campaigns.activationPlan];
                    if (!value) return null;
                    return (
                      <div key={phase.key} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2">
                        <span className="mt-0.5 text-base">{phase.icon}</span>
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">{phase.label}</span>
                          <p className="text-sm">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Budget Allocation (from Pillar I) ─── */}
      {implContent?.budgetAllocation && (
        <CockpitSection
          icon={<DollarSign className="h-5 w-5" />}
          pillarLetter="I"
          title="Allocation Budgétaire"
          subtitle="Répartition par poste, par phase, projections ROI"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Global envelope */}
            {implContent.budgetAllocation.enveloppeGlobale && (
              <div className="rounded-lg border-l-4 border-[#3cc4c4]/30 bg-[#3cc4c4]/5 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget global annuel</p>
                <p className="mt-1 text-2xl font-bold text-[#3cc4c4]">{implContent.budgetAllocation.enveloppeGlobale}</p>
              </div>
            )}

            {/* By department */}
            {Array.isArray(implContent.budgetAllocation.parPoste) && implContent.budgetAllocation.parPoste.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Par poste</p>
                <div className="space-y-2">
                  {implContent.budgetAllocation.parPoste.map((p, i) => (
                    <div key={i} className="rounded-md border px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{p.poste}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#3cc4c4]">{p.montant}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{p.pourcentage}%</span>
                        </div>
                      </div>
                      {p.justification && <p className="mt-0.5 text-xs text-muted-foreground">{p.justification}</p>}
                      {/* Visual bar */}
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-[#3cc4c4]" style={{ width: `${Math.min(p.pourcentage, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By phase */}
            {Array.isArray(implContent.budgetAllocation.parPhase) && implContent.budgetAllocation.parPhase.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Par phase</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {implContent.budgetAllocation.parPhase.map((p, i) => (
                    <div key={i} className="rounded-lg border p-3 text-center">
                      <p className="text-xs font-semibold text-muted-foreground">{p.phase}</p>
                      <p className="mt-1 text-lg font-bold">{p.montant}</p>
                      <p className="text-[11px] text-muted-foreground">{p.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROI projections */}
            {implContent.budgetAllocation.roiProjections && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projections ROI</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="6 mois" value={implContent.budgetAllocation.roiProjections.mois6} description="Court terme" />
                  <MetricCard label="12 mois" value={implContent.budgetAllocation.roiProjections.mois12} description="Moyen terme" />
                  <MetricCard label="24 mois" value={implContent.budgetAllocation.roiProjections.mois24} description="Long terme" />
                </div>
                {implContent.budgetAllocation.roiProjections.hypotheses && (
                  <p className="mt-2 text-xs italic text-muted-foreground">{implContent.budgetAllocation.roiProjections.hypotheses}</p>
                )}
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Team Structure (from Pillar I) ─── */}
      {implContent?.teamStructure && (
        <CockpitSection
          icon={<UserPlus className="h-5 w-5" />}
          pillarLetter="I"
          title="Structure d'Équipe"
          subtitle="Équipe actuelle, Recrutements, Partenaires"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Current team */}
            {Array.isArray(implContent.teamStructure.equipeActuelle) && implContent.teamStructure.equipeActuelle.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Équipe actuelle</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {implContent.teamStructure.equipeActuelle.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Users className="h-4 w-4 shrink-0 text-[#3cc4c4]" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold">{m.role}</span>
                        <p className="truncate text-xs text-muted-foreground">{m.profil} · {m.allocation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruitments */}
            {Array.isArray(implContent.teamStructure.recrutements) && implContent.teamStructure.recrutements.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan de recrutement</p>
                <div className="space-y-2">
                  {implContent.teamStructure.recrutements.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        P{r.priorite}
                      </div>
                      <div>
                        <span className="text-sm font-semibold">{r.role}</span>
                        <p className="text-xs text-muted-foreground">{r.profil}</p>
                        <p className="text-[11px] text-[#3cc4c4]">📅 {r.echeance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External partners */}
            {Array.isArray(implContent.teamStructure.partenairesExternes) && implContent.teamStructure.partenairesExternes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partenaires externes</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {implContent.teamStructure.partenairesExternes.map((p, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <span className="text-sm font-semibold">{p.type}</span>
                      <p className="text-xs text-muted-foreground">{p.mission}</p>
                      <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                        {p.budget && <span>💰 {p.budget}</span>}
                        {p.duree && <span>⏱ {p.duree}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Launch Plan (from Pillar I) ─── */}
      {implContent?.launchPlan && (
        <CockpitSection
          icon={<Flag className="h-5 w-5" />}
          pillarLetter="I"
          title="Plan de Lancement"
          subtitle="Phases, Milestones, Go/No-Go"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Phases */}
            {Array.isArray(implContent.launchPlan.phases) && implContent.launchPlan.phases.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phases de lancement</p>
                <div className="space-y-3">
                  {implContent.launchPlan.phases.map((p, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{p.nom}</span>
                        <span className="text-xs text-muted-foreground">{p.debut} → {p.fin}</span>
                      </div>
                      {Array.isArray(p.objectifs) && p.objectifs.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Objectifs</p>
                          <ul className="mt-0.5 space-y-0.5">
                            {p.objectifs.map((o, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs">
                                <Target className="mt-0.5 h-3 w-3 shrink-0 text-[#3cc4c4]" />{o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(p.livrables) && p.livrables.length > 0 && (
                        <div className="mt-1.5">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Livrables</p>
                          <div className="mt-0.5 flex flex-wrap gap-1.5">
                            {p.livrables.map((l, j) => (
                              <span key={j} className="rounded-full border bg-muted/30 px-2 py-0.5 text-[10px] font-medium">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {p.goNoGo && (
                        <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs">
                          <span className="font-semibold text-amber-700">Go/No-Go : </span>
                          <span className="text-amber-900">{p.goNoGo}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {Array.isArray(implContent.launchPlan.milestones) && implContent.launchPlan.milestones.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jalons clés</p>
                <div className="space-y-2">
                  {implContent.launchPlan.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3cc4c4]/10">
                        <Flag className="h-3.5 w-3.5 text-[#3cc4c4]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{m.jalon}</span>
                          <span className="text-xs text-muted-foreground">{m.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">👤 {m.responsable}</p>
                        {m.critereSucces && <p className="text-xs text-emerald-700">✓ {m.critereSucces}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Operational Playbook (from Pillar I) ─── */}
      {implContent?.operationalPlaybook && (
        <CockpitSection
          icon={<BookOpen className="h-5 w-5" />}
          pillarLetter="I"
          title="Playbook Opérationnel"
          subtitle="Rythmes, Escalation, Stack outils"
          color={PILLAR_CONFIG.I.color}
        >
          <div className="space-y-5">
            {/* Rhythms */}
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.isArray(implContent.operationalPlaybook.rythmeQuotidien) && implContent.operationalPlaybook.rythmeQuotidien.length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">📅 Quotidien</p>
                  <ul className="space-y-1">
                    {implContent.operationalPlaybook.rythmeQuotidien.map((r, i) => (
                      <li key={i} className="text-xs text-foreground/80">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(implContent.operationalPlaybook.rythmeHebdomadaire) && implContent.operationalPlaybook.rythmeHebdomadaire.length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">📆 Hebdomadaire</p>
                  <ul className="space-y-1">
                    {implContent.operationalPlaybook.rythmeHebdomadaire.map((r, i) => (
                      <li key={i} className="text-xs text-foreground/80">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(implContent.operationalPlaybook.rythmeMensuel) && implContent.operationalPlaybook.rythmeMensuel.length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">🗓 Mensuel</p>
                  <ul className="space-y-1">
                    {implContent.operationalPlaybook.rythmeMensuel.map((r, i) => (
                      <li key={i} className="text-xs text-foreground/80">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Escalation */}
            {Array.isArray(implContent.operationalPlaybook.escalation) && implContent.operationalPlaybook.escalation.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Escalation</p>
                <div className="space-y-2">
                  {implContent.operationalPlaybook.escalation.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <div>
                        <span className="text-sm font-medium">{e.scenario}</span>
                        <p className="text-xs text-muted-foreground">→ {e.action}</p>
                        <p className="text-[11px] text-muted-foreground">👤 {e.responsable}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools stack */}
            {Array.isArray(implContent.operationalPlaybook.outilsStack) && implContent.operationalPlaybook.outilsStack.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stack outils</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {implContent.operationalPlaybook.outilsStack.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Wrench className="h-4 w-4 shrink-0 text-[#3cc4c4]" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold">{o.outil}</span>
                        <p className="truncate text-[11px] text-muted-foreground">{o.usage}</p>
                        {o.cout && <p className="text-[10px] text-[#3cc4c4]">{o.cout}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CockpitSection>
      )}

      {/* ─── Reports Access ─── */}
      {data.documents.length > 0 && (
        <CockpitSection
          icon={<FileText className="h-5 w-5" />}
          pillarLetter="S"
          title="Rapports Stratégiques"
          subtitle={`${data.documents.length} rapport${data.documents.length > 1 ? "s" : ""} généré${data.documents.length > 1 ? "s" : ""}`}
          color={PILLAR_CONFIG.S.color}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.documents.map((doc) => (
              <Card key={doc.id} className="transition-shadow hover:shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{doc.title}</p>
                  </div>
                  {doc.pageCount && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {doc.pageCount} pages
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CockpitSection>
      )}

      {/* ─── Footer / Branding ─── */}
      <footer className="border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Généré avec la méthodologie{" "}
          <span className="font-semibold text-terracotta">ADVERTIS</span>
          {" "}— Fiche de marque en 8 piliers
        </p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CockpitSection({
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

/** Generic data card for label + value */
function DataCard({
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

/** Metric card for numeric values */
function MetricCard({
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
      <p className="mt-1 text-lg font-bold">{value || "–"}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Smart pillar content display — handles:
 * 1. String content (renders as prose with markdown-like formatting)
 * 2. Object/JSON content (renders as structured key-value pairs)
 * 3. Empty/missing content (renders an empty state)
 */
function PillarContentDisplay({ pillar }: { pillar?: PillarData | null }) {
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

          // Heading detection (### or ** wrapper)
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

          // Bullet points
          if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                <span className="text-foreground/80">
                  {trimmed.replace(/^[-•]\s*/, "")}
                </span>
              </div>
            );
          }

          // Bold line detection (**text**)
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <p key={i} className="mt-2 text-sm font-semibold">
                {trimmed.replace(/^\*\*|\*\*$/g, "")}
              </p>
            );
          }

          // Regular paragraph
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

          // Format key: camelCase → readable label
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase())
            .trim();

          // Array values
          if (Array.isArray(val)) {
            if (val.length === 0) return null;

            // Array of strings
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

            // Array of objects — render as cards
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

          // Nested object
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

          // Simple string/number value
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

function SwotCard({
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
