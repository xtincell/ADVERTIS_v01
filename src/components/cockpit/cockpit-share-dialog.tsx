"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Shield,
  X,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface CockpitShareDialogProps {
  strategyId: string;
  onClose: () => void;
}

export function CockpitShareDialog({
  strategyId,
  onClose,
}: CockpitShareDialogProps) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus trap — focus the dialog on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const {
    data: shareStatus,
    refetch,
  } = api.cockpit.getShareStatus.useQuery({ strategyId });

  const createMutation = api.cockpit.createShare.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const disableMutation = api.cockpit.disableShare.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const enableMutation = api.cockpit.enableShare.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const shareUrl = shareStatus?.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cockpit/${shareStatus.slug}`
    : null;

  const handleCreate = () => {
    if (password.length < 4) return;
    createMutation.mutate({ strategyId, password });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Partager le Cockpit"
    >
      <Card ref={dialogRef} className="w-full max-w-md" tabIndex={-1}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-terracotta" />
              <CardTitle>Partager le Cockpit</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Créez un lien public protégé par mot de passe pour partager le
            cockpit avec votre client.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {shareStatus ? (
            // Share exists
            <div className="space-y-4">
              {/* Share URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien de partage</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl ?? ""}
                    className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {shareStatus.isActive ? (
                      <span className="text-green-600">Actif</span>
                    ) : (
                      <span className="text-red-500">Désactivé</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {shareStatus.viewCount} vue
                  {shareStatus.viewCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Toggle active state */}
              <div className="flex gap-2">
                {shareStatus.isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disableMutation.mutate({ strategyId })}
                    disabled={disableMutation.isPending}
                  >
                    {disableMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Désactiver
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enableMutation.mutate({ strategyId })}
                    disabled={enableMutation.isPending}
                  >
                    {enableMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Réactiver
                  </Button>
                )}

                {shareStatus.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(shareUrl ?? "", "_blank")
                    }
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Ouvrir
                  </Button>
                )}
              </div>

              {/* Update password */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">
                  Changer le mot de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    minLength={4}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={
                      password.length < 4 || createMutation.isPending
                    }
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Mettre à jour"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // No share yet — create one
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mot de passe d&apos;accès
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choisissez un mot de passe (min. 4 caractères)"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  minLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Le client devra saisir ce mot de passe pour accéder au
                  cockpit.
                </p>
              </div>

              <Button
                onClick={handleCreate}
                disabled={password.length < 4 || createMutation.isPending}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                Créer le lien de partage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
