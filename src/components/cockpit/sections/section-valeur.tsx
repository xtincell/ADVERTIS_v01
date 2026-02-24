// =============================================================================
// COMPONENT C.K4 — Section Valeur
// =============================================================================
// Pillar V cockpit display: Value Architecture.
// Props: vContent (ValeurPillarData), implContent, pillar, vertical.
// Key features: product ladder (tiers with pricing), brand value (tangible /
// intangible), client value (functional / emotional / social), client frictions,
// cost structure (CAPEX, OPEX, hidden costs), unit economics (CAC, LTV, ratio,
// break-even, margins). Falls back to implContent.valueArchitecture.
// =============================================================================

// Section Valeur (Pillar V) — Product Ladder, Brand & Client Value, Costs, Unit Economics

import {
  TrendingUp,
  Zap,
  Heart,
  AlertTriangle,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { SupportedCurrency } from "~/lib/constants";
import type { ValeurPillarData } from "~/lib/types/pillar-data";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { getCurrencySymbol } from "~/lib/currency";
import {
  CockpitSection,
  DataCard,
  MetricCard,
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

// Helper: check if a price string already contains a known currency symbol
const CURRENCY_SYMBOLS_RE = /FCFA|XOF|XAF|EUR|USD|GHS|NGN|GH₵|₦|€|\$/i;

export function SectionValeur({
  vContent,
  implContent,
  pillar,
  vertical,
  currency,
}: {
  vContent: ValeurPillarData;
  implContent: ImplementationData;
  pillar?: PillarData | null;
  vertical?: string | null;
  currency?: SupportedCurrency;
}) {
  const color = PILLAR_CONFIG.V.color;
  const currencySymbol = getCurrencySymbol(currency ?? "XOF");

  // Annotate a price string with currency if not already present
  const annotatePrice = (prix: string | undefined | null): string => {
    if (!prix) return "";
    if (CURRENCY_SYMBOLS_RE.test(prix)) return prix;
    return `${prix} ${currencySymbol}`;
  };

  return (
    <CockpitSection
      icon={<TrendingUp className="h-5 w-5" />}
      pillarLetter="V"
      title="Architecture de Valeur"
      subtitle="Valeur — Proposition de valeur, Pricing, Unit Economics"
      color={color}
      updatedAt={pillar?.updatedAt}
      vertical={vertical}
    >
      {vContent?.productLadder?.length ||
      vContent?.valeurMarque?.tangible?.length ||
      vContent?.valeurMarque?.intangible?.length ||
      vContent?.valeurClient?.fonctionnels?.length ||
      vContent?.valeurClient?.emotionnels?.length ||
      vContent?.valeurClient?.sociaux?.length ||
      vContent?.coutClient?.frictions?.length ||
      vContent?.coutMarque?.capex ||
      vContent?.coutMarque?.opex ||
      vContent?.coutMarque?.coutsCaches?.length ||
      vContent?.unitEconomics?.cac ||
      vContent?.unitEconomics?.ltv ? (
        <div className="space-y-5">
          {/* ----------------------------------------------------------------
              1. Product Ladder
          ---------------------------------------------------------------- */}
          {Array.isArray(vContent.productLadder) && vContent.productLadder.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Ladder
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vContent.productLadder.map((item, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.tier}</span>
                      {item.prix && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {annotatePrice(item.prix)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-foreground/80">{item.description}</p>
                    )}
                    {item.cible && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Cible : {item.cible}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              2. Valeur Marque — Tangible
          ---------------------------------------------------------------- */}
          {Array.isArray(vContent.valeurMarque?.tangible) && vContent.valeurMarque.tangible.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valeur de marque — Tangible
              </p>
              <div className="space-y-1.5">
                {vContent.valeurMarque.tangible.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 pl-1 text-sm">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              3. Valeur Marque — Intangible
          ---------------------------------------------------------------- */}
          {Array.isArray(vContent.valeurMarque?.intangible) && vContent.valeurMarque.intangible.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valeur de marque — Intangible
              </p>
              <div className="space-y-1.5">
                {vContent.valeurMarque.intangible.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 pl-1 text-sm">
                    <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
                    <span className="text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              4-5-6. Valeur Client — Fonctionnels, Emotionnels, Sociaux
          ---------------------------------------------------------------- */}
          {(!!vContent.valeurClient?.fonctionnels?.length ||
            !!vContent.valeurClient?.emotionnels?.length ||
            !!vContent.valeurClient?.sociaux?.length) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valeur client
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Fonctionnels */}
                {Array.isArray(vContent.valeurClient.fonctionnels) && vContent.valeurClient.fonctionnels.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1.5 text-xs font-semibold">
                      <span className="mr-1">{"\u2699\uFE0F"}</span>Fonctionnels
                    </p>
                    <ul className="space-y-1">
                      {vContent.valeurClient.fonctionnels.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emotionnels */}
                {Array.isArray(vContent.valeurClient.emotionnels) && vContent.valeurClient.emotionnels.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1.5 text-xs font-semibold">
                      <span className="mr-1">{"\u2764\uFE0F"}</span>Emotionnels
                    </p>
                    <ul className="space-y-1">
                      {vContent.valeurClient.emotionnels.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sociaux */}
                {Array.isArray(vContent.valeurClient.sociaux) && vContent.valeurClient.sociaux.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-1.5 text-xs font-semibold">
                      <span className="mr-1">{"\uD83E\uDD1D"}</span>Sociaux
                    </p>
                    <ul className="space-y-1">
                      {vContent.valeurClient.sociaux.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              7. Co{u}t Client — Frictions
          ---------------------------------------------------------------- */}
          {Array.isArray(vContent.coutClient?.frictions) && vContent.coutClient.frictions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Frictions client
              </p>
              <div className="space-y-2">
                {vContent.coutClient.frictions.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.friction}</p>
                      {item.solution && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-semibold">Solution :</span> {item.solution}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              8. Co{u}t Marque — CAPEX, OPEX, Co{u}ts cach{e}s
          ---------------------------------------------------------------- */}
          {(vContent.coutMarque?.capex ||
            vContent.coutMarque?.opex ||
            (Array.isArray(vContent.coutMarque?.coutsCaches) && vContent.coutMarque.coutsCaches.length > 0)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Structure de co&ucirc;ts marque
              </p>
              <div className="space-y-3">
                {/* CAPEX + OPEX MetricCards */}
                {(vContent.coutMarque.capex || vContent.coutMarque.opex) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vContent.coutMarque.capex && (
                      <MetricCard
                        label="Investissements (CAPEX)"
                        value={vContent.coutMarque.capex}
                        description="Capital expenditure"
                      />
                    )}
                    {vContent.coutMarque.opex && (
                      <MetricCard
                        label="Charges récurrentes (OPEX)"
                        value={vContent.coutMarque.opex}
                        description="Operational expenditure"
                      />
                    )}
                  </div>
                )}

                {/* Couts caches */}
                {Array.isArray(vContent.coutMarque.coutsCaches) && vContent.coutMarque.coutsCaches.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                      Co&ucirc;ts cach&eacute;s
                    </p>
                    <div className="space-y-1.5">
                      {vContent.coutMarque.coutsCaches.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 pl-1 text-sm">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span className="text-foreground/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              9. Unit Economics
          ---------------------------------------------------------------- */}
          {(vContent.unitEconomics?.cac ||
            vContent.unitEconomics?.ltv ||
            vContent.unitEconomics?.ratio ||
            vContent.unitEconomics?.pointMort ||
            vContent.unitEconomics?.marges) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unit Economics
              </p>
              <div className="space-y-3">
                {/* CAC, LTV, Ratio */}
                {(vContent.unitEconomics.cac ||
                  vContent.unitEconomics.ltv ||
                  vContent.unitEconomics.ratio) && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {vContent.unitEconomics.cac && (
                      <MetricCard
                        label="CAC"
                        value={vContent.unitEconomics.cac}
                        description={"Coût d\'acquisition client"}
                      />
                    )}
                    {vContent.unitEconomics.ltv && (
                      <MetricCard
                        label="LTV"
                        value={vContent.unitEconomics.ltv}
                        description="Lifetime value"
                      />
                    )}
                    {vContent.unitEconomics.ratio && (
                      <MetricCard
                        label="Ratio LTV/CAC"
                        value={vContent.unitEconomics.ratio}
                        description={"Rentabilité client"}
                      />
                    )}
                  </div>
                )}

                {/* Point Mort + Marges */}
                {(vContent.unitEconomics.pointMort || vContent.unitEconomics.marges) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vContent.unitEconomics.pointMort && (
                      <MetricCard
                        label="Point mort"
                        value={vContent.unitEconomics.pointMort}
                        description={"Seuil de rentabilité"}
                      />
                    )}
                    {vContent.unitEconomics.marges && (
                      <MetricCard
                        label="Marges"
                        value={vContent.unitEconomics.marges}
                        description="Structure de marges"
                      />
                    )}
                  </div>
                )}

                {/* Notes */}
                {vContent.unitEconomics.notes && (
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    {vContent.unitEconomics.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : implContent?.valueArchitecture?.valueProposition ||
        implContent?.valueArchitecture?.productLadder?.length ||
        implContent?.valueArchitecture?.unitEconomics?.cac ? (
        /* ----------------------------------------------------------------
           Fallback: implContent.valueArchitecture
        ---------------------------------------------------------------- */
        <div className="space-y-5">
          {/* Value Proposition */}
          {implContent.valueArchitecture.valueProposition && (
            <div className="rounded-lg border-l-4 bg-muted/30 px-4 py-3" style={{ borderColor: `${color}50` }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Proposition de valeur
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {implContent.valueArchitecture.valueProposition}
              </p>
            </div>
          )}

          {/* Product Ladder from impl */}
          {Array.isArray(implContent.valueArchitecture.productLadder) &&
            implContent.valueArchitecture.productLadder.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Ladder
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {implContent.valueArchitecture.productLadder.map((item, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.tier}</span>
                      {item.price && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {item.price}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-foreground/80">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit Economics from impl */}
          {(implContent.valueArchitecture.unitEconomics?.cac ||
            implContent.valueArchitecture.unitEconomics?.ltv ||
            implContent.valueArchitecture.unitEconomics?.ratio) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unit Economics
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {implContent.valueArchitecture.unitEconomics.cac && (
                  <MetricCard
                    label="CAC"
                    value={implContent.valueArchitecture.unitEconomics.cac}
                    description={"Coût d\'acquisition client"}
                  />
                )}
                {implContent.valueArchitecture.unitEconomics.ltv && (
                  <MetricCard
                    label="LTV"
                    value={implContent.valueArchitecture.unitEconomics.ltv}
                    description="Lifetime value"
                  />
                )}
                {implContent.valueArchitecture.unitEconomics.ratio && (
                  <MetricCard
                    label="Ratio LTV/CAC"
                    value={implContent.valueArchitecture.unitEconomics.ratio}
                    description={"Rentabilité client"}
                  />
                )}
              </div>
              {implContent.valueArchitecture.unitEconomics.notes && (
                <p className="mt-2 text-sm italic leading-relaxed text-foreground/80">
                  {implContent.valueArchitecture.unitEconomics.notes}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ----------------------------------------------------------------
           Final fallback: PillarContentDisplay
        ---------------------------------------------------------------- */
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
