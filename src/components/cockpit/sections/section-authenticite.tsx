// Section Authenticité (Pillar A) — Brand DNA, Values, Identity

import {
  Star,
  Heart,
  Compass,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  Eye,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
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
}

export function SectionAuthenticite({
  aContent,
  implContent,
  pillar,
}: {
  aContent: AuthenticitePillarData;
  implContent: ImplementationData;
  pillar?: PillarData | null;
}) {
  return (
    <CockpitSection
      icon={<Compass className="h-5 w-5" />}
      pillarLetter="A"
      title="ADN de Marque"
      subtitle="Authenticité — Identité, Valeurs, Raison d'être"
      color={PILLAR_CONFIG.A.color}
    >
      {aContent?.identite?.archetype || aContent?.identite?.noyauIdentitaire ? (
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
                  { key: "acte1Origines", label: "Origines", icon: "\uD83C\uDF31" },
                  { key: "acte2Appel", label: "L'appel", icon: "\uD83D\uDCE2" },
                  { key: "acte3Epreuves", label: "Les épreuves", icon: "\u2694\uFE0F" },
                  { key: "acte4Transformation", label: "Transformation", icon: "\uD83E\uDD8B" },
                  { key: "acte5Revelation", label: "Révélation", icon: "\u2728" },
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
                      <p className="mt-1 text-xs text-[#c45a3c]">{"\u2726"} {h.privileges}</p>
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
      ) : implContent?.brandIdentity?.archetype ? (
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
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
