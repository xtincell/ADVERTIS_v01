"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  RotateCcw,
  Sparkles,
  CircleDashed,
  Eye,
  StopCircle,
  FileText,
  ArrowRight,
  AlertTriangle,
  Database,
  Shield,
  BarChart3,
  Presentation,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  PILLAR_CONFIG,
  PHASE_CONFIG,
  FICHE_PILLARS,
  REPORT_TYPES,
  TEMPLATE_TYPES,
  PHASES,
  LEGACY_PHASE_MAP,
} from "~/lib/constants";
import type { PillarType, Phase } from "~/lib/constants";
import type {
  RiskAuditResult,
  TrackAuditResult,
} from "~/server/services/audit-generation";
import type {
  MarketStudySynthesis,
  ManualDataStore,
  SourceStatusMap,
  ManualDataCategory,
} from "~/lib/types/market-study";

import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { PhaseTimeline } from "~/components/strategy/phase-timeline";
import { ReportCard } from "~/components/strategy/report-card";
import { TemplateCard } from "~/components/strategy/template-card";
import { AuditReviewForm } from "~/components/strategy/audit-review/audit-review-form";
import { AuditSuggestionsPanel } from "~/components/strategy/audit-review/audit-suggestions-panel";
import { FicheReviewForm } from "~/components/strategy/fiche-review/fiche-review-form";
import { MarketStudyDashboard } from "~/components/strategy/market-study/market-study-dashboard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PillarStatus = "pending" | "generating" | "complete" | "error";

interface PillarState {
  id: string;
  type: string;
  title: string;
  status: PillarStatus;
  content: unknown;
  errorMessage: string | null;
}

interface DocumentStatus {
  id: string;
  type: string;
  title: string;
  status: string;
  pageCount: number | null;
  errorMessage: string | null;
  generatedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Main Generation Page — 8-Phase Pipeline
// ---------------------------------------------------------------------------

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  // State
  const [pillars, setPillars] = useState<PillarState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isValidatingAudit, setIsValidatingAudit] = useState(false);
  const [isValidatingFiche, setIsValidatingFiche] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [previewContent, setPreviewContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const cancelledRef = useRef(false);

  // Fetch strategy
  const {
    data: strategy,
    refetch: refetchStrategy,
    isError: isStrategyError,
    isLoading: isStrategyLoading,
  } = api.strategy.getById.useQuery(
    { id: strategyId },
    { enabled: !!strategyId, refetchInterval: isGenerating ? 3000 : false },
  );

  // Fetch document status
  const {
    data: documents,
    refetch: refetchDocuments,
  } = api.document.getStatus.useQuery(
    { strategyId },
    { enabled: !!strategyId, refetchInterval: isGenerating ? 3000 : false },
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

  // tRPC mutations
  const validateAuditMutation = api.strategy.validateAuditReview.useMutation();
  const validateFicheMutation = api.strategy.validateFicheReview.useMutation();
  const advancePhaseMutation = api.strategy.advancePhase.useMutation();
  const revertPhaseMutation = api.strategy.revertPhase.useMutation();
  const addManualDataMutation = api.marketStudy.addManualData.useMutation();
  const removeManualDataMutation = api.marketStudy.removeManualData.useMutation();
  const skipMarketStudyMutation = api.marketStudy.skip.useMutation();
  const completeMarketStudyMutation = api.marketStudy.complete.useMutation();
  const synthesizeMarketStudyMutation = api.marketStudy.synthesize.useMutation();

  // Initialize pillar state
  useEffect(() => {
    if (strategy?.pillars) {
      setPillars(
        strategy.pillars.map((p) => ({
          id: p.id,
          type: p.type,
          title: p.title,
          status: p.status as PillarStatus,
          content: p.content,
          errorMessage: p.errorMessage,
        })),
      );
    }
  }, [strategy]);

  // Resolve legacy phase names
  const rawPhase = strategy?.phase ?? "fiche";
  const currentPhase = (LEGACY_PHASE_MAP[rawPhase] ?? rawPhase) as Phase;

  // ---------------------------------------------------------------------------
  // Generation logic
  // ---------------------------------------------------------------------------

  const generateSinglePillar = useCallback(
    async (pillarType: string) => {
      setPillars((prev) =>
        prev.map((p) =>
          p.type === pillarType
            ? { ...p, status: "generating" as PillarStatus, errorMessage: null }
            : p,
        ),
      );

      try {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId, pillarType }),
        });

        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const data = (await response.json()) as {
          success: boolean;
          pillar?: { type: string; status: string; content: unknown };
          error?: string;
        };

        if (data.success && data.pillar) {
          setPillars((prev) =>
            prev.map((p) =>
              p.type === pillarType
                ? {
                    ...p,
                    status: "complete" as PillarStatus,
                    content: data.pillar!.content,
                    errorMessage: null,
                  }
                : p,
            ),
          );
          const pillarConfig = PILLAR_CONFIG[pillarType as PillarType];
          toast.success(`Pilier ${pillarConfig?.title ?? pillarType} généré avec succès.`);
          return true;
        } else {
          setPillars((prev) =>
            prev.map((p) =>
              p.type === pillarType
                ? {
                    ...p,
                    status: "error" as PillarStatus,
                    errorMessage: data.error ?? "Erreur inconnue",
                  }
                : p,
            ),
          );
          return false;
        }
      } catch (error) {
        setPillars((prev) =>
          prev.map((p) =>
            p.type === pillarType
              ? {
                  ...p,
                  status: "error" as PillarStatus,
                  errorMessage:
                    error instanceof Error ? error.message : "Erreur réseau",
                }
              : p,
          ),
        );
        return false;
      }
    },
    [strategyId],
  );

  // --- Validate Fiche Review → advance to audit-r → auto-launch audit ---
  const handleValidateFiche = useCallback(
    async (editedData: Record<string, string>) => {
      setIsValidatingFiche(true);
      try {
        await validateFicheMutation.mutateAsync({
          id: strategyId,
          interviewData: editedData,
        });
        await refetchStrategy();
        toast.success("Fiche validée — Lancement de l'audit Risk…");

        // Auto-chain: launch audit R immediately after fiche validation
        setIsGenerating(true);
        setCurrentAction("audit-r");
        cancelledRef.current = false;
        await generateSinglePillar("R");
        setIsGenerating(false);
        setCurrentAction(null);
        await refetchStrategy();
      } catch (error) {
        toast.error("Erreur lors de la validation de la fiche.");
        console.error("[Fiche Review] Validation failed:", error);
        setIsGenerating(false);
        setCurrentAction(null);
      } finally {
        setIsValidatingFiche(false);
      }
    },
    [strategyId, validateFicheMutation, refetchStrategy, generateSinglePillar],
  );

  // --- Launch Fiche generation (A-D-V-E sequentially) ---
  const handleLaunchFiche = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("fiche");
    cancelledRef.current = false;

    for (const pillarType of ["A", "D", "V", "E"] as const) {
      if (cancelledRef.current) break;

      // Skip if already complete
      const existing = pillars.find((p) => p.type === pillarType);
      if (existing?.status === "complete") continue;

      setCurrentAction(pillarType);
      const success = await generateSinglePillar(pillarType);
      if (!success) break; // Stop on error
    }

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [pillars, generateSinglePillar, refetchStrategy]);

  // --- Advance fiche → fiche-review ---
  const handleAdvanceToFicheReview = useCallback(async () => {
    try {
      await advancePhaseMutation.mutateAsync({
        id: strategyId,
        targetPhase: "fiche-review",
      });
      await refetchStrategy();
      toast.success("Fiche validée — Passez à l\u2019audit Risk.");
    } catch (error) {
      toast.error("Erreur lors de l\u2019avancement de phase. Veuillez réessayer.");
      console.error("[Pipeline] Advance to fiche-review failed:", error);
    }
  }, [strategyId, advancePhaseMutation, refetchStrategy]);

  // --- Launch Audit R only ---
  const handleLaunchAuditR = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("audit-r");
    cancelledRef.current = false;

    await generateSinglePillar("R");

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // --- Launch Audit T only ---
  const handleLaunchAuditT = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("audit-t");
    cancelledRef.current = false;

    await generateSinglePillar("T");

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // --- Market Study handlers ---
  const handleLaunchCollection = useCallback(async () => {
    setIsCollecting(true);
    try {
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
      console.error("[MarketStudy] Collection failed:", error);
    } finally {
      setIsCollecting(false);
    }
  }, [strategyId, refetchMarketStudy]);

  const handleAddManualData = useCallback(
    async (data: {
      title: string;
      content: string;
      category: ManualDataCategory;
      sourceType: string;
    }) => {
      try {
        await addManualDataMutation.mutateAsync({
          strategyId,
          ...data,
        });
        await refetchMarketStudy();
        toast.success("Données ajoutées avec succès.");
      } catch (error) {
        toast.error("Erreur lors de l'ajout des données.");
        console.error("[MarketStudy] Add manual data failed:", error);
      }
    },
    [strategyId, addManualDataMutation, refetchMarketStudy],
  );

  const handleRemoveManualData = useCallback(
    async (entryId: string) => {
      try {
        await removeManualDataMutation.mutateAsync({
          strategyId,
          entryId,
        });
        await refetchMarketStudy();
        toast.success("Entrée supprimée.");
      } catch (error) {
        toast.error("Erreur lors de la suppression.");
        console.error("[MarketStudy] Remove manual data failed:", error);
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
        toast.error("Erreur lors de l\u2019import du fichier. Veuillez réessayer.");
        console.error("[MarketStudy] Upload failed:", error);
      }
    },
    [strategyId, refetchMarketStudy],
  );

  const handleSynthesize = useCallback(async () => {
    setIsSynthesizing(true);
    try {
      await synthesizeMarketStudyMutation.mutateAsync({ strategyId });
      await refetchMarketStudy();
      toast.success("Synthèse générée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la synthèse.");
      console.error("[MarketStudy] Synthesis failed:", error);
    } finally {
      setIsSynthesizing(false);
    }
  }, [strategyId, synthesizeMarketStudyMutation, refetchMarketStudy]);

  const handleSkipMarketStudy = useCallback(async () => {
    try {
      await skipMarketStudyMutation.mutateAsync({ strategyId });
      await refetchStrategy();
      toast.success("Étude de marché passée.");
    } catch (error) {
      toast.error("Erreur lors du passage de l'étude.");
      console.error("[MarketStudy] Skip failed:", error);
    }
  }, [strategyId, skipMarketStudyMutation, refetchStrategy]);

  const handleCompleteMarketStudy = useCallback(async () => {
    try {
      await completeMarketStudyMutation.mutateAsync({ strategyId });
      await refetchStrategy();
      toast.success("Étude de marché validée !");
    } catch (error) {
      toast.error("Erreur lors de la validation.");
      console.error("[MarketStudy] Complete failed:", error);
    }
  }, [strategyId, completeMarketStudyMutation, refetchStrategy]);

  // --- Validate Audit Review ---
  const handleValidateAudit = useCallback(
    async (riskData: RiskAuditResult, trackData: TrackAuditResult) => {
      setIsValidatingAudit(true);
      try {
        await validateAuditMutation.mutateAsync({
          id: strategyId,
          riskAuditData: JSON.parse(JSON.stringify(riskData)),
          trackAuditData: JSON.parse(JSON.stringify(trackData)),
        });
        await refetchStrategy();
        toast.success("Audit validé avec succès !");
      } catch (error) {
        toast.error("Erreur lors de la validation de l'audit.");
        console.error("[Audit Review] Validation failed:", error);
      } finally {
        setIsValidatingAudit(false);
      }
    },
    [strategyId, validateAuditMutation, refetchStrategy],
  );

  // --- Launch Implementation Data (Pillar I) ---
  const handleLaunchImplementation = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("implementation");
    cancelledRef.current = false;

    await generateSinglePillar("I");

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // --- Launch a single report (on demand) ---
  const handleLaunchSingleReport = useCallback(
    async (reportType?: string) => {
      setIsGenerating(true);
      setCurrentAction("reports");
      cancelledRef.current = false;

      try {
        const response = await fetch("/api/ai/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId, reportType }),
        });

        const data = (await response.json()) as {
          success: boolean;
          error?: string;
        };

        if (!data.success) {
          toast.error(data.error ?? "Erreur lors de la génération du rapport.");
          console.error("[Reports] Generation failed:", data.error);
        }
      } catch (error) {
        toast.error("Erreur réseau lors de la génération.");
        console.error("[Reports] Error:", error);
      }

      setIsGenerating(false);
      setCurrentAction(null);
      await refetchStrategy();
      await refetchDocuments();
    },
    [strategyId, refetchStrategy, refetchDocuments],
  );

  // --- Launch a single template (on demand) ---
  const handleLaunchSingleTemplate = useCallback(
    async (templateType?: string) => {
      setIsGenerating(true);
      setCurrentAction("templates");
      cancelledRef.current = false;

      try {
        const response = await fetch("/api/ai/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId, templateType }),
        });

        const data = (await response.json()) as {
          success: boolean;
          error?: string;
        };

        if (!data.success) {
          toast.error(data.error ?? "Erreur lors de la génération du template.");
          console.error("[Templates] Generation failed:", data.error);
        } else {
          toast.success("Template généré avec succès !");
        }
      } catch (error) {
        toast.error("Erreur réseau lors de la génération.");
        console.error("[Templates] Error:", error);
      }

      setIsGenerating(false);
      setCurrentAction(null);
      await refetchStrategy();
      await refetchDocuments();
    },
    [strategyId, refetchStrategy, refetchDocuments],
  );

  // --- Retry a single pillar ---
  const handleRetry = useCallback(
    async (pillarType: string) => {
      if (isGenerating) return;
      setIsGenerating(true);
      setCurrentAction(pillarType);
      await generateSinglePillar(pillarType);
      setIsGenerating(false);
      setCurrentAction(null);
      await refetchStrategy();
    },
    [isGenerating, generateSinglePillar, refetchStrategy],
  );

  // Cancel
  const handleCancel = () => {
    cancelledRef.current = true;
  };

  // --- Revert to a previous phase ---
  type RevertablePhase = Exclude<Phase, "complete">;
  const handleRevertPhase = useCallback(
    async (targetPhase: RevertablePhase) => {
      try {
        await revertPhaseMutation.mutateAsync({
          id: strategyId,
          targetPhase,
        });
        await refetchStrategy();
        toast.success(`Retour à la phase "${PHASE_CONFIG[targetPhase].title}"`);
      } catch (error) {
        toast.error("Erreur lors du retour en arrière.");
        console.error("[Pipeline] Revert phase failed:", error);
      }
    },
    [strategyId, revertPhaseMutation, refetchStrategy],
  );

  // ---------------------------------------------------------------------------
  // Phase helpers
  // ---------------------------------------------------------------------------

  const fichePillars = pillars.filter((p) =>
    FICHE_PILLARS.includes(p.type as PillarType),
  );
  const pillarR = pillars.find((p) => p.type === "R");
  const pillarT = pillars.find((p) => p.type === "T");
  const pillarI = pillars.find((p) => p.type === "I");

  const ficheComplete = fichePillars.length > 0 && fichePillars.every((p) => p.status === "complete");
  const rComplete = pillarR?.status === "complete";
  const rInProgress = pillarR?.status === "generating";
  const tComplete = pillarT?.status === "complete";
  const tInProgress = pillarT?.status === "generating";
  const implComplete = pillarI?.status === "complete";
  const implInProgress = pillarI?.status === "generating";

  const reportDocs = (documents ?? []) as DocumentStatus[];
  const reportsInProgress = reportDocs.some(
    (d) => d.status === "generating",
  );

  // Audit R+T data for the review form
  const riskData = pillarR?.content as RiskAuditResult | null;
  const trackData = pillarT?.content as TrackAuditResult | null;

  const interviewData =
    (strategy?.interviewData as Record<string, string>) ?? {};

  // Reports are available after audit-review phase
  const auditComplete = rComplete && tComplete;
  const reportsAvailable =
    auditComplete &&
    (currentPhase === "audit-review" ||
      currentPhase === "implementation" ||
      currentPhase === "cockpit" ||
      currentPhase === "complete");

  // Templates require Pillar I complete
  const templatesAvailable =
    implComplete &&
    (currentPhase === "cockpit" || currentPhase === "complete");

  const templateDocs = (documents ?? []).filter((d) =>
    (TEMPLATE_TYPES as readonly string[]).includes(d.type),
  ) as DocumentStatus[];
  const templatesInProgress = templateDocs.some(
    (d) => d.status === "generating",
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isStrategyError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-red-700">Impossible de charger la fiche de marque</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez votre connexion ou réessayez.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetchStrategy()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (isStrategyLoading || !strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">Chargement de la fiche de marque…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pipeline de génération
        </h1>
        <p className="text-muted-foreground">
          {strategy.brandName} — {strategy.name}
        </p>
      </div>

      {/* Phase Timeline */}
      <PhaseTimeline currentPhase={currentPhase} />

      {/* ─── Phase 1: Fiche de Marque (A-D-V-E) ─── */}
      <PhaseSection
        phase="fiche"
        currentPhase={currentPhase}
        title="Phase 1 : Fiche de Marque"
        description="Données collectées via le formulaire ou l'import de fichier"
        onRevert={() => handleRevertPhase("fiche")}
        isReverting={revertPhaseMutation.isPending}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {fichePillars.map((pillar) => {
            const config = PILLAR_CONFIG[pillar.type as PillarType];
            return (
              <PillarStatusCard
                key={pillar.id}
                pillar={pillar}
                config={config}
                onPreview={() =>
                  pillar.content &&
                  setPreviewContent({
                    title: `Pilier ${pillar.type} — ${config.title}`,
                    content:
                      typeof pillar.content === "string"
                        ? pillar.content
                        : JSON.stringify(pillar.content, null, 2),
                  })
                }
              />
            );
          })}
        </div>

        {currentPhase === "fiche" && !ficheComplete && (
          <div className="mt-4">
            <Button
              onClick={handleLaunchFiche}
              disabled={isGenerating}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              {isGenerating && currentAction === "fiche" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isGenerating && currentAction
                ? `Génération du pilier ${currentAction}...`
                : "Générer la fiche de marque (A-D-V-E)"}
            </Button>
            {isGenerating && (
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <StopCircle className="mr-1.5 h-3.5 w-3.5" />
                  Annuler
                </Button>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Génère les 4 piliers A-D-V-E à partir des données du formulaire
            </p>
          </div>
        )}

        {ficheComplete && currentPhase === "fiche" && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Fiche de Marque complète — Passez à la validation
              </span>
            </div>
            <Button
              onClick={handleAdvanceToFicheReview}
              size="sm"
              className="bg-terracotta hover:bg-terracotta/90"
              disabled={advancePhaseMutation.isPending}
            >
              {advancePhaseMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
              )}
              Valider la fiche
            </Button>
          </div>
        )}

        {ficheComplete && currentPhase !== "fiche" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Fiche de Marque complète
            </span>
          </div>
        )}

        {!ficheComplete && currentPhase === "fiche" && !isGenerating && Object.keys(interviewData).length === 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Renseignez d&apos;abord les données du formulaire avant de générer.{" "}
              <button
                onClick={() => router.push(`/strategy/${strategyId}`)}
                className="font-medium underline hover:no-underline"
              >
                Compléter les données
              </button>
            </span>
          </div>
        )}
      </PhaseSection>

      {/* ─── Phase 2: Validation Fiche ─── */}
      <PhaseSection
        phase="fiche-review"
        currentPhase={currentPhase}
        title="Phase 2 : Validation de la Fiche"
        description="Vérifiez et corrigez les données A-D-V-E avant l'audit"
        onRevert={() => handleRevertPhase("fiche-review")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "fiche-review" ? (
          <FicheReviewForm
            strategyId={strategyId}
            interviewData={interviewData}
            onValidate={handleValidateFiche}
            isValidating={isValidatingFiche}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {PHASES.indexOf(currentPhase) > PHASES.indexOf("fiche-review")
              ? "Fiche validée — Les données ont été confirmées."
              : "La fiche doit être complétée avant la validation."}
          </p>
        )}
      </PhaseSection>

      {/* ─── Phase 3: Audit Risk (R) ─── */}
      <PhaseSection
        phase="audit-r"
        currentPhase={currentPhase}
        title="Phase 3 : Audit Risk (R)"
        description="Analyse SWOT automatique par variable A-D-V-E"
        onRevert={() => handleRevertPhase("audit-r")}
        isReverting={revertPhaseMutation.isPending}
      >
        {pillarR && (
          <PillarStatusCard
            pillar={pillarR}
            config={PILLAR_CONFIG.R}
            onPreview={() =>
              pillarR.content &&
              setPreviewContent({
                title: "Pilier R — Risk Audit",
                content:
                  typeof pillarR.content === "string"
                    ? pillarR.content
                    : JSON.stringify(pillarR.content, null, 2),
              })
            }
            onRetry={() => handleRetry("R")}
          />
        )}

        {currentPhase === "audit-r" &&
          !rComplete &&
          !rInProgress && (
            <div className="mt-4">
              <Button
                onClick={handleLaunchAuditR}
                disabled={isGenerating}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                {isGenerating && currentAction === "audit-r" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Lancer l&apos;audit Risk
              </Button>
            </div>
          )}

        {rInProgress && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-terracotta">
              <Loader2 className="h-4 w-4 animate-spin" />
              Audit Risk en cours...
            </div>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              Annuler
            </Button>
          </div>
        )}

        {rComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Audit Risk complet — Passez à l&apos;étude de marché (optionnel) ou
              à l&apos;audit Track
            </span>
          </div>
        )}
      </PhaseSection>

      {/* ─── Phase 4: Étude de Marché (optionnel) ─── */}
      <PhaseSection
        phase="market-study"
        currentPhase={currentPhase}
        title="Phase 4 : Étude de Marché"
        description="Collecte de données marché réelles pour enrichir l'audit Track"
        optional
        onRevert={() => handleRevertPhase("market-study")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "market-study" ? (
          <MarketStudyDashboard
            strategyId={strategyId}
            marketStudyStatus={marketStudy?.status ?? "pending"}
            sourceStatuses={
              (marketStudy?.sourceStatuses as SourceStatusMap) ?? {}
            }
            manualData={
              (marketStudy?.manualData as ManualDataStore | null) ?? null
            }
            synthesis={
              (marketStudy?.synthesis as MarketStudySynthesis | null) ??
              null
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
            onSkip={handleSkipMarketStudy}
            onComplete={handleCompleteMarketStudy}
            isCollecting={isCollecting}
            isSynthesizing={isSynthesizing}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {PHASES.indexOf(currentPhase) > PHASES.indexOf("market-study")
              ? marketStudy?.status === "skipped"
                ? "Étude de marché ignorée."
                : "Étude de marché terminée."
              : "L'audit Risk doit être complété avant l'étude de marché."}
          </p>
        )}
      </PhaseSection>

      {/* ─── Phase 5: Audit Track (T) ─── */}
      <PhaseSection
        phase="audit-t"
        currentPhase={currentPhase}
        title="Phase 5 : Audit Track (T)"
        description="Validation marché, TAM/SAM/SOM, benchmarking concurrentiel"
        onRevert={() => handleRevertPhase("audit-t")}
        isReverting={revertPhaseMutation.isPending}
      >
        {pillarT && (
          <PillarStatusCard
            pillar={pillarT}
            config={PILLAR_CONFIG.T}
            onPreview={() =>
              pillarT.content &&
              setPreviewContent({
                title: "Pilier T — Track Audit",
                content:
                  typeof pillarT.content === "string"
                    ? pillarT.content
                    : JSON.stringify(pillarT.content, null, 2),
              })
            }
            onRetry={() => handleRetry("T")}
          />
        )}

        {currentPhase === "audit-t" &&
          !tComplete &&
          !tInProgress && (
            <div className="mt-4">
              <Button
                onClick={handleLaunchAuditT}
                disabled={isGenerating}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                {isGenerating && currentAction === "audit-t" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Lancer l&apos;audit Track
                {marketStudy?.status === "complete" && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    + données marché
                  </Badge>
                )}
              </Button>
              {marketStudy?.status === "complete" && (
                <p className="mt-2 text-xs text-green-600">
                  ✓ L&apos;audit sera enrichi avec les données de l&apos;étude de marché
                </p>
              )}
              {(!marketStudy || marketStudy.status === "skipped") && (
                <p className="mt-2 text-xs text-muted-foreground">
                  L&apos;audit Track sera 100% IA (pas de données marché réelles)
                </p>
              )}
            </div>
          )}

        {tInProgress && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-terracotta">
              <Loader2 className="h-4 w-4 animate-spin" />
              Audit Track en cours...
            </div>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              Annuler
            </Button>
          </div>
        )}

        {tComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Audit Track complet — Passez à la validation
            </span>
          </div>
        )}
      </PhaseSection>

      {/* ─── Phase 6: Validation Audit (R+T) ─── */}
      <PhaseSection
        phase="audit-review"
        currentPhase={currentPhase}
        title="Phase 6 : Validation de l'audit"
        description="Revue et correction manuelle des résultats R+T"
        onRevert={() => handleRevertPhase("audit-review")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "audit-review" && riskData && trackData ? (
          <div className="space-y-6">
            <AuditReviewForm
              initialRiskData={riskData}
              initialTrackData={trackData}
              onValidate={handleValidateAudit}
              isValidating={isValidatingAudit}
            />

            {/* Suggestions panel — analyze audit to suggest A-D-V-E updates */}
            <AuditSuggestionsPanel
              strategyId={strategyId}
              pillars={pillars.map((p) => ({
                id: p.id,
                type: p.type,
                content: p.content,
              }))}
              onSuggestionsApplied={() => void refetchStrategy()}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {PHASES.indexOf(currentPhase) > PHASES.indexOf("audit-review")
              ? "Audit validé — Les données ont été confirmées."
              : "L'audit doit être complété avant la validation."}
          </p>
        )}
      </PhaseSection>

      {/* ─── Phase 7: Données Stratégiques (Pillar I) ─── */}
      <PhaseSection
        phase="implementation"
        currentPhase={currentPhase}
        title="Phase 7 : Données stratégiques"
        description="Génération des données structurées pour le cockpit (Pilier I)"
        onRevert={() => handleRevertPhase("implementation")}
        isReverting={revertPhaseMutation.isPending}
      >
        {pillarI && (
          <PillarStatusCard
            pillar={pillarI}
            config={PILLAR_CONFIG.I}
            onPreview={() =>
              pillarI.content &&
              setPreviewContent({
                title: "Pilier I — Données d'Implémentation",
                content:
                  typeof pillarI.content === "string"
                    ? pillarI.content
                    : JSON.stringify(pillarI.content, null, 2),
              })
            }
            onRetry={() => handleRetry("I")}
          />
        )}

        {currentPhase === "implementation" &&
          !implComplete &&
          !implInProgress && (
            <div className="mt-4">
              <Button
                onClick={handleLaunchImplementation}
                disabled={isGenerating}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                {isGenerating && currentAction === "implementation" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Générer les données cockpit
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Compile les données A-D-V-E + audit R+T en données structurées
              </p>
            </div>
          )}

        {implInProgress && (
          <div className="mt-4 flex items-center gap-2 text-sm text-terracotta">
            <Loader2 className="h-4 w-4 animate-spin" />
            Génération des données en cours...
          </div>
        )}

        {implComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Données stratégiques générées — Le cockpit est prêt
            </span>
          </div>
        )}
      </PhaseSection>

      {/* ─── Phase 8: Cockpit ─── */}
      <PhaseSection
        phase="cockpit"
        currentPhase={currentPhase}
        title="Phase 8 : Cockpit stratégique"
        description="Interface interactive + lien de partage public"
        onRevert={() => handleRevertPhase("cockpit")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "cockpit" || currentPhase === "complete" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le cockpit compile toutes les données en une interface interactive
              premium, prête à être partagée avec le client.
            </p>
            <Button
              onClick={() =>
                router.push(`/strategy/${strategyId}/cockpit`)
              }
              className="bg-terracotta hover:bg-terracotta/90"
            >
              <Eye className="mr-2 h-4 w-4" />
              Ouvrir le Cockpit
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Le cockpit sera disponible après la génération des données
            stratégiques.
          </p>
        )}
      </PhaseSection>

      {/* ─── Rapports on demand (floating section, hors pipeline) ─── */}
      {reportsAvailable && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Rapports stratégiques
                  <Badge variant="secondary" className="text-xs">
                    Optionnel
                  </Badge>
                </CardTitle>
                <CardDescription>
                  6 rapports détaillés de 15-80 pages — Génération individuelle
                  à la demande
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REPORT_TYPES.map((rt) => {
                const doc = reportDocs.find((d) => d.type === rt);
                return (
                  <ReportCard
                    key={rt}
                    reportType={rt}
                    status={
                      (doc?.status as
                        | "pending"
                        | "generating"
                        | "complete"
                        | "error") ?? "pending"
                    }
                    pageCount={doc?.pageCount}
                    errorMessage={doc?.errorMessage}
                    generatedAt={doc?.generatedAt}
                    onGenerate={
                      !isGenerating && doc?.status !== "complete"
                        ? () => handleLaunchSingleReport(rt)
                        : undefined
                    }
                    onView={
                      doc?.status === "complete"
                        ? () =>
                            router.push(
                              `/strategy/${strategyId}/report/${doc.id}`,
                            )
                        : undefined
                    }
                  />
                );
              })}
            </div>

            {reportsInProgress && (
              <div className="mt-4 flex items-center gap-2 text-sm text-terracotta">
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération de rapport en cours...
              </div>
            )}

            <div className="mt-4 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLaunchSingleReport()}
                disabled={isGenerating}
              >
                {isGenerating && currentAction === "reports" ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                )}
                Tout générer ({REPORT_TYPES.length} rapports)
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                ⏱ Durée estimée : 5-15 minutes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Templates UPGRADERS (floating section, hors pipeline) ─── */}
      {templatesAvailable && (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Presentation className="h-5 w-5 text-muted-foreground" />
                  Templates UPGRADERS
                  <Badge variant="secondary" className="text-xs">
                    Livrables
                  </Badge>
                </CardTitle>
                <CardDescription>
                  3 livrables vendables — Protocole Stratégique, Reco Campagne,
                  Mandat 360
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_TYPES.map((tt) => {
                const doc = templateDocs.find((d) => d.type === tt);
                return (
                  <TemplateCard
                    key={tt}
                    templateType={tt}
                    status={
                      (doc?.status as
                        | "pending"
                        | "generating"
                        | "complete"
                        | "error") ?? "pending"
                    }
                    slideCount={doc?.pageCount}
                    errorMessage={doc?.errorMessage}
                    generatedAt={doc?.generatedAt}
                    onGenerate={
                      !isGenerating && doc?.status !== "complete"
                        ? () => handleLaunchSingleTemplate(tt)
                        : undefined
                    }
                    onView={
                      doc?.status === "complete"
                        ? () =>
                            router.push(
                              `/strategy/${strategyId}/report/${doc.id}`,
                            )
                        : undefined
                    }
                    onRegenerate={
                      doc?.status === "complete" || doc?.status === "error"
                        ? () => handleLaunchSingleTemplate(tt)
                        : undefined
                    }
                  />
                );
              })}
            </div>

            {templatesInProgress && (
              <div className="mt-4 flex items-center gap-2 text-sm text-terracotta">
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération de template en cours...
              </div>
            )}

            <div className="mt-4 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLaunchSingleTemplate()}
                disabled={isGenerating}
              >
                {isGenerating && currentAction === "templates" ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                )}
                Tout générer ({TEMPLATE_TYPES.length} templates)
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                ⏱ Durée estimée : 10-20 minutes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Actions footer ─── */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/strategy/${strategyId}`)}
        >
          Retour à la fiche
        </Button>

        {currentPhase === "complete" && (
          <Button
            onClick={() =>
              router.push(`/strategy/${strategyId}/cockpit`)
            }
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Voir le cockpit final
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Preview overlay */}
      {previewContent && (
        <PreviewOverlay
          title={previewContent.title}
          content={previewContent.content}
          onClose={() => setPreviewContent(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase Section wrapper — uses PHASES constant for ordering
// ---------------------------------------------------------------------------

function PhaseSection({
  phase,
  currentPhase,
  title,
  description,
  optional,
  onRevert,
  isReverting,
  children,
}: {
  phase: Phase;
  currentPhase: Phase;
  title: string;
  description: string;
  optional?: boolean;
  onRevert?: () => void;
  isReverting?: boolean;
  children: React.ReactNode;
}) {
  const currentIndex = PHASES.indexOf(currentPhase);
  const phaseIndex = PHASES.indexOf(phase);
  const isLocked = phaseIndex > currentIndex;
  const isComplete = phaseIndex < currentIndex;

  return (
    <Card
      className={
        isLocked ? "opacity-50" : isComplete ? "border-green-200/50" : ""
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {title}
              {optional && (
                <Badge variant="secondary" className="text-xs">
                  Optionnel
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isComplete && onRevert && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRevert}
                disabled={isReverting}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {isReverting ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="mr-1 h-3 w-3" />
                )}
                Revenir ici
              </Button>
            )}
            {isComplete && (
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                <Check className="mr-1 h-3 w-3" />
                Terminé
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-muted-foreground">
                Verrouillé
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{isLocked ? null : children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pillar Status Card (compact)
// ---------------------------------------------------------------------------

function PillarStatusCard({
  pillar,
  config,
  onPreview,
  onRetry,
}: {
  pillar: PillarState;
  config: { title: string; color: string; description: string };
  onPreview?: () => void;
  onRetry?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        pillar.status === "complete"
          ? "border-green-200 bg-green-50/50"
          : pillar.status === "generating"
            ? "border-terracotta/30 bg-terracotta/5 animate-pulse"
            : pillar.status === "error"
              ? "border-red-200 bg-red-50/50"
              : "border-muted"
      }`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
        style={{ backgroundColor: config.color }}
      >
        {pillar.type}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{config.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {pillar.status === "complete"
            ? "Généré"
            : pillar.status === "generating"
              ? "En cours..."
              : pillar.status === "error"
                ? pillar.errorMessage ?? "Erreur"
                : "En attente"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {pillar.status === "complete" && (
          <>
            <Check className="h-4 w-4 text-green-600" />
            {onPreview && (
              <button
                onClick={onPreview}
                className="ml-1 rounded p-1 hover:bg-green-100"
                aria-label={`Aperçu du pilier ${pillar.type}`}
              >
                <Eye className="h-3.5 w-3.5 text-green-600" />
              </button>
            )}
          </>
        )}
        {pillar.status === "generating" && (
          <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
        )}
        {pillar.status === "error" && (
          <>
            <X className="h-4 w-4 text-red-500" />
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-1 rounded p-1 hover:bg-red-100"
                aria-label={`Réessayer le pilier ${pillar.type}`}
              >
                <RotateCcw className="h-3.5 w-3.5 text-red-500" />
              </button>
            )}
          </>
        )}
        {pillar.status === "pending" && (
          <CircleDashed className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview Overlay
// ---------------------------------------------------------------------------

function PreviewOverlay({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Card ref={dialogRef} className="flex max-h-[80vh] w-full max-w-3xl flex-col" tabIndex={-1}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer l'aperçu">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[60vh]">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {content}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
