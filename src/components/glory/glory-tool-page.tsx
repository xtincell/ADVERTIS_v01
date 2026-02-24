"use client";

// =============================================================================
// COMP C.GLORY — GloryToolPage
// =============================================================================
// Generic GLORY tool page component used by every tool.
// Shows tool info, input form, generate button, and output display.
// Manages full lifecycle: idle → generating → complete → error.
// =============================================================================

import { useState, useCallback, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  Loader2,
  Play,
  RefreshCw,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import {
  GLORY_LAYER_META,
  type GloryToolDescriptor,
} from "~/lib/types/glory-tools";
import { GloryInputForm } from "./glory-input-form";
import { GloryOutputDisplay } from "./glory-output-display";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------
function getIconComponent(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? icons[`${iconName}Icon`] ?? LucideIcons.Puzzle;
}

// ---------------------------------------------------------------------------
// Generation state
// ---------------------------------------------------------------------------
type GenerationState = "idle" | "generating" | "complete" | "error";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryToolPageProps {
  toolSlug: string;
  strategyId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryToolPage({ toolSlug, strategyId }: GloryToolPageProps) {
  const { data: tools, isLoading: toolsLoading } =
    api.glory.listTools.useQuery();

  // Find the tool by slug
  const tool = useMemo<GloryToolDescriptor | undefined>(
    () => tools?.find((t) => t.slug === toolSlug),
    [tools, toolSlug],
  );

  // Form values state
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Generation state
  const [genState, setGenState] = useState<GenerationState>("idle");
  const [outputText, setOutputText] = useState("");
  const [outputData, setOutputData] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // tRPC mutations
  const generateMutation = api.glory.generate.useMutation({
    onSuccess: (result) => {
      setOutputText(result.outputText ?? "");
      setOutputData(result.outputData ?? null);
      setGenState("complete");
      toast.success("Génération terminée");
    },
    onError: (err) => {
      setErrorMessage(err.message ?? "Une erreur est survenue");
      setGenState("error");
      toast.error("Erreur de génération");
    },
  });

  const saveMutation = api.glory.generate.useMutation({
    onSuccess: () => {
      toast.success("Résultat sauvegardé avec succès");
    },
    onError: () => {
      toast.error("Impossible de sauvegarder");
    },
  });

  // Handle form value changes
  const handleInputChange = useCallback((key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Check if all required fields are filled
  const canGenerate = useMemo(() => {
    if (!tool || !strategyId) return false;
    return tool.inputs
      .filter((inp) => inp.required)
      .every((inp) => {
        const val = formValues[inp.key];
        if (val === undefined || val === null || val === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      });
  }, [tool, strategyId, formValues]);

  // Generate
  const handleGenerate = useCallback(() => {
    if (!tool || !strategyId) return;
    setGenState("generating");
    setErrorMessage("");
    generateMutation.mutate({
      toolSlug: tool.slug,
      strategyId,
      inputs: formValues,
      save: false,
    });
  }, [tool, strategyId, formValues, generateMutation]);

  // Save
  const handleSave = useCallback(() => {
    if (!tool || !strategyId) return;
    saveMutation.mutate({
      toolSlug: tool.slug,
      strategyId,
      inputs: formValues,
      save: true,
    });
  }, [tool, strategyId, formValues, saveMutation]);

  // Retry
  const handleRetry = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (toolsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Tool not found
  // -----------------------------------------------------------------------
  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-800">Outil introuvable</h2>
        <p className="text-sm text-muted-foreground mt-1">
          L&apos;outil &laquo;&nbsp;{toolSlug}&nbsp;&raquo; n&apos;existe pas dans le registre GLORY.
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // No strategy selected
  // -----------------------------------------------------------------------
  if (!strategyId) {
    return (
      <div className="space-y-6">
        <ToolHeader tool={tool} />
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Sélectionnez une marque pour utiliser cet outil. Utilisez le
              sélecteur de marque dans la barre supérieure.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Main tool view
  // -----------------------------------------------------------------------
  const layerMeta = GLORY_LAYER_META[tool.layer];
  const IconComp = getIconComponent(tool.icon);

  return (
    <div className="space-y-6">
      {/* Tool header */}
      <ToolHeader tool={tool} />

      {/* Input form card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Paramètres</CardTitle>
          <CardDescription className="text-xs">
            Renseignez les champs ci-dessous puis lancez la génération.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GloryInputForm
            inputs={tool.inputs}
            values={formValues}
            onChange={handleInputChange}
            disabled={genState === "generating"}
          />

          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || genState === "generating"}
              className={cn(
                "gap-2 px-6",
                "bg-[#6C5CE7] hover:bg-[#5b4bd5] text-white",
              )}
            >
              {genState === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {genState === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                Erreur de génération
              </p>
            </div>
            <p className="text-sm text-red-700">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Output display */}
      {genState === "complete" && (
        <Card className="border-[#6C5CE7]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LucideIcons.CheckCircle2 className="h-5 w-5 text-green-600" />
              Résultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GloryOutputDisplay
              outputData={outputData}
              outputText={outputText}
              outputFormat={tool.outputFormat}
              persistable={tool.persistable}
              onSave={handleSave}
              isSaving={saveMutation.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tool Header sub-component
// ---------------------------------------------------------------------------
function ToolHeader({ tool }: { tool: GloryToolDescriptor }) {
  const layerMeta = GLORY_LAYER_META[tool.layer];
  const IconComp = getIconComponent(tool.icon);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center h-10 w-10 rounded-lg"
          style={{ backgroundColor: `${layerMeta.color}15` }}
        >
          <IconComp className="h-5 w-5" style={{ color: layerMeta.color }} />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-gray-900">{tool.name}</h1>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className="text-[10px]"
          style={{
            borderColor: `${layerMeta.color}40`,
            color: layerMeta.color,
          }}
        >
          {layerMeta.label}
        </Badge>
        {tool.requiredPillars.map((pillar) => (
          <Badge
            key={pillar}
            variant="secondary"
            className="text-[10px]"
          >
            {pillar}
          </Badge>
        ))}
        {tool.persistable && (
          <Badge
            variant="outline"
            className="text-[10px] border-green-300 text-green-700"
          >
            Persistable
          </Badge>
        )}
      </div>
    </div>
  );
}
