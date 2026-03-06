"use client";

import { useState } from "react";
import {
  Image,
  Video,
  Music,
  FileText,
  Palette,
  Monitor,
  Package,
  BookOpen,
  Film,
  Layout,
  Loader2,
  Upload,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
  CAMPAIGN_ASSET_TYPES,
  CAMPAIGN_ASSET_TYPE_LABELS,
  type CampaignAssetType,
} from "~/lib/constants";

interface AssetGalleryProps {
  campaignId: string;
}

const ASSET_ICONS: Record<CampaignAssetType, React.ComponentType<{ className?: string }>> = {
  KEY_VISUAL: Image,
  VIDEO: Video,
  AUDIO: Music,
  PRINT: FileText,
  DIGITAL_BANNER: Monitor,
  SOCIAL_POST: Layout,
  PACKAGING: Package,
  PLV: Palette,
  DOCUMENT: FileText,
  SCRIPT: BookOpen,
  STORYBOARD: Film,
  MOODBOARD: Palette,
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-gray-600 bg-gray-50 border-gray-200",
  IN_REVIEW: "text-amber-600 bg-amber-50 border-amber-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  PUBLISHED: "text-blue-600 bg-blue-50 border-blue-200",
  ARCHIVED: "text-slate-600 bg-slate-50 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  IN_REVIEW: "En revision",
  APPROVED: "Approuve",
  REJECTED: "Rejete",
  PUBLISHED: "Publie",
  ARCHIVED: "Archive",
};

export function AssetGallery({ campaignId }: AssetGalleryProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const utils = api.useUtils();

  const { data: assets, isLoading } =
    api.campaign.assets.getByCampaign.useQuery({ campaignId });

  const publishMutation = api.campaign.assets.publishToVault.useMutation({
    onSuccess: () => {
      toast.success("Asset publie au Brand Vault");
      void utils.campaign.assets.getByCampaign.invalidate({ campaignId });
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la publication");
    },
  });

  const filteredAssets =
    assets && filterType !== "ALL"
      ? assets.filter((a: Asset) => a.assetType === filterType)
      : assets;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Image className="h-4 w-4 text-indigo-500" />
          Assets creatifs
          {assets && (
            <Badge variant="secondary" className="text-xs">
              {assets.length}
            </Badge>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {CAMPAIGN_ASSET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {CAMPAIGN_ASSET_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets && filteredAssets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset: Asset) => {
            const AssetIcon =
              ASSET_ICONS[asset.assetType as CampaignAssetType] ?? FileText;
            const statusColor = STATUS_COLORS[asset.status] ?? STATUS_COLORS.DRAFT;
            const statusLabel = STATUS_LABELS[asset.status] ?? asset.status;

            return (
              <Card key={asset.id} className="overflow-hidden">
                {/* Thumbnail / Placeholder */}
                <div className="flex h-36 items-center justify-center bg-muted/50">
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AssetIcon className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>

                <CardContent className="space-y-2 py-3">
                  {/* Name */}
                  <p className="truncate text-sm font-medium" title={asset.name}>
                    {asset.name}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {CAMPAIGN_ASSET_TYPE_LABELS[asset.assetType as CampaignAssetType] ?? asset.assetType}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${statusColor}`}>
                      {statusLabel}
                    </Badge>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {asset.fileType && <span>{asset.fileType.toUpperCase()}</span>}
                    {asset.version != null && <span>v{asset.version}</span>}
                  </div>

                  {/* Publish Button */}
                  {asset.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 w-full text-xs"
                      onClick={() => publishMutation.mutate({ assetId: asset.id })}
                      disabled={publishMutation.isPending}
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="mr-1 h-3 w-3" />
                      )}
                      Publier au Brand Vault
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              {filterType !== "ALL"
                ? "Aucun asset pour ce type."
                : "Aucun asset creatif pour cette campagne."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Types ──

interface Asset {
  id: string;
  name: string;
  assetType: string;
  status: string;
  fileType?: string | null;
  version?: number | null;
  thumbnailUrl?: string | null;
}
