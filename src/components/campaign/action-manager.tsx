"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Loader2,
  Zap,
  Radio,
  Globe,
  X,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  ACTION_LINES,
  ATL_TYPES,
  BTL_TYPES,
  TTL_TYPES,
  CAMPAIGN_ACTION_STATUSES,
  type ActionLine,
  ACTION_LINE_LABELS,
  ATL_TYPE_LABELS,
  BTL_TYPE_LABELS,
  TTL_TYPE_LABELS,
  CAMPAIGN_ACTION_STATUS_LABELS,
} from "~/lib/constants";

interface ActionManagerProps {
  campaignId: string;
}

const LINE_ICONS: Record<ActionLine, React.ComponentType<{ className?: string }>> = {
  ATL: Radio,
  BTL: Zap,
  TTL: Globe,
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "destructive"> = {
  PLANNED: "outline",
  BRIEFED: "secondary",
  IN_PRODUCTION: "warning",
  READY: "info" as "default",
  ACTIVE: "success",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

function getTypesForLine(line: ActionLine) {
  switch (line) {
    case "ATL": return ATL_TYPES;
    case "BTL": return BTL_TYPES;
    case "TTL": return TTL_TYPES;
  }
}

function getTypeLabelForLine(line: ActionLine, type: string): string {
  switch (line) {
    case "ATL": return ATL_TYPE_LABELS[type as keyof typeof ATL_TYPE_LABELS] ?? type;
    case "BTL": return BTL_TYPE_LABELS[type as keyof typeof BTL_TYPE_LABELS] ?? type;
    case "TTL": return TTL_TYPE_LABELS[type as keyof typeof TTL_TYPE_LABELS] ?? type;
  }
}

export function ActionManager({ campaignId }: ActionManagerProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [actionLine, setActionLine] = useState<ActionLine>("ATL");
  const [actionType, setActionType] = useState("");
  const [channel, setChannel] = useState("");
  const [budgetAllocated, setBudgetAllocated] = useState("");

  const utils = api.useUtils();

  const { data: actions, isLoading } = api.campaign.actions.getByCampaign.useQuery({
    campaignId,
    ...(activeTab !== "ALL" ? { actionLine: activeTab as ActionLine } : {}),
  });

  const createMutation = api.campaign.actions.create.useMutation({
    onSuccess: () => {
      toast.success("Action cr\u00e9\u00e9e avec succ\u00e8s");
      void utils.campaign.actions.getByCampaign.invalidate({ campaignId });
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de cr\u00e9er l\u2019action");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setName("");
    setActionLine("ATL");
    setActionType("");
    setChannel("");
    setBudgetAllocated("");
  };

  const handleCreate = () => {
    if (!name.trim() || !actionType) return;
    createMutation.mutate({
      campaignId,
      name: name.trim(),
      actionLine,
      actionType: actionType as never,
      channel: channel || undefined,
      budgetAllocated: budgetAllocated ? Number(budgetAllocated) : undefined,
    });
  };

  const availableTypes = useMemo(() => getTypesForLine(actionLine), [actionLine]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actions de campagne</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Annuler" : "Nouvelle action"}
        </Button>
      </div>

      {/* Inline Create Form */}
      {showForm && (
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'action" />
              </div>
              <div className="space-y-2">
                <Label>Ligne</Label>
                <Select value={actionLine} onValueChange={(v) => { setActionLine(v as ActionLine); setActionType(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTION_LINES.map((l) => (
                      <SelectItem key={l} value={l}>{ACTION_LINE_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger><SelectValue placeholder="S\u00e9lectionner..." /></SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((t) => (
                      <SelectItem key={t} value={t}>{getTypeLabelForLine(actionLine, t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Ex: Facebook, TV5" />
              </div>
              <div className="space-y-2">
                <Label>Budget allou\u00e9</Label>
                <Input type="number" value={budgetAllocated} onChange={(e) => setBudgetAllocated(e.target.value)} placeholder="0" />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!name.trim() || !actionType || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cr\u00e9er l&apos;action
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ALL">Toutes</TabsTrigger>
          {ACTION_LINES.map((line) => {
            const Icon = LINE_ICONS[line];
            return (
              <TabsTrigger key={line} value={line}>
                <Icon className="mr-1.5 h-3.5 w-3.5" />
                {line}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {!actions?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune action trouv\u00e9e.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {actions.map((action) => {
                const Icon = LINE_ICONS[action.actionLine as ActionLine] ?? Zap;
                return (
                  <Card key={action.id} className="gap-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm">{action.name}</CardTitle>
                        </div>
                        <Badge variant={STATUS_VARIANT[action.status] ?? "outline"} className="text-[10px]">
                          {CAMPAIGN_ACTION_STATUS_LABELS[action.status as keyof typeof CAMPAIGN_ACTION_STATUS_LABELS] ?? action.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{action.actionLine}</Badge>
                        <span>{getTypeLabelForLine(action.actionLine as ActionLine, action.actionType)}</span>
                      </div>
                      {action.channel && <p>Canal : {action.channel}</p>}
                      {action.budgetAllocated != null && (
                        <p>Budget : {action.budgetAllocated.toLocaleString("fr-FR")} FCFA</p>
                      )}
                      {action.vendorName && <p>Prestataire : {action.vendorName}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
