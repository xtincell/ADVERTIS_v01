"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

// ---------------------------------------------------------------------------
// Presentation Page — Inline viewer for the HTML "Fiche S"
// ---------------------------------------------------------------------------

export default function PresentationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoadingHtml, setIsLoadingHtml] = useState(true);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch strategy metadata (for brand name in header)
  const {
    data: strategy,
    isLoading: isLoadingStrategy,
    isError: isStrategyError,
  } = api.strategy.getById.useQuery(
    { id: strategyId },
    { enabled: !!strategyId },
  );

  // Fetch HTML presentation from the preview API
  const fetchHtml = useCallback(async () => {
    setIsLoadingHtml(true);
    setHtmlError(null);

    try {
      const response = await fetch("/api/export/html/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errorData?.error ?? `Erreur ${response.status}`,
        );
      }

      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error("[Presentation] Error fetching HTML:", error);
      setHtmlError(
        error instanceof Error
          ? error.message
          : "Impossible de charger la présentation",
      );
    } finally {
      setIsLoadingHtml(false);
    }
  }, [strategyId]);

  useEffect(() => {
    void fetchHtml();
  }, [fetchHtml]);

  // Toggle fullscreen on the iframe container
  function handleFullscreen() {
    const container = iframeRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      void container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  // Listen for fullscreen change (e.g. pressing Escape)
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Download HTML file
  async function handleDownload() {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/export/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeBrand = (strategy?.brandName ?? "Strategie")
        .replace(/[^a-zA-Z0-9\u00C0-\u024F\- _]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);

      a.download = `ADVERTIS-${safeBrand}-Fiche-S.html`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch {
      // silently fail — user will see nothing happened
    } finally {
      setIsDownloading(false);
    }
  }

  const brandName = strategy?.brandName ?? "Chargement…";
  const isLoading = isLoadingStrategy || isLoadingHtml;

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading && !htmlContent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">
          Génération de la Fiche S…
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (isStrategyError || htmlError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-red-700">
            {htmlError ?? "Impossible de charger la stratégie"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez que la stratégie existe et que des piliers sont générés.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/strategy/${strategyId}`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Retour
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchHtml()}
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Presentation viewer
  // ---------------------------------------------------------------------------
  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/strategy/${strategyId}`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Retour
            </Link>
          </Button>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-foreground/90">
              Fiche S — {brandName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-3.5" />
            )}
            Télécharger
          </Button>
        </div>
      </div>

      {/* Iframe container */}
      <div className="relative flex-1 bg-neutral-900">
        {htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            title={`Fiche S — ${brandName}`}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
