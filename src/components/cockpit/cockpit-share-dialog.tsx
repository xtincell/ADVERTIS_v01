"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

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

const MIN_PASSWORD_LENGTH = 4;

export function CockpitShareDialog({
  strategyId,
  onClose,
}: CockpitShareDialogProps) {
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key + lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Focus trap — focus the dialog on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const {
    data: shareStatus,
    isLoading: isShareLoading,
    isError: isShareError,
    refetch,
  } = api.cockpit.getShareStatus.useQuery({ strategyId });

  const createMutation = api.cockpit.createShare.useMutation({
    onSuccess: () => {
      toast.success("Lien de partage créé avec succès.");
      setPassword("");
      setPasswordTouched(false);
      void refetch();
    },
    onError: () => {
      toast.error("Impossible de créer le lien de partage.");
    },
  });

  const disableMutation = api.cockpit.disableShare.useMutation({
    onSuccess: () => {
      toast.success("Partage désactivé.");
      void refetch();
    },
    onError: () => {
      toast.error("Impossible de désactiver le partage.");
    },
  });

  const enableMutation = api.cockpit.enableShare.useMutation({
    onSuccess: () => {
      toast.success("Partage réactivé.");
      void refetch();
    },
    onError: () => {
      toast.error("Impossible de réactiver le partage.");
    },
  });

  const shareUrl = shareStatus?.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cockpit/${shareStatus.slug}`
    : null;

  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const showPasswordError = passwordTouched && !isPasswordValid && password.length > 0;

  const handleCreate = () => {
    if (!isPasswordValid) return;
    createMutation.mutate({ strategyId, password });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papiers.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — fallback with prompt
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success("Lien copié dans le presse-papiers.");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Impossible de copier le lien. Copiez-le manuellement.");
      }
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isPasswordValid) {
      handleCreate();
    }
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
          {/* Loading state */}
          {isShareLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
              <span className="ml-2 text-sm text-muted-foreground">
                Chargement du statut de partage…
              </span>
            </div>
          )}

          {/* Error state */}
          {isShareError && (
            <div className="flex flex-col items-center gap-3 py-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-muted-foreground">
                Impossible de charger le statut de partage.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Content loaded — share exists */}
          {!isShareLoading && !isShareError && shareStatus ? (
            <div className="space-y-4">
              {/* Share URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="share-url">
                  Lien de partage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="share-url"
                    type="text"
                    readOnly
                    value={shareUrl ?? ""}
                    className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    aria-label="Copier le lien de partage"
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
                <label className="text-sm font-medium" htmlFor="update-password">
                  Changer le mot de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="update-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!passwordTouched) setPasswordTouched(true);
                    }}
                    onKeyDown={handlePasswordKeyDown}
                    placeholder="Nouveau mot de passe"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    minLength={MIN_PASSWORD_LENGTH}
                    aria-describedby={showPasswordError ? "password-error" : undefined}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={!isPasswordValid || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Mettre à jour"
                    )}
                  </Button>
                </div>
                {showPasswordError && (
                  <p id="password-error" className="text-xs text-red-500">
                    Le mot de passe doit contenir au moins {MIN_PASSWORD_LENGTH} caractères.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Content loaded — no share yet */}
          {!isShareLoading && !isShareError && !shareStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="create-password">
                  Mot de passe d&apos;accès
                </label>
                <input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched) setPasswordTouched(true);
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Choisissez un mot de passe (min. 4 caractères)"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  minLength={MIN_PASSWORD_LENGTH}
                  aria-describedby={showPasswordError ? "create-password-error" : undefined}
                />
                {showPasswordError ? (
                  <p id="create-password-error" className="text-xs text-red-500">
                    Le mot de passe doit contenir au moins {MIN_PASSWORD_LENGTH} caractères.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Le client devra saisir ce mot de passe pour accéder au
                    cockpit.
                  </p>
                )}
              </div>

              <Button
                onClick={handleCreate}
                disabled={!isPasswordValid || createMutation.isPending}
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
