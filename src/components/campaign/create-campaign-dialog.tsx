"use client";

import { useState } from "react";
import {
  Megaphone,
  X,
  Loader2,
  Calendar,
  DollarSign,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_TYPES,
  CAMPAIGN_TYPE_LABELS,
  FUNNEL_STAGES,
  FUNNEL_STAGE_LABELS,
} from "~/lib/constants";

interface CreateCampaignDialogProps {
  strategyId: string;
  onClose: () => void;
  onCreated?: (campaignId: string) => void;
}

export function CreateCampaignDialog({
  strategyId,
  onClose,
  onCreated,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState<string>("ACTIVATION");
  const [priority, setPriority] = useState<string>("P1");
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [funnelStage, setFunnelStage] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bigIdea, setBigIdea] = useState("");

  const utils = api.useUtils();

  const createMutation = api.campaign.campaigns.create.useMutation({
    onSuccess: (data) => {
      toast.success("Campagne créée avec succès");
      void utils.campaign.campaigns.getByStrategy.invalidate({ strategyId });
      void utils.campaign.campaigns.getKanban.invalidate();
      void utils.campaign.campaigns.dashboard.invalidate();
      onCreated?.(data.id);
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de créer la campagne");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    createMutation.mutate({
      strategyId,
      name: name.trim(),
      description: description || undefined,
      campaignType: campaignType as typeof CAMPAIGN_TYPES[number],
      priority: priority as "P0" | "P1" | "P2",
      totalBudget: totalBudget ? Number(totalBudget) : undefined,
      funnelStage: funnelStage
        ? (funnelStage as typeof FUNNEL_STAGES[number])
        : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bigIdea: bigIdea || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <CardTitle>Nouvelle Campagne</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la campagne *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lancement Produit X Q2 2026"
              autoFocus
            />
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CAMPAIGN_TYPE_LABELS[t as keyof typeof CAMPAIGN_TYPE_LABELS] ?? t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">P0 - Critique</SelectItem>
                  <SelectItem value="P1">P1 - Haute</SelectItem>
                  <SelectItem value="P2">P2 - Normale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectifs et contexte de la campagne..."
              rows={3}
            />
          </div>

          {/* Big Idea */}
          <div className="space-y-2">
            <Label htmlFor="bigIdea">Big Idea</Label>
            <Input
              id="bigIdea"
              value={bigIdea}
              onChange={(e) => setBigIdea(e.target.value)}
              placeholder="Le concept central de la campagne"
            />
          </div>

          {/* Budget + Funnel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Budget total</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Funnel stage</Label>
              <Select value={funnelStage} onValueChange={setFunnelStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {FUNNEL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {FUNNEL_STAGE_LABELS[s as keyof typeof FUNNEL_STAGE_LABELS] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="mr-2 h-4 w-4" />
            )}
            Créer la campagne
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
