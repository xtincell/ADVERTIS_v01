// =============================================================================
// PAGE P.GUILDE.INDEX — Talent Directory
// =============================================================================
// Répertoire filtrable des talents La Guilde.
// Desktop: table. Mobile: cards.
// Filters: catégorie, niveau, disponibilité, spécialisation.
// =============================================================================

"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { CreateTalentDialog } from "~/components/guilde/create-talent-dialog";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  TALENT_CATEGORIES,
  TALENT_CATEGORY_LABELS,
  TALENT_LEVELS,
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  TALENT_AVAILABILITY,
  TALENT_AVAILABILITY_LABELS,
  type TalentCategory,
  type TalentLevel,
  type TalentAvailability,
} from "~/lib/constants";
import Link from "next/link";

export default function GuildeDirectoryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TalentCategory | "ALL">("ALL");
  const [level, setLevel] = useState<TalentLevel | "ALL">("ALL");
  const [availability, setAvailability] = useState<TalentAvailability | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = api.guilde.directory.useQuery({
    query: query || undefined,
    category: category !== "ALL" ? category : undefined,
    level: level !== "ALL" ? level : undefined,
    availability: availability !== "ALL" ? availability : undefined,
    page,
    pageSize: 20,
    sortBy: "level",
    sortDir: "desc",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 animate-page-enter">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-display-lg">La Guilde</h1>
            <p className="text-sm text-muted-foreground">
              Répertoire des talents — {data?.total ?? 0} profils
            </p>
          </div>
          <CreateTalentDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un talent..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v as any); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes catégories</SelectItem>
            {TALENT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{TALENT_CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={(v) => { setLevel(v as any); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous niveaux</SelectItem>
            {TALENT_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {TALENT_LEVEL_CONFIG[l].emoji} {TALENT_LEVEL_LABELS[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={(v) => { setAvailability(v as any); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Disponibilité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toute dispo</SelectItem>
            {TALENT_AVAILABILITY.map((a) => (
              <SelectItem key={a} value={a}>{TALENT_AVAILABILITY_LABELS[a]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucun talent trouvé</p>
          <p className="text-sm">Essayez d&apos;élargir vos critères de recherche.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Talent</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Dispo</TableHead>
                    <TableHead className="text-right">Missions</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">TJM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((talent) => {
                    const lvl = talent.level as TalentLevel;
                    const cfg = TALENT_LEVEL_CONFIG[lvl];
                    return (
                      <TableRow key={talent.id}>
                        <TableCell>
                          <Link href={`/guilde/${talent.userId}`} className="hover:underline">
                            <div className="font-medium">{talent.displayName ?? talent.user?.name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{talent.headline ?? ""}</div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {TALENT_CATEGORY_LABELS[talent.category as TalentCategory] ?? talent.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            <span>{cfg?.emoji}</span>
                            <span style={{ color: cfg?.color }}>{TALENT_LEVEL_LABELS[lvl]}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={talent.availability === "AVAILABLE" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {TALENT_AVAILABILITY_LABELS[talent.availability as TalentAvailability] ?? talent.availability}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{talent.totalMissions}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {talent.avgScore ? `${talent.avgScore.toFixed(1)}/5` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {talent.tjmMin ? `${talent.tjmMin.toLocaleString()} ${talent.currency}` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid gap-3 stagger-children">
            {data?.items.map((talent) => {
              const lvl = talent.level as TalentLevel;
              const cfg = TALENT_LEVEL_CONFIG[lvl];
              return (
                <Link
                  key={talent.id}
                  href={`/guilde/${talent.userId}`}
                  className="block rounded-xl border bg-card p-4 transition-all hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{talent.displayName ?? talent.user?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{talent.headline ?? ""}</div>
                    </div>
                    <span className="text-lg">{cfg?.emoji}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className="text-xs">{TALENT_CATEGORY_LABELS[talent.category as TalentCategory]}</Badge>
                    <Badge variant="secondary" className="text-xs" style={{ color: cfg?.color }}>
                      {TALENT_LEVEL_LABELS[lvl]}
                    </Badge>
                    <Badge variant={talent.availability === "AVAILABLE" ? "default" : "secondary"} className="text-xs">
                      {TALENT_AVAILABILITY_LABELS[talent.availability as TalentAvailability]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{talent.totalMissions} missions</span>
                    <span>{talent.avgScore ? `${talent.avgScore.toFixed(1)}/5` : "—"}</span>
                    <span>{talent.tjmMin ? `${talent.tjmMin.toLocaleString()} ${talent.currency}` : "—"}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
