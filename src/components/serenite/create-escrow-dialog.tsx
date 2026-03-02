// =============================================================================
// COMP C.SERENITE — CreateEscrowDialog
// =============================================================================
// Creates an Escrow transaction linked to a Mission.
// =============================================================================

"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle2, Lock } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateEscrowDialog() {
  const [open, setOpen] = useState(false);

  // Form state
  const [missionId, setMissionId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("XAF");
  const [releaseCondition, setReleaseCondition] = useState("");

  // Success state
  const [result, setResult] = useState<{
    amount: number;
    currency: string;
  } | null>(null);

  const utils = api.useUtils();

  // Fetch missions for the dropdown
  const { data: kanban } = api.mission.missions.getKanban.useQuery(
    undefined,
    { enabled: open },
  );
  const allMissions = kanban
    ? Object.values(kanban).flat()
    : [];

  const createEscrow = api.serenite.createEscrow.useMutation({
    onSuccess: (data) => {
      setResult({
        amount: data.amount,
        currency: data.currency,
      });
      void utils.serenite.listEscrows.invalidate();
      void utils.serenite.dashboard.invalidate();
    },
  });

  const resetForm = () => {
    setMissionId("");
    setAmount(0);
    setCurrency("XAF");
    setReleaseCondition("");
    setResult(null);
    createEscrow.reset();
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleSubmit = () => {
    createEscrow.mutate({
      missionId,
      amount,
      currency,
      releaseCondition: releaseCondition || undefined,
    });
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const isValid = missionId.length > 0 && amount > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau séquestre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un séquestre</DialogTitle>
          <DialogDescription>
            Bloquez des fonds sur une mission avec une condition de libération.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ─── Success state ─── */
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Séquestre créé avec succès
                </p>
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                {fmt(result.amount)} {result.currency} séquestrés
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <div className="space-y-4 py-4">
            {/* Mission (required) */}
            <div className="space-y-1.5">
              <Label>Mission *</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une mission..." />
                </SelectTrigger>
                <SelectContent>
                  {allMissions.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Montant *</Label>
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Devise</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAF">XAF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Release Condition */}
            <div className="space-y-1.5">
              <Label>Condition de libération</Label>
              <Textarea
                value={releaseCondition}
                onChange={(e) => setReleaseCondition(e.target.value)}
                placeholder="Ex: Validation de tous les livrables par le client"
                rows={3}
                maxLength={2000}
              />
            </div>

            {/* Error */}
            {createEscrow.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createEscrow.error.message}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createEscrow.isPending}
              className="w-full"
            >
              {createEscrow.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Créer le séquestre
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
