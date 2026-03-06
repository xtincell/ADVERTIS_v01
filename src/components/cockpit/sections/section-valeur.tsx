// =============================================================================
// COMPONENT C.K4 — Section Valeur
// =============================================================================
// Pillar V cockpit display: Value Architecture (V2 flat format).
// Props: vContent (ValeurPillarDataV2), implContent, pillar, vertical.
// Key features: product catalogue (V0), product ladder, 4x value arrays
// (brand/client tangible/intangible), 4x cost arrays, flat unit economics
// (CAC, LTV, ratio, break-even, margins), derived metrics (margeNette,
// roiEstime, paybackPeriod). Falls back to implContent.valueArchitecture.
// =============================================================================

// Section Valeur (Pillar V) — Catalogue, Product Ladder, Value/Cost, Unit Economics

"use client";

import { useState } from "react";
import {
  TrendingUp,
  Zap,
  Heart,
  AlertTriangle,
  Package,
  Calculator,
  Eye,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { SupportedCurrency } from "~/lib/constants";
import type { ValeurPillarDataV2, ValeurCoutItem, ProduitService } from "~/lib/types/pillar-schemas";
import type { ImplementationData } from "~/lib/types/implementation-data";
import { getCurrencySymbol } from "~/lib/currency";
import {
  CockpitSection,
  DataCard,
  MetricCard,
  PillarContentDisplay,
} from "../cockpit-shared";
import { ProductSheetEnhanced } from "../product-sheet-enhanced";

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

// Helper: render a ValeurCoutItem array as a list
function ValeurCoutItemList({
  items,
  icon,
  color,
}: {
  items: ValeurCoutItem[];
  icon: React.ReactNode;
  color?: string;
}) {
  const filtered = items.filter((i) => i.item?.trim());
  if (filtered.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {filtered.map((item, i) => (
        <div key={i} className="flex items-start gap-2 pl-1 text-sm">
          <span className="mt-0.5 shrink-0">{icon}</span>
          <div className="flex-1">
            <span className="text-foreground/80">{item.item}</span>
            {item.montant && item.montant.trim() && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({item.montant})
              </span>
            )}
            {item.categorie && item.categorie.trim() && (
              <span className="ml-1 inline-flex rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {item.categorie}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper: check if a ValeurCoutItem array has displayable content
function hasItems(arr: ValeurCoutItem[] | undefined): boolean {
  return Array.isArray(arr) && arr.some((i) => i.item?.trim());
}

// Helper: check if a string has displayable content
function hasVal(val: string | undefined): boolean {
  return !!val && val.trim().length > 0;
}

export function SectionValeur({
  vContent,
  implContent,
  pillar,
  vertical,
  currency,
}: {
  vContent: ValeurPillarDataV2;
  implContent: ImplementationData;
  pillar?: PillarData | null;
  vertical?: string | null;
  currency?: SupportedCurrency;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProduitService | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const color = PILLAR_CONFIG.V.color;
  const currencySymbol = getCurrencySymbol(currency ?? "XOF");

  // Annotate a price string with currency if not already present
  const annotatePrice = (prix: string | undefined | null): string => {
    if (!prix) return "";
    if (CURRENCY_SYMBOLS_RE.test(prix)) return prix;
    return `${prix} ${currencySymbol}`;
  };

  // Check if V2 data has any displayable content
  const hasV2Data =
    vContent?.produitsCatalogue?.length > 0 ||
    vContent?.productLadder?.length > 0 ||
    hasItems(vContent?.valeurMarqueTangible) ||
    hasItems(vContent?.valeurMarqueIntangible) ||
    hasItems(vContent?.valeurClientTangible) ||
    hasItems(vContent?.valeurClientIntangible) ||
    hasItems(vContent?.coutMarqueTangible) ||
    hasItems(vContent?.coutMarqueIntangible) ||
    hasItems(vContent?.coutClientTangible) ||
    hasItems(vContent?.coutClientIntangible) ||
    hasVal(vContent?.cac) ||
    hasVal(vContent?.ltv);

  return (
    <CockpitSection
      icon={<TrendingUp className="h-5 w-5" />}
      pillarLetter="V"
      title="Architecture de Valeur"
      subtitle="Valeur — Catalogue, Pricing, Unit Economics"
      color={color}
      updatedAt={pillar?.updatedAt}
      vertical={vertical}
    >
      {hasV2Data ? (
        <div className="space-y-5">
          {/* ----------------------------------------------------------------
              0. Catalogue Produits (V0)
          ---------------------------------------------------------------- */}
          {Array.isArray(vContent.produitsCatalogue) && vContent.produitsCatalogue.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Catalogue Produits & Services
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vContent.produitsCatalogue.map((prod, i) => (
                  <button
                    key={prod.id || i}
                    type="button"
                    className="rounded-lg border p-3 space-y-1 text-left hover:border-amber-400/50 hover:bg-amber-50/5 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedProduct(prod);
                      setSheetOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <span className="text-sm font-semibold">{prod.nom || `Produit ${i + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] capitalize">
                          {prod.categorie}
                        </span>
                        <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {prod.prix && (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {annotatePrice(prod.prix)}
                        </span>
                        {prod.cout && (
                          <span className="text-[10px] text-muted-foreground">
                            Cout : {annotatePrice(prod.cout)}
                          </span>
                        )}
                      </div>
                    )}
                    {prod.description && (
                      <p className="text-xs text-foreground/80">{prod.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {prod.segmentCible && (
                        <span className="text-[11px] text-muted-foreground">
                          Segment : {prod.segmentCible}
                        </span>
                      )}
                      {prod.phaseLifecycle && (
                        <span className="inline-flex rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
                          {prod.phaseLifecycle}
                        </span>
                      )}
                      {prod.scoreEmotionnelADVE > 0 && (
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                          ADVE {prod.scoreEmotionnelADVE}
                        </span>
                      )}
                      {prod.leviersPsychologiques?.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {prod.leviersPsychologiques.length} levier(s)
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                    {item.produitIds?.length > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {item.produitIds.length} produit(s) lie(s)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              2-3. Valeur Marque — Tangible & Intangible
          ---------------------------------------------------------------- */}
          {(hasItems(vContent.valeurMarqueTangible) || hasItems(vContent.valeurMarqueIntangible)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valeur de marque
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasItems(vContent.valeurMarqueTangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Tangible</p>
                    <ValeurCoutItemList
                      items={vContent.valeurMarqueTangible}
                      icon={<Zap className="h-3.5 w-3.5" style={{ color }} />}
                    />
                  </div>
                )}
                {hasItems(vContent.valeurMarqueIntangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Intangible</p>
                    <ValeurCoutItemList
                      items={vContent.valeurMarqueIntangible}
                      icon={<Heart className="h-3.5 w-3.5" style={{ color }} />}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              4-5. Valeur Client — Tangible & Intangible
          ---------------------------------------------------------------- */}
          {(hasItems(vContent.valeurClientTangible) || hasItems(vContent.valeurClientIntangible)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valeur client
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasItems(vContent.valeurClientTangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Tangible</p>
                    <ValeurCoutItemList
                      items={vContent.valeurClientTangible}
                      icon={<Zap className="h-3.5 w-3.5 text-emerald-600" />}
                    />
                  </div>
                )}
                {hasItems(vContent.valeurClientIntangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Intangible</p>
                    <ValeurCoutItemList
                      items={vContent.valeurClientIntangible}
                      icon={<Heart className="h-3.5 w-3.5 text-emerald-600" />}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              6-7. Cout Marque — Tangible & Intangible
          ---------------------------------------------------------------- */}
          {(hasItems(vContent.coutMarqueTangible) || hasItems(vContent.coutMarqueIntangible)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Structure de couts marque
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasItems(vContent.coutMarqueTangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Tangible (CAPEX/OPEX)</p>
                    <ValeurCoutItemList
                      items={vContent.coutMarqueTangible}
                      icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    />
                  </div>
                )}
                {hasItems(vContent.coutMarqueIntangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Intangible (couts caches)</p>
                    <ValeurCoutItemList
                      items={vContent.coutMarqueIntangible}
                      icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              8-9. Cout Client — Tangible & Intangible
          ---------------------------------------------------------------- */}
          {(hasItems(vContent.coutClientTangible) || hasItems(vContent.coutClientIntangible)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Frictions client
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasItems(vContent.coutClientTangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Tangible</p>
                    <ValeurCoutItemList
                      items={vContent.coutClientTangible}
                      icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    />
                  </div>
                )}
                {hasItems(vContent.coutClientIntangible) && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Intangible</p>
                    <ValeurCoutItemList
                      items={vContent.coutClientIntangible}
                      icon={<AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              10. Unit Economics
          ---------------------------------------------------------------- */}
          {(hasVal(vContent.cac) ||
            hasVal(vContent.ltv) ||
            hasVal(vContent.ltvCacRatio) ||
            hasVal(vContent.pointMort) ||
            hasVal(vContent.marges)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unit Economics
              </p>
              <div className="space-y-3">
                {/* CAC, LTV, Ratio */}
                {(hasVal(vContent.cac) || hasVal(vContent.ltv) || hasVal(vContent.ltvCacRatio)) && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {hasVal(vContent.cac) && (
                      <MetricCard
                        label="CAC"
                        value={vContent.cac}
                        description="Cout d'acquisition client"
                      />
                    )}
                    {hasVal(vContent.ltv) && (
                      <MetricCard
                        label="LTV"
                        value={vContent.ltv}
                        description={`Lifetime value${vContent.dureeLTV ? ` (${vContent.dureeLTV} mois)` : ""}`}
                      />
                    )}
                    {hasVal(vContent.ltvCacRatio) && (
                      <MetricCard
                        label="Ratio LTV/CAC"
                        value={vContent.ltvCacRatio}
                        description="Rentabilite client"
                      />
                    )}
                  </div>
                )}

                {/* Point Mort + Marges */}
                {(hasVal(vContent.pointMort) || hasVal(vContent.marges)) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {hasVal(vContent.pointMort) && (
                      <MetricCard
                        label="Point mort"
                        value={vContent.pointMort}
                        description="Seuil de rentabilite"
                      />
                    )}
                    {hasVal(vContent.marges) && (
                      <MetricCard
                        label="Marges"
                        value={vContent.marges}
                        description="Structure de marges"
                      />
                    )}
                  </div>
                )}

                {/* Notes */}
                {hasVal(vContent.notesEconomics) && (
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    {vContent.notesEconomics}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              11. Derived Metrics
          ---------------------------------------------------------------- */}
          {(hasVal(vContent.margeNette) || hasVal(vContent.roiEstime) || hasVal(vContent.paybackPeriod)) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Calculator className="mr-1 inline h-3.5 w-3.5" />
                Metriques derivees
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {hasVal(vContent.margeNette) && (
                  <MetricCard
                    label="Marge nette"
                    value={vContent.margeNette}
                    description="LTV - CAC"
                  />
                )}
                {hasVal(vContent.roiEstime) && (
                  <MetricCard
                    label="ROI estime"
                    value={vContent.roiEstime}
                    description="(LTV-CAC)/CAC"
                  />
                )}
                {hasVal(vContent.paybackPeriod) && (
                  <MetricCard
                    label="Payback period"
                    value={vContent.paybackPeriod}
                    description="CAC / (LTV/duree)"
                  />
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
                    description="Cout d'acquisition client"
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
                    description="Rentabilite client"
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

      {/* Product Detail Sheet */}
      <ProductSheetEnhanced
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={selectedProduct}
        currency={currencySymbol}
      />
    </CockpitSection>
  );
}
