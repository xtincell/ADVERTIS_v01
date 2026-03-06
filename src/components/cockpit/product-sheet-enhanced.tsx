// =============================================================================
// COMPONENT C.KPS — Product Sheet Enhanced
// =============================================================================
// Sheet lateral with 8 sections per product/service:
// 1. Header — nom, categorie, prix/cout, SKU, lifecycle, score ADVE
// 2. Mix Marketing 4P — grille lisible
// 3. Leviers Psychologiques — barres horizontales
// 4. Pyramide de Maslow — 5 couches, opacite ∝ pertinence
// 5. Nano Banana — card prompt + copier
// 6. Saisonnalite — 12 barres mensuelles
// 7. Cannibalization — SKU impactes + % risque
// 8. Reglementaire — badges par flag
// =============================================================================

"use client";

import { useState } from "react";
import {
  Package,
  Copy,
  Check,
  ShoppingBag,
  DollarSign,
  MapPin,
  Megaphone,
  AlertTriangle,
  ShieldAlert,
  Palette,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { ProduitService } from "~/lib/types/pillar-schemas";
import {
  MASLOW_LEVELS,
  PSYCHOLOGICAL_LEVERS,
  REGULATORY_FLAGS,
  SEASONALITY_PROFILES,
  MONTH_NAMES_FR,
} from "~/lib/constants/marketing-levers";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductSheetEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProduitService | null;
  currency?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductSheetEnhanced({
  open,
  onOpenChange,
  product,
  currency = "XAF",
}: ProductSheetEnhancedProps) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyPrompt = async () => {
    if (!product.nanoBananaPrompt?.prompt) return;
    await navigator.clipboard.writeText(product.nanoBananaPrompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lifecycleColors: Record<string, string> = {
    launch: "#3B82F6",
    growth: "#10B981",
    mature: "#F59E0B",
    decline: "#EF4444",
  };

  const lifecycleLabels: Record<string, string> = {
    launch: "Lancement",
    growth: "Croissance",
    mature: "Maturite",
    decline: "Declin",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-500" />
            {product.nom || "Produit sans nom"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-5 px-1">
          {/* ═══════════════════════════════════════════════════════════════
              1. HEADER
          ═══════════════════════════════════════════════════════════════ */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {product.categorie}
              </Badge>
              {product.phaseLifecycle && (
                <Badge
                  style={{
                    backgroundColor: `${lifecycleColors[product.phaseLifecycle] ?? "#6B7280"}15`,
                    color: lifecycleColors[product.phaseLifecycle] ?? "#6B7280",
                    borderColor: `${lifecycleColors[product.phaseLifecycle] ?? "#6B7280"}40`,
                  }}
                >
                  {lifecycleLabels[product.phaseLifecycle] ?? product.phaseLifecycle}
                </Badge>
              )}
              {product.skuRef && (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  SKU: {product.skuRef}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {product.prix && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Prix</p>
                  <p className="text-lg font-bold text-amber-600">
                    {product.prix} {currency}
                  </p>
                </div>
              )}
              {product.cout && (
                <div className="rounded-lg border p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cout</p>
                  <p className="text-lg font-bold text-red-500">
                    {product.cout} {currency}
                  </p>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-foreground/80">{product.description}</p>
            )}

            {product.scoreEmotionnelADVE > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Score Emotionnel ADVE</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${product.scoreEmotionnelADVE}%`,
                      backgroundColor:
                        product.scoreEmotionnelADVE >= 70
                          ? "#10B981"
                          : product.scoreEmotionnelADVE >= 40
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  />
                </div>
                <span className="text-xs font-bold">{product.scoreEmotionnelADVE}/100</span>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              2. MIX MARKETING 4P
          ═══════════════════════════════════════════════════════════════ */}
          {(product.mixMarketing?.produit ||
            product.mixMarketing?.prix ||
            product.mixMarketing?.place ||
            product.mixMarketing?.promotion) && (
            <div>
              <SectionTitle>Mix Marketing 4P</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <MixCard
                  icon={<ShoppingBag className="h-4 w-4" />}
                  label="Produit"
                  value={product.mixMarketing.produit}
                  color="#10B981"
                />
                <MixCard
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Prix"
                  value={product.mixMarketing.prix}
                  color="#F59E0B"
                />
                <MixCard
                  icon={<MapPin className="h-4 w-4" />}
                  label="Place"
                  value={product.mixMarketing.place}
                  color="#3B82F6"
                />
                <MixCard
                  icon={<Megaphone className="h-4 w-4" />}
                  label="Promotion"
                  value={product.mixMarketing.promotion}
                  color="#8B5CF6"
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3. LEVIERS PSYCHOLOGIQUES
          ═══════════════════════════════════════════════════════════════ */}
          {product.leviersPsychologiques?.length > 0 && (
            <div>
              <SectionTitle>Leviers Psychologiques</SectionTitle>
              <div className="space-y-2">
                {product.leviersPsychologiques.map((lp, i) => {
                  const def = PSYCHOLOGICAL_LEVERS.find((l) => l.id === lp.levier);
                  const Icon = def?.icon;
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: def.color }} />}
                        <span className="text-xs font-medium flex-1">
                          {def?.label ?? lp.levier}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: def?.color }}>
                          {lp.intensite}/10
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(lp.intensite / 10) * 100}%`,
                            backgroundColor: def?.color ?? "#6B7280",
                          }}
                        />
                      </div>
                      {lp.description && (
                        <p className="text-[10px] text-muted-foreground pl-5">{lp.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              4. PYRAMIDE DE MASLOW
          ═══════════════════════════════════════════════════════════════ */}
          {product.maslowMapping?.length > 0 && (
            <div>
              <SectionTitle>Pyramide de Maslow</SectionTitle>
              <div className="flex flex-col-reverse gap-1">
                {MASLOW_LEVELS.map((level) => {
                  const mapping = product.maslowMapping.find(
                    (m) => m.niveau === level.id,
                  );
                  const pertinence = mapping?.pertinence ?? 0;
                  const opacity = pertinence > 0 ? 0.3 + (pertinence / 10) * 0.7 : 0.1;
                  const widthPct = 40 + level.level * 12; // Pyramid widening

                  return (
                    <div key={level.id} className="flex items-center gap-2">
                      <div
                        className="rounded-md px-3 py-2 text-center transition-all"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: level.color,
                          opacity,
                          marginLeft: `${(100 - widthPct) / 2}%`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {level.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                        {pertinence > 0 ? `${pertinence}/10` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Justifications */}
              <div className="mt-2 space-y-1">
                {product.maslowMapping
                  .filter((m) => m.justification)
                  .map((m, i) => {
                    const level = MASLOW_LEVELS.find((l) => l.id === m.niveau);
                    return (
                      <p key={i} className="text-[10px] text-muted-foreground">
                        <span className="font-semibold" style={{ color: level?.color }}>
                          {level?.label}
                        </span>
                        {" : "}
                        {m.justification}
                      </p>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              5. NANO BANANA PROMPT
          ═══════════════════════════════════════════════════════════════ */}
          {product.nanoBananaPrompt?.prompt && (
            <div>
              <SectionTitle>
                <Palette className="inline h-3.5 w-3.5 mr-1 text-fuchsia-500" />
                Nano Banana — Description Visuelle
              </SectionTitle>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  &quot;{product.nanoBananaPrompt.prompt}&quot;
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.nanoBananaPrompt.style && (
                    <Badge variant="secondary" className="text-[10px]">
                      Style: {product.nanoBananaPrompt.style}
                    </Badge>
                  )}
                  {product.nanoBananaPrompt.mood && (
                    <Badge variant="secondary" className="text-[10px]">
                      Mood: {product.nanoBananaPrompt.mood}
                    </Badge>
                  )}
                  {product.nanoBananaPrompt.colorDirection && (
                    <Badge variant="secondary" className="text-[10px]">
                      Couleur: {product.nanoBananaPrompt.colorDirection}
                    </Badge>
                  )}
                  {product.nanoBananaPrompt.aspectRatio && (
                    <Badge variant="secondary" className="text-[10px]">
                      {product.nanoBananaPrompt.aspectRatio}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCopyPrompt}
                >
                  {copied ? (
                    <Check className="mr-1.5 h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="mr-1.5 h-3 w-3" />
                  )}
                  {copied ? "Copie !" : "Copier le prompt"}
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              6. SAISONNALITE — 12 barres mensuelles
          ═══════════════════════════════════════════════════════════════ */}
          {product.saisonalite?.length > 0 && (
            <div>
              <SectionTitle>Saisonnalite</SectionTitle>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 12 }, (_, m) => {
                  const month = product.saisonalite.find((s) => s.mois === m + 1);
                  const coeff = month?.coefficient ?? 1.0;
                  const profil = month?.profil ?? "NORMAL";
                  const profile = SEASONALITY_PROFILES[profil] ?? SEASONALITY_PROFILES.NORMAL;
                  const heightPct = Math.round((coeff / 1.5) * 100);
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[8px] font-mono text-muted-foreground">
                        {coeff.toFixed(1)}
                      </span>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(heightPct, 10)}%`,
                          backgroundColor: profile?.color ?? "#94A3B8",
                        }}
                      />
                      <span className="text-[8px] text-muted-foreground">
                        {MONTH_NAMES_FR[m]?.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.values(SEASONALITY_PROFILES).map((p) => (
                  <div key={p.id} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-[9px] text-muted-foreground">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              7. CANNIBALIZATION
          ═══════════════════════════════════════════════════════════════ */}
          {product.cannibalisationRisque?.length > 0 && (
            <div>
              <SectionTitle>
                <AlertTriangle className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                Risque de Cannibalization
              </SectionTitle>
              <div className="space-y-1.5">
                {product.cannibalisationRisque.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border p-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.skuRef || "—"}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.risque}%`,
                          backgroundColor:
                            c.risque >= 70
                              ? "#EF4444"
                              : c.risque >= 40
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          c.risque >= 70
                            ? "#EF4444"
                            : c.risque >= 40
                              ? "#F59E0B"
                              : "#10B981",
                      }}
                    >
                      {c.risque}%
                    </span>
                    {c.description && (
                      <span className="text-[10px] text-muted-foreground max-w-[120px] truncate">
                        {c.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              8. REGLEMENTAIRE
          ═══════════════════════════════════════════════════════════════ */}
          {product.contraintesReglementaires?.length > 0 && (
            <div>
              <SectionTitle>
                <ShieldAlert className="inline h-3.5 w-3.5 mr-1 text-red-500" />
                Contraintes Reglementaires
              </SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {product.contraintesReglementaires.map((flagId) => {
                  const flag = REGULATORY_FLAGS.find((f) => f.id === flagId);
                  const severityColors = {
                    blocking: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
                    warning: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
                    info: { bg: "#DBEAFE", text: "#2563EB", border: "#BFDBFE" },
                  };
                  const colors = flag
                    ? severityColors[flag.severity]
                    : severityColors.info;
                  return (
                    <Badge
                      key={flagId}
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                      className="text-[10px]"
                    >
                      {flag?.label ?? flagId}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

function MixCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  color: string;
}) {
  if (!value) return null;
  return (
    <div className="rounded-lg border p-2.5 space-y-1">
      <div className="flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed">{value}</p>
    </div>
  );
}
