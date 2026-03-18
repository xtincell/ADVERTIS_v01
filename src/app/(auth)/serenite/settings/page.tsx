// ==========================================================================
// PAGE P.8G — Settings (Operator)
// 5-tab settings hub: Profil, Plateforme, IA, Notifications, Sécurité.
// ==========================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  User,
  Building,
  Mail,
  Calendar,
  Loader2,
  AlertTriangle,
  Globe,
  Brain,
  Bell,
  Shield,
  Save,
} from "lucide-react";
import { PageHeader } from "~/components/ui/page-header";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRENCIES = [
  { value: "XOF", label: "XOF — Franc CFA (BCEAO)" },
  { value: "XAF", label: "XAF — Franc CFA (BEAC)" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — Dollar US" },
  { value: "GHS", label: "GHS — Cedi ghanéen" },
  { value: "NGN", label: "NGN — Naira nigérian" },
];

const MARKETS = [
  { value: "CM", label: "Cameroun" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "SN", label: "Sénégal" },
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "FR", label: "France" },
  { value: "US", label: "États-Unis" },
  { value: "GA", label: "Gabon" },
  { value: "BJ", label: "Bénin" },
  { value: "TG", label: "Togo" },
  { value: "ML", label: "Mali" },
  { value: "BF", label: "Burkina Faso" },
];

const TIMEZONES = [
  { value: "Africa/Douala", label: "Douala (UTC+1)" },
  { value: "Africa/Lagos", label: "Lagos (UTC+1)" },
  { value: "Africa/Abidjan", label: "Abidjan (UTC+0)" },
  { value: "Africa/Dakar", label: "Dakar (UTC+0)" },
  { value: "Africa/Accra", label: "Accra (UTC+0)" },
  { value: "Europe/Paris", label: "Paris (UTC+1)" },
  { value: "America/New_York", label: "New York (UTC-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
];

const AI_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (Recommandé)" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Rapide)" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Tab 1: Profile
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès.");
      setIsDirty(false);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du profil.");
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setCompany(profile.company ?? "");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      company: company || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="size-5 text-primary" />
          <CardTitle>Profil</CardTitle>
        </div>
        <CardDescription>
          Gérez vos informations personnelles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">
            <div className="flex items-center gap-1.5">
              <Building className="size-3.5" />
              Entreprise
            </div>
          </Label>
          <Input
            id="company"
            placeholder="Nom de votre entreprise"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setIsDirty(true);
            }}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!isDirty || updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Platform
// ---------------------------------------------------------------------------

function PlatformTab() {
  const { data: prefs, isLoading } = api.auth.getPreferences.useQuery();
  const updatePrefs = api.auth.updatePreferences.useMutation({
    onSuccess: () => toast.success("Préférences mises à jour."),
    onError: () => toast.error("Erreur lors de la sauvegarde."),
  });

  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("Africa/Douala");
  const [currency, setCurrency] = useState("XOF");
  const [market, setMarket] = useState("CM");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (prefs) {
      setLanguage((prefs.language as string) ?? "fr");
      setTimezone((prefs.timezone as string) ?? "Africa/Douala");
      setCurrency((prefs.defaultCurrency as string) ?? "XOF");
      setMarket((prefs.defaultMarket as string) ?? "CM");
    }
  }, [prefs]);

  const handleSave = () => {
    updatePrefs.mutate({
      language: language as "fr" | "en",
      timezone,
      defaultCurrency: currency,
      defaultMarket: market,
    });
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="size-5 text-primary" />
          <CardTitle>Plateforme</CardTitle>
        </div>
        <CardDescription>
          Paramètres régionaux et valeurs par défaut.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Langue de l'interface</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v);
                setIsDirty(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fuseau horaire</Label>
            <Select
              value={timezone}
              onValueChange={(v) => {
                setTimezone(v);
                setIsDirty(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Devise par défaut</Label>
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrency(v);
                setIsDirty(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marché par défaut</Label>
            <Select
              value={market}
              onValueChange={(v) => {
                setMarket(v);
                setIsDirty(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKETS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!isDirty || updatePrefs.isPending}>
          {updatePrefs.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: AI
// ---------------------------------------------------------------------------

function AITab() {
  const { data: prefs, isLoading } = api.auth.getPreferences.useQuery();
  const updatePrefs = api.auth.updatePreferences.useMutation({
    onSuccess: () => toast.success("Paramètres IA mis à jour."),
    onError: () => toast.error("Erreur lors de la sauvegarde."),
  });

  const aiPrefs = (prefs?.ai as Record<string, unknown>) ?? {};
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [temperature, setTemperature] = useState(0.7);
  const [genLanguage, setGenLanguage] = useState("fr");
  const [includeMarketContext, setIncludeMarketContext] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (prefs?.ai) {
      const ai = prefs.ai as Record<string, unknown>;
      setModel((ai.model as string) ?? "claude-sonnet-4-20250514");
      setTemperature((ai.temperature as number) ?? 0.7);
      setGenLanguage((ai.generationLanguage as string) ?? "fr");
      setIncludeMarketContext((ai.includeMarketContext as boolean) ?? true);
    }
  }, [prefs]);

  const handleSave = () => {
    updatePrefs.mutate({
      ai: {
        model,
        temperature,
        generationLanguage: genLanguage as "fr" | "en" | "both",
        includeMarketContext,
      },
    });
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          <CardTitle>Intelligence Artificielle</CardTitle>
        </div>
        <CardDescription>
          Configurez le comportement de l'IA pour les générations de contenu et MESTOR.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Modèle par défaut</Label>
          <Select
            value={model}
            onValueChange={(v) => {
              setModel(v);
              setIsDirty(true);
            }}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Température créative</Label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => {
                setTemperature(parseFloat(e.target.value));
                setIsDirty(true);
              }}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-mono w-12 text-right">
              {temperature.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            0 = Précis et factuel · 1 = Créatif et audacieux
          </p>
        </div>

        <div className="space-y-2">
          <Label>Langue de génération</Label>
          <Select
            value={genLanguage}
            onValueChange={(v) => {
              setGenLanguage(v);
              setIsDirty(true);
            }}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français uniquement</SelectItem>
              <SelectItem value="en">English only</SelectItem>
              <SelectItem value="both">Bilingue (FR + EN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={includeMarketContext}
            onCheckedChange={(checked) => {
              setIncludeMarketContext(checked === true);
              setIsDirty(true);
            }}
          />
          <div>
            <div className="text-sm font-medium">
              Inclure le contexte marché dans les générations
            </div>
            <div className="text-xs text-muted-foreground">
              Les données TARSIS (signaux, concurrents) enrichiront les prompts IA
            </div>
          </div>
        </label>

        <Button onClick={handleSave} disabled={!isDirty || updatePrefs.isPending}>
          {updatePrefs.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Notifications
// ---------------------------------------------------------------------------

function NotificationsTab() {
  const { data: prefs, isLoading } = api.auth.getPreferences.useQuery();
  const updatePrefs = api.auth.updatePreferences.useMutation({
    onSuccess: () => toast.success("Notifications mises à jour."),
    onError: () => toast.error("Erreur lors de la sauvegarde."),
  });

  const notifPrefs = (prefs?.notifications as Record<string, unknown>) ?? {};
  const [emailCampaign, setEmailCampaign] = useState(true);
  const [cultIndexAlerts, setCultIndexAlerts] = useState(true);
  const [cultIndexThreshold, setCultIndexThreshold] = useState(30);
  const [missionReminders, setMissionReminders] = useState(true);
  const [tarsisSignals, setTarsisSignals] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (prefs?.notifications) {
      const n = prefs.notifications as Record<string, unknown>;
      setEmailCampaign((n.emailCampaignActivation as boolean) ?? true);
      setCultIndexAlerts((n.cultIndexAlerts as boolean) ?? true);
      setCultIndexThreshold((n.cultIndexThreshold as number) ?? 30);
      setMissionReminders((n.missionReminders as boolean) ?? true);
      setTarsisSignals((n.tarsisSignals as boolean) ?? true);
    }
  }, [prefs]);

  const handleSave = () => {
    updatePrefs.mutate({
      notifications: {
        emailCampaignActivation: emailCampaign,
        cultIndexAlerts,
        cultIndexThreshold,
        missionReminders,
        tarsisSignals,
      },
    });
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const NOTIFICATION_TOGGLES = [
    {
      key: "emailCampaign",
      checked: emailCampaign,
      setter: setEmailCampaign,
      title: "Activations de campagne",
      description: "Recevoir un email quand une campagne passe en statut LIVE",
    },
    {
      key: "cultIndex",
      checked: cultIndexAlerts,
      setter: setCultIndexAlerts,
      title: "Alertes Cult Index",
      description: "Notification quand le Cult Index passe sous le seuil défini",
    },
    {
      key: "missions",
      checked: missionReminders,
      setter: setMissionReminders,
      title: "Rappels de missions",
      description: "Notifications de deadline et livrables en attente",
    },
    {
      key: "tarsis",
      checked: tarsisSignals,
      setter: setTarsisSignals,
      title: "Signaux marché (TARSIS)",
      description: "Alertes sur les nouveaux signaux concurrentiels détectés",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <CardTitle>Notifications</CardTitle>
        </div>
        <CardDescription>
          Choisissez quelles alertes et rappels vous souhaitez recevoir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {NOTIFICATION_TOGGLES.map((toggle) => (
          <label
            key={toggle.key}
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={toggle.checked}
              onCheckedChange={(checked) => {
                toggle.setter(checked === true);
                setIsDirty(true);
              }}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium">{toggle.title}</div>
              <div className="text-xs text-muted-foreground">
                {toggle.description}
              </div>
            </div>
          </label>
        ))}

        {/* Cult Index threshold slider */}
        {cultIndexAlerts && (
          <div className="ml-9 space-y-2 border-l-2 border-primary/20 pl-4">
            <Label>Seuil d'alerte Cult Index</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={cultIndexThreshold}
                onChange={(e) => {
                  setCultIndexThreshold(parseInt(e.target.value));
                  setIsDirty(true);
                }}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-mono w-12 text-right">
                {cultIndexThreshold}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Alerte si le Cult Index descend sous {cultIndexThreshold}/100
            </p>
          </div>
        )}

        <Separator />

        <Button onClick={handleSave} disabled={!isDirty || updatePrefs.isPending}>
          {updatePrefs.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab 5: Security
// ---------------------------------------------------------------------------

function SecurityTab() {
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <CardTitle>Sécurité du compte</CardTitle>
          </div>
          <CardDescription>
            Informations de sécurité et gestion du compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Mail className="size-3" />
                Adresse email
              </div>
            </Label>
            <p className="text-sm font-medium">
              {profile?.email ?? "Non renseigné"}
            </p>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                Membre depuis
              </div>
            </Label>
            <p className="text-sm font-medium">
              {profile?.createdAt ? formatDate(profile.createdAt) : "---"}
            </p>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Rôle
            </Label>
            <p className="text-sm font-medium capitalize">
              {profile?.role ?? "utilisateur"}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Mot de passe
            </Label>
            <Button variant="outline" size="sm" disabled title="Bientôt disponible">
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
          </div>
          <CardDescription>
            Actions irréversibles sur votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            disabled
            title="Bientôt disponible"
          >
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page — 5 Tabs
// ---------------------------------------------------------------------------

export default function OperatorSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Paramètres"
        description="Gérez votre profil, les paramètres de la plateforme et les préférences IA"
        backHref="/serenite"
        backLabel="Retour au menu"
      />

      <Tabs defaultValue="profile">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Globe className="mr-1.5 h-4 w-4" />
            Plateforme
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="mr-1.5 h-4 w-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-4 w-4" />
            Notifs
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-1.5 h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="platform" className="mt-4">
          <PlatformTab />
        </TabsContent>
        <TabsContent value="ai" className="mt-4">
          <AITab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
