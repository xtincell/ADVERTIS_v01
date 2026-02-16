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
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  PILLAR_CONFIG,
  FICHE_PILLARS,
  REPORT_TYPES,
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
import { AuditReviewForm } from "~/components/strategy/audit-review/audit-review-form";
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

  // --- Validate Fiche Review → advance to audit-r ---
  const handleValidateFiche = useCallback(
    async (editedData: Record<string, string>) => {
      setIsValidatingFiche(true);
      try {
        await validateFicheMutation.mutateAsync({
          id: strategyId,
          interviewData: editedData,
        });
        await refetchStrategy();
      } catch (error) {
        console.error("[Fiche Review] Validation failed:", error);
      } finally {
        setIsValidatingFiche(false);
      }
    },
    [strategyId, validateFicheMutation, refetchStrategy],
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
    } catch (error) {
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
      await response.json();
      await refetchMarketStudy();
    } catch (error) {
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
      await addManualDataMutation.mutateAsync({
        strategyId,
        ...data,
      });
      await refetchMarketStudy();
    },
    [strategyId, addManualDataMutation, refetchMarketStudy],
  );

  const handleRemoveManualData = useCallback(
    async (entryId: string) => {
      await removeManualDataMutation.mutateAsync({
        strategyId,
        entryId,
      });
      await refetchMarketStudy();
    },
    [strategyId, removeManualDataMutation, refetchMarketStudy],
  );

  const handleUploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("strategyId", strategyId);
      formData.append("file", file);

      try {
        await fetch("/api/market-study/upload", {
          method: "POST",
          body: formData,
        });
        await refetchMarketStudy();
      } catch (error) {
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
    } catch (error) {
      console.error("[MarketStudy] Synthesis failed:", error);
    } finally {
      setIsSynthesizing(false);
    }
  }, [strategyId, synthesizeMarketStudyMutation, refetchMarketStudy]);

  const handleSkipMarketStudy = useCallback(async () => {
    try {
      await skipMarketStudyMutation.mutateAsync({ strategyId });
      await refetchStrategy();
    } catch (error) {
      console.error("[MarketStudy] Skip failed:", error);
    }
  }, [strategyId, skipMarketStudyMutation, refetchStrategy]);

  const handleCompleteMarketStudy = useCallback(async () => {
    try {
      await completeMarketStudyMutation.mutateAsync({ strategyId });
      await refetchStrategy();
    } catch (error) {
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
      } catch (error) {
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
          console.error("[Reports] Generation failed:", data.error);
        }
      } catch (error) {
        console.error("[Reports] Error:", error);
      }

      setIsGenerating(false);
      setCurrentAction(null);
      await refetchStrategy();
      void refetchDocuments();
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

  // ---------------------------------------------------------------------------
  // Phase helpers
  // ---------------------------------------------------------------------------

  const fichePillars = pillars.filter((p) =>
    FICHE_PILLARS.includes(p.type as PillarType),
  );
  const pillarR = pillars.find((p) => p.type === "R");
  const pillarT = pillars.find((p) => p.type === "T");
  const pillarI = pillars.find((p) => p.type === "I");

  const ficheComplete = fichePillars.every((p) => p.status === "complete");
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!strategy) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-terracotta" />
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
            >
              <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
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
      >
        {currentPhase === "fiche-review" ? (
          <FicheReviewForm
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
      >
        {currentPhase === "audit-review" && riskData && trackData ? (
          <AuditReviewForm
            initialRiskData={riskData}
            initialTrackData={trackData}
            onValidate={handleValidateAudit}
            isValidating={isValidatingAudit}
          />
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
                Tout générer (6 rapports)
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                ⏱ Durée estimée : 5-15 minutes (~48 appels IA)
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
          Retour à la stratégie
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
  children,
}: {
  phase: Phase;
  currentPhase: Phase;
  title: string;
  description: string;
  optional?: boolean;
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex max-h-[80vh] w-full max-w-3xl flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
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
