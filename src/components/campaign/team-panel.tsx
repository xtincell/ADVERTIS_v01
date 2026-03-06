"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  Users,
  UserPlus,
  Star,
  Trash2,
  MoreHorizontal,
  Briefcase,
  DollarSign,
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
  CAMPAIGN_TEAM_ROLES,
  CAMPAIGN_TEAM_ROLE_LABELS,
} from "~/lib/constants";

interface TeamPanelProps {
  campaignId: string;
}

export function TeamPanel({ campaignId }: TeamPanelProps) {
  const [showAdd, setShowAdd] = useState(false);

  const utils = api.useUtils();
  const { data: team, isLoading } =
    api.campaign.team.getByCampaign.useQuery({ campaignId });
  const { data: workload } =
    api.campaign.team.workload.useQuery({ campaignId });

  const removeMut = api.campaign.team.remove.useMutation({
    onSuccess: () => {
      toast.success("Membre retiré");
      void utils.campaign.team.getByCampaign.invalidate({ campaignId });
      void utils.campaign.team.workload.invalidate({ campaignId });
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

  // Workload summary
  const totalEstCost =
    workload?.reduce((sum, m) => sum + (m.estimatedCost ?? 0), 0) ?? 0;
  const totalActCost =
    workload?.reduce((sum, m) => sum + (m.actualCost ?? 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {team && team.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="py-3">
            <CardContent className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Membres</p>
              <p className="text-lg font-semibold">{team.length}</p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Coût estimé</p>
              <p className="text-lg font-semibold">
                {totalEstCost.toLocaleString("fr-FR")}
              </p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="px-4 text-center">
              <p className="text-xs text-muted-foreground">Coût réel</p>
              <p className="text-lg font-semibold">
                {totalActCost.toLocaleString("fr-FR")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Équipe campagne
        </h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <UserPlus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {showAdd && (
        <AddTeamMemberForm
          campaignId={campaignId}
          onAdded={() => {
            setShowAdd(false);
            void utils.campaign.team.getByCampaign.invalidate({ campaignId });
            void utils.campaign.team.workload.invalidate({ campaignId });
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Team list */}
      {team && team.length > 0 ? (
        <div className="space-y-2">
          {team.map(
            (member: {
              id: string;
              role: string;
              isLead: boolean;
              externalName: string | null;
              externalCompany: string | null;
              responsibility: string | null;
              allocation: number | null;
              dayRate: number | null;
              estimatedDays: number | null;
              actualDays: number | null;
              status: string;
            }) => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {member.externalName
                        ? member.externalName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {member.externalName ?? "Membre interne"}
                        </span>
                        {member.isLead && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                        <Badge variant="secondary" className="text-[10px]">
                          {CAMPAIGN_TEAM_ROLE_LABELS[
                            member.role as keyof typeof CAMPAIGN_TEAM_ROLE_LABELS
                          ] ?? member.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            member.status === "ACTIVE"
                              ? "text-green-600"
                              : member.status === "COMPLETED"
                                ? "text-blue-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {member.externalCompany && (
                          <span>{member.externalCompany}</span>
                        )}
                        {member.allocation != null && (
                          <span>{member.allocation}% alloc.</span>
                        )}
                        {member.dayRate != null && member.estimatedDays != null && (
                          <span>
                            {member.estimatedDays}j ×{" "}
                            {member.dayRate.toLocaleString("fr-FR")} XAF
                          </span>
                        )}
                        {member.responsibility && (
                          <span>{member.responsibility}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => removeMut.mutate({ id: member.id })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Retirer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aucun membre. Constituez votre équipe campagne.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AddTeamMemberForm({
  campaignId,
  onAdded,
  onCancel,
}: {
  campaignId: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<string>("");
  const [dayRate, setDayRate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [isLead, setIsLead] = useState(false);

  const addMut = api.campaign.team.add.useMutation({
    onSuccess: () => {
      toast.success("Membre ajouté");
      onAdded();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du prestataire / membre"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>Entreprise</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Société / agence"
            />
          </div>
          <div className="space-y-1">
            <Label>Rôle *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TEAM_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {CAMPAIGN_TEAM_ROLE_LABELS[
                      r as keyof typeof CAMPAIGN_TEAM_ROLE_LABELS
                    ] ?? r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
                className="rounded"
              />
              Chef de projet
            </label>
          </div>
          <div className="space-y-1">
            <Label>TJM (XAF)</Label>
            <Input
              type="number"
              value={dayRate}
              onChange={(e) => setDayRate(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label>Jours estimés</Label>
            <Input
              type="number"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={!role || addMut.isPending}
            onClick={() =>
              addMut.mutate({
                campaignId,
                externalName: name || undefined,
                externalCompany: company || undefined,
                role: role as typeof CAMPAIGN_TEAM_ROLES[number],
                isLead,
                dayRate: dayRate ? Number(dayRate) : undefined,
                estimatedDays: estimatedDays
                  ? Number(estimatedDays)
                  : undefined,
              })
            }
          >
            {addMut.isPending && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
