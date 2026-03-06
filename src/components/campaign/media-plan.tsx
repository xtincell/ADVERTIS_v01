"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  BarChart3,
  Tv,
  Radio,
  Globe,
  Newspaper,
  Eye,
  MousePointer,
  TrendingUp,
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
  AMPLIFICATION_MEDIA_TYPES,
  AMPLIFICATION_MEDIA_TYPE_LABELS,
  AMPLIFICATION_STATUSES,
  AMPLIFICATION_STATUS_LABELS,
  AMPLIFICATION_STATUS_COLORS,
} from "~/lib/constants";

interface MediaPlanProps {
  campaignId: string;
}

export function MediaPlan({ campaignId }: MediaPlanProps) {
  const [showCreate, setShowCreate] = useState(false);

  const utils = api.useUtils();
  const { data: amplifications, isLoading } =
    api.campaign.amplifications.getByCampaign.useQuery({ campaignId });
  const { data: summary } =
    api.campaign.amplifications.mediaPlanSummary.useQuery({ campaignId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Coût média"
            value={summary.totalMediaCost}
            icon={<Tv className="h-4 w-4" />}
          />
          <SummaryCard
            label="Impressions"
            value={summary.totalImpressions}
            icon={<Eye className="h-4 w-4" />}
            format="number"
          />
          <SummaryCard
            label="Clics"
            value={summary.totalClicks}
            icon={<MousePointer className="h-4 w-4" />}
            format="number"
          />
          <SummaryCard
            label="CPM moyen"
            value={summary.avgCpm}
            icon={<TrendingUp className="h-4 w-4" />}
            format="decimal"
          />
        </div>
      )}

      {/* Media Type Breakdown */}
      {summary && Object.keys(summary.byMediaType).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Répartition par média</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(
              summary.byMediaType as Record<
                string,
                { count: number; cost: number; impressions: number }
              >,
            ).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {AMPLIFICATION_MEDIA_TYPE_LABELS[
                      type as keyof typeof AMPLIFICATION_MEDIA_TYPE_LABELS
                    ] ?? type}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {data.count} placements
                  </Badge>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {data.cost.toLocaleString("fr-FR")} XAF
                  </span>
                  {data.impressions > 0 && (
                    <span className="ml-3">
                      {data.impressions.toLocaleString("fr-FR")} impr.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Amplifications ({amplifications?.length ?? 0})
        </h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {showCreate && (
        <CreateAmplificationForm
          campaignId={campaignId}
          onCreated={() => {
            setShowCreate(false);
            void utils.campaign.amplifications.getByCampaign.invalidate({
              campaignId,
            });
            void utils.campaign.amplifications.mediaPlanSummary.invalidate({
              campaignId,
            });
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Amplification list */}
      {amplifications && amplifications.length > 0 ? (
        <div className="space-y-2">
          {amplifications.map(
            (amp: {
              id: string;
              name: string;
              mediaType: string;
              platform: string | null;
              status: string;
              flightStart: Date | null;
              flightEnd: Date | null;
              mediaCost: number;
              totalCost: number;
              impressions: number | null;
              reach: number | null;
              clicks: number | null;
              ctr: number | null;
              regieName: string | null;
              action: {
                id: string;
                name: string;
                actionLine: string;
              } | null;
            }) => (
              <Card key={amp.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{amp.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {AMPLIFICATION_MEDIA_TYPE_LABELS[
                            amp.mediaType as keyof typeof AMPLIFICATION_MEDIA_TYPE_LABELS
                          ] ?? amp.mediaType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            AMPLIFICATION_STATUS_COLORS[
                              amp.status as keyof typeof AMPLIFICATION_STATUS_COLORS
                            ] ?? ""
                          }`}
                        >
                          {AMPLIFICATION_STATUS_LABELS[
                            amp.status as keyof typeof AMPLIFICATION_STATUS_LABELS
                          ] ?? amp.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {amp.platform && <span>{amp.platform}</span>}
                        {amp.regieName && <span>{amp.regieName}</span>}
                        {amp.flightStart && (
                          <span>
                            {new Date(amp.flightStart).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" },
                            )}
                            {amp.flightEnd &&
                              ` → ${new Date(amp.flightEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium">
                        {amp.totalCost.toLocaleString("fr-FR")} XAF
                      </p>
                      {amp.impressions != null && amp.impressions > 0 && (
                        <p className="text-muted-foreground">
                          {amp.impressions.toLocaleString("fr-FR")} impr.
                        </p>
                      )}
                      {amp.ctr != null && amp.ctr > 0 && (
                        <p className="text-muted-foreground">
                          CTR: {amp.ctr.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aucune amplification. Ajoutez des placements média (TV, radio, digital, etc.)
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon,
  format = "currency",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  format?: "currency" | "number" | "decimal";
}) {
  const formatted =
    format === "currency"
      ? value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value.toLocaleString("fr-FR")
      : format === "decimal"
        ? value.toFixed(2)
        : value.toLocaleString("fr-FR");

  return (
    <Card className="py-3">
      <CardContent className="flex items-center gap-2 px-4">
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{formatted}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function CreateAmplificationForm({
  campaignId,
  onCreated,
  onCancel,
}: {
  campaignId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [mediaType, setMediaType] = useState<string>("");
  const [platform, setPlatform] = useState("");
  const [mediaCost, setMediaCost] = useState("");

  const createMut = api.campaign.amplifications.create.useMutation({
    onSuccess: () => {
      toast.success("Amplification créée");
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
              placeholder="Ex: Spot TV CRTV 30s"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>Type de média *</Label>
            <Select value={mediaType} onValueChange={setMediaType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {AMPLIFICATION_MEDIA_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {AMPLIFICATION_MEDIA_TYPE_LABELS[
                      t as keyof typeof AMPLIFICATION_MEDIA_TYPE_LABELS
                    ] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Plateforme / Chaîne</Label>
            <Input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="CRTV, Canal+, Meta..."
            />
          </div>
          <div className="space-y-1">
            <Label>Coût média</Label>
            <Input
              type="number"
              value={mediaCost}
              onChange={(e) => setMediaCost(e.target.value)}
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
            disabled={!name.trim() || !mediaType || createMut.isPending}
            onClick={() =>
              createMut.mutate({
                campaignId,
                name: name.trim(),
                mediaType:
                  mediaType as typeof AMPLIFICATION_MEDIA_TYPES[number],
                platform: platform || undefined,
                mediaCost: mediaCost ? Number(mediaCost) : 0,
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
