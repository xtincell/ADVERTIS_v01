// Section Distinction (Pillar D) — Positioning, Personas, Visual Identity

import {
  Target,
  Crown,
  Zap,
  MessageCircle,
  Eye,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

import { PILLAR_CONFIG } from "~/lib/constants";
import type { DistinctionPillarData } from "~/lib/types/pillar-data";
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

const COLOR = PILLAR_CONFIG.D.color; // #2d5a3d

export function SectionDistinction({
  dContent,
  implContent,
  pillar,
}: {
  dContent: DistinctionPillarData;
  implContent: ImplementationData;
  pillar?: PillarData | null;
}) {
  // Check whether we have meaningful D-pillar data
  const hasDContent =
    dContent?.positionnement ||
    dContent?.promessesDeMarque?.promesseMaitre ||
    (Array.isArray(dContent?.personas) && dContent.personas.length > 0) ||
    (Array.isArray(dContent?.paysageConcurrentiel?.concurrents) &&
      dContent.paysageConcurrentiel.concurrents.length > 0);

  // Check whether we have implementation fallback data
  const hasImplContent =
    implContent?.positioning?.statement ||
    (Array.isArray(implContent?.positioning?.differentiators) &&
      implContent.positioning.differentiators.length > 0) ||
    (Array.isArray(implContent?.positioning?.personas) &&
      implContent.positioning.personas.length > 0) ||
    (Array.isArray(implContent?.positioning?.competitors) &&
      implContent.positioning.competitors.length > 0);

  return (
    <CockpitSection
      icon={<Target className="h-5 w-5" />}
      pillarLetter="D"
      title="Positionnement & Identite"
      subtitle="Distinction — Personas, Concurrence, Identite visuelle"
      color={COLOR}
    >
      {hasDContent ? (
        <div className="space-y-5">
          {/* 1. Positionnement — statement with left accent */}
          {dContent.positionnement && (
            <div
              className="rounded-lg border-l-4 bg-muted/30 px-4 py-3"
              style={{ borderLeftColor: COLOR }}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Positionnement
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {dContent.positionnement}
              </p>
            </div>
          )}

          {/* 2. Promesse Maitre — master promise with Crown icon */}
          {dContent.promessesDeMarque?.promesseMaitre && (
            <div className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-[#2d5a3d]/5 to-transparent p-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2d5a3d]/10">
                <Crown className="h-4 w-4 text-[#2d5a3d]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promesse maitre
                </p>
                <p className="mt-0.5 text-base font-semibold">
                  {dContent.promessesDeMarque.promesseMaitre}
                </p>
              </div>
            </div>
          )}

          {/* 3. Sous-Promesses — list with Zap icons */}
          {Array.isArray(dContent.promessesDeMarque?.sousPromesses) &&
            dContent.promessesDeMarque.sousPromesses.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sous-promesses
                </p>
                <div className="space-y-2">
                  {dContent.promessesDeMarque.sousPromesses.map((sp, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2"
                    >
                      <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#2d5a3d]" />
                      <p className="text-sm">{sp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 4. Ton de Voix — personnalite */}
          {dContent.tonDeVoix?.personnalite && (
            <DataCard
              icon={<MessageCircle className="h-4 w-4" />}
              label="Ton de voix — Personnalite"
              value={dContent.tonDeVoix.personnalite}
            />
          )}

          {/* 5. On dit (green) */}
          {Array.isArray(dContent.tonDeVoix?.onDit) &&
            dContent.tonDeVoix.onDit.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  On dit
                </p>
                <ul className="space-y-1.5">
                  {dContent.tonDeVoix.onDit.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-foreground/80"
                    >
                      <span className="mt-0.5 shrink-0 text-emerald-600">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* 6. On ne dit pas (red) */}
          {Array.isArray(dContent.tonDeVoix?.onNeditPas) &&
            dContent.tonDeVoix.onNeditPas.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-800">
                  On ne dit pas
                </p>
                <ul className="space-y-1.5">
                  {dContent.tonDeVoix.onNeditPas.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-foreground/80"
                    >
                      <span className="mt-0.5 shrink-0 text-red-600">
                        &#10007;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* 7. Personas — card grid */}
          {Array.isArray(dContent.personas) && dContent.personas.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personas
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
                    {p.demographie && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium">Demo :</span>{" "}
                        {p.demographie}
                      </p>
                    )}
                    {p.psychographie && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium">Psycho :</span>{" "}
                        {p.psychographie}
                      </p>
                    )}
                    {p.motivations && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium">Motivations :</span>{" "}
                        {p.motivations}
                      </p>
                    )}
                    {p.freins && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium">Freins :</span>{" "}
                        {p.freins}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Paysage concurrentiel — concurrents card grid */}
          {Array.isArray(dContent.paysageConcurrentiel?.concurrents) &&
            dContent.paysageConcurrentiel.concurrents.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paysage concurrentiel
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dContent.paysageConcurrentiel.concurrents.map((c, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <span className="text-sm font-semibold">{c.nom}</span>
                      {c.forces && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">Forces :</span>{" "}
                          {c.forces}
                        </p>
                      )}
                      {c.faiblesses && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-medium">Faiblesses :</span>{" "}
                          {c.faiblesses}
                        </p>
                      )}
                      {c.partDeMarche && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-medium">Part de marche :</span>{" "}
                          {c.partDeMarche}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 9. Avantages competitifs — tag pills with CheckCircle2 */}
          {Array.isArray(dContent.paysageConcurrentiel?.avantagesCompetitifs) &&
            dContent.paysageConcurrentiel.avantagesCompetitifs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Avantages competitifs
                </p>
                <div className="flex flex-wrap gap-2">
                  {dContent.paysageConcurrentiel.avantagesCompetitifs.map(
                    (a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#2d5a3d]/20 bg-[#2d5a3d]/5 px-3 py-1 text-sm font-medium"
                      >
                        <CheckCircle2 className="h-3 w-3 text-[#2d5a3d]" />
                        {a}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* 10. Identite visuelle — direction artistique */}
          {dContent.identiteVisuelle?.directionArtistique && (
            <DataCard
              icon={<Eye className="h-4 w-4" />}
              label="Direction artistique"
              value={dContent.identiteVisuelle.directionArtistique}
            />
          )}

          {/* 11. Identite visuelle — mood */}
          {dContent.identiteVisuelle?.mood && (
            <DataCard
              icon={<Lightbulb className="h-4 w-4" />}
              label="Mood"
              value={dContent.identiteVisuelle.mood}
            />
          )}

          {/* 12. Palette de couleurs — color pills */}
          {Array.isArray(dContent.identiteVisuelle?.paletteCouleurs) &&
            dContent.identiteVisuelle.paletteCouleurs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Palette de couleurs
                </p>
                <div className="flex flex-wrap gap-2">
                  {dContent.identiteVisuelle.paletteCouleurs.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border"
                        style={{
                          backgroundColor: c.startsWith("#") ? c : undefined,
                        }}
                      />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* 13. Mantras — italic quoted list */}
          {Array.isArray(dContent.assetsLinguistiques?.mantras) &&
            dContent.assetsLinguistiques.mantras.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mantras
                </p>
                <div className="space-y-2">
                  {dContent.assetsLinguistiques.mantras.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-lg border-l-4 border-[#2d5a3d]/30 bg-muted/30 px-4 py-2"
                    >
                      <p className="text-sm italic leading-relaxed text-foreground/80">
                        &ldquo;{m}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 14. Vocabulaire proprietaire — tag pills */}
          {Array.isArray(
            dContent.assetsLinguistiques?.vocabulaireProprietaire,
          ) &&
            dContent.assetsLinguistiques.vocabulaireProprietaire.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Vocabulaire proprietaire
                </p>
                <div className="flex flex-wrap gap-2">
                  {dContent.assetsLinguistiques.vocabulaireProprietaire.map(
                    (v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-[#2d5a3d]/20 bg-[#2d5a3d]/5 px-3 py-1 text-sm font-medium"
                      >
                        {v}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      ) : hasImplContent ? (
        /* ----------------------------------------------------------------- */
        /* Fallback: Implementation data (positioning)                       */
        /* ----------------------------------------------------------------- */
        <div className="space-y-5">
          {/* Statement */}
          {implContent.positioning.statement && (
            <div
              className="rounded-lg border-l-4 bg-muted/30 px-4 py-3"
              style={{ borderLeftColor: COLOR }}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Positionnement
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {implContent.positioning.statement}
              </p>
            </div>
          )}

          {/* Differentiators */}
          {Array.isArray(implContent.positioning.differentiators) &&
            implContent.positioning.differentiators.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Differenciateurs
                </p>
                <div className="flex flex-wrap gap-2">
                  {implContent.positioning.differentiators.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2d5a3d]/20 bg-[#2d5a3d]/5 px-3 py-1 text-sm font-medium"
                    >
                      <CheckCircle2 className="h-3 w-3 text-[#2d5a3d]" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Tone of Voice */}
          {implContent.positioning.toneOfVoice && (
            <DataCard
              icon={<MessageCircle className="h-4 w-4" />}
              label="Ton de voix"
              value={implContent.positioning.toneOfVoice}
            />
          )}

          {/* Personas */}
          {Array.isArray(implContent.positioning.personas) &&
            implContent.positioning.personas.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personas
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {implContent.positioning.personas.map((p, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d5a3d]/10 text-xs font-bold text-[#2d5a3d]">
                          {p.priority ?? i + 1}
                        </div>
                        <span className="text-sm font-semibold">{p.name}</span>
                      </div>
                      {p.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Competitors */}
          {Array.isArray(implContent.positioning.competitors) &&
            implContent.positioning.competitors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Concurrents
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {implContent.positioning.competitors.map((c, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <span className="text-sm font-semibold">{c.name}</span>
                      {c.position && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.position}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        /* ----------------------------------------------------------------- */
        /* Final fallback: raw pillar content display                        */
        /* ----------------------------------------------------------------- */
        <PillarContentDisplay pillar={pillar} />
      )}
    </CockpitSection>
  );
}
