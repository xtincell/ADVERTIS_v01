// =============================================================================
// COMPONENT C.K36 — Section Multi-Markets
// =============================================================================
// M5 — Country selector + 5 dimensions per market adaptation.
// =============================================================================

"use client";

import { useState } from "react";
import {
  Globe,
  Loader2,
  Languages,
  Heart,
  Truck,
  Radio,
  Shield,
} from "lucide-react";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { CockpitSection } from "../cockpit-shared";
import { SectionAccordion } from "../section-accordion";
import { GenerateButton } from "../generate-button";
import {
  MarketAdaptationDimensionSchema,
  CulturalDimensionSchema,
  DistributionDimensionSchema,
  MediaDimensionSchema,
  RegulatoryDimensionSchema,
} from "~/lib/types/deliverable-schemas";

const COUNTRY_LABELS: Record<string, string> = {
  CM: "Cameroun",
  CI: "Côte d'Ivoire",
  SN: "Sénégal",
  GH: "Ghana",
  NG: "Nigeria",
  GA: "Gabon",
  CG: "Congo",
  CD: "RD Congo",
  BF: "Burkina Faso",
  ML: "Mali",
};

export function SectionMultiMarkets({ strategyId }: { strategyId: string }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [newCountry, setNewCountry] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: adaptations, isLoading } =
    api.deliverables.multiMarkets.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  const generateMutation = api.deliverables.multiMarkets.generate.useMutation({
    onSuccess: () => {
      void utils.deliverables.multiMarkets.getByStrategy.invalidate({ strategyId });
      setNewCountry("");
      setGenError(null);
    },
    onError: (err) => setGenError(err.message),
  });

  const selectedAdaptation = selectedCountry
    ? adaptations?.find((a) => a.country === selectedCountry)
    : adaptations?.[0];

  // Auto-select first country
  if (!selectedCountry && adaptations && adaptations.length > 0) {
    // handled in render
  }

  if (isLoading) {
    return (
      <CockpitSection
        icon={<Globe className="h-5 w-5" />}
        pillarLetter="T"
        title="Adaptations Multi-Marchés"
        subtitle="Chargement…"
        color="#0891B2"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CockpitSection>
    );
  }

  if (!adaptations || adaptations.length === 0) {
    return (
      <CockpitSection
        icon={<Globe className="h-5 w-5" />}
        pillarLetter="T"
        title="Adaptations Multi-Marchés"
        subtitle="Non configuré"
        color="#0891B2"
      >
        <div className="space-y-3 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Aucune adaptation multi-marchés configurée. Sélectionnez un pays pour générer une adaptation.
          </p>
          <div className="flex items-center justify-center gap-2">
            <select
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Choisir un pays…</option>
              {Object.entries(COUNTRY_LABELS).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <GenerateButton
              onClick={() => {
                if (!newCountry) return;
                generateMutation.mutate({
                  strategyId,
                  countryCode: newCountry,
                  countryName: COUNTRY_LABELS[newCountry] ?? newCountry,
                });
              }}
              isLoading={generateMutation.isPending}
              label="Générer"
              loadingLabel="Génération…"
              variant="secondary"
              className="shrink-0"
            />
          </div>
          {genError && <p className="text-center text-xs text-red-600">{genError}</p>}
        </div>
      </CockpitSection>
    );
  }

  const activeCountry = selectedCountry ?? adaptations[0]!.country;
  const active = adaptations.find((a) => a.country === activeCountry);

  const linguistic = active?.linguistic ? MarketAdaptationDimensionSchema.safeParse(active.linguistic) : null;
  const cultural = active?.cultural ? CulturalDimensionSchema.safeParse(active.cultural) : null;
  const distribution = active?.distribution ? DistributionDimensionSchema.safeParse(active.distribution) : null;
  const media = active?.media ? MediaDimensionSchema.safeParse(active.media) : null;
  const regulatory = active?.regulatory ? RegulatoryDimensionSchema.safeParse(active.regulatory) : null;

  return (
    <CockpitSection
      icon={<Globe className="h-5 w-5" />}
      pillarLetter="T"
      title="Adaptations Multi-Marchés"
      subtitle={`${adaptations.length} marché${adaptations.length > 1 ? "s" : ""}`}
      color="#0891B2"
    >
      <div className="space-y-4">
        {/* Country selector + generate */}
        <div className="flex flex-wrap items-center gap-2">
          {adaptations.map((a) => (
            <button
              key={a.country}
              onClick={() => setSelectedCountry(a.country)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                a.country === activeCountry
                  ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              {COUNTRY_LABELS[a.country] ?? a.country}
            </button>
          ))}
          <span className="mx-1 text-muted-foreground/30">|</span>
          <select
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            className="rounded-full border bg-background px-2 py-1 text-xs"
          >
            <option value="">+ Pays…</option>
            {Object.entries(COUNTRY_LABELS)
              .filter(([code]) => !adaptations.some((a) => a.country === code))
              .map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
          </select>
          {newCountry && (
            <GenerateButton
              onClick={() => {
                generateMutation.mutate({
                  strategyId,
                  countryCode: newCountry,
                  countryName: COUNTRY_LABELS[newCountry] ?? newCountry,
                });
              }}
              isLoading={generateMutation.isPending}
              label="Générer"
              loadingLabel="…"
              variant="secondary"
              className="shrink-0 !px-2 !py-0.5 !text-[10px]"
            />
          )}
          {genError && <span className="text-xs text-red-600">{genError}</span>}
        </div>

        {active && (
          <div className="space-y-3">
            {/* Linguistic */}
            {linguistic?.success && (
              <SectionAccordion
                title="Dimension Linguistique"
                icon={<Languages className="h-4 w-4" />}
                accentColor="#0891B2"
                defaultOpen
              >
                <div className="space-y-2">
                  {linguistic.data.language && (
                    <p className="text-sm"><strong>Langue:</strong> {linguistic.data.language}</p>
                  )}
                  {linguistic.data.dialect && (
                    <p className="text-sm"><strong>Dialecte:</strong> {linguistic.data.dialect}</p>
                  )}
                  {linguistic.data.adaptations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Adaptations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {linguistic.data.adaptations.map((a, i) => (
                          <span key={i} className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs text-cyan-700">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {linguistic.data.translations.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="pb-1 text-left font-medium">Original</th>
                            <th className="pb-1 text-left font-medium">Adapté</th>
                            <th className="pb-1 text-left font-medium">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {linguistic.data.translations.map((t, i) => (
                            <tr key={i} className="border-b border-muted/30">
                              <td className="py-1">{t.original}</td>
                              <td className="py-1 font-medium">{t.adapted}</td>
                              <td className="py-1 text-muted-foreground">{t.note ?? ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </SectionAccordion>
            )}

            {/* Cultural */}
            {cultural?.success && (
              <SectionAccordion
                title="Dimension Culturelle"
                icon={<Heart className="h-4 w-4" />}
                accentColor="#0891B2"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {cultural.data.celebrations.length > 0 && (
                    <div className="rounded-md bg-emerald-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-emerald-700">Célébrations</p>
                      <ul className="space-y-0.5">
                        {cultural.data.celebrations.map((c, i) => (
                          <li key={i} className="text-xs">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cultural.data.taboos.length > 0 && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-red-700">Tabous</p>
                      <ul className="space-y-0.5">
                        {cultural.data.taboos.map((t, i) => (
                          <li key={i} className="text-xs">{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cultural.data.localInsights.length > 0 && (
                    <div className="rounded-md bg-blue-50 p-3 sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-blue-700">Insights locaux</p>
                      <ul className="space-y-0.5">
                        {cultural.data.localInsights.map((ins, i) => (
                          <li key={i} className="text-xs">{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionAccordion>
            )}

            {/* Distribution */}
            {distribution?.success && (
              <SectionAccordion
                title="Distribution"
                icon={<Truck className="h-4 w-4" />}
                accentColor="#0891B2"
              >
                <div className="space-y-2">
                  {distribution.data.channels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {distribution.data.channels.map((ch, i) => (
                        <span key={i} className="rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-xs">{ch}</span>
                      ))}
                    </div>
                  )}
                  {distribution.data.logistics && (
                    <p className="text-xs text-muted-foreground">{distribution.data.logistics}</p>
                  )}
                </div>
              </SectionAccordion>
            )}

            {/* Media */}
            {media?.success && (
              <SectionAccordion
                title="Paysage Média"
                icon={<Radio className="h-4 w-4" />}
                accentColor="#0891B2"
              >
                <div className="space-y-2">
                  {media.data.topChannels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {media.data.topChannels.map((ch, i) => (
                        <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{ch}</span>
                      ))}
                    </div>
                  )}
                  {media.data.digitalPenetration != null && (
                    <p className="text-xs">
                      <strong>Pénétration digitale:</strong> {media.data.digitalPenetration}%
                    </p>
                  )}
                  {media.data.mediaHabits && (
                    <p className="text-xs text-muted-foreground">{media.data.mediaHabits}</p>
                  )}
                </div>
              </SectionAccordion>
            )}

            {/* Regulatory */}
            {regulatory?.success && (
              <SectionAccordion
                title="Cadre Réglementaire"
                icon={<Shield className="h-4 w-4" />}
                accentColor="#0891B2"
              >
                <div className="space-y-2">
                  {regulatory.data.restrictions.length > 0 && (
                    <div className="rounded-md bg-red-50 p-2">
                      <p className="mb-1 text-[10px] font-semibold text-red-700">Restrictions</p>
                      <ul className="space-y-0.5">
                        {regulatory.data.restrictions.map((r, i) => (
                          <li key={i} className="text-xs text-red-800">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {regulatory.data.requiredMentions.length > 0 && (
                    <div className="rounded-md bg-amber-50 p-2">
                      <p className="mb-1 text-[10px] font-semibold text-amber-700">Mentions obligatoires</p>
                      <ul className="space-y-0.5">
                        {regulatory.data.requiredMentions.map((m, i) => (
                          <li key={i} className="text-xs text-amber-800">• {m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {regulatory.data.approvalProcess && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Process d'approbation:</strong> {regulatory.data.approvalProcess}
                    </p>
                  )}
                </div>
              </SectionAccordion>
            )}
          </div>
        )}
      </div>
    </CockpitSection>
  );
}
