"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  Settings,
  ArrowRight,
  MapPin,
  Package,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  EXECUTION_TYPES,
  EXECUTION_TYPE_LABELS,
  EXECUTION_STATUSES,
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_COLORS,
  EXECUTION_VALID_TRANSITIONS,
  type ExecutionStatus,
} from "~/lib/constants";

interface ExecutionTrackerProps {
  campaignId: string;
}

export function ExecutionTracker({ campaignId }: ExecutionTrackerProps) {
  const [showCreate, setShowCreate] = useState(false);

  const utils = api.useUtils();
  const { data: executions, isLoading } =
    api.campaign.executions.getByCampaign.useQuery({ campaignId });

  const transitionMut = api.campaign.executions.transition.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      void utils.campaign.executions.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Pipeline de production
        </h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter exécution
        </Button>
      </div>

      {showCreate && (
        <CreateExecutionForm
          campaignId={campaignId}
          onCreated={() => {
            setShowCreate(false);
            void utils.campaign.executions.getByCampaign.invalidate({ campaignId });
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Pipeline visualization */}
      {executions && executions.length > 0 ? (
        <div className="space-y-2">
          {executions.map(
            (exec: {
              id: string;
              name: string;
              executionType: string;
              status: string;
              format: string | null;
              quantity: number;
              location: string | null;
              city: string | null;
              unitCost: number | null;
              totalCost: number | null;
              vendorName: string | null;
              action: { id: string; name: string; actionLine: string } | null;
            }) => {
              const status = exec.status as ExecutionStatus;
              const transitions = EXECUTION_VALID_TRANSITIONS[status] ?? [];

              return (
                <Card key={exec.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {exec.name}
                          </span>
                          <Badge
                            className={`text-[10px] ${
                              EXECUTION_STATUS_COLORS[
                                status as keyof typeof EXECUTION_STATUS_COLORS
                              ] ?? ""
                            }`}
                          >
                            {EXECUTION_STATUS_LABELS[
                              status as keyof typeof EXECUTION_STATUS_LABELS
                            ] ?? status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {EXECUTION_TYPE_LABELS[
                              exec.executionType as keyof typeof EXECUTION_TYPE_LABELS
                            ] ?? exec.executionType}
                          </span>
                          {exec.format && <span>{exec.format}</span>}
                          <span>x{exec.quantity}</span>
                          {exec.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {exec.location}
                            </span>
                          )}
                          {exec.vendorName && <span>{exec.vendorName}</span>}
                          {exec.totalCost != null && exec.totalCost > 0 && (
                            <span>
                              {exec.totalCost.toLocaleString("fr-FR")} XAF
                            </span>
                          )}
                        </div>
                        {exec.action && (
                          <p className="text-[10px] text-muted-foreground">
                            Action: {exec.action.name} ({exec.action.actionLine})
                          </p>
                        )}
                      </div>

                      {/* Transition buttons */}
                      <div className="flex items-center gap-1">
                        {transitions.map((t) => (
                          <Button
                            key={t}
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2"
                            disabled={transitionMut.isPending}
                            onClick={() =>
                              transitionMut.mutate({
                                id: exec.id,
                                newStatus: t as ExecutionStatus,
                              })
                            }
                          >
                            <ArrowRight className="mr-0.5 h-3 w-3" />
                            {EXECUTION_STATUS_LABELS[
                              t as keyof typeof EXECUTION_STATUS_LABELS
                            ] ?? t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aucune exécution. Le pipeline de production est vide.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CreateExecutionForm({
  campaignId,
  onCreated,
  onCancel,
}: {
  campaignId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [executionType, setExecutionType] = useState<string>("");
  const [format, setFormat] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");

  const createMut = api.campaign.executions.create.useMutation({
    onSuccess: () => {
      toast.success("Exécution créée");
      onCreated();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Nom *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Panneau 4x3 Douala"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>Type *</Label>
            <Select value={executionType} onValueChange={setExecutionType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {EXECUTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EXECUTION_TYPE_LABELS[
                      t as keyof typeof EXECUTION_TYPE_LABELS
                    ] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Format</Label>
            <Input
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="4x3, A0, etc."
            />
          </div>
          <div className="space-y-1">
            <Label>Quantité</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
            />
          </div>
          <div className="space-y-1">
            <Label>Emplacement</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Adresse / lieu"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || !executionType || createMut.isPending}
            onClick={() =>
              createMut.mutate({
                campaignId,
                name: name.trim(),
                executionType: executionType as typeof EXECUTION_TYPES[number],
                format: format || undefined,
                quantity: Number(quantity) || 1,
                location: location || undefined,
              })
            }
          >
            {createMut.isPending && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            Créer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
