// ==========================================================================
// HOOK — usePillarForm
// Manages pillar editor state: loading, structured vs raw, auto-save,
// and save mutation. Replaces manual useState + useEffect + debounce in
// the pillar editor page.
// ==========================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { PillarType } from "~/lib/constants";

interface UsePillarFormOptions {
  strategyId: string;
  pillarType: PillarType;
}

interface UsePillarFormReturn {
  // ── Data ──
  /** The structured JSON content (null if not structured) */
  content: unknown;
  /** Raw string content (JSON serialized or plain text) */
  rawContent: string;
  /** Whether the content is structured JSON */
  isStructured: boolean;

  // ── State ──
  /** Loading the initial data */
  isLoading: boolean;
  /** Error fetching data */
  isError: boolean;
  /** Currently saving */
  isSaving: boolean;
  /** Content has been modified since last save */
  isDirty: boolean;

  // ── Strategy data ──
  strategy: ReturnType<typeof api.cockpit.getData.useQuery>["data"];
  pillar: { id: string; type: string; content: unknown; status: string } | undefined;

  // ── Handlers ──
  /** Update structured content */
  handleStructuredChange: (data: unknown) => void;
  /** Update raw text content */
  handleRawChange: (value: string) => void;
  /** Save content immediately */
  handleSave: () => void;
  /** Refetch strategy data */
  refetch: () => void;
}

/**
 * All-in-one hook for pillar editors. Manages data fetching, content state
 * (structured vs raw), dirty tracking, and save mutation.
 *
 * @example
 * const {
 *   content, rawContent, isStructured,
 *   isLoading, isSaving, isDirty,
 *   handleStructuredChange, handleRawChange, handleSave,
 * } = usePillarForm({ strategyId, pillarType: "A" });
 */
export function usePillarForm({
  strategyId,
  pillarType,
}: UsePillarFormOptions): UsePillarFormReturn {
  // ── Local state ──
  const [content, setContent] = useState<unknown>(null);
  const [rawContent, setRawContent] = useState("");
  const [isStructured, setIsStructured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initializedRef = useRef(false);

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

  // ── Initialize content from fetched pillar ──
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

  // ── Mutation ──
  const updatePillar = api.pillar.update.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      setIsDirty(false);
      toast.success("Contenu sauvegardé.");
      void refetch();
    },
    onError: () => {
      setIsSaving(false);
      toast.error("Erreur lors de la sauvegarde.");
    },
  });

  // ── Handlers ──
  const handleStructuredChange = useCallback((newData: unknown) => {
    setContent(newData);
    setRawContent(JSON.stringify(newData, null, 2));
    setIsDirty(true);
  }, []);

  const handleRawChange = useCallback((value: string) => {
    setRawContent(value);
    setIsDirty(true);
    try {
      const parsed: unknown = JSON.parse(value);
      setContent(parsed);
    } catch {
      // Not valid JSON — keep as raw
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!pillar) return;
    setIsSaving(true);

    const contentToSave = isStructured && content != null ? content : rawContent;

    updatePillar.mutate({
      id: pillar.id,
      content: contentToSave as Record<string, unknown>,
      status: "complete",
    });
  }, [pillar, isStructured, content, rawContent, updatePillar]);

  return {
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
    refetch: () => void refetch(),
  };
}
