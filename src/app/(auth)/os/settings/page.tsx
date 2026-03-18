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
  MessageSquare,
  Bell,
  X,
  Save,
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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AddChannelDialog } from "~/components/brand-os/add-channel-dialog";
import { getAllFrameworks } from "~/lib/framework-registry";
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
  { value: "Montserrat", label: "Montserrat" },
  { value: "Raleway", label: "Raleway" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Outfit", label: "Outfit" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Sora", label: "Sora" },
];

const TONE_OPTIONS = [
  { value: "authoritative", label: "Autoritaire" },
  { value: "friendly", label: "Amical" },
  { value: "inspiring", label: "Inspirant" },
  { value: "provocative", label: "Provocateur" },
  { value: "expert", label: "Expert" },
  { value: "playful", label: "Ludique" },
  { value: "minimalist", label: "Minimaliste" },
  { value: "storytelling", label: "Narratif" },
];

const REGISTER_OPTIONS = [
  { value: "formal", label: "Soutenu" },
  { value: "standard", label: "Courant" },
  { value: "casual", label: "Familier" },
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
          <TabsTrigger value="voice">
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Voix
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="mr-1.5 h-4 w-4" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="frameworks">
            <Settings2 className="mr-1.5 h-4 w-4" />
            Frameworks
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

        {/* ── Tab 4: Brand Voice ── */}
        <TabsContent value="voice" className="mt-4">
          <BrandVoiceTab
            strategyId={strategyId}
            config={config}
            onUpdate={async (data) => {
              await updateConfig.mutateAsync({ strategyId, brandVoice: data });
            }}
            isLoading={updateConfig.isPending}
          />
        </TabsContent>

        {/* ── Tab 5: Alerts ── */}
        <TabsContent value="alerts" className="mt-4">
          <AlertsTab
            strategyId={strategyId}
            config={config}
            onUpdate={async (data) => {
              await updateConfig.mutateAsync({ strategyId, alertConfig: data });
            }}
            isLoading={updateConfig.isPending}
          />
        </TabsContent>

        {/* ── Tab 6: Frameworks ── */}
        <TabsContent value="frameworks" className="mt-4">
          <FrameworksTab
            strategyId={strategyId}
            config={config}
            onUpdate={async (ids) => {
              await updateConfig.mutateAsync({ strategyId, enabledFrameworks: ids });
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

// ===========================================================================
// TAB 4 — Brand Voice
// ===========================================================================

interface BrandVoiceTabProps {
  strategyId: string;
  config: {
    socialCredentials: unknown;
  };
  onUpdate: (data: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

function BrandVoiceTab({ config, onUpdate, isLoading }: BrandVoiceTabProps) {
  const creds = (config.socialCredentials && typeof config.socialCredentials === "object"
    ? config.socialCredentials
    : {}) as Record<string, unknown>;
  const existingVoice = (creds.brandVoice ?? {}) as Record<string, unknown>;

  const [tone, setTone] = useState((existingVoice.tone as string) ?? "");
  const [register, setRegister] = useState((existingVoice.register as string) ?? "");
  const [keywords, setKeywords] = useState<string[]>(
    (existingVoice.keywords as string[]) ?? [],
  );
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(
    (existingVoice.forbiddenWords as string[]) ?? [],
  );
  const [examplePhrase, setExamplePhrase] = useState(
    (existingVoice.examplePhrase as string) ?? "",
  );
  const [applyToGlory, setApplyToGlory] = useState(
    (existingVoice.applyToGlory as boolean) ?? true,
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [forbiddenInput, setForbiddenInput] = useState("");

  const handleAddKeyword = useCallback(() => {
    const word = keywordInput.trim();
    if (word && !keywords.includes(word)) {
      setKeywords([...keywords, word]);
      setKeywordInput("");
    }
  }, [keywordInput, keywords]);

  const handleAddForbidden = useCallback(() => {
    const word = forbiddenInput.trim();
    if (word && !forbiddenWords.includes(word)) {
      setForbiddenWords([...forbiddenWords, word]);
      setForbiddenInput("");
    }
  }, [forbiddenInput, forbiddenWords]);

  const handleSave = useCallback(async () => {
    await onUpdate({
      tone,
      register,
      keywords,
      forbiddenWords,
      examplePhrase: examplePhrase || undefined,
      applyToGlory,
    });
  }, [tone, register, keywords, forbiddenWords, examplePhrase, applyToGlory, onUpdate]);

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-1">Voix de marque</h3>
          <p className="text-xs text-muted-foreground">
            Définissez le ton, le registre et le vocabulaire de votre marque.
            Ces paramètres guident les générations IA.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Tone */}
          <div className="space-y-2">
            <Label>Ton principal</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un ton" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Register */}
          <div className="space-y-2">
            <Label>Registre de langue</Label>
            <Select value={register} onValueChange={setRegister}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un registre" />
              </SelectTrigger>
              <SelectContent>
                {REGISTER_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Mots-clés de marque</Label>
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Ajouter un mot-clé..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleAddKeyword}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {kw}
                <button
                  onClick={() => setKeywords(keywords.filter((k) => k !== kw))}
                  className="hover:text-primary/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Forbidden words */}
        <div className="space-y-2">
          <Label>Mots interdits</Label>
          <div className="flex gap-2">
            <Input
              value={forbiddenInput}
              onChange={(e) => setForbiddenInput(e.target.value)}
              placeholder="Ajouter un mot à éviter..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddForbidden();
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleAddForbidden}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {forbiddenWords.map((fw) => (
              <span
                key={fw}
                className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600"
              >
                {fw}
                <button
                  onClick={() => setForbiddenWords(forbiddenWords.filter((w) => w !== fw))}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Separator />

        {/* Example phrase */}
        <div className="space-y-2">
          <Label>Phrase type (exemple de voix)</Label>
          <Textarea
            value={examplePhrase}
            onChange={(e) => setExamplePhrase(e.target.value)}
            placeholder="Ex: Chez Xtincell, on ne suit pas les tendances — on les crée."
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Donnez un exemple de phrase qui capture parfaitement le ton de votre marque.
          </p>
        </div>

        <Separator />

        {/* Apply to GLORY */}
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={applyToGlory}
            onCheckedChange={(checked) => setApplyToGlory(checked === true)}
          />
          <div>
            <div className="text-sm font-medium">
              Appliquer aux générations GLORY
            </div>
            <div className="text-xs text-muted-foreground">
              Les outils GLORY utiliseront automatiquement cette voix de marque
            </div>
          </div>
        </label>

        <Separator />

        <Button onClick={() => void handleSave()} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Enregistrer la voix
        </Button>
      </Card>
    </div>
  );
}

// ===========================================================================
// TAB 5 — Alerts & Monitoring
// ===========================================================================

interface AlertsTabProps {
  strategyId: string;
  config: {
    socialCredentials: unknown;
  };
  onUpdate: (data: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

function AlertsTab({ config, onUpdate, isLoading }: AlertsTabProps) {
  const creds = (config.socialCredentials && typeof config.socialCredentials === "object"
    ? config.socialCredentials
    : {}) as Record<string, unknown>;
  const existingAlerts = (creds.alertConfig ?? {}) as Record<string, unknown>;

  const [cultThreshold, setCultThreshold] = useState(
    (existingAlerts.cultIndexThreshold as number) ?? 30,
  );
  const [healthThreshold, setHealthThreshold] = useState(
    (existingAlerts.communityHealthThreshold as number) ?? 40,
  );
  const [reportFreq, setReportFreq] = useState(
    (existingAlerts.reportFrequency as string) ?? "WEEKLY",
  );
  const [alertEngagement, setAlertEngagement] = useState(
    (existingAlerts.alertEngagementDrop as boolean) ?? true,
  );
  const [alertTarsis, setAlertTarsis] = useState(
    (existingAlerts.alertTarsisSignal as boolean) ?? true,
  );
  const [alertMission, setAlertMission] = useState(
    (existingAlerts.alertMissionDeadline as boolean) ?? true,
  );

  const handleSave = useCallback(async () => {
    await onUpdate({
      cultIndexThreshold: cultThreshold,
      communityHealthThreshold: healthThreshold,
      reportFrequency: reportFreq,
      alertEngagementDrop: alertEngagement,
      alertTarsisSignal: alertTarsis,
      alertMissionDeadline: alertMission,
    });
  }, [cultThreshold, healthThreshold, reportFreq, alertEngagement, alertTarsis, alertMission, onUpdate]);

  return (
    <div className="space-y-6">
      {/* Thresholds */}
      <Card className="p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-1">Seuils d'alerte</h3>
          <p className="text-xs text-muted-foreground">
            Définissez les seuils en dessous desquels vous serez alerté.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Seuil Cult Index</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={cultThreshold}
                onChange={(e) => setCultThreshold(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-mono w-12 text-right">
                {cultThreshold}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Alerte si le Cult Index descend sous {cultThreshold}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label>Seuil santé communauté</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={healthThreshold}
                onChange={(e) => setHealthThreshold(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-mono w-12 text-right">
                {healthThreshold}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Alerte si la santé communautaire descend sous {healthThreshold}/100
            </p>
          </div>
        </div>
      </Card>

      {/* Report frequency */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Fréquence des rapports</h3>
          <p className="text-xs text-muted-foreground">
            À quelle fréquence souhaitez-vous recevoir les rapports de monitoring ?
          </p>
        </div>
        <div className="flex gap-2">
          {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((freq) => {
            const labels: Record<string, string> = {
              DAILY: "Quotidien",
              WEEKLY: "Hebdomadaire",
              MONTHLY: "Mensuel",
            };
            return (
              <Button
                key={freq}
                variant={reportFreq === freq ? "default" : "outline"}
                size="sm"
                onClick={() => setReportFreq(freq)}
              >
                {labels[freq]}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Alert toggles */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Types d'alertes</h3>
          <p className="text-xs text-muted-foreground">
            Activez ou désactivez les différents types d'alertes.
          </p>
        </div>

        {[
          {
            checked: alertEngagement,
            setter: setAlertEngagement,
            title: "Baisse d'engagement > 20%",
            desc: "Alerte quand l'engagement rate chute de plus de 20% par rapport à la moyenne",
          },
          {
            checked: alertTarsis,
            setter: setAlertTarsis,
            title: "Nouveaux signaux TARSIS",
            desc: "Alerte quand un nouveau signal concurrentiel est détecté",
          },
          {
            checked: alertMission,
            setter: setAlertMission,
            title: "Deadlines de missions",
            desc: "Rappel quand une mission approche de sa date limite",
          },
        ].map((toggle, i) => (
          <label
            key={i}
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={toggle.checked}
              onCheckedChange={(checked) => toggle.setter(checked === true)}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium">{toggle.title}</div>
              <div className="text-xs text-muted-foreground">{toggle.desc}</div>
            </div>
          </label>
        ))}
      </Card>

      <Button onClick={() => void handleSave()} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Enregistrer les alertes
      </Button>
    </div>
  );
}

// ===========================================================================
// TAB 6 — Frameworks
// ===========================================================================

const LAYER_LABELS: Record<string, string> = {
  PHILOSOPHY: "Philosophie",
  IDENTITY: "Identité",
  STRATEGY: "Stratégie",
  EXPERIENCE: "Expérience",
  VALIDATION: "Validation",
  EXECUTION: "Exécution",
  MEASURE: "Mesure",
  GROWTH: "Croissance",
  SURVIVAL: "Survie",
};

const LAYER_COLORS: Record<string, string> = {
  PHILOSOPHY: "#8B5CF6",
  IDENTITY: "#10B981",
  STRATEGY: "#F59E0B",
  EXPERIENCE: "#3B82F6",
  VALIDATION: "#EF4444",
  EXECUTION: "#EC4899",
  MEASURE: "#06B6D4",
  GROWTH: "#F97316",
  SURVIVAL: "#6B7280",
};

interface FrameworksTabProps {
  strategyId: string;
  config: {
    socialCredentials: unknown;
  };
  onUpdate: (frameworkIds: string[]) => Promise<void>;
  isLoading: boolean;
}

function FrameworksTab({ config, onUpdate, isLoading }: FrameworksTabProps) {
  const allFrameworks = getAllFrameworks();
  const creds = (config.socialCredentials && typeof config.socialCredentials === "object"
    ? config.socialCredentials
    : {}) as Record<string, unknown>;

  // Default: all implemented frameworks are enabled
  const defaultEnabled = allFrameworks
    .filter((fw) => fw.hasImplementation)
    .map((fw) => fw.id);
  const savedEnabled = (creds.enabledFrameworks as string[]) ?? defaultEnabled;

  const [enabledIds, setEnabledIds] = useState<string[]>(savedEnabled);

  const handleToggle = useCallback(
    (fwId: string, checked: boolean) => {
      setEnabledIds((prev) =>
        checked ? [...prev, fwId] : prev.filter((id) => id !== fwId),
      );
    },
    [],
  );

  const handleSave = useCallback(async () => {
    await onUpdate(enabledIds);
  }, [enabledIds, onUpdate]);

  // Group by layer
  const byLayer = new Map<string, typeof allFrameworks>();
  for (const fw of allFrameworks) {
    const layer = fw.layer;
    if (!byLayer.has(layer)) byLayer.set(layer, []);
    byLayer.get(layer)!.push(fw);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-2">
        <h3 className="text-sm font-semibold">Frameworks ARTEMIS</h3>
        <p className="text-xs text-muted-foreground">
          Activez ou désactivez les frameworks stratégiques pour cette marque.
          {enabledIds.length} / {allFrameworks.length} activé(s).
        </p>
      </Card>

      {Array.from(byLayer.entries()).map(([layer, frameworks]) => (
        <Card key={layer} className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[layer] ?? "#6b7280" }}
            />
            <h3 className="text-sm font-semibold">
              {LAYER_LABELS[layer] ?? layer}
            </h3>
            <Badge variant="outline" className="text-[10px]">
              Couche {Array.from(byLayer.keys()).indexOf(layer)}
            </Badge>
          </div>

          <div className="space-y-2">
            {frameworks.map((fw) => {
              const isEnabled = enabledIds.includes(fw.id);
              return (
                <label
                  key={fw.id}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      handleToggle(fw.id, checked === true)
                    }
                    disabled={isLoading}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{fw.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {fw.id}
                      </span>
                      {!fw.hasImplementation && (
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                          Système existant
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {fw.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>
      ))}

      <Button onClick={() => void handleSave()} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Enregistrer la configuration
      </Button>
    </div>
  );
}
