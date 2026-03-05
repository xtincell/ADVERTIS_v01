// ==========================================================================
// PAGE P.7 — Adaptive Pillar Editor Route (v3)
// Renders the correct pillar editor inside a mobile full-screen wrapper or
// a desktop slide-over panel depending on viewport width.
// Route: /impulsion/brand/[id]/edit/[type]  (type = A | D | V | E | R | T | I | S)
// ==========================================================================

"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Save } from "lucide-react";

import { PageSpinner } from "~/components/ui/loading-skeleton";
import { PILLAR_CONFIG } from "~/lib/constants";
import type { PillarType } from "~/lib/constants";
import { useMobile } from "~/components/hooks/use-mobile";
import { EditorFullScreen } from "~/components/editors/editor-full-screen";
import { EditorSlideOver } from "~/components/editors/editor-slide-over";
import { StructuredPillarEditor } from "~/components/pillar-editors";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { usePillarForm } from "~/hooks/use-pillar-form";

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

  // ── All state managed by usePillarForm ──
  const {
    content,
    rawContent,
    isStructured,
    isLoading,
    isError,
    isSaving,
    isDirty,
    strategy,
    pillar,
    handleStructuredChange,
    handleRawChange,
    handleSave,
  } = usePillarForm({ strategyId, pillarType });

  // ── Navigation ──
  const handleBack = useCallback(() => {
    router.push(`/impulsion/brand/${strategyId}`);
  }, [router, strategyId]);

  // ── Loading ──
  if (isLoading) {
    return <PageSpinner />;
  }

  // ── Error / not found ──
  if (isError || !strategy || !pillar) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertTriangle className="size-8 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          {isError
            ? "Impossible de charger les données."
            : "Pilier introuvable."}
        </p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          Retour
        </Button>
      </div>
    );
  }

  // ── Title ──
  const title = config
    ? `${pillarType} — ${config.title}`
    : `Éditeur ${pillarType}`;

  // ── Save bar (shows dirty state) ──
  const saveBar = isDirty ? (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 backdrop-blur-sm px-4 py-3">
      <Badge variant="warning" className="text-xs">
        Modifications non sauvegardées
      </Badge>
      <Button
        size="sm"
        variant="gradient"
        onClick={handleSave}
        loading={isSaving}
      >
        <Save className="mr-1.5 h-3.5 w-3.5" />
        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  ) : null;

  // ── Editor content ──
  const editorContent = (
    <div className="space-y-4">
      {isStructured && content != null ? (
        <>
          <StructuredPillarEditor
            pillarType={pillarType}
            content={content}
            onChange={handleStructuredChange}
          />
          {/* Raw JSON fallback for types without a dedicated structured editor */}
          {!["A", "D", "V", "E", "T", "R", "I", "S"].includes(pillarType) && (
            <Textarea
              value={rawContent}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="Éditez le JSON structuré..."
              className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
            />
          )}
        </>
      ) : (
        <Textarea
          value={rawContent}
          onChange={(e) => handleRawChange(e.target.value)}
          placeholder="Saisissez ou modifiez le contenu de ce pilier..."
          className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
        />
      )}
      {saveBar}
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
