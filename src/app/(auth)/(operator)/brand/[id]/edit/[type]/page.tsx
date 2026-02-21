// ==========================================================================
// PAGE P.7 — Adaptive Pillar Editor Route
// Renders the correct pillar editor inside a mobile full-screen wrapper or
// a desktop slide-over panel depending on viewport width.
// Route: /brand/[id]/edit/[type]  (type = A | D | V | E | R | T | I | S)
// ==========================================================================

"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { useMobile } from "~/components/hooks/use-mobile";
import { EditorFullScreen } from "~/components/editors/editor-full-screen";
import { EditorSlideOver } from "~/components/editors/editor-slide-over";
import { StructuredPillarEditor } from "~/components/pillar-editors";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PillarEditorAdaptivePage(props: {
  params: Promise<{ id: string; type: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const pillarType = params.type.toUpperCase() as PillarType;
  const config = PILLAR_CONFIG[pillarType];

  const router = useRouter();
  const isMobile = useMobile();

  // ── Local editor state ──
  const [content, setContent] = useState<unknown>(null);
  const [rawContent, setRawContent] = useState("");
  const [isStructured, setIsStructured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initializedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data fetching ──
  const {
    data: strategy,
    isLoading,
    isError,
    refetch,
  } = api.cockpit.getData.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  const pillar = strategy?.pillars.find(
    (p) => p.type === pillarType,
  );

  // ── Update mutation ──
  const updatePillar = api.pillar.update.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      toast.success("Contenu sauvegard\u00e9.");
      void refetch();
    },
    onError: () => {
      setIsSaving(false);
      toast.error("Erreur lors de la sauvegarde.");
    },
  });

  // ── Initialize content from pillar data ──
  useEffect(() => {
    if (pillar && !initializedRef.current) {
      if (pillar.content && typeof pillar.content === "object") {
        setContent(pillar.content);
        setRawContent(JSON.stringify(pillar.content, null, 2));
        setIsStructured(true);
      } else {
        setRawContent(
          typeof pillar.content === "string" ? pillar.content : "",
        );
        setIsStructured(false);
      }
      initializedRef.current = true;
    }
  }, [pillar]);

  // ── Cleanup debounce on unmount ──
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Handlers ──
  const handleBack = useCallback(() => {
    router.push(`/brand/${strategyId}`);
  }, [router, strategyId]);

  const handleSave = useCallback(() => {
    if (!pillar) return;
    setIsSaving(true);

    const contentToSave = isStructured && content != null ? content : rawContent;

    updatePillar.mutate({
      id: pillar.id,
      content: contentToSave,
      status: "complete",
    });
  }, [pillar, isStructured, content, rawContent, updatePillar]);

  const handleStructuredChange = useCallback((newData: unknown) => {
    setContent(newData);
    setRawContent(JSON.stringify(newData, null, 2));
  }, []);

  const handleRawChange = useCallback((value: string) => {
    setRawContent(value);
    // Try to keep structured state in sync when editing raw JSON
    try {
      const parsed: unknown = JSON.parse(value);
      setContent(parsed);
    } catch {
      // raw text — not valid JSON
    }
  }, []);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error / not found ──
  if (isError || !strategy || !pillar) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="size-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          {isError
            ? "Impossible de charger les donn\u00e9es."
            : "Pilier introuvable."}
        </p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          Retour
        </Button>
      </div>
    );
  }

  // ── Build title ──
  const title = config
    ? `${pillarType} \u2014 ${config.title}`
    : `\u00c9diteur ${pillarType}`;

  // ── Editor content ──
  const editorContent = (
    <div className="space-y-4">
      {/* Structured form editor for A, D, V, E, T */}
      {isStructured && content != null ? (
        <>
          <StructuredPillarEditor
            pillarType={pillarType}
            content={content}
            onChange={handleStructuredChange}
          />
          {/* Fallback raw JSON for pillar types without a dedicated editor */}
          {!["A", "D", "V", "E", "T"].includes(pillarType) && (
            <Textarea
              value={rawContent}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="\u00c9ditez le JSON structur\u00e9..."
              className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
            />
          )}
        </>
      ) : (
        /* Raw textarea for legacy / unstructured content */
        <Textarea
          value={rawContent}
          onChange={(e) => handleRawChange(e.target.value)}
          placeholder="Saisissez ou modifiez le contenu de ce pilier..."
          className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
        />
      )}
    </div>
  );

  // ── Adaptive wrapper ──
  if (isMobile) {
    return (
      <EditorFullScreen
        title={title}
        onBack={handleBack}
        onSave={handleSave}
        isSaving={isSaving}
      >
        {editorContent}
      </EditorFullScreen>
    );
  }

  // Desktop: render as slide-over (always open, closing navigates back)
  return (
    <EditorSlideOver
      open={true}
      onOpenChange={(open) => {
        if (!open) handleBack();
      }}
      title={title}
    >
      {editorContent}
    </EditorSlideOver>
  );
}
