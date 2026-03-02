// =============================================================================
// COMP C.SERENITE — CreateContractDialog
// =============================================================================
// Creates a Contract (NDA, PRESTATION, CESSION_DROITS, PORTAGE).
// =============================================================================

"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle2, Handshake } from "lucide-react";
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
import {
  CONTRACT_TYPES,
  CONTRACT_TYPE_LABELS,
  type ContractType,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateContractDialog() {
  const [open, setOpen] = useState(false);

  // Form state
  const [type, setType] = useState<ContractType>("PRESTATION");
  const [title, setTitle] = useState("");
  const [partyAId, setPartyAId] = useState("");
  const [partyBId, setPartyBId] = useState("");
  const [missionId, setMissionId] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Success state
  const [result, setResult] = useState<{
    title: string;
    type: string;
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

  const createContract = api.serenite.createContract.useMutation({
    onSuccess: (data) => {
      setResult({
        title: data.title,
        type: data.type,
      });
      void utils.serenite.listContracts.invalidate();
    },
  });

  const resetForm = () => {
    setType("PRESTATION");
    setTitle("");
    setPartyAId("");
    setPartyBId("");
    setMissionId("");
    setContent("");
    setStartDate("");
    setEndDate("");
    setResult(null);
    createContract.reset();
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const handleSubmit = () => {
    createContract.mutate({
      type,
      title,
      partyAId,
      partyBId,
      missionId: missionId || undefined,
      content: content || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  };

  const isValid =
    title.trim().length >= 1 &&
    partyAId.trim().length >= 1 &&
    partyBId.trim().length >= 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau contrat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un contrat</DialogTitle>
          <DialogDescription>
            NDA, prestation, cession de droits ou portage.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ─── Success state ─── */
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Contrat créé avec succès
                </p>
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                {result.title} — {CONTRACT_TYPE_LABELS[result.type as ContractType]}
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <div className="space-y-4 py-4">
            {/* Type */}
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContractType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CONTRACT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label>Titre *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: NDA — Projet Alpha"
                maxLength={300}
              />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Partie A (ID) *</Label>
                <Input
                  value={partyAId}
                  onChange={(e) => setPartyAId(e.target.value)}
                  placeholder="ID utilisateur"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Partie B (ID) *</Label>
                <Input
                  value={partyBId}
                  onChange={(e) => setPartyBId(e.target.value)}
                  placeholder="ID utilisateur"
                />
              </div>
            </div>

            {/* Mission (optional) */}
            <div className="space-y-1.5">
              <Label>Mission (optionnel)</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune mission liée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {allMissions.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label>Contenu / clauses</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Clauses principales, obligations..."
                rows={3}
              />
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
            {createContract.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createContract.error.message}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createContract.isPending}
              className="w-full"
            >
              {createContract.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-2" />
                  Créer le contrat
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
