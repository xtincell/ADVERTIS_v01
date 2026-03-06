"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Loader2,
  Sparkles,
  Send,
  Wand2,
  MonitorPlay,
  Radio,
  PackageCheck,
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
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_BRIEF_TYPES,
  CAMPAIGN_BRIEF_TYPE_LABELS,
} from "~/lib/constants";
import type { CampaignBriefType } from "~/lib/constants";

interface CampaignBriefEditorProps {
  campaignId: string;
}

interface Brief {
  id: string;
  briefType: string;
  title: string;
  status: string;
  recipientType: string | null;
}

const BRIEF_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REVISION_REQUESTED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const RECIPIENT_TYPES = [
  { value: "AGENCY", label: "Agence" },
  { value: "MEDIA_AGENCY", label: "Agence Média" },
  { value: "PRODUCTION", label: "Production" },
  { value: "VENDOR", label: "Prestataire" },
  { value: "INTERNAL", label: "Interne" },
] as const;

export function CampaignBriefEditor({ campaignId }: CampaignBriefEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [briefType, setBriefType] = useState<string>(CAMPAIGN_BRIEF_TYPES[0]);
  const [title, setTitle] = useState("");
  const [recipientType, setRecipientType] = useState<string>("");

  const utils = api.useUtils();

  const { data: briefs, isLoading } =
    api.campaign.briefs.getByCampaign.useQuery({ campaignId });

  const createMutation = api.campaign.briefs.create.useMutation({
    onSuccess: () => {
      toast.success("Brief créé avec succès");
      void utils.campaign.briefs.getByCampaign.invalidate({ campaignId });
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de créer le brief");
    },
  });

  const generateCreative = api.campaign.briefs.generateCreative.useMutation({
    onSuccess: () => {
      toast.success("Brief créatif généré par IA");
      void utils.campaign.briefs.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur de génération IA");
    },
  });

  const generateMedia = api.campaign.briefs.generateMedia.useMutation({
    onSuccess: () => {
      toast.success("Brief média généré par IA");
      void utils.campaign.briefs.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur de génération IA");
    },
  });

  const sendBrief = api.campaign.briefs.send.useMutation({
    onSuccess: () => {
      toast.success("Brief envoyé avec succès");
      void utils.campaign.briefs.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Impossible d'envoyer le brief");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setBriefType(CAMPAIGN_BRIEF_TYPES[0]);
    setTitle("");
    setRecipientType("");
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      campaignId,
      briefType: briefType as CampaignBriefType,
      title: title.trim(),
      recipientType: (recipientType || undefined) as "FREELANCE" | "INTERNAL" | "VENDOR" | "MEDIA_REP" | undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-primary" />
            Briefs de campagne
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {/* AI Generate buttons */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={generateCreative.isPending}
              onClick={() => generateCreative.mutate({ campaignId })}
            >
              {generateCreative.isPending ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="mr-1.5 h-3 w-3" />
              )}
              Brief Créatif IA
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={generateMedia.isPending}
              onClick={() => generateMedia.mutate({ campaignId })}
            >
              {generateMedia.isPending ? (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3 w-3" />
              )}
              Brief Média IA
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="mr-1.5 h-3 w-3" />
              Nouveau
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create brief form */}
        {showForm && (
          <Card className="border-dashed">
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type de brief</Label>
                  <Select value={briefType} onValueChange={setBriefType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_BRIEF_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {CAMPAIGN_BRIEF_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Titre *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre du brief"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Destinataire</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPIENT_TYPES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!title.trim() || createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  )}
                  Créer le brief
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Briefs list */}
        <div className="space-y-2">
          {(!briefs || (briefs as Brief[]).length === 0) && !showForm && (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Aucun brief pour cette campagne
            </div>
          )}

          {(briefs as Brief[] | undefined)?.map((brief) => (
            <div
              key={brief.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono"
                >
                  {CAMPAIGN_BRIEF_TYPE_LABELS[brief.briefType as CampaignBriefType] ?? brief.briefType}
                </Badge>
                <span className="text-sm font-medium">{brief.title}</span>
                {brief.recipientType && (
                  <span className="text-xs text-muted-foreground">
                    {RECIPIENT_TYPES.find((r) => r.value === brief.recipientType)?.label ??
                      brief.recipientType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${
                    BRIEF_STATUS_COLORS[brief.status] ?? ""
                  }`}
                >
                  {brief.status}
                </Badge>
                {brief.status === "DRAFT" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={sendBrief.isPending}
                    onClick={() => sendBrief.mutate({ briefId: brief.id })}
                  >
                    {sendBrief.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
