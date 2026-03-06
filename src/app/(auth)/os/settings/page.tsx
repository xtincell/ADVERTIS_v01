// ==========================================================================
// PAGE OS.SETTINGS — Brand OS Settings
// 3-tab settings: Canaux sociaux, Configuration OS, Thème.
// Uses the BrandOSProvider context for current brand selection.
// ==========================================================================

"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Music2,
  Twitter,
  Youtube,
  Linkedin,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Radio,
  Settings2,
  Palette,
} from "lucide-react";

import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-os-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AddChannelDialog } from "~/components/brand-os/add-channel-dialog";
import { CultWeightsEditor } from "~/components/brand-os/cult-weights-editor";
import {
  PLATFORM_CONFIG,
  CHANNEL_HEALTH_CONFIG,
  BRAND_OS_VIEWS,
  DEFAULT_CULT_WEIGHTS,
} from "~/lib/types/brand-os";
import type {
  SocialPlatform,
  ChannelHealthStatus,
  BrandOSView,
  CultIndexWeights,
} from "~/lib/types/brand-os";

// ---------------------------------------------------------------------------
// Platform icons mapping
// ---------------------------------------------------------------------------

const PLATFORM_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  TIKTOK: Music2,
  TWITTER: Twitter,
  YOUTUBE: Youtube,
  LINKEDIN: Linkedin,
};

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BrandOSSettingsPage() {
  const brandId = useBrandId();

  if (!brandId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          Sélectionnez une marque pour accéder aux paramètres.
        </p>
      </div>
    );
  }

  return <SettingsContent strategyId={brandId} />;
}

// ---------------------------------------------------------------------------
// Settings content (with strategyId guaranteed)
// ---------------------------------------------------------------------------

function SettingsContent({ strategyId }: { strategyId: string }) {
  const utils = api.useUtils();

  // ── Data queries ──
  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = api.brandOS.getConfig.useQuery({ strategyId });

  const {
    data: channels,
    isLoading: channelsLoading,
    refetch: refetchChannels,
  } = api.brandOS.getChannels.useQuery({ strategyId });

  // ── Mutations ──
  const updateConfig = api.brandOS.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration mise à jour");
      void refetchConfig();
    },
    onError: (err) => toast.error(err.message),
  });

  const upsertChannel = api.brandOS.upsertChannel.useMutation({
    onSuccess: () => {
      toast.success("Canal mis à jour");
      void refetchChannels();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteChannel = api.brandOS.deleteChannel.useMutation({
    onSuccess: () => {
      toast.success("Canal supprimé");
      void refetchChannels();
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Loading ──
  if (configLoading || channelsLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 stagger-children">
        <div className="h-7 w-48 shimmer rounded-md bg-muted" />
        <div className="h-10 w-full shimmer rounded-lg bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 shimmer rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Impossible de charger la configuration
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetchConfig()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-6 animate-page-enter">
      <div>
        <h1 className="text-display-lg">Paramètres Brand OS</h1>
        <p className="text-sm text-muted-foreground">
          Configurez vos canaux, l'algorithme du Cult Index et le thème visuel.
        </p>
      </div>

      <Tabs defaultValue="channels">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="channels">
            <Radio className="mr-1.5 h-4 w-4" />
            Canaux
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 className="mr-1.5 h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="mr-1.5 h-4 w-4" />
            Thème
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Social Channels ── */}
        <TabsContent value="channels" className="mt-4">
          <ChannelsTab
            strategyId={strategyId}
            channels={channels ?? []}
            onUpsert={async (data) => {
              await upsertChannel.mutateAsync({ strategyId, ...data });
            }}
            onDelete={async (platform) => {
              await deleteChannel.mutateAsync({ strategyId, platform });
            }}
            isUpsertLoading={upsertChannel.isPending}
            isDeleteLoading={deleteChannel.isPending}
          />
        </TabsContent>

        {/* ── Tab 2: OS Configuration ── */}
        <TabsContent value="config" className="mt-4">
          <ConfigTab
            strategyId={strategyId}
            config={config}
            onUpdate={async (data) => {
              await updateConfig.mutateAsync({ strategyId, ...data });
            }}
            isLoading={updateConfig.isPending}
          />
        </TabsContent>

        {/* ── Tab 3: Theme ── */}
        <TabsContent value="theme" className="mt-4">
          <ThemeTab
            strategyId={strategyId}
            config={config}
            onUpdate={async (data) => {
              await updateConfig.mutateAsync({ strategyId, theme: data });
            }}
            isLoading={updateConfig.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===========================================================================
// TAB 1 — Social Channels
// ===========================================================================

interface ChannelsTabProps {
  strategyId: string;
  channels: Array<{
    id: string;
    platform: string;
    accountName: string | null;
    followers: number | null;
    engagementRate: number | null;
    healthStatus: string | null;
    category: string | null;
    isConnected: boolean;
  }>;
  onUpsert: (data: {
    platform: string;
    accountName?: string;
    followers?: number;
  }) => Promise<void>;
  onDelete: (platform: string) => Promise<void>;
  isUpsertLoading: boolean;
  isDeleteLoading: boolean;
}

function ChannelsTab({
  channels,
  onUpsert,
  onDelete,
  isUpsertLoading,
  isDeleteLoading,
}: ChannelsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{
    platform: string;
    accountName?: string | null;
    category?: string | null;
    followers?: number | null;
  } | null>(null);
  const [deletingPlatform, setDeletingPlatform] = useState<string | null>(null);

  const handleEdit = useCallback(
    (ch: ChannelsTabProps["channels"][number]) => {
      setEditData({
        platform: ch.platform,
        accountName: ch.accountName,
        category: ch.category,
        followers: ch.followers,
      });
      setDialogOpen(true);
    },
    [],
  );

  const handleDelete = useCallback(
    async (platform: string) => {
      setDeletingPlatform(platform);
      try {
        await onDelete(platform);
      } finally {
        setDeletingPlatform(null);
      }
    },
    [onDelete],
  );

  const handleAdd = useCallback(() => {
    setEditData(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Canaux connectés</h2>
          <p className="text-xs text-muted-foreground">
            {channels.length} canal{channels.length !== 1 ? "ux" : ""} configuré
            {channels.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {channels.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12">
          <Radio className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aucun canal social connecté
          </p>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter votre premier canal
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((ch) => {
            const platKey = ch.platform as SocialPlatform;
            const platConfig = PLATFORM_CONFIG[platKey];
            const Icon = platConfig ? PLATFORM_ICONS[platKey] : Radio;
            const healthKey = (ch.healthStatus ?? "UNKNOWN") as ChannelHealthStatus;
            const healthConfig = CHANNEL_HEALTH_CONFIG[healthKey] ?? CHANNEL_HEALTH_CONFIG.UNKNOWN;
            const isDeleting = deletingPlatform === ch.platform;

            return (
              <Card key={ch.id} className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${platConfig?.color ?? "#6b7280"}15` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: platConfig?.color ?? "#6b7280" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {platConfig?.label ?? ch.platform}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{ color: healthConfig.color, borderColor: healthConfig.color }}
                    >
                      {healthConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {ch.accountName ?? "—"} ·{" "}
                    {ch.followers ? `${(ch.followers / 1000).toFixed(1)}k` : "—"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(ch)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => void handleDelete(ch.platform)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editData={editData}
        onSubmit={onUpsert}
      />
    </div>
  );
}

// ===========================================================================
// TAB 2 — OS Configuration
// ===========================================================================

interface ConfigTabProps {
  strategyId: string;
  config: {
    enabledViews: unknown;
    refreshCadence: string | null;
    cultWeights: unknown;
  };
  onUpdate: (data: {
    enabledViews?: string[];
    refreshCadence?: "HOURLY" | "DAILY" | "WEEKLY";
    cultWeights?: Record<string, number>;
  }) => Promise<void>;
  isLoading: boolean;
}

function ConfigTab({ config, onUpdate, isLoading }: ConfigTabProps) {
  // ── Enabled views ──
  const currentViews = Array.isArray(config.enabledViews)
    ? (config.enabledViews as string[])
    : [];

  const handleViewToggle = useCallback(
    async (view: string, checked: boolean) => {
      const next = checked
        ? [...currentViews, view]
        : currentViews.filter((v) => v !== view);
      await onUpdate({ enabledViews: next });
    },
    [currentViews, onUpdate],
  );

  // ── Refresh cadence ──
  const handleCadenceChange = useCallback(
    async (cadence: string) => {
      await onUpdate({ refreshCadence: cadence as "HOURLY" | "DAILY" | "WEEKLY" });
    },
    [onUpdate],
  );

  // ── Cult weights ──
  const currentWeights: CultIndexWeights = (config.cultWeights &&
    typeof config.cultWeights === "object"
    ? config.cultWeights
    : DEFAULT_CULT_WEIGHTS) as CultIndexWeights;

  const handleWeightsChange = useCallback(
    async (weights: CultIndexWeights) => {
      await onUpdate({ cultWeights: weights as unknown as Record<string, number> });
    },
    [onUpdate],
  );

  return (
    <div className="space-y-6">
      {/* Views */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1">Vues activées</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sélectionnez les modules visibles dans le Brand OS.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(BRAND_OS_VIEWS) as [BrandOSView, (typeof BRAND_OS_VIEWS)[BrandOSView]][]).map(
            ([key, view]) => {
              const enabled = currentViews.includes(key);
              return (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      void handleViewToggle(key, checked === true)
                    }
                    disabled={isLoading}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{view.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {view.description}
                    </div>
                  </div>
                </label>
              );
            },
          )}
        </div>
      </Card>

      {/* Refresh Cadence */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1">Cadence de rafraîchissement</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Fréquence de recalcul automatique du Cult Index et des métriques.
        </p>
        <div className="flex gap-2">
          {(["HOURLY", "DAILY", "WEEKLY"] as const).map((cadence) => {
            const labels: Record<string, string> = {
              HOURLY: "Toutes les heures",
              DAILY: "Quotidien",
              WEEKLY: "Hebdomadaire",
            };
            const active = config.refreshCadence === cadence;
            return (
              <Button
                key={cadence}
                variant={active ? "default" : "outline"}
                size="sm"
                disabled={isLoading}
                onClick={() => void handleCadenceChange(cadence)}
              >
                {labels[cadence]}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Cult Index Weights */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-1">Pondération du Cult Index</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Ajustez l'importance de chaque métrique dans le calcul du Cult Index.
          Le total doit être de 100%.
        </p>
        <CultWeightsEditor
          weights={currentWeights}
          onChange={(w) => void handleWeightsChange(w)}
          disabled={isLoading}
        />
      </Card>
    </div>
  );
}

// ===========================================================================
// TAB 3 — Theme
// ===========================================================================

interface ThemeTabProps {
  strategyId: string;
  config: {
    theme: unknown;
  };
  onUpdate: (theme: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

function ThemeTab({ config, onUpdate, isLoading }: ThemeTabProps) {
  const theme = (config.theme && typeof config.theme === "object"
    ? config.theme
    : {}) as Record<string, string>;

  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor ?? "#F59E0B");
  const [logoUrl, setLogoUrl] = useState(theme.logoUrl ?? "");
  const [fontFamily, setFontFamily] = useState(theme.fontFamily ?? "Inter");

  const handleSave = useCallback(async () => {
    await onUpdate({
      primaryColor,
      logoUrl: logoUrl || undefined,
      fontFamily,
    });
  }, [primaryColor, logoUrl, fontFamily, onUpdate]);

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-1">Identité visuelle</h3>
          <p className="text-xs text-muted-foreground">
            Personnalisez les couleurs et la typographie du Brand OS.
          </p>
        </div>

        {/* Primary color */}
        <div className="space-y-2">
          <Label>Couleur principale</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#F59E0B"
              className="max-w-[160px] font-mono"
            />
            <div
              className="h-10 flex-1 rounded-lg border"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>

        <Separator />

        {/* Logo URL */}
        <div className="space-y-2">
          <Label>URL du logo (optionnel)</Label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          {logoUrl && (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Font */}
        <div className="space-y-2">
          <Label>Police de caractères</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="max-w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p
            className="text-sm text-muted-foreground mt-2"
            style={{ fontFamily }}
          >
            Aperçu : The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        <Separator />

        <Button onClick={() => void handleSave()} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer le thème
        </Button>
      </Card>
    </div>
  );
}
