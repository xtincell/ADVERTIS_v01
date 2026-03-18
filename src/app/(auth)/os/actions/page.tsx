// ==========================================================================
// PAGE P.OS4 — Brand OS / Actions
// Command center — prioritized action queue.
// ==========================================================================

"use client";

import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { ActionQueue } from "~/components/brand-os/action-queue";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

function ActionsContent() {
  const brandId = useBrandId();
  const utils = api.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("TODO");
  const [priority, setPriority] = useState<"P0" | "P1" | "P2">("P1");
  const [effort, setEffort] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [impact, setImpact] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const { data: actions, isLoading } = api.brandOS.getActions.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const updateStatus = api.brandOS.updateActionStatus.useMutation({
    onSuccess: () => {
      void utils.brandOS.getActions.invalidate({ strategyId: brandId! });
    },
  });

  const createAction = api.brandOS.createAction.useMutation({
    onSuccess: () => {
      void utils.brandOS.getActions.invalidate({ strategyId: brandId! });
      setDialogOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("TODO");
    setPriority("P1");
    setEffort("MEDIUM");
    setImpact("MEDIUM");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandId || !title.trim()) return;
    createAction.mutate({
      strategyId: brandId,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      effort,
      impact,
    });
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  const todoCount = actions?.filter((a) => a.status === "TODO").length ?? 0;
  const inProgressCount = actions?.filter((a) => a.status === "IN_PROGRESS").length ?? 0;
  const doneCount = actions?.filter((a) => a.status === "DONE").length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Actions</h1>
          <p className="text-sm text-muted-foreground">Centre de commande — ce que la marque doit faire maintenant</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              Créer une action
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Créer une action</DialogTitle>
                <DialogDescription>
                  Ajoutez une action manuelle au centre de commande de la marque.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="action-title">Titre</Label>
                  <Input
                    id="action-title"
                    placeholder="Ex: Publier le post Instagram du lundi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="action-description">Description</Label>
                  <Textarea
                    id="action-description"
                    placeholder="Détails ou contexte supplémentaire..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Category + Priority row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">À faire</SelectItem>
                        <SelectItem value="REMINDER">Rappel</SelectItem>
                        <SelectItem value="CONTENT">Contenu</SelectItem>
                        <SelectItem value="ENGAGEMENT">Engagement</SelectItem>
                        <SelectItem value="STRATEGY">Stratégie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Priorité</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as "P0" | "P1" | "P2")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P0">P0 — Critique</SelectItem>
                        <SelectItem value="P1">P1 — Important</SelectItem>
                        <SelectItem value="P2">P2 — Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Effort + Impact row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Effort</Label>
                    <Select value={effort} onValueChange={(v) => setEffort(v as "LOW" | "MEDIUM" | "HIGH")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyen</SelectItem>
                        <SelectItem value="HIGH">Élevé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Impact</Label>
                    <Select value={impact} onValueChange={(v) => setImpact(v as "LOW" | "MEDIUM" | "HIGH")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyen</SelectItem>
                        <SelectItem value="HIGH">Élevé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || createAction.isPending}
                >
                  {createAction.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-muted-foreground">{todoCount} à faire</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{inProgressCount} en cours</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{doneCount} fait</span>
        </span>
      </div>

      {/* Action Queue */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>
      ) : actions && actions.length > 0 ? (
        <ActionQueue
          actions={actions}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status: status as "TODO" | "IN_PROGRESS" | "DONE" | "DISMISSED" })}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucune action pour le moment.</p>
          <p className="text-xs mt-1">Les actions sont générées automatiquement par l&apos;IA ou créées manuellement.</p>
        </div>
      )}
    </div>
  );
}

export default function ActionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <ActionsContent />
    </Suspense>
  );
}
