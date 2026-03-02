// =============================================================================
// PAGE P.GUILDE.MATCHING — Talent Matching
// =============================================================================
// Select a mission → see recommended talents ranked by match score.
// =============================================================================

"use client";

import { useState } from "react";
import { Target, Users, Star, Briefcase } from "lucide-react";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  TALENT_SPECIALIZATIONS,
  TALENT_SPECIALIZATION_LABELS,
  type TalentLevel,
  type TalentSpecialization,
} from "~/lib/constants";
import Link from "next/link";

export default function GuildeMatchingPage() {
  const [selectedMission, setSelectedMission] = useState<string>("");
  const [requiredSpecs, setRequiredSpecs] = useState<TalentSpecialization[]>([]);

  // Fetch missions for selector
  const { data: missions } = api.mission.missions.getKanban.useQuery(undefined, {
    select: (data: Record<string, any[]> | null | undefined) => {
      // Flatten kanban columns to get all missions
      if (!data) return [];
      return Object.values(data).flat();
    },
  });

  // Match talents
  const { data: matches, isLoading: matchLoading } = api.guilde.match.useQuery(
    {
      missionId: selectedMission,
      requiredSpecializations: requiredSpecs.length > 0 ? requiredSpecs : undefined,
      limit: 20,
    },
    { enabled: !!selectedMission },
  );

  const toggleSpec = (spec: TalentSpecialization) => {
    setRequiredSpecs((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec],
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
          <Target className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matching Talents</h1>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une mission pour trouver les talents idéaux.
          </p>
        </div>
      </div>

      {/* Mission selector */}
      <div className="rounded-xl border bg-white p-5 mb-6">
        <h2 className="font-semibold mb-3">Mission</h2>
        <Select value={selectedMission} onValueChange={setSelectedMission}>
          <SelectTrigger className="w-full md:w-[400px]">
            <SelectValue placeholder="Sélectionner une mission..." />
          </SelectTrigger>
          <SelectContent>
            {(missions as any[])?.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title} ({m.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Specialization filters */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Spécialisations recherchées (optionnel)</h3>
          <div className="flex flex-wrap gap-1.5">
            {TALENT_SPECIALIZATIONS.map((spec) => (
              <Badge
                key={spec}
                variant={requiredSpecs.includes(spec) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => toggleSpec(spec)}
              >
                {TALENT_SPECIALIZATION_LABELS[spec]}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {!selectedMission ? (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Sélectionnez une mission pour lancer le matching.</p>
        </div>
      ) : matchLoading ? (
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      ) : matches?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Aucun talent disponible ne correspond aux critères.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches?.map((talent, idx) => {
            const lvl = talent.level as TalentLevel;
            const talentCfg = TALENT_LEVEL_CONFIG[lvl];
            return (
              <div
                key={talent.id}
                className="rounded-xl border bg-white p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg shrink-0"
                    style={{ backgroundColor: talentCfg.color + "20" }}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/guilde/${talent.userId}`}
                      className="font-medium hover:underline"
                    >
                      {talent.displayName ?? talent.user?.name ?? "—"}
                    </Link>
                    <div className="text-xs text-muted-foreground truncate">
                      {talent.headline ?? ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge style={{ backgroundColor: talentCfg.color + "20", color: talentCfg.color }} className="text-xs">
                    {talentCfg.emoji} {TALENT_LEVEL_LABELS[lvl]}
                  </Badge>
                  {talent.avgScore && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      {talent.avgScore.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    {talent.totalMissions}
                  </span>
                </div>

                <div className="w-[140px] shrink-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Match</span>
                    <span className="font-medium text-emerald-600">
                      {talent.matchScore}%
                    </span>
                  </div>
                  <Progress value={talent.matchScore} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
