// ==========================================================================
// SECTION C.K23 — Oracle Sub-Scores
// Granular per-pillar sub-component scores displayed as progress bars.
// Inspired by V1's /200 scoring with named sub-categories.
// ==========================================================================

"use client";

import { useMemo } from "react";
import { BarChart3, Shield, Target, Sparkles } from "lucide-react";
import { PILLAR_CONFIG } from "~/lib/constants";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarDataV2,
  EngagementPillarData,
} from "~/lib/types/pillar-data";

// ---------------------------------------------------------------------------
// Sub-score definitions per pillar
// ---------------------------------------------------------------------------

interface SubScore {
  name: string;
  score: number;
  max: number;
  color: string;
}

interface PillarScoreCard {
  pillar: string;
  letter: string;
  color: string;
  icon: React.ReactNode;
  total: number;
  maxTotal: number;
  subScores: SubScore[];
}

/** Compute completeness of a section (0-max) based on non-empty fields */
function sectionScore(obj: Record<string, unknown> | null | undefined, max: number): number {
  if (!obj || typeof obj !== "object") return 0;
  const keys = Object.keys(obj);
  if (keys.length === 0) return 0;
  let filled = 0;
  for (const key of keys) {
    const val = obj[key];
    if (val === null || val === undefined || val === "") continue;
    if (typeof val === "string" && val.trim().length > 10) filled++;
    else if (typeof val === "number" && val > 0) filled++;
    else if (Array.isArray(val) && val.length > 0) filled++;
    else if (typeof val === "object" && val !== null && Object.keys(val).length > 0) filled++;
  }
  return Math.round((filled / keys.length) * max);
}

function arrayScore(arr: unknown[] | null | undefined, max: number, minItems = 1): number {
  if (!arr || !Array.isArray(arr)) return 0;
  if (arr.length === 0) return 0;
  return Math.min(max, Math.round((arr.length / Math.max(minItems, 1)) * max));
}

// ---------------------------------------------------------------------------
// Build sub-scores from pillar data
// ---------------------------------------------------------------------------

function buildPillarCards(
  aContent: AuthenticitePillarData | null,
  dContent: DistinctionPillarData | null,
  vContent: ValeurPillarDataV2 | null,
  eContent: EngagementPillarData | null,
  coherenceScore: number | null,
  riskScore: number | null,
  bmfScore: number | null,
): PillarScoreCard[] {
  const cards: PillarScoreCard[] = [];

  // ── Pillar A — Authenticité ──
  if (aContent) {
    const identity = sectionScore(aContent.identite, 10);
    const hero = sectionScore(aContent.herosJourney, 10);
    const ikigai = sectionScore(aContent.ikigai, 10);
    const values = arrayScore(aContent.valeurs, 10, 3);
    const timeline = sectionScore(aContent.timelineNarrative, 10);
    const total = identity + hero + ikigai + values + timeline;
    cards.push({
      pillar: "Authenticité",
      letter: "A",
      color: PILLAR_CONFIG.A.color,
      icon: <Sparkles className="h-4 w-4" />,
      total,
      maxTotal: 50,
      subScores: [
        { name: "Identité & Archétype", score: identity, max: 10, color: PILLAR_CONFIG.A.color },
        { name: "Parcours Héroïque", score: hero, max: 10, color: PILLAR_CONFIG.A.color },
        { name: "Ikigai de marque", score: ikigai, max: 10, color: PILLAR_CONFIG.A.color },
        { name: "Valeurs fondamentales", score: values, max: 10, color: PILLAR_CONFIG.A.color },
        { name: "Timeline narrative", score: timeline, max: 10, color: PILLAR_CONFIG.A.color },
      ],
    });
  }

  // ── Pillar D — Distinction ──
  if (dContent) {
    const personas = arrayScore(dContent.personas, 15, 2);
    const positioning = sectionScore(dContent.paysageConcurrentiel, 15);
    const dna = sectionScore(dContent as Record<string, unknown>, 20);
    const total = personas + positioning + dna;
    cards.push({
      pillar: "Distinction",
      letter: "D",
      color: PILLAR_CONFIG.D.color,
      icon: <Target className="h-4 w-4" />,
      total,
      maxTotal: 50,
      subScores: [
        { name: "Personas & Segments", score: personas, max: 15, color: PILLAR_CONFIG.D.color },
        { name: "Positionnement", score: positioning, max: 15, color: PILLAR_CONFIG.D.color },
        { name: "ADN de marque", score: dna, max: 20, color: PILLAR_CONFIG.D.color },
      ],
    });
  }

  // ── Pillar V — Valeur ──
  if (vContent) {
    const pricing = vContent.cac || vContent.ltv ? 10 : 0;
    const unitEco = vContent.ltvCacRatio ? 10 : vContent.marges ? 5 : 0;
    const offer = arrayScore(vContent.produitsCatalogue, 15, 2);
    const valueMaps = [
      ...(vContent.valeurMarqueTangible ?? []),
      ...(vContent.valeurClientTangible ?? []),
      ...(vContent.coutMarqueTangible ?? []),
      ...(vContent.coutClientTangible ?? []),
    ];
    const costs = Math.min(15, Math.round((valueMaps.length / 4) * 15));
    const total = pricing + unitEco + offer + costs;
    cards.push({
      pillar: "Valeur",
      letter: "V",
      color: PILLAR_CONFIG.V.color,
      icon: <BarChart3 className="h-4 w-4" />,
      total,
      maxTotal: 50,
      subScores: [
        { name: "Pricing & CAC", score: pricing, max: 10, color: PILLAR_CONFIG.V.color },
        { name: "Économie unitaire", score: unitEco, max: 10, color: PILLAR_CONFIG.V.color },
        { name: "Offre produits", score: offer, max: 15, color: PILLAR_CONFIG.V.color },
        { name: "Structure de coûts", score: costs, max: 15, color: PILLAR_CONFIG.V.color },
      ],
    });
  }

  // ── Pillar E — Engagement ──
  if (eContent) {
    const touchpoints = arrayScore(eContent.touchpoints, 15, 3);
    const rituels = arrayScore(eContent.rituels, 15, 2);
    const community = sectionScore(eContent.principesCommunautaires, 10);
    const gamification = arrayScore(eContent.gamification, 10, 2);
    const total = touchpoints + rituels + community + gamification;
    cards.push({
      pillar: "Engagement",
      letter: "E",
      color: PILLAR_CONFIG.E.color,
      icon: <Shield className="h-4 w-4" />,
      total,
      maxTotal: 50,
      subScores: [
        { name: "Touchpoints", score: touchpoints, max: 15, color: PILLAR_CONFIG.E.color },
        { name: "Rituels de marque", score: rituels, max: 15, color: PILLAR_CONFIG.E.color },
        { name: "Principes communautaires", score: community, max: 10, color: PILLAR_CONFIG.E.color },
        { name: "Gamification", score: gamification, max: 10, color: PILLAR_CONFIG.E.color },
      ],
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SectionOracleScoresProps {
  aContent: AuthenticitePillarData | null;
  dContent: DistinctionPillarData | null;
  vContent: ValeurPillarDataV2 | null;
  eContent: EngagementPillarData | null;
  coherenceScore: number | null;
  riskScore: number | null;
  bmfScore: number | null;
}

export function SectionOracleScores({
  aContent,
  dContent,
  vContent,
  eContent,
  coherenceScore,
  riskScore,
  bmfScore,
}: SectionOracleScoresProps) {
  const pillarCards = useMemo(
    () => buildPillarCards(aContent, dContent, vContent, eContent, coherenceScore, riskScore, bmfScore),
    [aContent, dContent, vContent, eContent, coherenceScore, riskScore, bmfScore],
  );

  // Global score /200 (sum of all pillar totals, capped at 200)
  const globalScore = pillarCards.reduce((sum, c) => sum + c.total, 0);
  const globalMax = pillarCards.reduce((sum, c) => sum + c.maxTotal, 0);

  if (pillarCards.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* ── Header with global score ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Sub-Scores Oracle
          </h2>
          <p className="text-xs text-muted-foreground">
            Granularité par sous-composante — chaque pilier décomposé
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-primary tabular-nums">
            {globalScore}
          </span>
          <span className="text-sm text-muted-foreground">/{globalMax}</span>
          <div className="h-1.5 w-24 mt-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${globalMax > 0 ? (globalScore / globalMax) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Pillar cards grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillarCards.map((card) => (
          <div
            key={card.letter}
            className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-3"
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <span className="text-xs font-bold" style={{ color: card.color }}>
                    {card.letter}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{card.pillar}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold tabular-nums" style={{ color: card.color }}>
                  {card.total}
                </span>
                <span className="text-xs text-muted-foreground">/{card.maxTotal}</span>
              </div>
            </div>

            {/* Sub-score progress bars */}
            <div className="space-y-2">
              {card.subScores.map((sub) => (
                <div key={sub.name} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{sub.name}</span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: sub.color }}>
                      {sub.score}/{sub.max}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.max > 0 ? (sub.score / sub.max) * 100 : 0}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
