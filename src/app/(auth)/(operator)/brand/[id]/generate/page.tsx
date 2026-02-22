// ==========================================================================
// PAGE P.8H — Generate Pipeline (Operator / Brand)
// AI generation pipeline control page for the operator brand view.
// Replicates the core functionality of the strategy generate page (P.6).
// ==========================================================================

"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
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
  Upload,
  PenLine,
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
import { PhaseTimeline } from "~/components/strategy/phase-timeline";
import { ReportCard } from "~/components/strategy/report-card";
import { TemplateCard } from "~/components/strategy/template-card";
import { AuditReviewForm } from "~/components/strategy/audit-review/audit-review-form";
import { AuditSuggestionsPanel } from "~/components/strategy/audit-review/audit-suggestions-panel";
import { FicheReviewForm } from "~/components/strategy/fiche-review/fiche-review-form";
import { MarketStudyDashboard } from "~/components/strategy/market-study/market-study-dashboard";
import FileUploadZone, {
  type ImportResult,
} from "~/components/strategy/import/file-upload-zone";
import FreeTextInput from "~/components/strategy/import/free-text-input";

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
// Main Generation Page
// ---------------------------------------------------------------------------

export default function BrandGeneratePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const strategyId = params.id;

  // State
  const [pillars, setPillars] = useState<PillarState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isValidatingAudit, setIsValidatingAudit] = useState(false);
  const [isValidatingFiche, setIsValidatingFiche] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ingestionComplete, setIngestionComplete] = useState(false);
  const cancelledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
  const { data: documents, refetch: refetchDocuments } =
    api.document.getStatus.useQuery(
      { strategyId },
      { enabled: !!strategyId, refetchInterval: isGenerating ? 3000 : false },
    );

  // Fetch market study data
  const { data: marketStudy, refetch: refetchMarketStudy } =
    api.marketStudy.getByStrategy.useQuery(
      { strategyId },
      { enabled: !!strategyId },
    );

  // Fetch available data sources
  const { data: availableSources } =
    api.marketStudy.getDataSources.useQuery();

  // tRPC mutations
  const validateAuditMutation =
    api.strategy.validateAuditReview.useMutation();
  const validateFicheMutation =
    api.strategy.validateFicheReview.useMutation();
  const advancePhaseMutation = api.strategy.advancePhase.useMutation();
  const updateInterviewDataMutation =
    api.strategy.updateInterviewData.useMutation();
  const confirmImportMutation = api.strategy.confirmImport.useMutation();
  const revertPhaseMutation = api.strategy.revertPhase.useMutation();
  const addManualDataMutation = api.marketStudy.addManualData.useMutation();
  const removeManualDataMutation =
    api.marketStudy.removeManualData.useMutation();
  const skipMarketStudyMutation = api.marketStudy.skip.useMutation();
  const completeMarketStudyMutation =
    api.marketStudy.complete.useMutation();
  const synthesizeMarketStudyMutation =
    api.marketStudy.synthesize.useMutation();

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
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId, pillarType }),
          signal: controller.signal,
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
          toast.success(
            `Pilier ${pillarConfig?.title ?? pillarType} généré avec succès.`,
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

  // Validate Fiche Review
  const handleValidateFiche = useCallback(
    async (editedData: Record<string, string>) => {
      setIsValidatingFiche(true);
      try {
        await validateFicheMutation.mutateAsync({
          id: strategyId,
          interviewData: editedData,
        });
        await refetchStrategy();
        toast.success("Fiche validée — Lancement de l’audit Risk…");

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

  // Launch Fiche generation (A-D-V-E)
  const handleLaunchFiche = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("fiche");
    cancelledRef.current = false;

    for (const pillarType of ["A", "D", "V", "E"] as const) {
      if (cancelledRef.current) break;
      const existing = pillars.find((p) => p.type === pillarType);
      if (existing?.status === "complete") continue;
      setCurrentAction(pillarType);
      const success = await generateSinglePillar(pillarType);
      if (!success) break;
    }

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [pillars, generateSinglePillar, refetchStrategy]);

  // ---------------------------------------------------------------------------
  // Ingestion handlers (called from Phase 0 data ingestion step)
  // ---------------------------------------------------------------------------

  // Handle import file result (import method)
  const handleImportComplete = useCallback(
    async (result: ImportResult) => {
      try {
        if (result.importedFileId) {
          // Confirm import (saves mapped variables into interviewData)
          await confirmImportMutation.mutateAsync({
            strategyId,
            importedFileId: result.importedFileId,
            confirmedData: result.mappedVariables,
          });
        } else {
          // Direct mapped variables (from freetext or other)
          await updateInterviewDataMutation.mutateAsync({
            id: strategyId,
            data: result.mappedVariables,
          });
        }
        await refetchStrategy();
        setIngestionComplete(true);
        toast.success(
          `${Object.keys(result.mappedVariables).length} variables import\u00e9es avec succ\u00e8s !`,
        );

        // Auto-launch ADVE generation
        await handleLaunchFiche();
      } catch (error) {
        toast.error("Erreur lors de la sauvegarde des donn\u00e9es import\u00e9es.");
        console.error("[Ingestion] Import save failed:", error);
      }
    },
    [
      strategyId,
      confirmImportMutation,
      updateInterviewDataMutation,
      refetchStrategy,
      handleLaunchFiche,
    ],
  );

  // Advance fiche -> fiche-review
  const handleAdvanceToFicheReview = useCallback(async () => {
    try {
      await advancePhaseMutation.mutateAsync({
        id: strategyId,
        targetPhase: "fiche-review",
      });
      await refetchStrategy();
      toast.success("Fiche validée — Passez à l’audit Risk.");
    } catch (error) {
      toast.error("Erreur lors de l’avancement de phase.");
      console.error("[Pipeline] Advance to fiche-review failed:", error);
    }
  }, [strategyId, advancePhaseMutation, refetchStrategy]);

  // Launch Audit R
  const handleLaunchAuditR = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("audit-r");
    cancelledRef.current = false;
    await generateSinglePillar("R");
    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // Launch Audit T
  const handleLaunchAuditT = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("audit-t");
    cancelledRef.current = false;
    await generateSinglePillar("T");
    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // Market Study handlers
  const handleLaunchCollection = useCallback(async () => {
    setIsCollecting(true);
    try {
      const response = await fetch("/api/market-study/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
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
        await addManualDataMutation.mutateAsync({ strategyId, ...data });
        await refetchMarketStudy();
        toast.success("Données ajoutées avec succès.");
      } catch (error) {
        toast.error("Erreur lors de l’ajout des données.");
        console.error("[MarketStudy] Add manual data failed:", error);
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
        toast.error("Erreur lors de l’import du fichier.");
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
      toast.error("Erreur lors du passage de l’étude.");
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

  // Validate Audit Review
  const handleValidateAudit = useCallback(
    async (riskData: RiskAuditResult, trackData: TrackAuditResult) => {
      setIsValidatingAudit(true);
      try {
        await validateAuditMutation.mutateAsync({
          id: strategyId,
          riskAuditData: structuredClone(riskData),
          trackAuditData: structuredClone(trackData),
        });
        await refetchStrategy();
        toast.success("Audit validé avec succès !");
      } catch (error) {
        toast.error("Erreur lors de la validation de l’audit.");
        console.error("[Audit Review] Validation failed:", error);
      } finally {
        setIsValidatingAudit(false);
      }
    },
    [strategyId, validateAuditMutation, refetchStrategy],
  );

  // Launch Implementation (Pillar I) + auto-chain template generation
  const handleLaunchImplementation = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("implementation");
    cancelledRef.current = false;
    const success = await generateSinglePillar("I");

    // Auto-generate all 3 UPGRADERS templates after Pillar I completes
    if (success && !cancelledRef.current) {
      setCurrentAction("templates");
      try {
        const response = await fetch("/api/ai/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId }),
        });
        const data = (await response.json()) as {
          success: boolean;
          error?: string;
          warning?: string;
        };
        if (data.success) {
          toast.success("Templates UPGRADERS générés automatiquement !");
        } else if (data.warning) {
          toast.warning(data.warning);
        } else if (data.error) {
          toast.error(data.error);
        }
      } catch (error) {
        console.error("[Templates] Auto-generation error:", error);
        toast.error("Erreur lors de la génération automatique des templates.");
      }
      await refetchDocuments();
    }

    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [strategyId, generateSinglePillar, refetchStrategy, refetchDocuments]);

  // Launch Synthese (Pillar S)
  const handleLaunchSynthese = useCallback(async () => {
    setIsGenerating(true);
    setCurrentAction("synthese");
    cancelledRef.current = false;
    await generateSinglePillar("S");
    setIsGenerating(false);
    setCurrentAction(null);
    await refetchStrategy();
  }, [generateSinglePillar, refetchStrategy]);

  // Retry a single pillar
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

  // Cancel — abort in-flight fetch + prevent next pillar in sequence
  const handleCancel = () => {
    cancelledRef.current = true;
    abortControllerRef.current?.abort();
  };

  // Revert phase
  type RevertablePhase = Exclude<Phase, "complete">;
  const handleRevertPhase = useCallback(
    async (targetPhase: RevertablePhase) => {
      try {
        await revertPhaseMutation.mutateAsync({ id: strategyId, targetPhase });
        await refetchStrategy();
        toast.success(
          `Retour à la phase "${PHASE_CONFIG[targetPhase].title}"`,
        );
      } catch (error) {
        toast.error("Erreur lors du retour en arrière.");
        console.error("[Pipeline] Revert phase failed:", error);
      }
    },
    [strategyId, revertPhaseMutation, refetchStrategy],
  );

  // Launch reports
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

  // Launch templates
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
          toast.error(
            data.error ?? "Erreur lors de la génération du template.",
          );
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

  // ---------------------------------------------------------------------------
  // Phase helpers
  // ---------------------------------------------------------------------------

  const fichePillars = pillars.filter((p) =>
    FICHE_PILLARS.includes(p.type as PillarType),
  );
  const pillarR = pillars.find((p) => p.type === "R");
  const pillarT = pillars.find((p) => p.type === "T");
  const pillarI = pillars.find((p) => p.type === "I");
  const pillarS = pillars.find((p) => p.type === "S");

  const ficheComplete =
    fichePillars.length > 0 &&
    fichePillars.every((p) => p.status === "complete");
  const rComplete = pillarR?.status === "complete";
  const rInProgress = pillarR?.status === "generating";
  const tComplete = pillarT?.status === "complete";
  const tInProgress = pillarT?.status === "generating";
  const implComplete = pillarI?.status === "complete";
  const implInProgress = pillarI?.status === "generating";
  const sComplete = pillarS?.status === "complete";
  const sInProgress = pillarS?.status === "generating";

  const reportDocs = (documents ?? []) as DocumentStatus[];
  const auditComplete = rComplete && tComplete;
  const reportsAvailable =
    auditComplete &&
    (currentPhase === "audit-review" ||
      currentPhase === "implementation" ||
      currentPhase === "cockpit" ||
      currentPhase === "complete");
  const templatesAvailable =
    implComplete &&
    (currentPhase === "implementation" ||
      currentPhase === "cockpit" ||
      currentPhase === "complete");

  const templateDocs = (documents ?? []).filter((d) =>
    (TEMPLATE_TYPES as readonly string[]).includes(d.type),
  ) as DocumentStatus[];

  const riskData = pillarR?.content as RiskAuditResult | null;
  const trackData = pillarT?.content as TrackAuditResult | null;
  const interviewData =
    (strategy?.interviewData as Record<string, string>) ?? {};

  // Ingestion step: show when in fiche phase, no ADVE pillars are complete, and inputMethod is set
  const inputMethod = strategy?.inputMethod as string | null;
  const hasInterviewData = Object.keys(interviewData).length > 0;
  const needsIngestion =
    currentPhase === "fiche" &&
    !ficheComplete &&
    !ingestionComplete &&
    !hasInterviewData &&
    !!inputMethod;

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
          <p className="font-medium text-red-700">
            Impossible de charger la fiche de marque
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            V&eacute;rifiez votre connexion ou r&eacute;essayez.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refetchStrategy()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          R&eacute;essayer
        </Button>
      </div>
    );
  }

  if (isStrategyLoading || !strategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="text-sm text-muted-foreground">
          Chargement de la fiche de marque&hellip;
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pipeline de g&eacute;n&eacute;ration
        </h1>
        <p className="text-muted-foreground">
          {strategy.brandName} &mdash; {strategy.name}
        </p>
      </div>

      {/* Phase Timeline */}
      <PhaseTimeline currentPhase={currentPhase} />

      {/* Phase 0: Data Ingestion (before pipeline) */}
      {needsIngestion && (
        <Card className="border-terracotta/30 bg-gradient-to-br from-terracotta/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {inputMethod === "import" ? (
                <Upload className="h-5 w-5 text-terracotta" />
              ) : (
                <PenLine className="h-5 w-5 text-terracotta" />
              )}
              Saisie des donn&eacute;es de marque
              <Badge className="bg-terracotta text-white text-xs">
                &Eacute;tape pr&eacute;alable
              </Badge>
            </CardTitle>
            <CardDescription>
              {inputMethod === "import"
                ? "Importez un document existant (PDF, DOCX, Excel) pour extraire les donn\u00e9es"
                : "D\u00e9crivez votre marque librement, l\u0027IA analysera le texte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inputMethod === "import" && (
              <FileUploadZone
                strategyId={strategyId}
                brandName={strategy.brandName}
                sector={strategy.sector ?? ""}
                onUploadComplete={(result) => void handleImportComplete(result)}
                onError={(err) => toast.error(err)}
              />
            )}
            {(inputMethod === "freetext" || inputMethod === "interview") && (
              <FreeTextInput
                brandName={strategy.brandName}
                sector={strategy.sector ?? ""}
                onAnalysisComplete={(result) => void handleImportComplete(result)}
                onError={(err) => toast.error(err)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase 1: Fiche de Marque */}
      <PhaseSection
        phase="fiche"
        currentPhase={currentPhase}
        title="Phase 1 : Fiche de Marque"
        description="Donn\u00e9es collect\u00e9es via le formulaire ou l\u0027import de fichier"
        onRevert={() => handleRevertPhase("fiche")}
        isReverting={revertPhaseMutation.isPending}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {fichePillars.map((pillar) => {
            const config = PILLAR_CONFIG[pillar.type as PillarType];
            return (
              <PillarStatusCard key={pillar.id} pillar={pillar} config={config} />
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
              G&eacute;n&eacute;rer la fiche de marque (A-D-V-E)
            </Button>
            {isGenerating && (
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <StopCircle className="mr-1.5 h-3.5 w-3.5" />
                  Annuler
                </Button>
              </div>
            )}
          </div>
        )}

        {ficheComplete && currentPhase === "fiche" && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Fiche de Marque compl&egrave;te
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
      </PhaseSection>

      {/* Phase 2: Validation Fiche */}
      <PhaseSection
        phase="fiche-review"
        currentPhase={currentPhase}
        title="Phase 2 : Validation de la Fiche"
        description="Vérifiez et corrigez les données A-D-V-E avant l’audit"
        onRevert={() => handleRevertPhase("fiche-review")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "fiche-review" ? (
          <FicheReviewForm
            strategyId={strategyId}
            interviewData={interviewData}
            pillarContents={fichePillars.map((p) => ({
              type: p.type,
              content: p.content,
            }))}
            riskData={rComplete ? riskData : null}
            trackData={tComplete ? trackData : null}
            onValidate={handleValidateFiche}
            isValidating={isValidatingFiche}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {PHASES.indexOf(currentPhase) > PHASES.indexOf("fiche-review")
              ? "Fiche validée."
              : "La fiche doit être complétée avant la validation."}
          </p>
        )}
      </PhaseSection>

      {/* Phase 3: Audit Risk (R) */}
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
            onRetry={() => handleRetry("R")}
          />
        )}
        {currentPhase === "audit-r" && !rComplete && !rInProgress && (
          <div className="mt-4">
            <Button
              onClick={handleLaunchAuditR}
              disabled={isGenerating}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              <Shield className="mr-2 h-4 w-4" />
              Lancer l&apos;audit Risk
            </Button>
          </div>
        )}
        {rComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Audit Risk complet</span>
          </div>
        )}
      </PhaseSection>

      {/* Phase 4: Market Study */}
      <PhaseSection
        phase="market-study"
        currentPhase={currentPhase}
        title="Phase 4 : Étude de Marché"
        description="Collecte de données marché réelles (optionnel)"
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
            onSkip={handleSkipMarketStudy}
            onComplete={handleCompleteMarketStudy}
            isCollecting={isCollecting}
            isSynthesizing={isSynthesizing}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {PHASES.indexOf(currentPhase) > PHASES.indexOf("market-study")
              ? "Étude de marché terminée."
              : "L’audit Risk doit être complété avant."}
          </p>
        )}
      </PhaseSection>

      {/* Phase 5: Audit Track (T) */}
      <PhaseSection
        phase="audit-t"
        currentPhase={currentPhase}
        title="Phase 5 : Audit Track (T)"
        description="Validation marché, TAM/SAM/SOM, benchmarking"
        onRevert={() => handleRevertPhase("audit-t")}
        isReverting={revertPhaseMutation.isPending}
      >
        {pillarT && (
          <PillarStatusCard
            pillar={pillarT}
            config={PILLAR_CONFIG.T}
            onRetry={() => handleRetry("T")}
          />
        )}
        {currentPhase === "audit-t" && !tComplete && !tInProgress && (
          <div className="mt-4">
            <Button
              onClick={handleLaunchAuditT}
              disabled={isGenerating}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Lancer l&apos;audit Track
            </Button>
          </div>
        )}
        {tComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Audit Track complet</span>
          </div>
        )}
      </PhaseSection>

      {/* Phase 6: Validation Audit */}
      <PhaseSection
        phase="audit-review"
        currentPhase={currentPhase}
        title="Phase 6 : Validation de l’audit"
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
              ? "Audit validé."
              : "L’audit doit être complété avant la validation."}
          </p>
        )}
      </PhaseSection>

      {/* Phase 7: Implementation */}
      <PhaseSection
        phase="implementation"
        currentPhase={currentPhase}
        title="Phase 7 : Données stratégiques"
        description="Génération des données cockpit (Pilier I)"
        onRevert={() => handleRevertPhase("implementation")}
        isReverting={revertPhaseMutation.isPending}
      >
        {pillarI && (
          <PillarStatusCard
            pillar={pillarI}
            config={PILLAR_CONFIG.I}
            onRetry={() => handleRetry("I")}
          />
        )}
        {currentPhase === "implementation" && !implComplete && !implInProgress && (
          <div className="mt-4">
            <Button
              onClick={handleLaunchImplementation}
              disabled={isGenerating}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              <Database className="mr-2 h-4 w-4" />
              G&eacute;n&eacute;rer les donn&eacute;es cockpit
            </Button>
          </div>
        )}
        {isGenerating && currentAction === "templates" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
            <span className="text-sm text-terracotta">
              G&eacute;n&eacute;ration automatique des templates UPGRADERS en cours&hellip;
            </span>
          </div>
        )}
        {implComplete && currentAction !== "templates" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Données stratégiques générées
            </span>
          </div>
        )}
      </PhaseSection>

      {/* Phase 8: Synthese & Cockpit */}
      <PhaseSection
        phase="cockpit"
        currentPhase={currentPhase}
        title="Phase 8 : Synthèse stratégique & Cockpit"
        description="Pilier S — Bible stratégique, puis cockpit interactif"
        onRevert={() => handleRevertPhase("cockpit")}
        isReverting={revertPhaseMutation.isPending}
      >
        {currentPhase === "cockpit" || currentPhase === "complete" ? (
          <div className="space-y-4">
            {!sComplete && !sInProgress && currentPhase === "cockpit" && (
              <Button
                onClick={() => void handleLaunchSynthese()}
                disabled={isGenerating}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                G&eacute;n&eacute;rer la synth&egrave;se (Pilier S)
              </Button>
            )}
            {sComplete && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Synth&egrave;se strat&eacute;gique g&eacute;n&eacute;r&eacute;e
                </span>
              </div>
            )}
            <div className="border-t pt-4">
              <Button
                onClick={() => router.push(`/brand/${strategyId}`)}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ouvrir le Cockpit
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            La synth&egrave;se sera disponible apr&egrave;s les donn&eacute;es
            strat&eacute;giques.
          </p>
        )}
      </PhaseSection>

      {/* Reports (optional) */}
      {reportsAvailable && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Rapports strat&eacute;giques
              <Badge variant="secondary" className="text-xs">
                Optionnel
              </Badge>
            </CardTitle>
            <CardDescription>
              Rapports d&eacute;taill&eacute;s &mdash; g&eacute;n&eacute;ration
              individuelle
            </CardDescription>
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
                              `/brand/${strategyId}/document/${doc.id}`,
                            )
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates (optional) */}
      {templatesAvailable && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Presentation className="h-5 w-5 text-muted-foreground" />
              Templates UPGRADERS
              <Badge variant="secondary" className="text-xs">
                Livrables
              </Badge>
            </CardTitle>
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
                              `/brand/${strategyId}/document/${doc.id}`,
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
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/brand/${strategyId}`)}
        >
          Retour au cockpit
        </Button>
        {currentPhase === "complete" && (
          <Button
            onClick={() => router.push(`/brand/${strategyId}`)}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Voir le cockpit final
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase Section wrapper
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
                Termin&eacute;
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-muted-foreground">
                Verrouill&eacute;
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
// Pillar Status Card
// ---------------------------------------------------------------------------

function PillarStatusCard({
  pillar,
  config,
  onRetry,
}: {
  pillar: PillarState;
  config: { title: string; color: string; description: string };
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
          <Check className="h-4 w-4 text-green-600" />
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

