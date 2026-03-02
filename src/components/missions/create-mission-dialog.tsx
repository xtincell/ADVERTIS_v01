// =============================================================================
// COMP C.MISSIONS — CreateMissionDialog
// =============================================================================
// Operator-initiated mission creation dialog.
// Creates a Mission linked to a Strategy via tRPC mutation.
// =============================================================================

"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  BRIEF_TYPES,
  BRIEF_TYPE_LABELS,
  type BriefType,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateMissionDialog() {
  const [open, setOpen] = useState(false);

  // Form state
  const [strategyId, setStrategyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"P0" | "P1" | "P2">("P1");
  const [briefTypes, setBriefTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Success state
  const [result, setResult] = useState<{
    title: string;
    brandName: string;
  } | null>(null);

  const utils = api.useUtils();

  // Fetch strategies for the dropdown
  const { data: strategies } = api.strategy.getAll.useQuery(
    {},
    { enabled: open },
  );

  const createMission = api.mission.missions.create.useMutation({
    onSuccess: (data) => {
      const strat = strategies?.find((s) => s.id === strategyId);
      setResult({
        title: data.title,
        brandName: strat?.brandName ?? "—",
      });
      void utils.mission.missions.getKanban.invalidate();
    },
  });

  const resetForm = () => {
    setStrategyId("");
    setTitle("");
    setDescription("");
    setPriority("P1");
    setBriefTypes([]);
    setStartDate("");
    setEndDate("");
    setResult(null);
    createMission.reset();
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleSubmit = () => {
    createMission.mutate({
      strategyId,
      title,
      description: description || undefined,
      priority,
      briefTypes: briefTypes.length > 0 ? briefTypes : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  };

  const toggleBriefType = (bt: string) => {
    setBriefTypes((prev) =>
      prev.includes(bt) ? prev.filter((b) => b !== bt) : [...prev, bt],
    );
  };

  const isValid = strategyId.length > 0 && title.trim().length >= 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle mission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une mission</DialogTitle>
          <DialogDescription>
            Lancez une mission opérationnelle liée à une stratégie de marque.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ─── Success state ─── */
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Mission créée avec succès
                </p>
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                {result.title} — {result.brandName}
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <div className="space-y-4 py-4">
            {/* Strategy (required) */}
            <div className="space-y-1.5">
              <Label>Stratégie / Marque *</Label>
              <Select value={strategyId} onValueChange={setStrategyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque..." />
                </SelectTrigger>
                <SelectContent>
                  {strategies?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.brandName || s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title (required) */}
            <div className="space-y-1.5">
              <Label>Titre de la mission *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Campagne lancement produit Q2"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objectifs, contexte, livrables attendus..."
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label>Priorité</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as "P0" | "P1" | "P2")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0 — Critique</SelectItem>
                  <SelectItem value="P1">P1 — Normal</SelectItem>
                  <SelectItem value="P2">P2 — Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brief Types */}
            <div className="space-y-1.5">
              <Label>Types de brief</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {BRIEF_TYPES.map((bt) => (
                  <Badge
                    key={bt}
                    variant={briefTypes.includes(bt) ? "default" : "outline"}
                    className="cursor-pointer transition-all text-xs select-none"
                    onClick={() => toggleBriefType(bt)}
                  >
                    {BRIEF_TYPE_LABELS[bt] ?? bt}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date début</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Error */}
            {createMission.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createMission.error.message}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createMission.isPending}
              className="w-full"
            >
              {createMission.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la mission
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
