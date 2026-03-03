// =============================================================================
// COMPONENT C.K26 — Section Brand OS Setup
// =============================================================================
// Cockpit section for configuring Brand OS: manage social channels,
// seed demo data, and link to the Brand OS portal.
// Props: strategyId.
// =============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  Loader2,
  Plus,
  Radio,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { CockpitSection } from "../cockpit-shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLATFORMS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "TWITTER", label: "Twitter / X" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  FACEBOOK: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TIKTOK: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  TWITTER: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  LINKEDIN: "bg-blue-600/15 text-blue-500 border-blue-600/30",
  YOUTUBE: "bg-red-500/15 text-red-400 border-red-500/30",
  WHATSAPP: "bg-green-500/15 text-green-400 border-green-500/30",
};

const HEALTH_OPTIONS = [
  { value: "HEALTHY", label: "Sain", color: "text-green-400" },
  { value: "WARNING", label: "Attention", color: "text-amber-400" },
  { value: "CRITICAL", label: "Critique", color: "text-red-400" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionBrandOSSetup({ strategyId }: { strategyId: string }) {
  const utils = api.useUtils();

  // ── Queries ──
  const { data: channels, isLoading: loadingChannels } =
    api.brandOS.getChannels.useQuery({ strategyId });

  const { data: config } = api.brandOS.getConfig.useQuery({ strategyId });

  const { data: latestSnapshot } =
    api.brandOS.getCultIndexHistory.useQuery({ strategyId, limit: 1 });

  // ── Channel form state ──
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState("");
  const [accountName, setAccountName] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [avgReach, setAvgReach] = useState("");
  const [healthStatus, setHealthStatus] = useState("HEALTHY");

  // ── Delete confirmation ──
  const [deleteTarget, setDeleteTarget] = useState<{ platform: string; name: string } | null>(null);

  // ── Mutations ──
  const upsertMut = api.brandOS.upsertChannel.useMutation({
    onSuccess: () => {
      toast.success("Canal mis à jour");
      resetForm();
      void utils.brandOS.getChannels.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMut = api.brandOS.deleteChannel.useMutation({
    onSuccess: () => {
      toast.success("Canal supprimé");
      void utils.brandOS.getChannels.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const seedMut = api.brandOS.seedDemoData.useMutation({
    onSuccess: (data) => {
      toast.success(`Données démo injectées : ${data.channels} canaux, ${data.snapshots} snapshots, ${data.superfans} superfans`);
      void utils.brandOS.getChannels.invalidate({ strategyId });
      void utils.brandOS.getCultIndexHistory.invalidate({ strategyId });
      void utils.brandOS.getConfig.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors de l'injection des données démo"),
  });

  const snapshotMut = api.brandOS.saveCultIndexSnapshot.useMutation({
    onSuccess: () => {
      toast.success("Snapshot Cult Index enregistré");
      void utils.brandOS.getCultIndexHistory.invalidate({ strategyId });
    },
    onError: () => toast.error("Erreur lors du calcul"),
  });

  function resetForm() {
    setShowForm(false);
    setPlatform("");
    setAccountName("");
    setFollowers("");
    setEngagementRate("");
    setAvgReach("");
    setHealthStatus("HEALTHY");
  }

  function handleSubmitChannel() {
    if (!platform) {
      toast.error("Sélectionnez une plateforme");
      return;
    }
    upsertMut.mutate({
      strategyId,
      platform,
      accountName: accountName || undefined,
      followers: followers ? parseInt(followers, 10) : undefined,
      engagementRate: engagementRate ? parseFloat(engagementRate) : undefined,
      avgReach: avgReach ? parseInt(avgReach, 10) : undefined,
      healthStatus: healthStatus || undefined,
    });
  }

  const hasChannels = channels && channels.length > 0;
  const hasData = latestSnapshot && latestSnapshot.length > 0;
  const totalFollowers = channels?.reduce((sum, c) => sum + (c.followers ?? 0), 0) ?? 0;

  return (
    <CockpitSection
      icon={<Radio className="h-5 w-5" />}
      pillarLetter="E"
      title="Brand OS — Configuration"
      subtitle="Connectez vos canaux et activez le tableau de bord vivant"
      color="#F59E0B"
    >
      <div className="space-y-6">
        {/* ── Status overview ── */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Radio className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{channels?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Canaux connectés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers}
                  </p>
                  <p className="text-xs text-muted-foreground">Audience totale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {hasData ? Math.round(latestSnapshot[0]!.cultIndex) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Cult Index</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Connected Channels ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Canaux sociaux</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="h-7 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingChannels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : hasChannels ? (
              <div className="space-y-2">
                {channels.map((ch) => (
                  <div
                    key={ch.platform}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0 shrink-0", PLATFORM_COLORS[ch.platform] ?? "")}
                    >
                      {ch.platform}
                    </Badge>
                    <span className="text-sm font-medium min-w-0 truncate flex-1">
                      {ch.accountName ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ch.followers ? `${(ch.followers / 1000).toFixed(1)}K` : "—"}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ch.engagementRate ? `${ch.engagementRate}%` : "—"}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 shrink-0",
                        ch.healthStatus === "HEALTHY"
                          ? "text-green-400 border-green-500/30"
                          : ch.healthStatus === "WARNING"
                            ? "text-amber-400 border-amber-500/30"
                            : "text-red-400 border-red-500/30",
                      )}
                    >
                      {ch.healthStatus === "HEALTHY" ? "Sain" : ch.healthStatus === "WARNING" ? "Attention" : ch.healthStatus ?? "—"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-400"
                      onClick={() => setDeleteTarget({ platform: ch.platform, name: ch.accountName ?? ch.platform })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucun canal connecté. Ajoutez vos plateformes sociales.
              </p>
            )}

            {/* ── Add channel form ── */}
            {showForm && (
              <div className="mt-4 rounded-lg border border-dashed p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Plateforme</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Nom du compte</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="@moncompte"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Abonnés</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="47200"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Taux d&apos;engagement (%)</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      step="0.1"
                      placeholder="4.8"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Portée moyenne</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      placeholder="18500"
                      value={avgReach}
                      onChange={(e) => setAvgReach(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Statut</Label>
                    <Select value={healthStatus} onValueChange={setHealthStatus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HEALTH_OPTIONS.map((h) => (
                          <SelectItem key={h.value} value={h.value}>
                            <span className={h.color}>{h.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSubmitChannel}
                    disabled={upsertMut.isPending}
                  >
                    {upsertMut.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Enregistrer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={resetForm}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-2">
          {hasChannels && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => snapshotMut.mutate({ strategyId })}
              disabled={snapshotMut.isPending}
            >
              {snapshotMut.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Zap className="mr-1 h-3 w-3" />
              )}
              Calculer le Cult Index
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => seedMut.mutate({ strategyId })}
            disabled={seedMut.isPending}
          >
            {seedMut.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Database className="mr-1 h-3 w-3" />
            )}
            Injecter données démo
          </Button>
          {(hasChannels || hasData) && (
            <Button
              size="sm"
              className="h-8 text-xs"
              asChild
            >
              <Link href="/os">
                Ouvrir Brand OS
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce canal ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le canal {deleteTarget?.name} sera retiré. Cette action est réversible en le rajoutant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteMut.mutate({ strategyId, platform: deleteTarget.platform });
                  setDeleteTarget(null);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CockpitSection>
  );
}
