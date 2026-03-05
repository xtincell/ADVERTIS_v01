// ==========================================================================
// HOOK — useAutoSave
// Debounced auto-save that watches data changes and triggers a callback.
// ==========================================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseAutoSaveOptions<T> {
  /** Data to watch for changes */
  data: T;
  /** Save function called with latest data */
  onSave: (data: T) => void | Promise<void>;
  /** Debounce delay in ms (default: 1500) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** Whether a save is currently pending (debouncing) */
  isPending: boolean;
  /** Whether the save callback is currently executing */
  isSaving: boolean;
  /** Manually trigger an immediate save */
  saveNow: () => void;
  /** Cancel the pending debounced save */
  cancel: () => void;
}

/**
 * Debounced auto-save hook. Watches `data` for changes and calls `onSave`
 * after a delay. Skips the initial render to avoid saving on mount.
 *
 * @example
 * const { isPending, isSaving } = useAutoSave({
 *   data: formData,
 *   onSave: (d) => mutation.mutate(d),
 *   delay: 2000,
 * });
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 1500,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  const isFirstRender = useRef(true);

  // Keep refs current
  dataRef.current = data;
  onSaveRef.current = onSave;

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPending(false);
  }, []);

  const saveNow = useCallback(async () => {
    cancel();
    setIsSaving(true);
    try {
      await onSaveRef.current(dataRef.current);
    } finally {
      setIsSaving(false);
    }
  }, [cancel]);

  useEffect(() => {
    // Skip the initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    setIsPending(true);

    timerRef.current = setTimeout(() => {
      setIsPending(false);
      setIsSaving(true);
      void Promise.resolve(onSaveRef.current(dataRef.current)).finally(() => {
        setIsSaving(false);
      });
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // Stringify data to detect deep changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isPending, isSaving, saveNow, cancel };
}
