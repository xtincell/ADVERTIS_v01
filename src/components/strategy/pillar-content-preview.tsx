"use client";

// Pillar Content Preview — Read-only structured display of pillar content
// Dispatches by type (A/D/V/E/R/T/I/S) to render structured fields
// instead of raw JSON blobs.

import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import type {
  AuthenticitePillarData,
  DistinctionPillarData,
  ValeurPillarData,
  EngagementPillarData,
  RiskAuditResult,
  TrackAuditResult,
  ImplementationData,
  SynthesePillarData,
} from "~/lib/types/pillar-schemas";
import {
  AuthenticitePillarSchema,
  DistinctionPillarSchema,
  ValeurPillarSchema,
  EngagementPillarSchema,
  RiskAuditResultSchema,
  TrackAuditResultSchema,
  ImplementationDataSchema,
  SynthesePillarSchema,
} from "~/lib/types/pillar-schemas";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}

function ReadOnlySection({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <h4
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: color ?? "hsl(var(--muted-foreground))" }}
      >
        {title}
      </h4>
      <div className="space-y-2 rounded-lg border bg-muted/20 p-3">{children}</div>
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreBadge({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const color =
    score >= 70 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    score >= 40 ? "text-amber-700 bg-amber-50 border-amber-200" :
                  "text-red-700 bg-red-50 border-red-200";
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${color}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A — Authenticite
// ---------------------------------------------------------------------------

function PreviewA({ data }: { data: AuthenticitePillarData }) {
  return (
    <div className="space-y-4">
      {/* Identite */}
      {(data.identite?.archetype || data.identite?.citationFondatrice || data.identite?.noyauIdentitaire) && (
        <ReadOnlySection title="Identite de marque">
          <ReadOnlyField label="Archetype" value={data.identite.archetype} />
          <ReadOnlyField label="Citation fondatrice" value={data.identite.citationFondatrice} />
          <ReadOnlyField label="Noyau identitaire" value={data.identite.noyauIdentitaire} />
        </ReadOnlySection>
      )}

      {/* Ikigai */}
      {(data.ikigai?.aimer || data.ikigai?.competence || data.ikigai?.besoinMonde || data.ikigai?.remuneration) && (
        <ReadOnlySection title="Ikigai">
          <div className="grid gap-2 sm:grid-cols-2">
            <ReadOnlyField label="Ce qu'on aime" value={data.ikigai.aimer} />
            <ReadOnlyField label="Competence" value={data.ikigai.competence} />
            <ReadOnlyField label="Besoin du monde" value={data.ikigai.besoinMonde} />
            <ReadOnlyField label="Remuneration" value={data.ikigai.remuneration} />
          </div>
        </ReadOnlySection>
      )}

      {/* Valeurs */}
      {data.valeurs?.length > 0 && (
        <ReadOnlySection title="Valeurs">
          <div className="space-y-1.5">
            {data.valeurs.map((v, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {v.rang || i + 1}
                </span>
                <div>
                  <span className="text-sm font-medium">{v.valeur}</span>
                  {v.justification && (
                    <p className="text-xs text-muted-foreground">{v.justification}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Hero's Journey */}
      {(data.herosJourney?.acte1Origines || data.herosJourney?.acte2Appel || data.herosJourney?.acte3Epreuves) && (
        <ReadOnlySection title="Hero's Journey">
          <div className="space-y-1.5">
            {[
              { label: "Acte 1 — Origines", value: data.herosJourney.acte1Origines },
              { label: "Acte 2 — Appel", value: data.herosJourney.acte2Appel },
              { label: "Acte 3 — Epreuves", value: data.herosJourney.acte3Epreuves },
              { label: "Acte 4 — Transformation", value: data.herosJourney.acte4Transformation },
              { label: "Acte 5 — Revelation", value: data.herosJourney.acte5Revelation },
            ].map((act) =>
              act.value ? <ReadOnlyField key={act.label} label={act.label} value={act.value} /> : null,
            )}
          </div>
        </ReadOnlySection>
      )}

      {/* Timeline Narrative */}
      {(data.timelineNarrative?.origines || data.timelineNarrative?.croissance) && (
        <ReadOnlySection title="Timeline narrative">
          <div className="grid gap-2 sm:grid-cols-2">
            <ReadOnlyField label="Origines" value={data.timelineNarrative.origines} />
            <ReadOnlyField label="Croissance" value={data.timelineNarrative.croissance} />
            <ReadOnlyField label="Pivot" value={data.timelineNarrative.pivot} />
            <ReadOnlyField label="Futur" value={data.timelineNarrative.futur} />
          </div>
        </ReadOnlySection>
      )}

      {/* Hierarchie communautaire */}
      {data.hierarchieCommunautaire?.length > 0 && (
        <ReadOnlySection title="Hierarchie communautaire">
          {data.hierarchieCommunautaire.map((h, i) => (
            <div key={i} className="rounded border bg-background p-2">
              <p className="text-sm font-medium">
                Niv. {h.niveau} — {h.nom}
              </p>
              {h.description && <p className="text-xs text-muted-foreground">{h.description}</p>}
              {h.privileges && <p className="text-xs text-muted-foreground italic">{h.privileges}</p>}
            </div>
          ))}
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// D — Distinction
// ---------------------------------------------------------------------------

function PreviewD({ data }: { data: DistinctionPillarData }) {
  return (
    <div className="space-y-4">
      <ReadOnlyField label="Positionnement" value={data.positionnement} />

      {/* Personas */}
      {data.personas?.length > 0 && (
        <ReadOnlySection title="Personas">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.personas.map((p, i) => (
              <div key={i} className="rounded border bg-background p-3 space-y-1">
                <p className="text-sm font-semibold">{p.nom}</p>
                <ReadOnlyField label="Demographie" value={p.demographie} />
                <ReadOnlyField label="Psychographie" value={p.psychographie} />
                <ReadOnlyField label="Motivations" value={p.motivations} />
                <ReadOnlyField label="Freins" value={p.freins} />
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Promesses */}
      {(data.promessesDeMarque?.promesseMaitre || data.promessesDeMarque?.sousPromesses?.length > 0) && (
        <ReadOnlySection title="Promesses de marque">
          <ReadOnlyField label="Promesse maitre" value={data.promessesDeMarque.promesseMaitre} />
          <TagList label="Sous-promesses" items={data.promessesDeMarque.sousPromesses} />
        </ReadOnlySection>
      )}

      {/* Concurrence */}
      {(data.paysageConcurrentiel?.concurrents?.length > 0 ||
        data.paysageConcurrentiel?.avantagesCompetitifs?.length > 0) && (
        <ReadOnlySection title="Paysage concurrentiel">
          {data.paysageConcurrentiel.concurrents.map((c, i) => (
            <div key={i} className="rounded border bg-background p-2 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.nom}</span>
                {c.partDeMarche && (
                  <span className="text-[10px] font-bold text-muted-foreground">{c.partDeMarche}</span>
                )}
              </div>
              {c.forces && <p className="text-xs text-emerald-700">+ {c.forces}</p>}
              {c.faiblesses && <p className="text-xs text-red-600">- {c.faiblesses}</p>}
            </div>
          ))}
          <TagList label="Avantages competitifs" items={data.paysageConcurrentiel.avantagesCompetitifs} />
        </ReadOnlySection>
      )}

      {/* Ton de voix */}
      {(data.tonDeVoix?.personnalite || data.tonDeVoix?.onDit?.length > 0) && (
        <ReadOnlySection title="Ton de voix">
          <ReadOnlyField label="Personnalite" value={data.tonDeVoix.personnalite} />
          <TagList label="On dit" items={data.tonDeVoix.onDit} />
          <TagList label="On ne dit pas" items={data.tonDeVoix.onNeditPas} />
        </ReadOnlySection>
      )}

      {/* Identite visuelle */}
      {(data.identiteVisuelle?.directionArtistique || data.identiteVisuelle?.paletteCouleurs?.length > 0) && (
        <ReadOnlySection title="Identite visuelle">
          <ReadOnlyField label="Direction artistique" value={data.identiteVisuelle.directionArtistique} />
          {data.identiteVisuelle.paletteCouleurs?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Palette couleurs
              </p>
              <div className="flex flex-wrap gap-2">
                {data.identiteVisuelle.paletteCouleurs.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded border bg-background px-2 py-1">
                    <div
                      className="size-3 rounded-full border"
                      style={{ backgroundColor: c.startsWith("#") ? c : undefined }}
                    />
                    <span className="text-xs">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ReadOnlyField label="Mood" value={data.identiteVisuelle.mood} />
        </ReadOnlySection>
      )}

      {/* Assets linguistiques */}
      {(data.assetsLinguistiques?.mantras?.length > 0 ||
        data.assetsLinguistiques?.vocabulaireProprietaire?.length > 0) && (
        <ReadOnlySection title="Assets linguistiques">
          <TagList label="Mantras" items={data.assetsLinguistiques.mantras} />
          <TagList label="Vocabulaire proprietaire" items={data.assetsLinguistiques.vocabulaireProprietaire} />
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// V — Valeur
// ---------------------------------------------------------------------------

function PreviewV({ data }: { data: ValeurPillarData }) {
  return (
    <div className="space-y-4">
      {/* Product Ladder */}
      {data.productLadder?.length > 0 && (
        <ReadOnlySection title="Product Ladder">
          <div className="space-y-2">
            {data.productLadder.map((tier, i) => (
              <div key={i} className="flex items-start gap-3 rounded border bg-background p-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {tier.tier || `T${i + 1}`}
                </div>
                <div className="flex-1">
                  {tier.prix && <p className="text-sm font-semibold">{tier.prix}</p>}
                  {tier.description && <p className="text-xs text-muted-foreground">{tier.description}</p>}
                  {tier.cible && <p className="text-xs text-muted-foreground italic">Cible : {tier.cible}</p>}
                </div>
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Valeur marque */}
      {(data.valeurMarque?.tangible?.length > 0 || data.valeurMarque?.intangible?.length > 0) && (
        <ReadOnlySection title="Valeur de marque">
          <TagList label="Tangible" items={data.valeurMarque.tangible} />
          <TagList label="Intangible" items={data.valeurMarque.intangible} />
        </ReadOnlySection>
      )}

      {/* Valeur client */}
      {(data.valeurClient?.fonctionnels?.length > 0 ||
        data.valeurClient?.emotionnels?.length > 0 ||
        data.valeurClient?.sociaux?.length > 0) && (
        <ReadOnlySection title="Valeur client">
          <TagList label="Fonctionnels" items={data.valeurClient.fonctionnels} />
          <TagList label="Emotionnels" items={data.valeurClient.emotionnels} />
          <TagList label="Sociaux" items={data.valeurClient.sociaux} />
        </ReadOnlySection>
      )}

      {/* Couts */}
      {(data.coutMarque?.capex || data.coutMarque?.opex || data.coutMarque?.coutsCaches?.length > 0) && (
        <ReadOnlySection title="Couts de marque">
          <div className="grid gap-2 sm:grid-cols-2">
            <ReadOnlyField label="CAPEX" value={data.coutMarque.capex} />
            <ReadOnlyField label="OPEX" value={data.coutMarque.opex} />
          </div>
          <TagList label="Couts caches" items={data.coutMarque.coutsCaches} />
        </ReadOnlySection>
      )}

      {/* Frictions */}
      {data.coutClient?.frictions?.length > 0 && (
        <ReadOnlySection title="Frictions client">
          {data.coutClient.frictions.map((f, i) => (
            <div key={i} className="rounded border bg-background p-2">
              <p className="text-sm text-red-700">{f.friction}</p>
              {f.solution && <p className="text-xs text-emerald-700 mt-0.5">Solution : {f.solution}</p>}
            </div>
          ))}
        </ReadOnlySection>
      )}

      {/* Unit Economics */}
      {(data.unitEconomics?.cac || data.unitEconomics?.ltv || data.unitEconomics?.ratio) && (
        <ReadOnlySection title="Unit Economics">
          <div className="grid gap-2 sm:grid-cols-3">
            <ReadOnlyField label="CAC" value={data.unitEconomics.cac} />
            <ReadOnlyField label="LTV" value={data.unitEconomics.ltv} />
            <ReadOnlyField label="Ratio LTV/CAC" value={data.unitEconomics.ratio} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <ReadOnlyField label="Point mort" value={data.unitEconomics.pointMort} />
            <ReadOnlyField label="Marges" value={data.unitEconomics.marges} />
          </div>
          <ReadOnlyField label="Notes" value={data.unitEconomics.notes} />
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// E — Engagement
// ---------------------------------------------------------------------------

function PreviewE({ data }: { data: EngagementPillarData }) {
  return (
    <div className="space-y-4">
      {/* AARRR */}
      {(data.aarrr?.acquisition || data.aarrr?.activation || data.aarrr?.retention) && (
        <ReadOnlySection title="Funnel AARRR">
          <div className="space-y-1.5">
            {[
              { label: "Acquisition", value: data.aarrr.acquisition },
              { label: "Activation", value: data.aarrr.activation },
              { label: "Retention", value: data.aarrr.retention },
              { label: "Revenue", value: data.aarrr.revenue },
              { label: "Referral", value: data.aarrr.referral },
            ].map((step) =>
              step.value ? (
                <div key={step.label} className="flex gap-2">
                  <span className="shrink-0 w-20 text-[10px] font-bold uppercase text-muted-foreground pt-0.5">
                    {step.label}
                  </span>
                  <p className="text-sm text-foreground/90">{step.value}</p>
                </div>
              ) : null,
            )}
          </div>
        </ReadOnlySection>
      )}

      {/* Touchpoints */}
      {data.touchpoints?.length > 0 && (
        <ReadOnlySection title="Touchpoints">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.touchpoints.map((tp, i) => (
              <div key={i} className="rounded border bg-background p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tp.canal}</span>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize">
                    {tp.type}
                  </span>
                </div>
                {tp.role && <p className="text-xs text-muted-foreground mt-0.5">{tp.role}</p>}
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Rituels */}
      {data.rituels?.length > 0 && (
        <ReadOnlySection title="Rituels">
          {data.rituels.map((r, i) => (
            <div key={i} className="rounded border bg-background p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.nom}</span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{r.type}</span>
                {r.frequence && <span className="text-[10px] text-muted-foreground">({r.frequence})</span>}
              </div>
              {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
            </div>
          ))}
        </ReadOnlySection>
      )}

      {/* Principes communautaires */}
      {(data.principesCommunautaires?.principes?.length > 0 ||
        data.principesCommunautaires?.tabous?.length > 0) && (
        <ReadOnlySection title="Principes communautaires">
          <TagList label="Principes" items={data.principesCommunautaires.principes} />
          <TagList label="Tabous" items={data.principesCommunautaires.tabous} />
        </ReadOnlySection>
      )}

      {/* Gamification */}
      {data.gamification?.length > 0 && (
        <ReadOnlySection title="Gamification">
          {data.gamification.map((g, i) => (
            <div key={i} className="flex items-start gap-2 rounded border bg-background p-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {g.niveau}
              </span>
              <div>
                <p className="text-sm font-medium">{g.nom}</p>
                {g.condition && <p className="text-xs text-muted-foreground">{g.condition}</p>}
                {g.recompense && <p className="text-xs text-emerald-700">{g.recompense}</p>}
              </div>
            </div>
          ))}
        </ReadOnlySection>
      )}

      {/* KPIs */}
      {data.kpis?.length > 0 && (
        <ReadOnlySection title="KPIs">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="rounded border bg-background p-2">
                <p className="text-sm font-medium">{kpi.nom}</p>
                {kpi.cible && <p className="text-xs text-muted-foreground">Cible : {kpi.cible}</p>}
                {kpi.frequence && <p className="text-xs text-muted-foreground">{kpi.frequence}</p>}
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// R — Risk Audit
// ---------------------------------------------------------------------------

function PreviewR({ data }: { data: RiskAuditResult }) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-3">
        <ScoreBadge score={data.riskScore} label="Score de risque" />
        {data.riskScoreJustification && (
          <p className="flex-1 text-sm text-foreground/80">{data.riskScoreJustification}</p>
        )}
      </div>

      <ReadOnlyField label="Resume" value={data.summary} />

      {/* Global SWOT */}
      {(data.globalSwot?.strengths?.length > 0 ||
        data.globalSwot?.weaknesses?.length > 0 ||
        data.globalSwot?.opportunities?.length > 0 ||
        data.globalSwot?.threats?.length > 0) && (
        <ReadOnlySection title="SWOT Global">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-emerald-200 bg-emerald-50/50 p-2">
              <p className="text-[10px] font-bold uppercase text-emerald-700 mb-1">Forces</p>
              {data.globalSwot.strengths.map((s, i) => (
                <p key={i} className="text-xs text-emerald-800">{s}</p>
              ))}
            </div>
            <div className="rounded border border-red-200 bg-red-50/50 p-2">
              <p className="text-[10px] font-bold uppercase text-red-700 mb-1">Faiblesses</p>
              {data.globalSwot.weaknesses.map((w, i) => (
                <p key={i} className="text-xs text-red-800">{w}</p>
              ))}
            </div>
            <div className="rounded border border-blue-200 bg-blue-50/50 p-2">
              <p className="text-[10px] font-bold uppercase text-blue-700 mb-1">Opportunites</p>
              {data.globalSwot.opportunities.map((o, i) => (
                <p key={i} className="text-xs text-blue-800">{o}</p>
              ))}
            </div>
            <div className="rounded border border-amber-200 bg-amber-50/50 p-2">
              <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Menaces</p>
              {data.globalSwot.threats.map((t, i) => (
                <p key={i} className="text-xs text-amber-800">{t}</p>
              ))}
            </div>
          </div>
        </ReadOnlySection>
      )}

      {/* Micro-SWOTs count */}
      {data.microSwots?.length > 0 && (
        <ReadOnlyField
          label="Micro-SWOTs"
          value={`${data.microSwots.length} analyses par variable`}
        />
      )}

      {/* Probability/Impact top 3 */}
      {data.probabilityImpactMatrix?.length > 0 && (
        <ReadOnlySection title="Matrice Probabilite x Impact (top risques)">
          {data.probabilityImpactMatrix.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded border bg-background p-2">
              <span className="text-sm">{item.risk}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">P: {item.probability}</span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">I: {item.impact}</span>
                <span className="text-xs font-bold text-primary">#{item.priority}</span>
              </div>
            </div>
          ))}
        </ReadOnlySection>
      )}

      {/* Mitigation priorities top 3 */}
      {data.mitigationPriorities?.length > 0 && (
        <ReadOnlySection title="Priorites de mitigation">
          {data.mitigationPriorities.slice(0, 5).map((m, i) => (
            <div key={i} className="rounded border bg-background p-2 space-y-0.5">
              <p className="text-sm font-medium">{m.risk}</p>
              <p className="text-xs text-foreground/80">{m.action}</p>
              <div className="flex gap-2">
                <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">{m.urgency.replace("_", " ")}</span>
                <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize">Effort: {m.effort}</span>
              </div>
            </div>
          ))}
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// T — Track Audit
// ---------------------------------------------------------------------------

function PreviewT({ data }: { data: TrackAuditResult }) {
  return (
    <div className="space-y-4">
      {/* BMF Score */}
      <div className="flex items-center gap-3">
        <ScoreBadge score={data.brandMarketFitScore} label="Brand-Market Fit" />
        {data.brandMarketFitJustification && (
          <p className="flex-1 text-sm text-foreground/80">{data.brandMarketFitJustification}</p>
        )}
      </div>

      <ReadOnlyField label="Resume" value={data.summary} />

      {/* TAM/SAM/SOM */}
      {(data.tamSamSom?.tam?.value || data.tamSamSom?.sam?.value || data.tamSamSom?.som?.value) && (
        <ReadOnlySection title="TAM / SAM / SOM">
          <div className="grid gap-2 sm:grid-cols-3">
            {(["tam", "sam", "som"] as const).map((k) => {
              const entry = data.tamSamSom[k];
              if (!entry?.value) return null;
              return (
                <div key={k} className="rounded border bg-background p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k.toUpperCase()}</p>
                  <p className="text-lg font-bold text-primary mt-0.5">{entry.value}</p>
                  {entry.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{entry.description}</p>
                  )}
                </div>
              );
            })}
          </div>
          <ReadOnlyField label="Methodologie" value={data.tamSamSom.methodology} />
        </ReadOnlySection>
      )}

      {/* Market Reality */}
      {(data.marketReality?.macroTrends?.length > 0 ||
        data.marketReality?.weakSignals?.length > 0 ||
        data.marketReality?.emergingPatterns?.length > 0) && (
        <ReadOnlySection title="Realite du marche">
          <TagList label="Tendances macro" items={data.marketReality.macroTrends} />
          <TagList label="Signaux faibles" items={data.marketReality.weakSignals} />
          <TagList label="Patterns emergents" items={data.marketReality.emergingPatterns} />
        </ReadOnlySection>
      )}

      {/* Hypothesis Validation */}
      {data.hypothesisValidation?.length > 0 && (
        <ReadOnlySection title="Validation des hypotheses">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.hypothesisValidation.map((h, i) => (
              <div key={i} className="rounded border bg-background p-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${
                      h.status === "validated" ? "bg-emerald-500" :
                      h.status === "invalidated" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-medium">{h.variableId}</span>
                  <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] capitalize">
                    {h.status.replace("_", " ")}
                  </span>
                </div>
                {h.hypothesis && <p className="text-xs mt-1">{h.hypothesis}</p>}
                {h.evidence && <p className="text-[11px] text-muted-foreground mt-0.5">{h.evidence}</p>}
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Competitive Benchmark */}
      {data.competitiveBenchmark?.length > 0 && (
        <ReadOnlySection title="Benchmark concurrentiel">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.competitiveBenchmark.map((c, i) => (
              <div key={i} className="rounded border bg-background p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{c.competitor}</span>
                  {c.marketShare && <span className="text-[10px] font-bold text-muted-foreground">{c.marketShare}</span>}
                </div>
                {c.strengths.length > 0 && (
                  <div className="mt-1">
                    {c.strengths.map((s, j) => (
                      <p key={j} className="text-xs text-emerald-700">+ {s}</p>
                    ))}
                  </div>
                )}
                {c.weaknesses.length > 0 && (
                  <div className="mt-0.5">
                    {c.weaknesses.map((w, j) => (
                      <p key={j} className="text-xs text-red-600">- {w}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ReadOnlySection>
      )}

      {/* Recommendations */}
      {data.strategicRecommendations?.length > 0 && (
        <TagList label="Recommandations strategiques" items={data.strategicRecommendations} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// I — Implementation
// ---------------------------------------------------------------------------

function PreviewI({ data }: { data: ImplementationData }) {
  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <ReadOnlyField label="Resume executif" value={data.executiveSummary} />

      {/* Coherence Score */}
      {data.coherenceScore > 0 && (
        <ScoreBadge score={data.coherenceScore} label="Score de coherence" />
      )}

      {/* Brand Platform */}
      {data.brandPlatform && (data.brandPlatform.purpose || data.brandPlatform.vision) && (
        <ReadOnlySection title="Plateforme de marque">
          <ReadOnlyField label="Purpose" value={data.brandPlatform.purpose} />
          <ReadOnlyField label="Vision" value={data.brandPlatform.vision} />
          <ReadOnlyField label="Mission" value={data.brandPlatform.mission} />
          <ReadOnlyField label="Personnalite" value={data.brandPlatform.personality} />
          <ReadOnlyField label="Territoire" value={data.brandPlatform.territory} />
          <ReadOnlyField label="Tagline" value={data.brandPlatform.tagline} />
          <TagList label="Valeurs" items={data.brandPlatform.values} />
        </ReadOnlySection>
      )}

      {/* Copy Strategy */}
      {data.copyStrategy && (data.copyStrategy.promise || data.copyStrategy.consumerBenefit) && (
        <ReadOnlySection title="Copy Strategy">
          <ReadOnlyField label="Promesse" value={data.copyStrategy.promise} />
          <ReadOnlyField label="Benefice consommateur" value={data.copyStrategy.consumerBenefit} />
          <ReadOnlyField label="Ton" value={data.copyStrategy.tone} />
          <ReadOnlyField label="Contrainte" value={data.copyStrategy.constraint} />
          <TagList label="Reasons to Believe" items={data.copyStrategy.rtb} />
        </ReadOnlySection>
      )}

      {/* Big Idea */}
      {data.bigIdea && (data.bigIdea.concept || data.bigIdea.mechanism) && (
        <ReadOnlySection title="Big Idea">
          <ReadOnlyField label="Concept" value={data.bigIdea.concept} />
          <ReadOnlyField label="Mecanisme" value={data.bigIdea.mechanism} />
          <ReadOnlyField label="Lien insight" value={data.bigIdea.insightLink} />
          {data.bigIdea.declinaisons?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Declinaisons</p>
              {data.bigIdea.declinaisons.map((d, i) => (
                <div key={i} className="rounded border bg-background p-1.5 mb-1">
                  <span className="text-xs font-medium">{d.support}</span>
                  {d.description && <span className="text-xs text-muted-foreground"> — {d.description}</span>}
                </div>
              ))}
            </div>
          )}
        </ReadOnlySection>
      )}

      {/* Roadmap */}
      {(data.strategicRoadmap?.sprint90Days?.length > 0 ||
        data.strategicRoadmap?.year1Priorities?.length > 0 ||
        data.strategicRoadmap?.year3Vision) && (
        <ReadOnlySection title="Roadmap strategique">
          {data.strategicRoadmap.sprint90Days.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Sprint 90 jours</p>
              {data.strategicRoadmap.sprint90Days.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs">{s.action}</p>
                    {s.owner && <p className="text-[10px] text-muted-foreground">{s.owner} — {s.kpi}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <TagList label="Priorites An 1" items={data.strategicRoadmap.year1Priorities} />
          <ReadOnlyField label="Vision An 3" value={data.strategicRoadmap.year3Vision} />
        </ReadOnlySection>
      )}

      {/* Campaigns summary */}
      {data.campaigns && data.campaigns.templates?.length > 0 && (
        <ReadOnlySection title="Campagnes">
          <ReadOnlyField
            label="Templates"
            value={`${data.campaigns.templates.length} template(s) de campagne`}
          />
          {data.campaigns.annualCalendar?.length > 0 && (
            <ReadOnlyField
              label="Calendrier annuel"
              value={`${data.campaigns.annualCalendar.length} campagne(s) planifiee(s)`}
            />
          )}
        </ReadOnlySection>
      )}

      {/* Budget summary */}
      {data.budgetAllocation && data.budgetAllocation.enveloppeGlobale && (
        <ReadOnlySection title="Budget">
          <ReadOnlyField label="Enveloppe globale" value={data.budgetAllocation.enveloppeGlobale} />
          {data.budgetAllocation.parPoste?.length > 0 && (
            <ReadOnlyField
              label="Postes budgetaires"
              value={`${data.budgetAllocation.parPoste.length} poste(s)`}
            />
          )}
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// S — Synthese
// ---------------------------------------------------------------------------

function PreviewS({ data }: { data: SynthesePillarData }) {
  return (
    <div className="space-y-4">
      {/* Coherence Score */}
      {data.scoreCoherence > 0 && (
        <ScoreBadge score={data.scoreCoherence} label="Coherence des piliers" />
      )}

      <ReadOnlyField label="Synthese executive" value={data.syntheseExecutive} />
      <ReadOnlyField label="Vision strategique" value={data.visionStrategique} />

      {/* Coherence piliers */}
      {data.coherencePiliers?.length > 0 && (
        <ReadOnlySection title="Coherence par pilier">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.coherencePiliers.map((cp, i) => {
              const pillarConfig = PILLAR_CONFIG[cp.pilier as PillarType];
              return (
                <div
                  key={i}
                  className="rounded border bg-background p-2"
                  style={{ borderLeftWidth: "3px", borderLeftColor: pillarConfig?.color }}
                >
                  <p className="text-xs font-bold">{cp.pilier} — {pillarConfig?.title ?? cp.pilier}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cp.contribution}</p>
                  {cp.articulation && (
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 italic">{cp.articulation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </ReadOnlySection>
      )}

      {/* Facteurs cles */}
      {data.facteursClesSucces?.length > 0 && (
        <TagList label="Facteurs cles de succes" items={data.facteursClesSucces} />
      )}

      {/* Recommandations */}
      {data.recommandationsPrioritaires?.length > 0 && (
        <ReadOnlySection title="Recommandations prioritaires">
          {data.recommandationsPrioritaires.map((r, i) => (
            <div key={i} className="flex items-start gap-2 rounded border bg-background p-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {r.priorite || i + 1}
              </span>
              <div>
                <p className="text-sm">{r.action}</p>
                <div className="flex gap-2 mt-0.5">
                  {r.impact && <span className="text-[10px] text-muted-foreground">Impact : {r.impact}</span>}
                  {r.delai && <span className="text-[10px] text-muted-foreground">Delai : {r.delai}</span>}
                </div>
              </div>
            </div>
          ))}
        </ReadOnlySection>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

interface PillarContentPreviewProps {
  pillarType: string;
  content: unknown;
}

export function PillarContentPreview({ pillarType, content }: PillarContentPreviewProps) {
  if (content == null) return null;

  try {
    switch (pillarType) {
      case "A": {
        const parsed = AuthenticitePillarSchema.parse(content);
        return <PreviewA data={parsed} />;
      }
      case "D": {
        const parsed = DistinctionPillarSchema.parse(content);
        return <PreviewD data={parsed} />;
      }
      case "V": {
        const parsed = ValeurPillarSchema.parse(content);
        return <PreviewV data={parsed} />;
      }
      case "E": {
        const parsed = EngagementPillarSchema.parse(content);
        return <PreviewE data={parsed} />;
      }
      case "R": {
        const parsed = RiskAuditResultSchema.parse(content);
        return <PreviewR data={parsed} />;
      }
      case "T": {
        const parsed = TrackAuditResultSchema.parse(content);
        return <PreviewT data={parsed} />;
      }
      case "I": {
        const parsed = ImplementationDataSchema.parse(content);
        return <PreviewI data={parsed} />;
      }
      case "S": {
        const parsed = SynthesePillarSchema.parse(content);
        return <PreviewS data={parsed} />;
      }
      default:
        return (
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
            {JSON.stringify(content, null, 2)}
          </pre>
        );
    }
  } catch {
    // Fallback: if parsing fails, show raw JSON
    return (
      <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
        {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
      </pre>
    );
  }
}
