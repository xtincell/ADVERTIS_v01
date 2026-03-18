// ==========================================================================
// PAGE P.8H — Integrations (Operator)
// Manage third-party service connections: connect, disconnect, sync.
// ==========================================================================

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plug,
  PlugZap,
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowDownUp,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | string | null): string {
  if (!date) return "Jamais";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const {
    data: providers,
    isLoading: providersLoading,
  } = api.integration.listProviders.useQuery();

  const {
    data: connected,
    isLoading: connectedLoading,
    refetch: refetchConnected,
  } = api.integration.listConnected.useQuery();

  const connectMutation = api.integration.connect.useMutation({
    onSuccess: () => {
      toast.success("Intégration connectée avec succès");
      void refetchConnected();
      setConnectDialog(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const disconnectMutation = api.integration.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Intégration déconnectée");
      void refetchConnected();
    },
    onError: (err) => toast.error(err.message),
  });

  const syncMutation = api.integration.sync.useMutation({
    onSuccess: () => {
      toast.success("Synchronisation lancée");
      void refetchConnected();
    },
    onError: (err) => toast.error(err.message),
  });

  // Connect dialog state
  const [connectDialog, setConnectDialog] = useState<{
    providerId: string;
    providerName: string;
    requiredFields: string[];
  } | null>(null);
  const [connectName, setConnectName] = useState("");
  const [connectCreds, setConnectCreds] = useState<Record<string, string>>({});

  const isLoading = providersLoading || connectedLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <PageHeader
          title="Intégrations"
          backHref="/serenite"
          backLabel="Retour"
        />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const connectedIds = new Set(connected?.map((c) => c.providerId) ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <PageHeader
        title="Intégrations"
        description="Connectez vos services externes pour synchroniser données et métriques"
        backHref="/serenite"
        backLabel="Retour"
      />

      {/* Connected integrations */}
      {connected && connected.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Connectées ({connected.length})
          </h2>
          {connected.map((integ) => (
            <Card key={integ.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <PlugZap className="h-5 w-5 text-emerald-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{integ.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        color: integ.status === "active" ? "#10b981" : "#ef4444",
                        borderColor: integ.status === "active" ? "#10b981" : "#ef4444",
                      }}
                    >
                      {integ.status === "active" ? "Actif" : "Erreur"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Dernière sync: {formatDate(integ.lastSyncAt)}
                    </span>
                    {integ.lastSyncStatus && (
                      <span className="flex items-center gap-1">
                        {integ.lastSyncStatus === "success" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        {integ.lastSyncStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={syncMutation.isPending}
                    onClick={() =>
                      syncMutation.mutate({
                        integrationId: integ.id,
                        direction: "pull",
                      })
                    }
                    title="Synchroniser"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={disconnectMutation.isPending}
                    onClick={() => disconnectMutation.mutate({ id: integ.id })}
                    title="Déconnecter"
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available providers */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Disponibles
        </h2>

        {providers && providers.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {providers.map((provider: { id: string; name: string; description?: string; category?: string; requiredFields?: string[] }) => {
              const isConnected = connectedIds.has(provider.id);
              return (
                <Card
                  key={provider.id}
                  className={isConnected ? "opacity-60" : ""}
                >
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Plug className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">
                        {provider.name}
                      </span>
                      <span className="text-xs text-muted-foreground block truncate">
                        {provider.description ?? provider.category ?? "Service externe"}
                      </span>
                    </div>

                    <Button
                      variant={isConnected ? "outline" : "default"}
                      size="sm"
                      disabled={isConnected}
                      onClick={() => {
                        setConnectName(provider.name);
                        setConnectCreds({});
                        setConnectDialog({
                          providerId: provider.id,
                          providerName: provider.name,
                          requiredFields: provider.requiredFields ?? ["apiKey"],
                        });
                      }}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Connecté
                        </>
                      ) : (
                        <>
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Connecter
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center gap-3 py-12">
            <ArrowDownUp className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun fournisseur d'intégration disponible
            </p>
            <p className="text-xs text-muted-foreground">
              Les connecteurs seront ajoutés progressivement
            </p>
          </Card>
        )}
      </div>

      {/* Connect dialog */}
      <Dialog
        open={!!connectDialog}
        onOpenChange={(open) => !open && setConnectDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connecter {connectDialog?.providerName}
            </DialogTitle>
            <DialogDescription>
              Entrez vos identifiants pour connecter ce service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la connexion</Label>
              <Input
                value={connectName}
                onChange={(e) => setConnectName(e.target.value)}
                placeholder="Mon compte Analytics"
              />
            </div>

            <Separator />

            {connectDialog?.requiredFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                <Input
                  type={field.toLowerCase().includes("secret") || field.toLowerCase().includes("key") ? "password" : "text"}
                  value={connectCreds[field] ?? ""}
                  onChange={(e) =>
                    setConnectCreds({ ...connectCreds, [field]: e.target.value })
                  }
                  placeholder={`Votre ${field}`}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectDialog(null)}
            >
              Annuler
            </Button>
            <Button
              disabled={
                !connectName.trim() ||
                connectMutation.isPending ||
                !connectDialog?.requiredFields.every((f) => connectCreds[f]?.trim())
              }
              onClick={() => {
                if (!connectDialog) return;
                connectMutation.mutate({
                  providerId: connectDialog.providerId,
                  name: connectName.trim(),
                  credentials: connectCreds,
                });
              }}
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Connecter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
