"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import type {
  MarketStudySynthesis,
  ManualDataStore,
  SourceStatusMap,
  ManualDataCategory,
} from "~/lib/types/market-study";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MarketStudyDashboard } from "~/components/strategy/market-study/market-study-dashboard";

// ---------------------------------------------------------------------------
// Standalone Market Study Page
// ---------------------------------------------------------------------------

export default function MarketStudyPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [isCollecting, setIsCollecting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Fetch strategy (for name display)
  const {
    data: strategy,
    isLoading: isStrategyLoading,
    isError: isStrategyError,
  } = api.strategy.getById.useQuery(
    { id: strategyId },
    { enabled: !!strategyId },
  );

  // Fetch market study data
  const {
    data: marketStudy,
    refetch: refetchMarketStudy,
  } = api.marketStudy.getByStrategy.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  // Fetch available data sources
  const { data: availableSources } = api.marketStudy.getDataSources.useQuery();

  // Mutations
  const createMutation = api.marketStudy.create.useMutation();
  const addManualDataMutation = api.marketStudy.addManualData.useMutation();
  const removeManualDataMutation = api.marketStudy.removeManualData.useMutation();
  const synthesizeMutation = api.marketStudy.synthesize.useMutation();
  const completeStandaloneMutation = api.marketStudy.completeStandalone.useMutation();

  // Ensure market study exists
  const ensureMarketStudy = useCallback(async () => {
    if (!marketStudy) {
      await createMutation.mutateAsync({ strategyId });
      await refetchMarketStudy();
    }
  }, [marketStudy, strategyId, createMutation, refetchMarketStudy]);

  // Handlers
  const handleLaunchCollection = useCallback(async () => {
    setIsCollecting(true);
    try {
      await ensureMarketStudy();
      const response = await fetch("/api/market-study/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || result.success === false) {
        throw new Error(result.error ?? "Échec de la collecte");
      }
      await refetchMarketStudy();
      toast.success("Collecte terminée !");
    } catch (error) {
      toast.error("Erreur lors de la collecte des données marché.");
      console.error("[MarketStudy Standalone] Collection failed:", error);
    } finally {
      setIsCollecting(false);
    }
  }, [strategyId, ensureMarketStudy, refetchMarketStudy]);

  const handleAddManualData = useCallback(
    async (data: {
      title: string;
      content: string;
      category: ManualDataCategory;
      sourceType: string;
    }) => {
      try {
        await addManualDataMutation.mutateAsync({ strategyId, ...data });
        await refetchMarketStudy();
        toast.success("Données ajoutées avec succès.");
      } catch (error) {
        toast.error("Erreur lors de l'ajout des données.");
        console.error("[MarketStudy Standalone] Add manual data failed:", error);
      }
    },
    [strategyId, addManualDataMutation, refetchMarketStudy],
  );

  const handleRemoveManualData = useCallback(
    async (entryId: string) => {
      try {
        await removeManualDataMutation.mutateAsync({ strategyId, entryId });
        await refetchMarketStudy();
        toast.success("Entrée supprimée.");
      } catch (error) {
        toast.error("Erreur lors de la suppression.");
        console.error("[MarketStudy Standalone] Remove manual data failed:", error);
      }
    },
    [strategyId, removeManualDataMutation, refetchMarketStudy],
  );

  const handleUploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("strategyId", strategyId);
      formData.append("file", file);

      try {
        const response = await fetch("/api/market-study/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }
        await refetchMarketStudy();
        toast.success("Fichier importé avec succès.");
      } catch (error) {
        toast.error("Erreur lors de l'import du fichier.");
        console.error("[MarketStudy Standalone] Upload failed:", error);
      }
    },
    [strategyId, refetchMarketStudy],
  );

  const handleSynthesize = useCallback(async () => {
    setIsSynthesizing(true);
    try {
      await synthesizeMutation.mutateAsync({ strategyId });
      await refetchMarketStudy();
      toast.success("Synthèse générée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la synthèse.");
      console.error("[MarketStudy Standalone] Synthesis failed:", error);
    } finally {
      setIsSynthesizing(false);
    }
  }, [strategyId, synthesizeMutation, refetchMarketStudy]);

  const handleCompleteStandalone = useCallback(async () => {
    try {
      await completeStandaloneMutation.mutateAsync({ strategyId });
      await refetchMarketStudy();
      toast.success("Étude de marché terminée !");
    } catch (error) {
      toast.error("Erreur lors de la finalisation.");
      console.error("[MarketStudy Standalone] Complete failed:", error);
    }
  }, [strategyId, completeStandaloneMutation, refetchMarketStudy]);

  // Skip handler (no-op in standalone mode — just go back)
  const handleSkip = useCallback(async () => {
    router.push(`/strategy/${strategyId}`);
  }, [router, strategyId]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isStrategyError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="font-medium text-red-700">Impossible de charger la stratégie</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  if (isStrategyLoading || !strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  const studyStatus = marketStudy?.status ?? "pending";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/strategy/${strategyId}`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Globe className="h-6 w-6 text-terracotta" />
            Étude de Marché
          </h1>
          <p className="text-sm text-muted-foreground">
            {strategy.brandName} — {strategy.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {studyStatus === "complete" ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Terminée
            </Badge>
          ) : (
            <Badge variant="outline">
              {studyStatus === "pending"
                ? "En attente"
                : studyStatus === "collecting"
                  ? "Collecte en cours"
                  : studyStatus === "partial"
                    ? "Données partielles"
                    : studyStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Market Study Dashboard (reused) */}
      <MarketStudyDashboard
        strategyId={strategyId}
        marketStudyStatus={studyStatus}
        sourceStatuses={
          (marketStudy?.sourceStatuses as SourceStatusMap) ?? {}
        }
        manualData={
          (marketStudy?.manualData as ManualDataStore | null) ?? null
        }
        synthesis={
          (marketStudy?.synthesis as MarketStudySynthesis | null) ?? null
        }
        availableSources={
          availableSources?.map((s) => ({
            sourceId: s.sourceId,
            name: s.name,
            configured: s.configured,
          })) ?? []
        }
        onLaunchCollection={handleLaunchCollection}
        onAddManualData={handleAddManualData}
        onRemoveManualData={handleRemoveManualData}
        onUploadFile={handleUploadFile}
        onSynthesize={handleSynthesize}
        onSkip={handleSkip}
        onComplete={handleCompleteStandalone}
        isCollecting={isCollecting}
        isSynthesizing={isSynthesizing}
      />

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/strategy/${strategyId}`)}
        >
          Retour à la fiche
        </Button>

        {studyStatus !== "complete" && (
          <Button
            onClick={handleCompleteStandalone}
            disabled={completeStandaloneMutation.isPending}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            {completeStandaloneMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Terminer l&apos;étude
          </Button>
        )}
      </div>
    </div>
  );
}
