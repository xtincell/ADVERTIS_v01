"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";

import { api } from "~/trpc/react";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { getInterviewSchema } from "~/lib/interview-schema";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

// ---------------------------------------------------------------------------
// Save Status Indicator
// ---------------------------------------------------------------------------

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case "saved":
      return (
        <div className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="size-4" />
          Sauvegarde
        </div>
      );
    case "saving":
      return (
        <div className="flex items-center gap-1.5 text-sm text-amber-600">
          <Loader2 className="size-4 animate-spin" />
          Sauvegarde en cours...
        </div>
      );
    case "unsaved":
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <AlertCircle className="size-4" />
          Modifications non sauvegardees
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="size-4" />
          Erreur de sauvegarde
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Variables Sidebar
// ---------------------------------------------------------------------------

function VariablesSidebar({
  pillarType,
  interviewData,
}: {
  pillarType: string;
  interviewData: Record<string, unknown> | null;
}) {
  const schema = getInterviewSchema();
  const section = schema.find((s) => s.pillarType === pillarType);

  if (!section || section.variables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune variable d&apos;entretien pour ce pilier.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Variables d&apos;entretien
        </CardTitle>
        <CardDescription className="text-xs">
          Donnees saisies lors de la creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.variables.map((variable) => {
          const value = interviewData?.[variable.id as keyof typeof interviewData];
          const displayValue =
            typeof value === "string" && value.trim()
              ? value
              : null;

          return (
            <div key={variable.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-muted-foreground">
                  {variable.id}
                </span>
                <span className="text-xs font-medium">{variable.label}</span>
              </div>
              {displayValue ? (
                <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/50 rounded p-2">
                  {displayValue}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">
                  Non renseigne
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <Skeleton className="h-[500px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Pillar Editor Page
// ---------------------------------------------------------------------------

export default function PillarEditorPage(props: {
  params: Promise<{ id: string; type: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const pillarType = params.type as PillarType;
  const config = PILLAR_CONFIG[pillarType];

  // State
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Fetch strategy with pillars
  const { data: strategy, isLoading, refetch } = api.strategy.getById.useQuery(
    { id: strategyId },
    { enabled: !!strategyId },
  );

  // Find the specific pillar
  const pillar = strategy?.pillars.find((p) => p.type === pillarType);

  // Update mutation
  const updatePillar = api.pillar.update.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      toast.success("Contenu sauvegarde.");
    },
    onError: () => {
      setSaveStatus("error");
      toast.error("Erreur lors de la sauvegarde.");
    },
  });

  // Initialize content from pillar data
  useEffect(() => {
    if (pillar && !initializedRef.current) {
      const formatted = pillar.content
        ? typeof pillar.content === "string"
          ? pillar.content
          : JSON.stringify(pillar.content, null, 2)
        : "";
      setContent(formatted);
      initializedRef.current = true;
    }
  }, [pillar]);

  // Debounced auto-save
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setSaveStatus("unsaved");

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (pillar) {
          setSaveStatus("saving");

          // Try to parse as JSON, otherwise save as string
          let contentToSave: unknown;
          try {
            contentToSave = JSON.parse(newContent);
          } catch {
            contentToSave = newContent;
          }

          updatePillar.mutate({
            id: pillar.id,
            content: contentToSave,
            status: "complete",
          });
        }
      }, 2000);
    },
    [pillar, updatePillar],
  );

  // Manual save
  const handleManualSave = useCallback(() => {
    if (!pillar) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setSaveStatus("saving");

    let contentToSave: unknown;
    try {
      contentToSave = JSON.parse(content);
    } catch {
      contentToSave = content;
    }

    updatePillar.mutate({
      id: pillar.id,
      content: contentToSave,
      status: "complete",
    });
  }, [pillar, content, updatePillar]);

  // Regenerate with AI
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId, pillarType }),
      });

      const data = (await response.json()) as {
        success: boolean;
        pillar?: { content: unknown };
        error?: string;
      };

      if (data.success && data.pillar) {
        const newContent =
          typeof data.pillar.content === "string"
            ? data.pillar.content
            : JSON.stringify(data.pillar.content, null, 2);
        setContent(newContent);
        setSaveStatus("saved");
        toast.success("Pilier regenere avec succes.");
        void refetch();
      } else {
        toast.error(data.error ?? "Erreur lors de la regeneration.");
      }
    } catch {
      toast.error("Erreur reseau lors de la regeneration.");
    } finally {
      setIsRegenerating(false);
    }
  }, [strategyId, pillarType, refetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (!strategy || !pillar) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="size-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Pilier non trouve. Verifiez l&apos;URL et reessayez.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    );
  }

  // Get interview data for the sidebar
  const interviewData = strategy.interviewData as Record<
    string,
    unknown
  > | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/strategy/${strategyId}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            Retour a la strategie
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold text-white"
              style={{ backgroundColor: config?.color }}
            >
              {pillarType}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {config?.title ?? pillarType}
              </h1>
              <p className="text-sm text-muted-foreground">
                {config?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SaveStatusIndicator status={saveStatus} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
            >
              <Save className="mr-1.5 size-3.5" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Editor + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Editor area */}
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Saisissez ou modifiez le contenu de ce pilier..."
                className="min-h-[500px] resize-y font-mono text-sm leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* Info note */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <Info className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Le contenu est automatiquement sauvegarde 2 secondes apres votre
              derniere modification. Vous pouvez aussi sauvegarder manuellement
              avec le bouton ci-dessus.
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Regenerate button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Generation IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Regeneration...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1.5 size-4" />
                    Regenerer avec l&apos;IA
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Regenere le contenu de ce pilier a partir des donnees
                d&apos;entretien. Le contenu actuel sera remplace.
              </p>
            </CardContent>
          </Card>

          {/* Variables sidebar */}
          <VariablesSidebar
            pillarType={pillarType}
            interviewData={interviewData}
          />
        </div>
      </div>
    </div>
  );
}
