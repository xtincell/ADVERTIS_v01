"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  DollarSign,
  ArrowRight,
  Loader2,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  PIPELINE_VALID_TRANSITIONS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealDetailDrawerProps {
  dealId: string;
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(amount: number | null | undefined, currency: string) {
  if (!amount) return "---";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "---";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealDetailDrawer({ dealId, open, onClose }: DealDetailDrawerProps) {
  const utils = api.useUtils();

  const { data: deal, isLoading } = api.crm.getById.useQuery(
    { id: dealId },
    { enabled: open && !!dealId },
  );

  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editNextAction, setEditNextAction] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const updateMutation = api.crm.update.useMutation({
    onSuccess: () => {
      toast.success("Deal mis à jour");
      void utils.crm.getById.invalidate({ id: dealId });
      void utils.crm.getKanban.invalidate();
      void utils.crm.getStats.invalidate();
      setEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const transitionMutation = api.crm.transition.useMutation({
    onSuccess: () => {
      toast.success("Étape mise à jour");
      void utils.crm.getById.invalidate({ id: dealId });
      void utils.crm.getKanban.invalidate();
      void utils.crm.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = api.crm.delete.useMutation({
    onSuccess: () => {
      toast.success("Deal supprimé");
      void utils.crm.getKanban.invalidate();
      void utils.crm.getStats.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  function startEditing() {
    if (!deal) return;
    setEditNotes(deal.notes ?? "");
    setEditNextAction(deal.nextAction ?? "");
    setEditAmount(deal.amount?.toString() ?? "");
    setEditing(true);
  }

  function saveEdits() {
    updateMutation.mutate({
      id: dealId,
      notes: editNotes || undefined,
      nextAction: editNextAction || undefined,
      amount: editAmount ? Number(editAmount) : undefined,
    });
  }

  const stage = deal?.stage as PipelineStage | undefined;
  const nextStages = stage ? (PIPELINE_VALID_TRANSITIONS[stage] ?? []) : [];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            {deal?.companyName ?? "Chargement..."}
          </SheetTitle>
        </SheetHeader>

        {isLoading || !deal ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Stage + Probability */}
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className={`text-xs ${PIPELINE_STAGE_COLORS[stage!] ?? ""}`}
              >
                {PIPELINE_STAGE_LABELS[stage!] ?? stage}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {deal.probability}% de probabilité
              </span>
            </div>

            {/* Transition buttons */}
            {nextStages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nextStages.map((ns) => (
                  <Button
                    key={ns}
                    size="sm"
                    variant="outline"
                    disabled={transitionMutation.isPending}
                    onClick={() =>
                      transitionMutation.mutate({ id: dealId, newStage: ns })
                    }
                  >
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {PIPELINE_STAGE_LABELS[ns] ?? ns}
                  </Button>
                ))}
              </div>
            )}

            {/* Info cards */}
            <div className="grid gap-3">
              <InfoRow icon={DollarSign} label="Montant" value={fmtCurrency(deal.amount, deal.currency)} />
              <InfoRow icon={User} label="Contact" value={deal.contactName} />
              <InfoRow icon={Mail} label="Email" value={deal.contactEmail} />
              <InfoRow icon={Phone} label="Téléphone" value={deal.contactPhone} />
              <InfoRow icon={Tag} label="Secteur" value={deal.sector} />
              <InfoRow icon={Tag} label="Source" value={deal.source} />
              <InfoRow icon={Calendar} label="Prochaine action" value={deal.nextAction} />
              <InfoRow
                icon={Calendar}
                label="Date prochaine action"
                value={fmtDate(deal.nextActionAt)}
              />
            </div>

            {/* Tags */}
            {Array.isArray(deal.tags) && deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(deal.tags as string[]).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Notes section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notes</h3>
                {!editing && (
                  <Button variant="ghost" size="sm" onClick={startEditing}>
                    Modifier
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Montant</Label>
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Montant du deal"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prochaine action</Label>
                    <Input
                      value={editNextAction}
                      onChange={(e) => setEditNextAction(e.target.value)}
                      placeholder="Ex: Envoyer la proposition"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes sur ce deal..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveEdits}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-3 w-3" />
                      )}
                      Sauvegarder
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(false)}
                    >
                      <X className="mr-1 h-3 w-3" /> Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {deal.notes || "Aucune note"}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
              <p>Dernière mise à jour : {fmtDate(deal.updatedAt)}</p>
              {deal.closedAt && <p>Fermé le : {fmtDate(deal.closedAt)}</p>}
              {deal.lostReason && (
                <p className="text-red-500">Raison perte : {deal.lostReason}</p>
              )}
            </div>

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm("Supprimer ce deal ?")) {
                  deleteMutation.mutate({ id: dealId });
                }
              }}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Supprimer le deal
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="font-medium truncate">{value ?? "---"}</span>
    </div>
  );
}
