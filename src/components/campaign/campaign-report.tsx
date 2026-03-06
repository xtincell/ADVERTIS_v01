"use client";

import { useState } from "react";
import {
  BarChart3,
  Plus,
  Loader2,
  Globe,
  FileBarChart,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
  CAMPAIGN_REPORT_TYPES,
  CAMPAIGN_REPORT_TYPE_LABELS,
} from "~/lib/constants";
import type { CampaignReportType } from "~/lib/constants";

interface CampaignReportProps {
  campaignId: string;
}

interface Report {
  id: string;
  reportType: string;
  title: string;
  status: string;
  generatedBy: string | null;
  createdAt: Date | string;
  publishedAt: Date | string | null;
}

const REPORT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PUBLISHED: "bg-green-100 text-green-700",
};

export function CampaignReport({ campaignId }: CampaignReportProps) {
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<string>(CAMPAIGN_REPORT_TYPES[0]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const utils = api.useUtils();

  const { data: reports, isLoading } =
    api.campaign.reports.getByCampaign.useQuery({ campaignId });

  const createMutation = api.campaign.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Rapport créé avec succès");
      void utils.campaign.reports.getByCampaign.invalidate({ campaignId });
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de créer le rapport");
    },
  });

  const publishMutation = api.campaign.reports.publish.useMutation({
    onSuccess: () => {
      toast.success("Rapport publié avec succès");
      void utils.campaign.reports.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de publier le rapport");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setReportType(CAMPAIGN_REPORT_TYPES[0]);
    setTitle("");
    setSummary("");
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      campaignId,
      reportType: reportType as CampaignReportType,
      title: title.trim(),
      summary: summary || undefined,
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
            <BarChart3 className="h-4 w-4 text-primary" />
            Rapports de campagne
          </CardTitle>
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-1.5 h-3 w-3" />
            Nouveau rapport
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create report form */}
        {showForm && (
          <Card className="border-dashed">
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type de rapport</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_REPORT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {CAMPAIGN_REPORT_TYPE_LABELS[t]}
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
                    placeholder="Titre du rapport"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Résumé</Label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Résumé exécutif du rapport..."
                  rows={3}
                  className="text-xs"
                />
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
                  Créer le rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports list */}
        <div className="space-y-2">
          {(!reports || (reports as Report[]).length === 0) && !showForm && (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Aucun rapport pour cette campagne
            </div>
          )}

          {(reports as Report[] | undefined)?.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  <FileBarChart className="mr-1 h-3 w-3" />
                  {CAMPAIGN_REPORT_TYPE_LABELS[report.reportType as CampaignReportType] ??
                    report.reportType}
                </Badge>
                <span className="text-sm font-medium">{report.title}</span>
                {report.generatedBy && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {report.generatedBy}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${
                    REPORT_STATUS_COLORS[report.status] ?? ""
                  }`}
                >
                  {report.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                </Badge>
                {report.status === "DRAFT" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={publishMutation.isPending}
                    onClick={() =>
                      publishMutation.mutate({ id: report.id })
                    }
                    title="Publier le rapport"
                  >
                    {publishMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
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
