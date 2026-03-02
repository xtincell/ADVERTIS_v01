// =============================================================================
// PAGE P.GUILDE.CERTIFICATIONS — Certification Management
// =============================================================================
// View and award certifications to talents.
// =============================================================================

"use client";

import { useState } from "react";
import { Award, Plus, Search } from "lucide-react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  TALENT_LEVEL_LABELS,
  TALENT_LEVEL_CONFIG,
  type TalentLevel,
} from "~/lib/constants";

export default function GuildeCertificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<string>("");
  const [certName, setCertName] = useState("");
  const [certIssuedBy, setCertIssuedBy] = useState("");
  const [certScore, setCertScore] = useState<number | undefined>();

  // Search talents for the directory
  const { data: talents } = api.guilde.directory.useQuery({
    query: searchQuery || undefined,
    page: 1,
    pageSize: 50,
    sortBy: "level",
    sortDir: "desc",
  });

  const utils = api.useUtils();

  const createCert = api.guilde.createCertification.useMutation({
    onSuccess: () => {
      setDialogOpen(false);
      setCertName("");
      setCertIssuedBy("");
      setCertScore(undefined);
      setSelectedTalent("");
      void utils.guilde.directory.invalidate();
    },
  });

  const handleAwardCert = () => {
    if (!selectedTalent || !certName) return;
    createCert.mutate({
      talentProfileId: selectedTalent,
      name: certName,
      issuedBy: certIssuedBy || undefined,
      score: certScore,
      issuedAt: new Date(),
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
            <p className="text-sm text-muted-foreground">
              Attribuer et gérer les certifications des talents.
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Attribuer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attribuer une certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Talent</Label>
                <select
                  className="w-full mt-1 rounded-md border px-3 py-2 text-sm"
                  value={selectedTalent}
                  onChange={(e) => setSelectedTalent(e.target.value)}
                >
                  <option value="">Sélectionner un talent...</option>
                  {talents?.items.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.displayName ?? t.user?.name ?? "—"} ({TALENT_LEVEL_LABELS[t.level as TalentLevel]})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Nom de la certification</Label>
                <Input
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="Ex: Expert Brand Strategy"
                />
              </div>
              <div>
                <Label>Délivré par</Label>
                <Input
                  value={certIssuedBy}
                  onChange={(e) => setCertIssuedBy(e.target.value)}
                  placeholder="Ex: ADVERTIS Academy"
                />
              </div>
              <div>
                <Label>Score (optionnel, 0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={certScore ?? ""}
                  onChange={(e) => setCertScore(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="85"
                />
              </div>
              <Button
                onClick={handleAwardCert}
                disabled={!selectedTalent || !certName || createCert.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {createCert.isPending ? "Attribution..." : "Attribuer la certification"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un talent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Talent list with certifications */}
      <div className="space-y-3">
        {talents?.items.map((talent) => {
          const lvl = talent.level as TalentLevel;
          const talentCfg = TALENT_LEVEL_CONFIG[lvl];
          return (
            <div key={talent.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{talentCfg.emoji}</span>
                  <div>
                    <div className="font-medium">{talent.displayName ?? talent.user?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{talent.headline ?? ""}</div>
                  </div>
                </div>
                <Badge style={{ backgroundColor: talentCfg.color + "20", color: talentCfg.color }}>
                  {TALENT_LEVEL_LABELS[lvl]}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {talent.totalMissions} missions • Score: {talent.avgScore?.toFixed(1) ?? "—"}/5
              </div>
            </div>
          );
        })}
        {talents?.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun talent trouvé
          </div>
        )}
      </div>
    </div>
  );
}
